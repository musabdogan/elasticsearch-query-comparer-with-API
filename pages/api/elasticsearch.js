import { Client } from '@elastic/elasticsearch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url, username, password, index, query } = req.body;

    // URL'den index pattern'i çıkar
    const baseUrl = url.split('/').slice(0, -1).join('/');
    const urlIndexPattern = url.split('/').pop();

    const client = new Client({
      node: baseUrl,
      auth: {
        username: username,
        password: password,
      },
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true
    });

    // Extract size and from from the query body if they exist, otherwise use defaults
    const size = query.size || 10;
    const from = query.from || 0;

    // Remove size and from from the query body before sending to client.search
    const searchBody = { ...query };
    delete searchBody.size;
    delete searchBody.from;
    
    // Perform the search using the index pattern from URL if available
    const response = await client.search({
      index: urlIndexPattern || index,
      body: searchBody,
      size: size, 
      from: from 
    });
    
    // Send successful response
    console.log("API Request Body:", searchBody);
    console.log("API Response:", JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.error('Elasticsearch error:', error);
    res.status(500).json({ 
      error: 'Error executing Elasticsearch query',
      details: error.message 
    });
  }
} 