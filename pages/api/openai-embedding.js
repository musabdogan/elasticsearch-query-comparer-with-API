export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, apiKey } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    // Sanitize text input
    const sanitizedText = String(text).trim().substring(0, 8000); // Limit length
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: sanitizedText,
        model: 'text-embedding-ada-002'
      }),
    }).catch(error => {
      throw new Error(`Network error: ${error.message}`);
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `OpenAI API error: ${errorData.error?.message || errorData.error || response.statusText}`;
      } catch (parseError) {
        // Continue with default error message
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response from OpenAI API');
    }

    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const embedding = data.data[0].embedding;

    res.status(200).json({ embedding });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get embedding from OpenAI',
      details: error.message 
    });
  }
}
