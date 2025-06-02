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
  { name: 'History', id: 'history', items: [] },
  { name: 'Settings', id: 'settings', items: [] },
];

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const router = useRouter();
  const [esUrl1, setEsUrl1] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('esUrl1') || process.env.ES_URL_1 || '';
    }
    return process.env.ES_URL_1 || '';
  });
  const [esUrl2, setEsUrl2] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('esUrl2') || process.env.ES_URL_2 || '';
    }
    return process.env.ES_URL_2 || '';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [usedQueryType, setUsedQueryType] = useState('');
  const [usedDsl, setUsedDsl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage1, setCurrentPage1] = useState(0);
  const [results2, setResults2] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [currentPage2, setCurrentPage2] = useState(0);

  // Save URLs to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('esUrl1', esUrl1);
      localStorage.setItem('esUrl2', esUrl2);
    }
  }, [esUrl1, esUrl2]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(0);
      handleQuery2(0);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (page = 0) => {
    setLoading(true);
    setCurrentPage1(page);

    const from = page * ITEMS_PER_PAGE;
    const size = ITEMS_PER_PAGE;

    try {
      // Get DSL query from file
      const queryType = searchTerm.trim().split(/\s+/).length > 1 ? 'old_query_multi_word' : 'old_query_single_word';
      const dslResponse = await fetch(`/api/dsl?query=${queryType}`);
      const { dsl } = await dslResponse.json();

      // Prepare DSL
      const preparedDsl = dsl.replace(/\{\{term\}\}/g, searchTerm.trim())
                            .replace(/\{\{size\}\}/g, size)
                            .replace(/\{\{from\}\}/g, from);

      const response = await fetch('/api/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: esUrl1,
          query: JSON.parse(preparedDsl),
        }),
      });
      const data = await response.json();
      setResult(data);
      setUsedQueryType(queryType === 'old_query_multi_word' ? 'Multi Word Query' : 'Single Word Query');
      setUsedDsl(preparedDsl);
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

    const from = page * ITEMS_PER_PAGE;
    const size = ITEMS_PER_PAGE;

    try {
      // Get new query from file
      const dslResponse = await fetch('/api/dsl?query=new_query');
      const { dsl } = await dslResponse.json();

      // Prepare DSL
      const preparedDsl = dsl.replace(/\{\{term\}\}/g, searchTerm.trim())
                            .replace(/\{\{size\}\}/g, size)
                            .replace(/\{\{from\}\}/g, from);

      const response2 = await fetch('/api/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: esUrl2,
          query: JSON.parse(preparedDsl),
        }),
      });
      const data2 = await response2.json();
      setResults2(data2);
    } catch (error) {
      console.error("Search error Query 2:", error);
      setResults2({ error: error.message });
    } finally {
      setLoading2(false);
    }
  };

  // Calculate total pages for each result set
  const totalPages1 = useMemo(() => 
    result?.body?.hits?.total?.value ? Math.ceil(result.body.hits.total.value / ITEMS_PER_PAGE) : 0
  , [result]);

  const totalPages2 = useMemo(() => 
    results2?.body?.hits?.total?.value ? Math.ceil(results2.body.hits.total.value / ITEMS_PER_PAGE) : 0
  , [results2]);

  return (
    <Layout
      esUrl1={esUrl1}
      setEsUrl1={setEsUrl1}
      esUrl2={esUrl2}
      setEsUrl2={setEsUrl2}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      usedQueryType={usedQueryType}
      usedDsl={usedDsl}
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
    />
  );
} 