import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { searchTerm, esUrl } = req.body;
    
    // Get credentials from request headers (sent by client)
    const username = req.headers['x-es-username'];
    const password = req.headers['x-es-password'];
    const openaiApiKey = req.headers['x-openai-api-key'];

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    if (!esUrl) {
      return res.status(400).json({ error: 'Elasticsearch URL is required' });
    }

    // Read query_ai.txt file for embeddings
    const queryFilePath = path.join(process.cwd(), 'query_ai.txt');
    let queryTemplate;
    
    try {
      queryTemplate = fs.readFileSync(queryFilePath, 'utf8');
    } catch (error) {
      console.error('Error reading query_ai.txt:', error);
      return res.status(500).json({ error: 'Failed to read query template file' });
    }

    // First, get embedding from OpenAI
    const embeddingResponse = await fetch(`${req.headers.host ? 'http://' + req.headers.host : 'http://localhost:3000'}/api/openai-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: searchTerm,
        apiKey: openaiApiKey || ''
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      throw new Error(`Embedding API error: ${errorData.error || errorData.details}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.embedding;

    // Replace placeholders in query template
    let queryBody;
    try {
      const queryString = queryTemplate
        .replace(/{{term}}/g, searchTerm)
        .replace(/"{{embedding}}"/g, JSON.stringify(embedding));
      
      queryBody = JSON.parse(queryString);
    } catch (error) {
      return res.status(500).json({ error: 'Invalid query template format' });
    }

    // Set up authentication headers
    let authHeaders = {};
    if (username && password) {
      authHeaders['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }

    // Send query to Elasticsearch
    const esResponse = await fetch(`${esUrl}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(queryBody),
    });

    if (!esResponse.ok) {
      const errorText = await esResponse.text();
      throw new Error(`Elasticsearch error: ${esResponse.status} - ${errorText}`);
    }

    const esData = await esResponse.json();

    // Check if we have any hits
    if (!esData.hits || !esData.hits.hits || esData.hits.hits.length === 0) {
      return res.status(200).json({
        body: {
          hits: {
            total: { value: 0 },
            hits: []
          },
          took: esData.took || 0
        }
      });
    }



    // Transform Elasticsearch response to match our expected format
    const transformedData = {
      body: {
        hits: {
          total: { value: (typeof esData.hits?.total === 'object' && esData.hits?.total?.value !== undefined) ? esData.hits.total.value : (typeof esData.hits?.total === 'number' ? esData.hits.total : 0) },
          hits: esData.hits?.hits?.map((hit, index) => {
            // Extract agent, title, and date from the record with flexible parsing
            let agentValue = '';
            let titleValue = 'No title';
            let dateValue = '';
            
            // Try different title formats
            if (hit._source?.title) {
              if (Array.isArray(hit._source.title) && hit._source.title[0]?.value) {
                titleValue = hit._source.title[0].value;
              } else if (Array.isArray(hit._source.title) && typeof hit._source.title[0] === 'string') {
                titleValue = hit._source.title[0];
              } else if (typeof hit._source.title === 'string') {
                titleValue = hit._source.title;
              } else if (hit._source.title?.value) {
                titleValue = hit._source.title.value;
              }
            }
            
            // Try different agent formats
            if (hit._source?.agent) {
              if (Array.isArray(hit._source.agent) && hit._source.agent[0]?.value?.value) {
                agentValue = hit._source.agent[0].value.value;
              } else if (Array.isArray(hit._source.agent) && hit._source.agent[0]?.value) {
                agentValue = hit._source.agent[0].value;
              } else if (Array.isArray(hit._source.agent) && typeof hit._source.agent[0] === 'string') {
                agentValue = hit._source.agent[0];
              } else if (typeof hit._source.agent === 'string') {
                agentValue = hit._source.agent;
              } else if (hit._source.agent?.value) {
                agentValue = hit._source.agent.value;
              }
            }
            
            // Try different date formats
            if (hit._source?.date) {
              if (Array.isArray(hit._source.date) && hit._source.date[0]?.value) {
                dateValue = hit._source.date[0].value;
              } else if (Array.isArray(hit._source.date) && typeof hit._source.date[0] === 'string') {
                dateValue = hit._source.date[0];
              } else if (typeof hit._source.date === 'string') {
                dateValue = hit._source.date;
              } else if (hit._source.date?.value) {
                dateValue = hit._source.date.value;
              }
            }
            
            return {
              _id: hit._id || `hit-${index}`,
              _source: {
                ...hit._source,
                // Add extracted values for easier access
                agentValue: agentValue,
                titleValue: titleValue,
                dateValue: dateValue
              },
              _index: hit._index || 'elasticsearch'
            };
          }) || []
        },
        took: esData.took || 0,
        // Add the DSL query that was sent to Elasticsearch (without credentials)
        dsl_query: queryBody,
        // Add query info without sensitive credentials
        query_info: {
          searchTerm: searchTerm,
          esUrl: esUrl,
          hasCredentials: !!(username && password),
          hasOpenAIKey: !!req.body.openaiApiKey
        }
      }
    };

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Elasticsearch dynamic query error:', error);
    res.status(500).json({ 
      error: 'Failed to execute dynamic Elasticsearch query',
      details: error.message 
    });
  }
}
