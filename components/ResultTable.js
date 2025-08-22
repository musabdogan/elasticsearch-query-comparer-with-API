import React from 'react';
import {
  EuiCard,
  EuiPopover,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
  EuiText,
  EuiCodeBlock,
  EuiSpacer,
  EuiTitle,
  EuiHorizontalRule
} from '@elastic/eui';

const ResultTable = ({
  title,
  results,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  displayField,
  loading,
  onPopoverToggle,
  popoverOpen,
  selectedHit
}) => {
  // Ultra safe string conversion - ensures everything becomes a string
  const forceToString = (value) => {
    try {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (typeof value === 'object') {
        // For objects with value property (Elasticsearch total hits format)
        if (value.value !== undefined) {
          if (typeof value.value === 'object' && value.value !== null && value.value.value !== undefined) {
            return String(value.value.value);
          }
          return String(value.value);
        }
        // For objects with relation property (Elasticsearch format)
        if (value.relation !== undefined) {
          return String(value.value || '');
        }
        // For any other object, just stringify
        return JSON.stringify(value);
      }
      return String(value);
    } catch (error) {
      return '';
    }
  };

  // Ultra safe field extraction - ensures everything becomes a string
  const getField = (source, fieldName, defaultValue = '') => {
    try {
      if (!source || typeof source !== 'object') return defaultValue;
      
      const field = source[fieldName];
      if (!field) return defaultValue;
      
      // If it's already a string, return it
      if (typeof field === 'string') return field;
      
      // If it's a number or boolean, convert to string
      if (typeof field === 'number' || typeof field === 'boolean') return String(field);
      
      // If it's an array, get the first element and ensure it's a string
      if (Array.isArray(field)) {
        if (field.length === 0) return defaultValue;
        const firstElement = field[0];
        // Ensure the first element is converted to string
        if (typeof firstElement === 'string') return firstElement;
        if (typeof firstElement === 'number' || typeof firstElement === 'boolean') return String(firstElement);
        if (typeof firstElement === 'object' && firstElement !== null) {
          return forceToString(firstElement);
        }
        return String(firstElement);
      }
      
      // If it's an object with value and relation (Elasticsearch total hits format)
      if (typeof field === 'object' && field !== null) {
        if (field.value !== undefined) {
          return String(field.value);
        }
        return forceToString(field);
      }
      
      // Otherwise, convert to string
      return String(field);
    } catch (error) {
      console.error('Error in getField:', error, 'for field:', fieldName);
      return defaultValue;
    }
  };

  // Check for valid results
  if (!results?.body?.hits?.hits || !Array.isArray(results.body.hits.hits) || results.body.hits.hits.length === 0) {
    return (
      <EuiCard
        title={title}
        betaBadgeLabel="No Results"
        betaBadgeTooltipContent="No search results found"
        style={{ marginBottom: '16px' }}
      >
        <EuiText color="subdued">No results to display</EuiText>
      </EuiCard>
    );
  }

  // Additional safety check for error objects
  if (results?.error) {
    return (
      <EuiCard
        title={title}
        betaBadgeLabel="Error"
        betaBadgeTooltipContent="Search error occurred"
        style={{ marginBottom: '16px' }}
      >
        <EuiText color="subdued">Error: {String(results.error)}</EuiText>
      </EuiCard>
    );
  }

  // Ensure totalPages is a number
  const safeTotalPages = Number(totalPages) || 0;

  const hits = results.body.hits.hits;
  const totalHits = Number(results.body.hits.total?.value) || 0;

  return (
    <>
      {loading && <EuiText color="subdued">Loading...</EuiText>}
      
      {!loading && (
        <>
          <EuiSpacer size="s" />
          <EuiHorizontalRule margin="s" style={{ background: '#e2e8f0' }} />
          <EuiSpacer size="s" />
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem>
              {hits.map((hit, index) => (
                (index < Math.ceil(itemsPerPage / 2)) && (
                  <EuiPopover
                    key={hit._id || `hit-${index}`}
                    button={
                      <div
                        title={hit._id || 'ID not found'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onPopoverToggle(hit)}
                      >
                        <EuiCard
                          title={
                            (() => {
                              try {
                                if (!hit || !hit._source || typeof hit._source !== 'object') {
                                  return (
                                    <EuiText size="s">#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}: Invalid result data</EuiText>
                                  );
                                }

                                const titleStr = String(getField(hit._source, 'title', 'No title'));
                                const agentStr = String(getField(hit._source, 'agent', ''));
                                const dateStr = String(getField(hit._source, 'date', ''));

                                return (
                                  <EuiText size="s">
                                    <span style={{ color: '#64748b' }}>#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}:</span>{' '}
                                    <strong
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {titleStr}
                                    </strong>
                                    {agentStr && (
                                      <div style={{ color: '#475569' }}>{agentStr}</div>
                                    )}
                                    {dateStr && (
                                      <div style={{ color: '#475569' }}>{dateStr}</div>
                                    )}
                                  </EuiText>
                                );
                              } catch (error) {
                                console.error('Error in title rendering:', error);
                                return (
                                  <EuiText size="s">#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}: Error displaying result</EuiText>
                                );
                              }
                            })()
                          }
                          description={null}
                          paddingSize="s"
                          textAlign="left"
                          style={{ 
                            marginBottom: 4, 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 120ms ease, box-shadow 120ms ease',
                            background: '#ffffff'
                          }}
                        />
                      </div>
                    }
                    isOpen={popoverOpen && selectedHit?._id === hit._id}
                    closePopover={() => onPopoverToggle(null)}
                    anchorPosition="downCenter"
                    panelPaddingSize="m"
                    panelStyle={{ 
                      maxWidth: '600px', 
                      maxHeight: '500px',
                      overflow: 'auto'
                    }}
                  >
                    <EuiText size="s">
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-all', 
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        {JSON.stringify(hit._source, null, 2)}
                      </pre>
                    </EuiText>
                  </EuiPopover>
                )
              ))}
            </EuiFlexItem>
            
            <EuiFlexItem>
              {hits.map((hit, index) => (
                (index >= Math.ceil(itemsPerPage / 2) && index < itemsPerPage) && (
                  <EuiPopover
                    key={hit._id || `hit-${index}`}
                    button={
                      <div
                        title={hit._id || 'ID not found'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onPopoverToggle(hit)}
                      >
                        <EuiCard
                          title={
                            (() => {
                              try {
                                if (!hit || !hit._source || typeof hit._source !== 'object') {
                                  return (
                                    <EuiText size="s">#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}: Invalid result data</EuiText>
                                  );
                                }

                                const titleStr = String(getField(hit._source, 'title', 'No title'));
                                const agentStr = String(getField(hit._source, 'agent', ''));
                                const dateStr = String(getField(hit._source, 'date', ''));

                                return (
                                  <EuiText size="s">
                                    <span style={{ color: '#64748b' }}>#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}:</span>{' '}
                                    <strong
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {titleStr}
                                    </strong>
                                    {agentStr && (
                                      <div style={{ color: '#475569' }}>{agentStr}</div>
                                    )}
                                    {dateStr && (
                                      <div style={{ color: '#475569' }}>{dateStr}</div>
                                    )}
                                  </EuiText>
                                );
                              } catch (error) {
                                console.error('Error in title rendering:', error);
                                return (
                                  <EuiText size="s">#{(typeof currentPage !== 'undefined' ? currentPage : 0) * itemsPerPage + index + 1}: Error displaying result</EuiText>
                                );
                              }
                            })()
                          }
                          description={null}
                          paddingSize="s"
                          textAlign="left"
                          style={{ 
                            marginBottom: 4, 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 120ms ease, box-shadow 120ms ease',
                            background: '#ffffff'
                          }}
                        />
                      </div>
                    }
                    isOpen={popoverOpen && selectedHit?._id === hit._id}
                    closePopover={() => onPopoverToggle(null)}
                    anchorPosition="downCenter"
                    panelPaddingSize="m"
                    panelStyle={{ 
                      maxWidth: '600px', 
                      maxHeight: '500px',
                      overflow: 'auto'
                    }}
                  >
                    <EuiText size="s">
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-all', 
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        {JSON.stringify(hit._source, null, 2)}
                      </pre>
                    </EuiText>
                  </EuiPopover>
                )
              ))}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xxs" />
          {safeTotalPages > 1 && (
            <EuiPagination
              pageCount={safeTotalPages}
              activePage={Number(currentPage) || 0}
              onPageClick={onPageChange}
              style={{ justifyContent: 'center' }}
              compressed
            />
          )}
        </>
      )}
    </>
  );
};

export default ResultTable;
