export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { searchTerm, awsApiUrl: customAwsApiUrl } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Use custom AWS API URL if provided, otherwise use default
    const baseAwsApiUrl = customAwsApiUrl && customAwsApiUrl !== 'Your Query API URL' 
      ? customAwsApiUrl 
      : 'https://your-aws-api-endpoint.com/search';
    const awsApiUrl = `${baseAwsApiUrl}?query=${encodeURIComponent(searchTerm)}`;
    
    // Start timing the query
    const startTime = Date.now();
    
    const response = await fetch(awsApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AWS API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
    
    // Calculate query time
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    // Transform AWS API response to match our expected format
    const transformedData = {
      body: {
        hits: {
          total: { value: (typeof data.total === 'object' && data.total?.value !== undefined) ? data.total.value : (data.total || 0) },
          hits: data.records?.map((record, index) => {
            // Extract agent.value.value, title.value, and date.value from the record
            const agentValue = record.agent?.[0]?.value?.value;
            const titleValue = record.title?.[0]?.value || 'No title';
            const dateValue = record.date?.[0]?.value;
            
            return {
              _id: record.id || `record-${index}`,
              _source: {
                ...record,
                // Add extracted values for easier access
                agentValue: agentValue,
                titleValue: titleValue,
                dateValue: dateValue
              },
              _index: 'aws-search'
            };
          }) || []
        },
        took: queryTime, // Manual query time calculation
        // Add query info without sensitive data
        query_info: {
          searchTerm: searchTerm,
          awsApiBaseUrl: baseAwsApiUrl
        }
      }
    };

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('AWS API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from AWS API',
      details: error.message 
    });
  }
}
