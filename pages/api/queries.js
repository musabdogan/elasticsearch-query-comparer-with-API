import fs from 'fs';
import path from 'path';

const QUERIES_DIR = path.join(process.cwd());
const PUBLIC_DIR = path.join(process.cwd(), 'public');

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { action, filename, type } = req.query;
        
        if (action === 'list') {
          // List all query files with optional type filtering
          let files = fs.readdirSync(QUERIES_DIR)
            .filter(file => {
              const isQueryFile = file.includes('query') && (file.endsWith('.txt') || file.endsWith('.json'));
              if (type) {
                return isQueryFile && file.includes(type);
              }
              return isQueryFile;
            })
            .map(file => ({
              name: file,
              path: file,
              size: fs.statSync(path.join(QUERIES_DIR, file)).size,
              modified: fs.statSync(path.join(QUERIES_DIR, file)).mtime,
              type: file.includes('new') ? 'new' : file.includes('old') ? 'old' : 'other'
            }));
          
          return res.status(200).json({ files });
        }
        
        if (action === 'read' && filename) {
          // Read specific query file
          let filePath;
          
          // For random_words.txt, read from public directory
          if (filename === 'random_words.txt') {
            filePath = path.join(PUBLIC_DIR, filename);
          } else {
            filePath = path.join(QUERIES_DIR, filename);
          }
          
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
          }
          
          const content = fs.readFileSync(filePath, 'utf8');
          return res.status(200).json({ content, filename });
        }
        
        return res.status(400).json({ error: 'Invalid action' });
      } catch (error) {
        console.error('Error reading queries:', error);
        return res.status(500).json({ error: 'Failed to read queries' });
      }

    case 'POST':
      try {
        const { action, filename, content } = req.body;
        
        if (action === 'save' && filename && content !== undefined) {
          // Save query file
          let filePath;
          
          // For random_words.txt, save to public directory
          if (filename === 'random_words.txt') {
            filePath = path.join(PUBLIC_DIR, filename);
          } else {
            filePath = path.join(QUERIES_DIR, filename);
          }
          
          // Validate filename - allow random_words.txt or query files
          if ((!filename.includes('query') && filename !== 'random_words.txt') || (!filename.endsWith('.txt') && !filename.endsWith('.json'))) {
            return res.status(400).json({ error: 'Invalid filename' });
          }
          
          fs.writeFileSync(filePath, content, 'utf8');
          return res.status(200).json({ message: 'File saved successfully', filename });
        }
        
        if (action === 'create' && filename && content !== undefined) {
          // Create new query file
          const filePath = path.join(QUERIES_DIR, filename);
          
          // Validate filename - allow random_words.txt or query files
          if ((!filename.includes('query') && filename !== 'random_words.txt') || (!filename.endsWith('.txt') && !filename.endsWith('.json'))) {
            return res.status(400).json({ error: 'Invalid filename' });
          }
          
          // Check if file already exists
          if (fs.existsSync(filePath)) {
            return res.status(409).json({ error: 'File already exists' });
          }
          
          fs.writeFileSync(filePath, content, 'utf8');
          return res.status(201).json({ message: 'File created successfully', filename });
        }
        
        return res.status(400).json({ error: 'Invalid action' });
      } catch (error) {
        console.error('Error saving query:', error);
        return res.status(500).json({ error: 'Failed to save query' });
      }

    case 'DELETE':
      try {
        const { filename } = req.query;
        
        if (!filename) {
          return res.status(400).json({ error: 'Filename is required' });
        }
        
        const filePath = path.join(QUERIES_DIR, filename);
        
        // Validate filename - allow random_words.txt or query files
        if ((!filename.includes('query') && filename !== 'random_words.txt') || (!filename.endsWith('.txt') && !filename.endsWith('.json'))) {
          return res.status(400).json({ error: 'Invalid filename' });
        }
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: 'File not found' });
        }
        
        fs.unlinkSync(filePath);
        return res.status(200).json({ message: 'Query deleted successfully', filename });
      } catch (error) {
        console.error('Error deleting query:', error);
        return res.status(500).json({ error: 'Failed to delete query' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
