import { useState, useMemo, useEffect } from 'react';
import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiPageTemplate,
  EuiTitle,
  EuiTextArea,
  EuiButton,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiFieldText,
  EuiBadge,
  EuiCard,
  EuiPagination,
  EuiIcon,
  EuiHorizontalRule,
  EuiPopover,
  EuiSelect,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiButtonIcon,
  
} from '@elastic/eui';
import ResultTable from './ResultTable';

const ITEMS_PER_PAGE = 10;

export default function Layout({
  awsApiUrl, setAwsApiUrl,
  esUrl1, setEsUrl1,
  esUrl2, setEsUrl2,
  esUsername2, setEsUsername2,
  esPassword2, setEsPassword2,
  openaiApiKey, setOpenaiApiKey,
  embeddingsEnabled, setEmbeddingsEnabled,
  searchTerm, setSearchTerm,
  usedQueryType, usedDsl, usedQueryType2, result, loading,
  currentPage1, handleSearch, totalPages1,
  results2, loading2,
  currentPage2, handleQuery2, totalPages2,
  handleSyncPageChange,
  newQueryWordCount,
  availableQueries,
  openEditModal,
  saveQuery,
  isEditModalVisible,
  setIsEditModalVisible,
  editingQueryContent,
  setEditingQueryContent,
  editingQueryType,
  itemsPerPage,
  setItemsPerPage,
  displayField,
  setDisplayField,
  selectedFields,
  setSelectedFields,
  selectedFields2,
  setSelectedFields2,
}) {
  const [randomWords, setRandomWords] = useState([]);
  const [popoverOpen1, setPopoverOpen1] = useState(null); // Old Query popover
  const [popoverOpen2, setPopoverOpen2] = useState(null); // New Query popover
  const [credentialsPopoverOpen, setCredentialsPopoverOpen] = useState(false);
  const [oldCredentialsPopoverOpen, setOldCredentialsPopoverOpen] = useState(false);
  const [randomEditModalVisible, setRandomEditModalVisible] = useState(false);
  const [randomWordsContent, setRandomWordsContent] = useState('');
  const [randomSaveError, setRandomSaveError] = useState('');
  const [randomSaveSuccess, setRandomSaveSuccess] = useState('');
  
  // Dynamic settings for display fields

  // Function to extract fields from _source
  const extractFieldsFromSource = (source) => {
    if (!source) return [];
    
    const fields = [];
    const extractNestedFields = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested object, recurse
          extractNestedFields(value, fieldPath);
        } else if (Array.isArray(value)) {
          // Array field - show as is
          fields.push({
            value: fieldPath,
            text: fieldPath.replace(/\./g, ' → ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ' (Array)'
          });
        } else {
          // Leaf field
          fields.push({
            value: fieldPath,
            text: fieldPath.replace(/\./g, ' → ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          });
        }
      }
    };
    
    extractNestedFields(source);
    return fields;
  };

  // Get available fields from results
  const availableFields = useMemo(() => {
    let fields = [];
    
    // Try to get fields from any available results
    if (result?.body?.hits?.hits?.length > 0) {
      fields = extractFieldsFromSource(result.body.hits.hits[0]._source);
    } else if (results2?.body?.hits?.hits?.length > 0) {
      fields = extractFieldsFromSource(results2.body.hits.hits[0]._source);
    } else {
      // Default field if no results available
      fields = [{ value: 'title', text: 'title' }];
    }
    
    // Sort fields alphabetically by text (display name)
    return fields.sort((a, b) => a.text.localeCompare(b.text, undefined, { numeric: true, sensitivity: 'base' }));
  }, [result, results2]);



  useEffect(() => {
    // Fetch random words from the file
    fetch('/random_words.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n').filter(word => word.trim().length > 0);
        setRandomWords(words);
      })
      .catch(error => console.error('Error loading random words:', error));
  }, []);





  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EuiHeader position="fixed" style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        background: '#fff',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <a 
              href="https://searchali.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <img 
                src="/searchali.com.png" 
                alt="SearchAli Logo" 
                style={{ 
                  height: '32px',
                  width: 'auto',
                  marginRight: '16px',
                  cursor: 'pointer'
                }} 
              />
            </a>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
        
        <EuiHeaderSection grow={true} style={{ justifyContent: 'center' }}>
          <EuiHeaderSectionItem>
            <EuiText size="xl" style={{ 
              fontWeight: 'bold', 
              color: '#1a73e8',
              lineHeight: '32px'
            }}>
              Elasticsearch/Opensearch Query Comparer
            </EuiText>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>



      </EuiHeader>
      <EuiPageTemplate style={{ paddingTop: 64 }} grow={true} restrictWidth="100%">
        <EuiPageTemplate.Section>
          <EuiPanel paddingSize="l" hasShadow style={{ 
            marginBottom: 24, 
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="center">
              <EuiFlexItem grow={false} style={{ marginRight: 16 }}>
                <a 
                  href="https://searchali.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <img 
                    src="/curationist.png" 
                    alt="Curationist" 
                    style={{ 
                      height: '32px',
                      width: 'auto',
                      cursor: 'pointer'
                    }} 
                  />
                </a>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: '300px' }}>
                <EuiFieldText
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  fullWidth
                  prepend={<EuiIcon type="search" color="#1a73e8" />}
                  size="s"
                  style={{ 
                    verticalAlign: 'middle',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    textAlign: 'left',
                    height: '32px',
                    lineHeight: '32px',
                    padding: '0 12px',
                    fontSize: '16px'
                  }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
                    setSearchTerm(searchTerm);
                  }}
                  isLoading={loading || loading2}
                  fill
                  iconType="search"
                  size="s"
                  style={{ 
                    background: '#1a73e8', 
                    height: '32px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    marginRight: '8px'
                  }}
                >
                  Search
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={async () => {
                    if (randomWords.length > 0) {
                      const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
                      setSearchTerm(randomWord);
                    }
                  }}
                  iconType="refresh"
                  size="s"
                  style={{ 
                    background: '#f8fafc', 
                    color: '#1a73e8',
                    height: '32px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  Random
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/queries?action=read&filename=random_words.txt');
                      const data = await response.json();
                      if (response.ok) {
                        setRandomWordsContent(data.content);
                        setRandomEditModalVisible(true);
                      } else {
                        console.error('Error reading random words:', data.error);
                      }
                    } catch (error) {
                      console.error('Error reading random words:', error);
                    }
                  }}
                  iconType="documentEdit"
                  size="s"
                  style={{ 
                    background: '#1a73e8', 
                    color: '#fff',
                    height: '32px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Edit
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
          <EuiFlexGroup gutterSize="l" responsive={false} style={{ marginTop: -16 }}>
            {/* Left Panel - Should display result state (butterfly_dev) */}
            <EuiFlexItem grow={true}>
              <EuiPanel paddingSize="l" hasShadow style={{ 
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiTitle size="s" style={{ margin: 0 }}>
                      <h3 style={{ color: '#1a73e8', margin: 0, fontSize: '16px' }}>Old Query</h3>
                    </EuiTitle>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: '375px' }}>
                    <EuiFieldText
                      label="AWS API URL"
                      placeholder="Your Query API URL"
                      value={awsApiUrl}
                      onChange={(e) => setAwsApiUrl(e.target.value)}
                      fullWidth
                      prepend={<EuiIcon type="link" color="#1a73e8" />}
                      size="xs"
                      style={{ 
                        verticalAlign: 'middle',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        textAlign: 'left',
                        height: '32px',
                        lineHeight: '32px',
                        padding: '0 12px',
                        fontSize: '16px'
                      }}
                      
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiPopover
                      button={
                        <EuiButton
                          iconType="gear"
                          size="s"
                          style={{ 
                            background: '#f8fafc', 
                            color: '#1a73e8',
                            height: '32px',
                            width: '32px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            padding: '0',
                            minWidth: '32px'
                          }}
                          onClick={() => setOldCredentialsPopoverOpen(!oldCredentialsPopoverOpen)}
                        />
                      }
                      isOpen={oldCredentialsPopoverOpen}
                      closePopover={() => setOldCredentialsPopoverOpen(false)}
                      anchorPosition="downLeft"
                      panelPaddingSize="s"
                      panelStyle={{ width: '400px', maxWidth: '90vw', overflow: 'auto' }}
                    >
                      <div style={{ width: '100%' }}>
                        <EuiFlexGroup direction="column" gutterSize="xs" style={{ padding: 4 }}>
                          {/* AWS Credentials Section */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px' }}>
                              <strong>AWS Credentials (if exist)</strong>
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiFieldText size="xs" placeholder="username" style={{ height: 28, marginBottom: 6 }} />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiFieldText size="xs" type="password" placeholder="password" style={{ height: 28, marginBottom: 12 }} />
                          </EuiFlexItem>
                          
                          {/* Field Selection Section */}
                          <EuiFlexItem>
                            <EuiHorizontalRule margin="s" />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px' }}>
                              <strong>Display Fields</strong>
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '8px', fontSize: '10px' }}>
                              Select and reorder fields to display in results
                            </EuiText>
                          </EuiFlexItem>
                          
                          {/* Available Fields */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px', fontSize: '10px' }}>
                              Available Fields:
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <div style={{ 
                              maxHeight: '120px', 
                              overflowY: 'auto', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '4px',
                              padding: '4px',
                              background: '#f8fafc'
                            }}>
                              {availableFields.map((field, index) => (
                                <div key={field.value} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  padding: '2px 4px',
                                  marginBottom: '2px',
                                  background: selectedFields.includes(field.value) ? '#e6f3ff' : 'transparent',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  if (selectedFields.includes(field.value)) {
                                    setSelectedFields(selectedFields.filter(f => f !== field.value));
                                  } else {
                                    setSelectedFields([...selectedFields, field.value]);
                                  }
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field.value)}
                                    onChange={() => {}}
                                    style={{ marginRight: '6px', transform: 'scale(0.8)' }}
                                  />
                                  <span style={{ fontSize: '11px', color: '#374151' }}>
                                    {field.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </EuiFlexItem>
                          
                          {/* Selected Fields Order */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px', fontSize: '10px', marginTop: '8px' }}>
                              Selected Fields (drag to reorder):
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <div style={{ 
                              minHeight: '60px', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '4px',
                              padding: '4px',
                              background: '#fff'
                            }}>
                              {selectedFields.length > 0 ? (
                                selectedFields.map((fieldValue, index) => {
                                  const field = availableFields.find(f => f.value === fieldValue);
                                  return (
                                    <div key={fieldValue} style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      padding: '4px',
                                      marginBottom: '2px',
                                      background: '#f1f5f9',
                                      borderRadius: '3px',
                                      border: '1px solid #e2e8f0'
                                    }}>
                                      <span style={{ 
                                        fontSize: '10px', 
                                        color: '#6b7280',
                                        marginRight: '6px',
                                        cursor: 'grab'
                                      }}>⋮⋮</span>
                                      <span style={{ fontSize: '11px', color: '#374151', flex: 1 }}>
                                        {field ? field.text : fieldValue}
                                      </span>
                                      <button
                                        onClick={() => setSelectedFields(selectedFields.filter(f => f !== fieldValue))}
                                        style={{ 
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          padding: '0 4px'
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#9ca3af', 
                                  textAlign: 'center',
                                  padding: '8px'
                                }}>
                                  No fields selected
                                </div>
                              )}
                            </div>
                          </EuiFlexItem>
                          
                          {/* Reset Button */}
                          <EuiFlexItem>
                            <EuiButton
                              size="xs"
                              onClick={() => setSelectedFields(['title', 'agent', 'date'])}
                              style={{ 
                                background: '#f3f4f6',
                                color: '#374151',
                                marginTop: '4px',
                                height: '20px',
                                fontSize: '10px'
                              }}
                            >
                              Reset to Default
                            </EuiButton>
                          </EuiFlexItem>
                          
                          <EuiFlexItem>
                            <EuiButton
                              size="xs"
                              fill
                              onClick={() => setOldCredentialsPopoverOpen(false)}
                              style={{ 
                                background: '#1a73e8',
                                marginTop: '8px',
                                height: '24px',
                                fontSize: '12px'
                              }}
                            >
                              Save & Close
                            </EuiButton>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </div>
                    </EuiPopover>
                  </EuiFlexItem>
                  <EuiFlexItem grow={true}>
                    <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="space-between">
                      <EuiFlexItem grow={false}>
                        <EuiFlexGroup gutterSize="s" alignItems="center">
                          {usedQueryType && (
                            <EuiFlexItem grow={false}>
                              <EuiBadge color="primary" iconType="tag" size="s" style={{ 
                                background: '#1a73e8', 
                                marginRight: 8,
                                borderRadius: '6px',
                                color: '#fff'
                              }}>{usedQueryType}</EuiBadge>
                            </EuiFlexItem>
                          )}
                          
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      

                    </EuiFlexGroup>
                    {result?.body?.hits && (
                      <EuiText size="xs" color="subdued" style={{ margin: '8px 0 0 0' }}>
                        <EuiIcon type="document" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                        Total Results: <strong>{result?.body?.hits?.total?.value ?? 0}</strong>
                        <span style={{ marginLeft: 8 }}>
                          <EuiIcon type="clock" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                          Query Time: <strong>{result?.body?.took ?? 0}ms</strong>
                        </span>
                      </EuiText>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>
                


                
                <ResultTable
                  title="Old Query Results"
                  results={result}
                  currentPage={currentPage1}
                  totalPages={totalPages1}
                  onPageChange={handleSyncPageChange}
                  itemsPerPage={itemsPerPage}
                  displayField={displayField}
                  selectedFields={selectedFields}
                  loading={loading}
                  onPopoverToggle={(hit) => setPopoverOpen1(popoverOpen1 === hit?._id ? null : hit?._id)}
                  popoverOpen={popoverOpen1}
                  selectedHit={result?.body?.hits?.hits?.find(hit => hit._id === popoverOpen1)}
                />
                {result?.error && (
                  <>
                    <EuiSpacer size="xs" />
                    <EuiPanel color="danger" paddingSize="m" style={{ borderRadius: '8px' }}>
                      <EuiText size="s" color="danger">
                        <EuiIcon type="alert" style={{ marginRight: 8 }} />
                        <strong>Error:</strong> {result.error}
                      </EuiText>
                      {result.details && (
                        <>
                          <EuiSpacer size="xs" />
                          <EuiText size="xs" color="danger" style={{ fontStyle: 'italic' }}>
                            {result.details}
                          </EuiText>
                        </>
                      )}
                    </EuiPanel>
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
                            {/* Right Panel - Should display results2 state */}
            <EuiFlexItem grow={true}>
              <EuiPanel paddingSize="l" hasShadow style={{ 
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiTitle size="s" style={{ margin: 0 }}>
                      <h3 style={{ color: '#1a73e8', margin: 0, fontSize: '16px' }}>New Query</h3>
                    </EuiTitle>
                  </EuiFlexItem>
                  
                  {/* AI toggle hidden as requested; functionality remains wired */}

                  <EuiFlexItem grow={false} style={{ width: '300px' }}>
                    <EuiFieldText
                      label="URL"
                      placeholder="https://localhost:9200/new_index_name"
                      value={esUrl2}
                      onChange={(e) => setEsUrl2(e.target.value)}
                      fullWidth
                      prepend={<EuiIcon type="link" color="#1a73e8" />}
                      size="xs"
                      className="center-input"
                      style={{ 
                        verticalAlign: 'middle',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        textAlign: 'left',
                        marginTop: '0px',
                        fontSize: '16px'
                      }}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiPopover
                      button={
                        <EuiButton
                          iconType="gear"
                          size="s"
                          style={{ 
                            background: '#f8fafc', 
                            color: '#1a73e8',
                            height: '32px',
                            width: '32px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            padding: '0',
                            minWidth: '32px'
                          }}
                          onClick={() => setCredentialsPopoverOpen(!credentialsPopoverOpen)}
                        />
                      }
                      isOpen={credentialsPopoverOpen}
                      closePopover={() => setCredentialsPopoverOpen(false)}
                      anchorPosition="downLeft"
                      panelPaddingSize="s"
                      panelStyle={{ 
                        width: '400px',
                        maxWidth: '90vw',
                        overflow: 'auto'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <EuiFlexGroup direction="column" gutterSize="xs" style={{ padding: 4 }}>
                          {/* Elasticsearch Credentials Section */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px' }}>
                              <strong>Elasticsearch Credentials (if exist)</strong>
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiFieldText
                              label="Username"
                              placeholder="username"
                              value={esUsername2}
                              onChange={(e) => setEsUsername2(e.target.value)}
                              fullWidth
                              size="xs"
                              style={{ height: '28px' }}
                            />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiFieldText
                              label="Password"
                              type="password"
                              placeholder="password"
                              value={esPassword2}
                              onChange={(e) => setEsPassword2(e.target.value)}
                              fullWidth
                              size="xs"
                              style={{ height: '28px', marginBottom: 12 }}
                            />
                          </EuiFlexItem>
                          
                          {/* Field Selection Section */}
                          <EuiFlexItem>
                            <EuiHorizontalRule margin="s" />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px' }}>
                              <strong>Display Fields</strong>
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '8px', fontSize: '10px' }}>
                              Select and reorder fields to display in results
                            </EuiText>
                          </EuiFlexItem>
                          
                          {/* Available Fields */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px', fontSize: '10px' }}>
                              Available Fields:
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <div style={{ 
                              maxHeight: '120px', 
                              overflowY: 'auto', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '4px',
                              padding: '4px',
                              background: '#f8fafc'
                            }}>
                              {availableFields.map((field, index) => (
                                <div key={field.value} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  padding: '2px 4px',
                                  marginBottom: '2px',
                                  background: selectedFields2.includes(field.value) ? '#e6f3ff' : 'transparent',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  if (selectedFields2.includes(field.value)) {
                                    setSelectedFields2(selectedFields2.filter(f => f !== field.value));
                                  } else {
                                    setSelectedFields2([...selectedFields2, field.value]);
                                  }
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedFields2.includes(field.value)}
                                    onChange={() => {}}
                                    style={{ marginRight: '6px', transform: 'scale(0.8)' }}
                                  />
                                  <span style={{ fontSize: '11px', color: '#374151' }}>
                                    {field.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </EuiFlexItem>
                          
                          {/* Selected Fields Order */}
                          <EuiFlexItem>
                            <EuiText size="xs" color="subdued" style={{ marginBottom: '4px', fontSize: '10px', marginTop: '8px' }}>
                              Selected Fields (drag to reorder):
                            </EuiText>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <div style={{ 
                              minHeight: '60px', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '4px',
                              padding: '4px',
                              background: '#fff'
                            }}>
                              {selectedFields2.length > 0 ? (
                                selectedFields2.map((fieldValue, index) => {
                                  const field = availableFields.find(f => f.value === fieldValue);
                                  return (
                                    <div key={fieldValue} style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      padding: '4px',
                                      marginBottom: '2px',
                                      background: '#f1f5f9',
                                      borderRadius: '3px',
                                      border: '1px solid #e2e8f0'
                                    }}>
                                      <span style={{ 
                                        fontSize: '10px', 
                                        color: '#6b7280',
                                        marginRight: '6px',
                                        cursor: 'grab'
                                      }}>⋮⋮</span>
                                      <span style={{ fontSize: '11px', color: '#374151', flex: 1 }}>
                                        {field ? field.text : fieldValue}
                                      </span>
                                      <button
                                        onClick={() => setSelectedFields2(selectedFields2.filter(f => f !== fieldValue))}
                                        style={{ 
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          padding: '0 4px'
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#9ca3af', 
                                  textAlign: 'center',
                                  padding: '8px'
                                }}>
                                  No fields selected
                                </div>
                              )}
                            </div>
                          </EuiFlexItem>
                          
                          {/* Reset Button */}
                          <EuiFlexItem>
                            <EuiButton
                              size="xs"
                              onClick={() => setSelectedFields2(['title', 'agent', 'date'])}
                              style={{ 
                                background: '#f3f4f6',
                                color: '#374151',
                                marginTop: '4px',
                                height: '20px',
                                fontSize: '10px'
                              }}
                            >
                              Reset to Default
                            </EuiButton>
                          </EuiFlexItem>
                          
                          <EuiFlexItem>
                            <EuiButton
                              size="xs"
                              fill
                              onClick={() => setCredentialsPopoverOpen(false)}
                              style={{ 
                                background: '#1a73e8',
                                marginTop: '8px',
                                height: '24px',
                                fontSize: '12px'
                              }}
                            >
                              Save & Close
                            </EuiButton>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </div>
                    </EuiPopover>
                  </EuiFlexItem>
                  <EuiFlexItem grow={true}>
                    <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="space-between">
                      <EuiFlexItem grow={false}>
                        <EuiFlexGroup gutterSize="s" alignItems="center">
                          {usedQueryType2 && (
                            <EuiFlexItem grow={false}>
                              <EuiBadge color="primary" iconType="tag" size="s" style={{ 
                                background: '#1a73e8', 
                                marginRight: 8,
                                borderRadius: '6px',
                                color: '#fff'
                              }}>{usedQueryType2}</EuiBadge>
                            </EuiFlexItem>
                          )}
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      

                    </EuiFlexGroup>
                    {results2?.body?.hits && (
                      <EuiText size="xs" color="subdued" style={{ margin: '8px 0 0 0' }}>
                        <EuiIcon type="document" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                        Total Results: <strong>{results2?.body?.hits?.total?.value ?? 0}</strong>
                        {results2.body.took && (
                          <span style={{ marginLeft: 8 }}>
                            <EuiIcon type="clock" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                            Query Time: <strong>{results2.body.took}ms</strong>
                          </span>
                        )}
                      </EuiText>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>
                


                
                <ResultTable
                  title="New Query Results"
                  results={results2}
                  currentPage={currentPage2}
                  totalPages={totalPages2}
                  onPageChange={handleSyncPageChange}
                  itemsPerPage={itemsPerPage}
                  displayField={displayField}
                  selectedFields={selectedFields2}
                  loading={loading2}
                  onPopoverToggle={(hit) => setPopoverOpen2(popoverOpen2 === hit?._id ? null : hit?._id)}
                  popoverOpen={popoverOpen2}
                  selectedHit={results2?.body?.hits?.hits?.find(hit => hit._id === popoverOpen2)}
                />
                {results2?.error && (
                  <>
                    <EuiSpacer size="xs" />
                    <EuiPanel color="danger" paddingSize="m" style={{ borderRadius: '8px' }}>
                      <EuiText size="s" color="danger">
                        <EuiIcon type="alert" style={{ marginRight: 8 }} />
                        <strong>Error:</strong> {results2.error}
                      </EuiText>
                      {results2.details && (
                        <>
                          <EuiSpacer size="xs" />
                          <EuiText size="xs" color="danger" style={{ fontStyle: 'italic' }}>
                            {results2.details}
                          </EuiText>
                        </>
                      )}
                    </EuiPanel>
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageTemplate.Section>
      </EuiPageTemplate>
      
      {/* Query Edit Modal */}
      {isEditModalVisible && (
        <EuiModal onClose={() => setIsEditModalVisible(false)}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              Edit {editingQueryType} Query
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          
          <EuiModalBody>
            <EuiTextArea
              value={editingQueryContent}
              onChange={(e) => setEditingQueryContent(e.target.value)}
              rows={20}
              placeholder="Empty"
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px'
              }}
            />
            {(editingQueryContent === '' || editingQueryContent.trim() === '') && (
              <EuiText size="s" color="subdued" style={{ marginTop: '0px', fontStyle: 'italic' }}>
                File is empty. Start typing to add content.
              </EuiText>
            )}
          </EuiModalBody>
          
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => setIsEditModalVisible(false)}>
              Cancel
            </EuiButtonEmpty>
            <EuiButton onClick={saveQuery} fill>
              Save Changes
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}

      {/* Random Words Edit Modal */}
      {randomEditModalVisible && (
        <EuiModal onClose={() => setRandomEditModalVisible(false)}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              Edit Random Words
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          
          <EuiModalBody>
            <EuiTextArea
              value={randomWordsContent}
              onChange={(e) => setRandomWordsContent(e.target.value)}
              rows={15}
              placeholder="Enter random words, one per line..."
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            {randomSaveSuccess && (
              <>
                <EuiSpacer size="s" />
                <EuiText size="s" color="success">
                  <EuiIcon type="check" style={{ marginRight: 8 }} />
                  {randomSaveSuccess}
                </EuiText>
              </>
            )}
            {randomSaveError && (
              <>
                <EuiSpacer size="s" />
                <EuiText size="s" color="danger">
                  <EuiIcon type="alert" style={{ marginRight: 8 }} />
                  {randomSaveError}
                </EuiText>
              </>
            )}
          </EuiModalBody>
          
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => setRandomEditModalVisible(false)}>
              Cancel
            </EuiButtonEmpty>
            <EuiButton onClick={async () => {
              try {
                setRandomSaveError('');
                setRandomSaveSuccess('');
                const response = await fetch('/api/queries', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'save',
                    filename: 'random_words.txt',
                    content: randomWordsContent
                  })
                });
                
                if (response.ok) {
                  setRandomSaveSuccess('Changes saved successfully.');
                  setRandomSaveError('');
                  // Update random words directly from the saved content
                  const words = randomWordsContent.split('\n').filter(word => word.trim().length > 0);
                  setRandomWords(words);
                  
                  // Close modal after 2 seconds
                  setTimeout(() => {
                    setRandomEditModalVisible(false);
                    setRandomSaveSuccess('');
                  }, 2000);
                } else {
                  const errorData = await response.json();
                  setRandomSaveError(errorData.error || 'File could not be saved');
                }
              } catch (error) {
                console.error('Error saving random words:', error);
                setRandomSaveError('Network error occurred');
              }
            }} fill>
              Save Changes
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}

      {/* Footer */}
      <EuiSpacer size="xl" />
      <EuiPanel paddingSize="m" hasShadow={false} style={{ 
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0',
        marginTop: 'auto'
      }}>
        <EuiFlexGroup gutterSize="m" alignItems="center" justifyContent="center">
          <EuiFlexItem grow={false}>
            <EuiText size="s" color="subdued">
              Powered by{' '}
              <a 
                href="https://searchali.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 'bold' }}
              >
                searchali.com
              </a>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s" color="subdued">
              •
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s" color="subdued">
                             <a 
                 href="https://www.linkedin.com/company/searchali-com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{ color: '#1a73e8', textDecoration: 'none' }}
               >
                 <svg 
                   width="14" 
                   height="14" 
                   viewBox="0 0 24 24" 
                   fill="currentColor" 
                   style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }}
                 >
                   <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                 </svg>
                 Follow us on LinkedIn
               </a>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
} 