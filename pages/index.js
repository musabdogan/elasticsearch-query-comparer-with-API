import { useState, useMemo, useEffect, useCallback } from 'react';
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

const multiWordDsl = `{
  "query": {
    "function_score": {
      "boost_mode": "multiply",
      "functions": [
        {
          "field_value_factor": {
            "field": "data.z_product_score_global",
            "factor": 1,
            "missing": 1,
            "modifier": "sqrt"
          }
        }
      ],
      "query": {
        "bool": {
          "filter": [
            { "term": { "type": { "value": 129 } } },
            { "terms": { "status": [0, 2] } }
          ],
          "must": [
            { "dis_max": { "queries": [
              { "match": { "data.name": { "query": "{{term}}" } } },
              { "match": { "data.sku": { "query": "{{term}}" } } },
              { "match": { "data.model_code": { "query": "{{term}}" } } },
              { "match": { "data.manufacturer_label": { "query": "{{term}}" } } },
              { "match": { "data.short_description": { "query": "{{term}}" } } },
              { "match": { "data.name": { "analyzer": "english", "query": "{{term}}" } } },
              { "match": { "data.short_description": { "analyzer": "english", "query": "{{term}}" } } },
              { "match_phrase": { "data.name": { "boost": 2, "query": "{{term}}" } } },
              { "match_phrase": { "data.manufacturer_label": { "boost": 2, "query": "{{term}}" } } },
              { "match_phrase": { "data.short_description": { "boost": 2, "query": "{{term}}" } } }
            ], "tie_breaker": 0 } }
          ]
        }
      },
      "score_mode": "multiply"
    }
  },
  "_source": ["data.product_name"],
  "size": {{size}},
  "from": {{from}}
}`;

const singleWordDsl = `{
  "query": {
    "function_score": {
      "boost_mode": "multiply",
      "functions": [
        {
          "field_value_factor": {
            "field": "data.z_product_score_global",
            "factor": 1,
            "missing": 1,
            "modifier": "sqrt"
          }
        }
      ],
      "query": {
        "bool": {
          "filter": [
            { "term": { "type": { "value": 129 } } },
            { "terms": { "status": [0, 2] } }
          ],
          "must": [
            { "dis_max": { "queries": [
              { "match": { "data.name": { "query": "{{term}}" } } },
              { "match": { "data.sku": { "query": "{{term}}" } } },
              { "match": { "data.model_code": { "query": "{{term}}" } } },
              { "match": { "data.manufacturer_label": { "query": "{{term}}" } } },
              { "match": { "data.short_description": { "query": "{{term}}" } } },
              { "match": { "data.name": { "analyzer": "english", "query": "{{term}}" } } },
              { "match": { "data.short_description": { "analyzer": "english", "query": "{{term}}" } } },
              { "match_phrase": { "data.name": { "boost": 2, "query": "{{term}}" } } },
              { "match_phrase": { "data.manufacturer_label": { "boost": 2, "query": "{{term}}" } } },
              { "match_phrase": { "data.short_description": { "boost": 2, "query": "{{term}}" } } },
              { "prefix": { "data.name": { "value": "{{term}}" } } },
              { "prefix": { "data.manufacturer_label": { "value": "{{term}}" } } },
              { "prefix": { "data.short_description": { "value": "{{term}}" } } },
              { "wildcard": { "data.name": { "value": "*{{term}}*" } } },
              { "wildcard": { "data.manufacturer_label": { "value": "*{{term}}*" } } },
              { "wildcard": { "data.short_description": { "value": "*{{term}}*" } } },
              { "term": { "data.sku": { "value": "{{term}}" } } },
              { "term": { "data.model_code": { "value": "{{term}}" } } }
            ], "tie_breaker": 0 } }
          ]
        }
      },
      "score_mode": "multiply"
    }
  },
  "_source": ["data.product_name"],
  "size": {{size}},
  "from": {{from}}
}`;

const oldQueryDsl = `{
  "size": 25,
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "filter": [
            { "term": { "type": 129 } },
            { "terms": { "status": [0, 2] } }
          ],
          "must": {
            "dis_max": {
              "queries": [
                { "term": { "data.sku": { "value": "{{term}}", "boost": 5 } } },
                { "term": { "data.model_code": { "value": "{{term}}", "boost": 5 } } },
                { "match_phrase": { "data.name": { "query": "{{term}}", "boost": 5 } } },
                { "match_phrase": { "data.short_description": { "query": "{{term}}", "boost": 3 } } },
                { "match_phrase": { "data.manufacturer_label": { "query": "{{term}}", "boost": 3 } } },
                { "match_phrase": { "data.product_name.keyword": { "query": "{{term}}", "boost": 3 } } },
                { "match": { "data.name": { "query": "{{term}}", "operator": "and" } } },
                { "match": { "data.short_description": { "query": "{{term}}", "operator": "and" } } },
                { "match": { "data.manufacturer_label": { "query": "{{term}}", "operator": "and" } } },
                { "match": { "data.product_name.keyword": { "query": "{{term}}", "operator": "and" } } },
                { "wildcard": { "data.name": { "value": "*{{term}}*" } } },
                { "wildcard": { "data.manufacturer_label": { "value": "*{{term}}*" } } },
                { "wildcard": { "data.short_description.keyword": { "value": "*{{term}}*" } } },
                { "wildcard": { "data.sku": { "value": "*{{term}}*" } } },
                { "wildcard": { "data.model_code": { "value": "*{{term}}*" } } },
                { "wildcard": { "data.product_name.keyword": { "value": "*{{term}}*" } } }
              ],
              "tie_breaker": 0.3
            }
          }
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "data.z_product_score_global",
            "factor": 1,
            "modifier": "sqrt",
            "missing": 1
          }
        }
      ],
      "boost_mode": "multiply",
      "score_mode": "multiply"
    }
  },
  "_source": ["data.name", "data.sku", "data.model_code", "data.z_product_score_global", "data.short_description", "data.product_name", "data.manufacturer_label", "data.product_name"]
}`;

const ITEMS_PER_PAGE = 10; // Sayfa başına gösterilecek öğe sayısı

export default function Home() {
  const [esUrl1, setEsUrl1] = useState(process.env.ES_URL_1 || '');
  const [esUrl2, setEsUrl2] = useState(process.env.ES_URL_2 || '');
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
      // DSL sorgusunu dosyadan çek
      const queryType = searchTerm.trim().split(/\s+/).length > 1 ? 'old_query_multi_word' : 'old_query_single_word';
      const dslResponse = await fetch(`/api/dsl?query=${queryType}`);
      const { dsl } = await dslResponse.json();

      // DSL'i hazırla
      const preparedDsl = dsl.replace(/\{\{term\}\}/g, searchTerm.trim())
                            .replace(/\{\{size\}\}/g, size)
                            .replace(/\{\{from\}\}/g, from);

      console.log("Sending request with DSL:", preparedDsl);
      const response = await fetch('/api/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: esUrl1,
          query: JSON.parse(preparedDsl),
        }),
      });
      const data = await response.json();
      console.log("Received response:", data);
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

    const from = page * 25; // Sorgu 2 için 25 öğe/sayfa
    const size = 25;

    try {
      // Yeni sorguyu dosyadan çek
      const dslResponse = await fetch('/api/dsl?query=new_query');
      const { dsl } = await dslResponse.json();

      // DSL'i hazırla
      const preparedDsl = dsl.replace(/\{\{term\}\}/g, searchTerm.trim())
                            .replace(/\{\{size\}\}/g, size)
                            .replace(/\{\{from\}\}/g, from);

      console.log("Sending Query 2 request with DSL:", preparedDsl);
      const response2 = await fetch('/api/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: esUrl2,
          query: JSON.parse(preparedDsl),
        }),
      });
      const data2 = await response2.json();
      console.log("Received Query 2 response:", data2);
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
    results2?.body?.hits?.total?.value ? Math.ceil(results2.body.hits.total.value / 25) : 0 // Sorgu 2 için 25 öğe/sayfa
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