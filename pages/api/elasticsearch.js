import { Client } from '@elastic/elasticsearch';
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

    // URL'den index pattern'i çıkar
    const baseUrl = url.split('/').slice(0, -1).join('/');
    const urlIndexPattern = url.split('/').pop();

    const client = new Client({
      node: baseUrl,
      auth: {
        username: username,
        password: password,
      },
      maxRetries: 10,
      requestTimeout: 10000, // 10 saniye timeout
      sniffOnStart: true,
      ssl: {
        rejectUnauthorized: false
      },
      tls: {
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
    console.log('=== İLK SORGU BAŞLIYOR ===');
    console.log('Sorgu:', JSON.stringify(searchBody, null, 2));
    let response;
    try {
      response = await client.search({
        index: urlIndexPattern || index,
        body: searchBody,
        size: size, 
        from: from 
      });
      console.log('İlk sorgu sonucu:', response.body.hits.total.value, 'sonuç');
    } catch (error) {
      console.error('İlk sorgu hatası:', error);
      throw error;
    }

    // Eğer sonuç bulunamazsa ve searchTerm varsa, basit bir match sorgusu dene
    if (response.body.hits.total.value === 0 && searchTerm) {
      console.log('\n=== FALLBACK SORGUSU BAŞLIYOR ===');
      console.log('SearchTerm:', searchTerm);
      
      try {
        // Fallback query template'ini oku ve derle
        const fallbackTemplate = fs.readFileSync(path.join(process.cwd(), 'new_query_fallback.txt'), 'utf8');
        console.log('Fallback template dosyası okundu');
        
        const compiledFallbackQuery = Handlebars.compile(fallbackTemplate);
        
        // Fallback query'yi hazırla
        const fallbackQuery = JSON.parse(compiledFallbackQuery({
          term: searchTerm,
          size: size,
          from: from,
          term_words: searchTerm.split(/\s+/)
        }));

        console.log('Fallback sorgu:', JSON.stringify(fallbackQuery, null, 2));

        // Yeni bir client oluştur
        const fallbackClient = new Client({
          node: baseUrl,
          auth: {
            username: username,
            password: password,
          },
          maxRetries: 10,
          requestTimeout: 10000,
          sniffOnStart: true,
          ssl: {
            rejectUnauthorized: false
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const fallbackResponse = await fallbackClient.search({
          index: urlIndexPattern || index,
          body: fallbackQuery,
          size: size,
          from: from
        });

        console.log('Fallback sorgu sonucu:', fallbackResponse.body.hits.total.value, 'sonuç');

        if (fallbackResponse.body.hits.total.value > 0) {
          console.log('Fallback sorgu başarılı, sonuçlar dönüyor');
          return res.status(200).json({
            ...fallbackResponse,
            isFallback: true
          });
        } else {
          console.log('Fallback sorgu da sonuç bulamadı');
        }
      } catch (fallbackError) {
        console.error('Fallback sorgu hatası:', fallbackError);
        console.error('Hata detayı:', fallbackError.message);
        throw fallbackError;
      }
    }
    
    // Send successful response
    console.log('\n=== SONUÇ ===');
    console.log('İlk sorgu sonuçları dönüyor');
    res.status(200).json(response);
  } catch (error) {
    console.error('Elasticsearch hatası:', error);
    res.status(500).json({ 
      error: 'Elasticsearch sorgusu çalıştırılırken hata oluştu',
      details: error.message 
    });
  }
} 