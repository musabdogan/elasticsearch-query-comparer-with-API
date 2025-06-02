import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Dosya yolunu oluştur
    const filePath = path.join(process.cwd(), `${query}.txt`);
    
    // Dosyayı oku
    const dsl = fs.readFileSync(filePath, 'utf8');
    
    // JSON olarak döndür
    res.status(200).json({ dsl });
  } catch (error) {
    console.error('Error reading DSL file:', error);
    res.status(500).json({ error: 'Error reading DSL file' });
  }
} 