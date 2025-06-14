import fs from 'fs';
import path from 'path';
import { processQueryTemplate } from '../../utils/queryProcessor';

export default function handler(req, res) {
  const { query, term, size, from } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Read the file path
    const filePath = path.join(process.cwd(), `${query}.txt`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Template file ${query}.txt not found` });
    }

    // For old queries, just return the file content as a string
    if (query === 'old_query_single_word' || query === 'old_query_multi_word') {
      const dsl = fs.readFileSync(filePath, 'utf8');
      return res.status(200).json({ dsl });
    }

    // For new template queries, require term and process the template
    if (!term) {
      return res.status(400).json({ error: 'Term parameter is required' });
    }
    const template = fs.readFileSync(filePath, 'utf8');
    if (!template) {
      return res.status(500).json({ error: 'Failed to read template file' });
    }
    const dsl = processQueryTemplate(template, term, parseInt(size) || 10, parseInt(from) || 0);
    res.status(200).json({ dsl });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Error processing query',
      details: error.message 
    });
  }
} 