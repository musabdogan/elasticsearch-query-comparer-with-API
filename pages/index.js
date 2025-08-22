import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
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
} from '@elastic/eui';
import dynamic from 'next/dynamic';

const Layout = dynamic(() => import('../components/Layout'), { ssr: false });

const sideNav = [
  { name: 'Query', id: 'query', items: [] },
  { name: 'Query Management', id: 'queries', items: [] },
  { name: 'History', id: 'history', items: [] },
  { name: 'Settings', id: 'settings', items: [] },
];

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const router = useRouter();
  const [awsApiUrl, setAwsApiUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('awsApiUrl') || 'Your Query API URL';
    }
    return 'Your Query API URL';
  });
  const [esUrl1, setEsUrl1] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('esUrl1') || process.env.ES_URL_1 || '';
    }
    return process.env.ES_URL_1 || '';
  });
  const [esUrl2, setEsUrl2] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('esUrl2') || 'https://localhost:9200/new_index_name';
    }
    return 'https://localhost:9200/new_index_name';
  });
  // Security: keep credentials in memory only (do not persist)
  const [esUsername2, setEsUsername2] = useState('');
  const [esPassword2, setEsPassword2] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [usedQueryType, setUsedQueryType] = useState('');
  const [usedDsl, setUsedDsl] = useState('');
  const [usedQueryType2, setUsedQueryType2] = useState('');
  const [result, setResult] = useState(null);
  
  // Query editing states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingQueryType, setEditingQueryType] = useState('');
  const [editingQueryContent, setEditingQueryContent] = useState('');
  const [editingQueryFile, setEditingQueryFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage1, setCurrentPage1] = useState(0);
  const [results2, setResults2] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [currentPage2, setCurrentPage2] = useState(0);
  const [newQueryWordCount, setNewQueryWordCount] = useState(0);
  const [embeddingsEnabled, setEmbeddingsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('embeddingsEnabled') === 'true';
    }
    return true;
  });

  // Query selection and function controls
  const [availableQueries, setAvailableQueries] = useState([]);
  
  // Items per page settings
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Display field settings
  const [displayField, setDisplayField] = useState('title');
  
  // Query type will be determined automatically based on search term
  


  // Save only non-sensitive values to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awsApiUrl', awsApiUrl);
      localStorage.setItem('esUrl1', esUrl1);
      localStorage.setItem('esUrl2', esUrl2);
      localStorage.setItem('embeddingsEnabled', embeddingsEnabled.toString());
    }
  }, [awsApiUrl, esUrl1, esUrl2, embeddingsEnabled]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setNewQueryWordCount(searchTerm.trim() ? searchTerm.trim().split(/\s+/).length : 0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load available queries
  useEffect(() => {
    const loadQueries = async () => {
      try {
        const response = await fetch('/api/queries?action=list');
        const data = await response.json();
        if (response.ok) {
          setAvailableQueries(data.files);
        }
      } catch (error) {
        console.error('Failed to load queries:', error);
      }
    };
    loadQueries();
  }, []);

  // Search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(0);
      handleQuery2(0);
    }
  }, [debouncedSearchTerm]);

  // Synchronized page change for both queries
  const handleSyncPageChange = async (page = 0) => {
    setCurrentPage1(page);
    setCurrentPage2(page);
    await Promise.all([
      handleSearch(page),
      handleQuery2(page)
    ]);
  };

  const handleSearch = async (page = 0) => {
    setLoading(true);
    setCurrentPage1(page);

    try {
      // Call AWS API directly
      const response = await fetch('/api/aws-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          awsApiUrl: awsApiUrl.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        setUsedQueryType('AWS API Search');
        setUsedDsl('AWS API call');
      } else {
        setResult({ error: data.error || 'Failed to fetch data from AWS API' });
      }
    } catch (error) {
      console.error("Search error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuery2 = async (page = 0) => {
    setLoading2(true);
    setCurrentPage2(page);

    try {
      if (!searchTerm.trim()) {
        setResults2({ error: 'Please enter a search term' });
        setUsedQueryType2('Error');
        return;
      }

      if (!esUrl2.trim()) {
        setResults2({ error: 'Please enter Elasticsearch URL for New Query' });
        setUsedQueryType2('Error');
        return;
      }

      // Choose API endpoint based on embeddings setting
      const apiEndpoint = embeddingsEnabled ? '/api/elasticsearch-dynamic' : '/api/elasticsearch-function-score';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ES-Username': esUsername2.trim(),
          'X-ES-Password': esPassword2.trim(),
          'X-OpenAI-API-Key': openaiApiKey.trim()
        },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          esUrl: esUrl2.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResults2(data);
      setUsedQueryType2(embeddingsEnabled ? 'Dynamic Query + Embeddings' : 'Function Score Query');
    } catch (error) {
      console.error("Search error Query 2:", error);
      setResults2({ error: error.message });
      setUsedQueryType2('Error');
    } finally {
      setLoading2(false);
    }
  };

  // Calculate total pages for each result set
  const totalPages1 = useMemo(() => {
    const totalValue = result?.body?.hits?.total?.value;
    return totalValue ? Math.ceil(Number(totalValue) / itemsPerPage) : 0;
  }, [result, itemsPerPage]);

  const totalPages2 = useMemo(() => {
    const totalValue = results2?.body?.hits?.total?.value;
    return totalValue ? Math.ceil(Number(totalValue) / itemsPerPage) : 0;
  }, [results2, itemsPerPage]);

  // Query editing functions
  const openEditModal = async (queryType, isOldQuery = true) => {
    let fileName = '';
    if (isOldQuery) {
      switch (queryType) {
        case 'single':
          fileName = 'old_query_single_word.txt';
          break;
        case 'multi':
          fileName = 'old_query_multi_word.txt';
          break;
        case 'fallback':
          fileName = 'old_query_fallback.txt';
          break;
      }
    } else {
      switch (queryType) {
        case 'single':
          fileName = 'new_query.txt';
          break;
        case 'multi':
          fileName = 'new_query_multi_word.txt';
          break;
        case 'fallback':
          fileName = 'new_query_fallback.txt';
          break;
      }
    }

    try {
      const response = await fetch(`/api/queries?action=read&filename=${fileName}`);
      const data = await response.json();
      // Allow empty files to be opened
      setEditingQueryContent(data.content && data.content.trim() !== '' ? data.content : '');
      setEditingQueryFile(fileName);
      setEditingQueryType(queryType);
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error reading query file:', error);
      // Even if file doesn't exist, open modal with empty content
      setEditingQueryContent('');
      setEditingQueryFile(fileName);
      setEditingQueryType(queryType);
      setIsEditModalVisible(true);
    }
  };

  const saveQuery = async () => {
    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          filename: editingQueryFile,
          content: editingQueryContent
        })
      });
      
      if (response.ok) {
        setIsEditModalVisible(false);
        setEditingQueryContent('');
        setEditingQueryFile('');
        setEditingQueryType('');
        
        // Trigger empty files check to update button colors
        if (typeof window !== 'undefined' && window.updateEmptyFiles) {
          window.updateEmptyFiles();
        }
      }
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  return (
            <Layout
          awsApiUrl={awsApiUrl}
          setAwsApiUrl={setAwsApiUrl}
          esUrl1={esUrl1}
          setEsUrl1={setEsUrl1}
      esUrl2={esUrl2}
      setEsUrl2={setEsUrl2}
      esUsername2={esUsername2}
      setEsUsername2={setEsUsername2}
      esPassword2={esPassword2}
      setEsPassword2={setEsPassword2}
      openaiApiKey={openaiApiKey}
      setOpenaiApiKey={setOpenaiApiKey}
      embeddingsEnabled={embeddingsEnabled}
      setEmbeddingsEnabled={setEmbeddingsEnabled}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      usedQueryType={usedQueryType}
      usedDsl={usedDsl}
      usedQueryType2={usedQueryType2}
      result={result}
      loading={loading}
      currentPage1={currentPage1}
      handleSearch={handleSearch}
      totalPages1={totalPages1}
      results2={results2}
      loading2={loading2}
      currentPage2={currentPage2}
      handleQuery2={handleQuery2}
      totalPages2={totalPages2}
      handleSyncPageChange={handleSyncPageChange}
      newQueryWordCount={newQueryWordCount}
      availableQueries={availableQueries}
      openEditModal={openEditModal}
      saveQuery={saveQuery}
      isEditModalVisible={isEditModalVisible}
      setIsEditModalVisible={setIsEditModalVisible}
      editingQueryContent={editingQueryContent}
      setEditingQueryContent={setEditingQueryContent}
      editingQueryType={editingQueryType}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      displayField={displayField}
      setDisplayField={setDisplayField}
    />
  );
} 