import { Client } from '@opensearch-project/opensearch';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url, username, password, index, query, searchTerm } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query object is required in the request body.' });
    }

    // Extract index pattern from URL
    const baseUrl = url.split('/').slice(0, -1).join('/');
    const urlIndexPattern = url.split('/').pop();

    const client = new Client({
      node: baseUrl,
      auth: {
        username: username,
        password: password,
      },
      maxRetries: 10,
      requestTimeout: 10000, // 10 second timeout
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Extract size and from from the query body if they exist, otherwise use defaults
    const size = query.size || 10;
    const from = query.from || 0;

    // Remove size and from from the query body before sending to client.search
    const searchBody = { ...query };
    delete searchBody.size;
    delete searchBody.from;
    
    // Perform the search using the index pattern from URL if available
    let response;
    try {
      response = await client.search({
        index: urlIndexPattern || index,
        body: searchBody,
        size: size, 
        from: from 
      });

    } catch (error) {
      console.error('First query error:', error);
      // Create a more detailed error message
      let errorMessage = 'Elasticsearch query failed';
      let errorDetails = error.message;
      
      if (error.name === 'TimeoutError') {
        errorMessage = 'Request timed out';
        errorDetails = 'The Elasticsearch request took too long to complete. Please check your connection or try again.';
      } else if (error.name === 'ConnectionError') {
        errorMessage = 'Connection failed';
        errorDetails = 'Unable to connect to Elasticsearch. Please check the URL and credentials.';
      } else if (error.statusCode === 401) {
        errorMessage = 'Authentication failed';
        errorDetails = 'Invalid username or password. Please check your credentials.';
      } else if (error.statusCode === 403) {
        errorMessage = 'Access denied';
        errorDetails = 'You do not have permission to access this index.';
      } else if (error.statusCode === 404) {
        errorMessage = 'Index not found';
        errorDetails = 'The specified index does not exist.';
      } else if (error.statusCode === 500) {
        errorMessage = 'Elasticsearch server error';
        errorDetails = 'Internal server error in Elasticsearch. Please try again later.';
      }
      
      throw {
        message: errorMessage,
        details: errorDetails,
        originalError: error
      };
    }

    // Fallback logic removed - handled in frontend
    
    // Send successful response
    res.status(200).json(response);
  } catch (error) {
    console.error('Elasticsearch error:', error);
    
    // Check if this is our custom error object
    if (error.message && error.details) {
      res.status(500).json({ 
        error: error.message,
        details: error.details
      });
    } else {
      // Fallback for other errors
      res.status(500).json({ 
        error: 'Elasticsearch query failed',
        details: error.message || 'An unexpected error occurred'
      });
    }
  }
} 