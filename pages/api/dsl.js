import fs from 'fs';
import path from 'path';
import { processQueryTemplate } from '../../utils/queryProcessor';

export default function handler(req, res) {
  const { query, term, size, from, displayField } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Read the file path - support both .txt and .json files
    let filePath = path.join(process.cwd(), query);
    if (!fs.existsSync(filePath)) {
      // Try with .txt extension
      filePath = path.join(process.cwd(), `${query}.txt`);
      if (!fs.existsSync(filePath)) {
        // Try with .json extension
        filePath = path.join(process.cwd(), `${query}.json`);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: `Template file ${query} not found` });
        }
      }
    }

    // For old queries, just return the file content
    if (query.includes('old_query')) {
      let dsl = fs.readFileSync(filePath, 'utf8');
      
      // Return empty string if file is empty
      return res.status(200).json({ dsl: dsl || '' });
    }

    // For new template queries, require term and process the template
    if (!term) {
      return res.status(400).json({ error: 'Term parameter is required' });
    }
    
    const template = fs.readFileSync(filePath, 'utf8');
    if (!template || template.trim() === '') {
      return res.status(200).json({ dsl: null });
    }
    
    // For new queries, process template
    let processedQuery = template
      .replace(/{{size}}/g, parseInt(size) || 10)
      .replace(/{{from}}/g, parseInt(from) || 0)
      .replace(/{{term}}/g, term);
    
    // Generate the word-by-word wildcard queries
    const termWords = term.split(/\s+/).filter(word => word.length > 0);
    const wordQueries = termWords.map(word => 
      `{ "wildcard": { "data.name": { "value": "*${word}*", "case_insensitive": true } } }`
    ).join(',\n                  ');
    
    // Replace the term_words section with the generated queries
    processedQuery = processedQuery.replace(
      /\{\{#each term_words\}\}[\s\S]*?\{\{\/each\}\}/,
      wordQueries
    );
    
    // Parse the query
    let queryObj = JSON.parse(processedQuery);
    

    
    const dsl = queryObj;
    
    res.status(200).json({ dsl });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Error processing query',
      details: error.message 
    });
  }
} 