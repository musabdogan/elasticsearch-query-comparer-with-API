import { useState, useMemo, useEffect } from 'react';
import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderLogo,
  EuiHeaderBreadcrumbs,
  EuiSideNav,
  EuiPageTemplate,
  EuiTitle,
  EuiTextArea,
  EuiButton,
  EuiSpacer,
  EuiCodeBlock,
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
  EuiToolTip,
  EuiPopover,
} from '@elastic/eui';

const ITEMS_PER_PAGE = 10;

export default function Layout({
  esUrl1, setEsUrl1,
  esUrl2, setEsUrl2,
  esUsername, setEsUsername,
  esPassword, setEsPassword,
  esIndex, setEsIndex,
  searchTerm, setSearchTerm,
  usedQueryType, usedDsl, result, loading,
  currentPage1, handleSearch, totalPages1,
  query2, setQuery2, results2, loading2,
  currentPage2, handleQuery2, totalPages2,
  newQueryWordCount
}) {
  const [randomWords, setRandomWords] = useState([]);
  // Popover state for both result lists
  const [popoverOpen1, setPopoverOpen1] = useState(null); // index of open popover for result 1
  const [popoverOpen2, setPopoverOpen2] = useState(null); // index of open popover for result 2

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
            <EuiHeaderLogo iconType="logoElasticsearch" href="#" aria-label="Elasticsearch Viewer" />
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem>
            <EuiHeaderBreadcrumbs
              breadcrumbs={[{ text: 'Elasticsearch Query Viewer', href: '#' }]}
              aria-label="App breadcrumbs"
            />
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
                <img 
                  src="https://www.chefsdeal.com/_next/static/media/logo.0e622da5.svg" 
                  alt="ChefsDeal Logo" 
                  style={{ 
                    height: '32px',
                    width: 'auto'
                  }} 
                />
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
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '-8px',
                    fontSize: '16px',
                    paddingLeft: '32px'
                  }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
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
                    border: '1px solid #e2e8f0',
                    marginRight: '8px'
                  }}
                >
                  Random
                </EuiButton>
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
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Search
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
                      label="URL"
                      placeholder="http://localhost:9200/index"
                      value={esUrl1}
                      onChange={(e) => setEsUrl1(e.target.value)}
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
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '-8px',
                        fontSize: '16px',
                        paddingLeft: '32px'
                      }}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={true}>
                    {usedQueryType && (
                      <EuiBadge color="primary" iconType="tag" size="s" style={{ 
                        background: '#1a73e8', 
                        marginRight: 8,
                        borderRadius: '6px'
                      }}>{usedQueryType}</EuiBadge>
                    )}
                    {result?.body?.hits && (
                      <EuiText size="xs" color="subdued" style={{ margin: 0 }}>
                        <EuiIcon type="document" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                        Total Results: <strong>{result.body.hits.total.value}</strong>
                        {result.body.took && (
                          <span style={{ marginLeft: 8 }}>
                            <EuiIcon type="clock" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                            Query Time: <strong>{result.body.took}ms</strong>
                          </span>
                        )}
                      </EuiText>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>
                {result?.body?.hits && (
                  <>
                    <EuiSpacer size="s" />
                    <EuiHorizontalRule margin="s" style={{ background: '#e2e8f0' }} />
                    <EuiSpacer size="s" />
                    <EuiFlexGroup gutterSize="m">
                      <EuiFlexItem>
                        {result.body.hits.hits.map((hit, index) => (
                          (index < 5) && (
                            <EuiPopover
                              key={hit._id}
                              button={
                                <div
                                  title={hit._source.data.model_code || 'Model code not found'}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setPopoverOpen1(popoverOpen1 === index ? null : index)}
                                >
                                  <EuiCard
                                    title={(() => {
                                      // Prefer data.name, then data.product_name
                                      const name = hit._source?.data?.name;
                                      const productName = hit._source?.data?.product_name;
                                      // Check for highlight in data.name or data.product_name
                                      if (hit.highlight) {
                                        if (hit.highlight['data.name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.name'][0]
                                              }}
                                            />
                                          );
                                        } else if (hit.highlight['data.product_name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.product_name'][0]
                                              }}
                                            />
                                          );
                                        }
                                      }
                                      // Fallback to plain name or product_name
                                      if (name) {
                                        return `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ${name}`;
                                      }
                                      return `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ${productName}`;
                                    })()}
                                    description={null}
                                    paddingSize="s"
                                    textAlign="left"
                                    style={{ 
                                      marginBottom: 4, 
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      cursor: 'pointer'
                                    }}
                                  />
                                </div>
                              }
                              isOpen={popoverOpen1 === index}
                              closePopover={() => setPopoverOpen1(null)}
                              anchorPosition="downCenter"
                              panelPaddingSize="m"
                            >
                              <EuiText size="s">
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                                  {JSON.stringify(hit._source, null, 2)}
                                </pre>
                              </EuiText>
                            </EuiPopover>
                          )
                        ))}
                      </EuiFlexItem>
                      <EuiFlexItem>
                        {result.body.hits.hits.map((hit, index) => (
                          (index >= 5 && index < 10) && (
                            <EuiPopover
                              key={hit._id}
                              button={
                                <div
                                  title={hit._source.data.model_code || 'Model code not found'}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setPopoverOpen1(popoverOpen1 === index ? null : index)}
                                >
                                  <EuiCard
                                    title={(() => {
                                      // Prefer data.name, then data.product_name
                                      const name = hit._source?.data?.name;
                                      const productName = hit._source?.data?.product_name;
                                      // Check for highlight in data.name or data.product_name
                                      if (hit.highlight) {
                                        if (hit.highlight['data.name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.name'][0]
                                              }}
                                            />
                                          );
                                        } else if (hit.highlight['data.product_name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.product_name'][0]
                                              }}
                                            />
                                          );
                                        }
                                      }
                                      // Fallback to plain name or product_name
                                      if (name) {
                                        return `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ${name}`;
                                      }
                                      return `#${(typeof currentPage1 !== 'undefined' ? currentPage1 : 0) * ITEMS_PER_PAGE + index + 1}: ${productName}`;
                                    })()}
                                    description={null}
                                    paddingSize="s"
                                    textAlign="left"
                                    style={{ 
                                      marginBottom: 4, 
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      cursor: 'pointer'
                                    }}
                                  />
                                </div>
                              }
                              isOpen={popoverOpen1 === index}
                              closePopover={() => setPopoverOpen1(null)}
                              anchorPosition="downCenter"
                              panelPaddingSize="m"
                            >
                              <EuiText size="s">
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                                  {JSON.stringify(hit._source, null, 2)}
                                </pre>
                              </EuiText>
                            </EuiPopover>
                          )
                        ))}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size="xxs" />
                    {totalPages1 > 1 && (
                      <EuiPagination
                        pageCount={totalPages1}
                        activePage={currentPage1}
                        onPageClick={page => handleSearch(page)}
                        style={{ justifyContent: 'center' }}
                        compressed
                      />
                    )}
                  </>
                )}
                {result?.error && (
                  <>
                    <EuiSpacer size="xs" />
                    <EuiPanel color="danger" paddingSize="m" style={{ borderRadius: '8px' }}>
                      <EuiText size="s" color="danger">
                        <EuiIcon type="alert" style={{ marginRight: 8 }} />
                        Error: {result.error}
                      </EuiText>
                    </EuiPanel>
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
            {/* Right Panel - Should display results2 state (musab-test) */}
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
                  <EuiFlexItem grow={false} style={{ width: '375px' }}>
                    <EuiFieldText
                      label="URL"
                      placeholder="http://localhost:9200/index"
                      value={esUrl2}
                      onChange={(e) => setEsUrl2(e.target.value)}
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
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '-8px',
                        fontSize: '16px',
                        paddingLeft: '32px'
                      }}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={true}>
                    <EuiFlexGroup gutterSize="s" alignItems="center">
                      {typeof newQueryWordCount === 'number' && newQueryWordCount > 0 && (
                        <EuiFlexItem grow={false}>
                          <EuiBadge color="primary" iconType="tag" size="s" style={{ 
                            background: '#1a73e8', 
                            marginRight: 8,
                            borderRadius: '6px',
                            color: '#fff'
                          }}>Number of words: {newQueryWordCount}</EuiBadge>
                        </EuiFlexItem>
                      )}
                      {results2?.isFallback && (
                        <EuiFlexItem grow={false}>
                          <EuiBadge color="success" iconType="check" size="s" style={{ 
                            background: '#34a853', 
                            marginRight: 8,
                            borderRadius: '6px',
                            color: '#fff'
                          }}>Fallback</EuiBadge>
                        </EuiFlexItem>
                      )}
                    </EuiFlexGroup>
                    {results2?.body?.hits && (
                      <EuiText size="xs" color="subdued" style={{ margin: '8px 0 0 0' }}>
                        <EuiIcon type="document" size="xs" style={{ marginRight: 2, color: '#1a73e8' }} />
                        Total Results: <strong>{results2.body.hits.total.value}</strong>
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
                {results2?.body?.hits && (
                  <>
                    <EuiSpacer size="s" />
                    <EuiHorizontalRule margin="s" style={{ background: '#e2e8f0' }} />
                    <EuiSpacer size="s" />
                    <EuiFlexGroup gutterSize="m">
                      <EuiFlexItem>
                        {results2.body.hits.hits.map((hit, index) => (
                          (index < 5) && (
                            <EuiPopover
                              key={hit._id}
                              button={
                                <div
                                  title={hit._source.data.model_code || 'Model code not found'}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setPopoverOpen2(popoverOpen2 === index ? null : index)}
                                >
                                  <EuiCard
                                    title={(() => {
                                      // Prefer data.name, then data.product_name
                                      const name = hit._source?.data?.name;
                                      const productName = hit._source?.data?.product_name;
                                      // Check for highlight in data.name or data.product_name
                                      if (hit.highlight) {
                                        if (hit.highlight['data.name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.name'][0]
                                              }}
                                            />
                                          );
                                        } else if (hit.highlight['data.product_name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.product_name'][0]
                                              }}
                                            />
                                          );
                                        }
                                      }
                                      // Fallback to plain name or product_name
                                      if (name) {
                                        return `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ${name}`;
                                      }
                                      return `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ${productName}`;
                                    })()}
                                    description={null}
                                    paddingSize="s"
                                    textAlign="left"
                                    style={{ 
                                      marginBottom: 4, 
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      cursor: 'pointer'
                                    }}
                                  />
                                </div>
                              }
                              isOpen={popoverOpen2 === index}
                              closePopover={() => setPopoverOpen2(null)}
                              anchorPosition="downCenter"
                              panelPaddingSize="m"
                            >
                              <EuiText size="s">
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                                  {JSON.stringify(hit._source, null, 2)}
                                </pre>
                              </EuiText>
                            </EuiPopover>
                          )
                        ))}
                      </EuiFlexItem>
                      <EuiFlexItem>
                        {results2.body.hits.hits.map((hit, index) => (
                          (index >= 5 && index < 10) && (
                            <EuiPopover
                              key={hit._id}
                              button={
                                <div
                                  title={hit._source.data.model_code || 'Model code not found'}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setPopoverOpen2(popoverOpen2 === index ? null : index)}
                                >
                                  <EuiCard
                                    title={(() => {
                                      // Prefer data.name, then data.product_name
                                      const name = hit._source?.data?.name;
                                      const productName = hit._source?.data?.product_name;
                                      // Check for highlight in data.name or data.product_name
                                      if (hit.highlight) {
                                        if (hit.highlight['data.name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.name'][0]
                                              }}
                                            />
                                          );
                                        } else if (hit.highlight['data.product_name']) {
                                          return (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ` + hit.highlight['data.product_name'][0]
                                              }}
                                            />
                                          );
                                        }
                                      }
                                      // Fallback to plain name or product_name
                                      if (name) {
                                        return `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ${name}`;
                                      }
                                      return `#${(typeof currentPage2 !== 'undefined' ? currentPage2 : 0) * ITEMS_PER_PAGE + index + 1}: ${productName}`;
                                    })()}
                                    description={null}
                                    paddingSize="s"
                                    textAlign="left"
                                    style={{ 
                                      marginBottom: 4, 
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      cursor: 'pointer'
                                    }}
                                  />
                                </div>
                              }
                              isOpen={popoverOpen2 === index}
                              closePopover={() => setPopoverOpen2(null)}
                              anchorPosition="downCenter"
                              panelPaddingSize="m"
                            >
                              <EuiText size="s">
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                                  {JSON.stringify(hit._source, null, 2)}
                                </pre>
                              </EuiText>
                            </EuiPopover>
                          )
                        ))}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size="xxs" />
                    {totalPages2 > 1 && (
                      <EuiPagination
                        pageCount={totalPages2}
                        activePage={currentPage2}
                        onPageClick={page => handleQuery2(page)}
                        style={{ justifyContent: 'center' }}
                        compressed
                      />
                    )}
                  </>
                )}
                {results2?.error && (
                  <>
                    <EuiSpacer size="xs" />
                    <EuiPanel color="danger" paddingSize="m" style={{ borderRadius: '8px' }}>
                      <EuiText size="s" color="danger">
                        <EuiIcon type="alert" style={{ marginRight: 8 }} />
                        Error: {results2.error}
                      </EuiText>
                    </EuiPanel>
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageTemplate.Section>
      </EuiPageTemplate>
    </div>
  );
} 