export function processQueryTemplate(template, term, size = 10, from = 0) {
  if (!template) {
    throw new Error('Template is required');
  }
  if (!term) {
    throw new Error('Search term is required');
  }

  // Split the term into words
  const termWords = term.split(/\s+/).filter(word => word.length > 0);
  
  try {
    // Replace the template variables
    let query = template
      .replace(/{{size}}/g, size)
      .replace(/{{from}}/g, from)
      .replace(/{{term}}/g, term);
    
    // Generate the word-by-word wildcard queries
    const wordQueries = termWords.map(word => 
      `{ "wildcard": { "data.name": { "value": "*${word}*", "case_insensitive": true } } }`
    ).join(',\n                  ');
    
    // Replace the term_words section with the generated queries
    query = query.replace(
      /\{\{#each term_words\}\}[\s\S]*?\{\{\/each\}\}/,
      wordQueries
    );
    
    return JSON.parse(query);
  } catch (error) {
    console.error('Error processing template:', error);
    throw new Error(`Failed to process template: ${error.message}`);
  }
} 