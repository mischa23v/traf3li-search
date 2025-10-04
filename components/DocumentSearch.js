import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function DocumentSearch() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ 
    court: '', 
    judgmentFor: '',
    dateFrom: '', 
    dateTo: '' 
  });
  const [results, setResults] = useState([]);
  const [aggregations, setAggregations] = useState({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const debounced = useDebounce(query, 300);

  async function performSearch(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        q: debounced, 
        page: p, 
        limit: 10, 
        ...filters 
      });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.documents || []);
      setAggregations(data.aggregations || {});
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session?.user?.authorized) {
      performSearch(1);
    }
  }, [debounced, filters, session]);

  if (!session?.user?.authorized) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>البحث في الأحكام القضائية</h3>
        <p>يرجى تسجيل الدخول للبحث في المستندات</p>
      </div>
    );
  }

  return (
    <div className="document-search">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>البحث في الأحكام القانونية</h2>
        <p style={{ color: '#666' }}>ابحث في {total} حكم قضائي</p>
      </div>

      {/* Main Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن رقم القضية، الأطراف، المحكمة، الكلمات المفتاحية..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            direction: 'rtl'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <select
          value={filters.court}
          onChange={(e) => setFilters({ ...filters, court: e.target.value })}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            direction: 'rtl'
          }}
        >
          <option value="">جميع المحاكم</option>
          {aggregations.courts?.map(c => (
            <option key={c.court} value={c.court}>
              {c.court} ({c._count.court})
            </option>
          ))}
        </select>

        <select
          value={filters.judgmentFor}
          onChange={(e) => setFilters({ ...filters, judgmentFor: e.target.value })}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            direction: 'rtl'
          }}
        >
          <option value="">الحكم لصالح (الكل)</option>
          {aggregations.judgmentFors?.map(j => (
            <option key={j.judgmentFor} value={j.judgmentFor}>
              {j.judgmentFor} ({j._count.judgmentFor})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          placeholder="من تاريخ"
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            direction: 'rtl'
          }}
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          placeholder="إلى تاريخ"
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            direction: 'rtl'
          }}
        />

        <button
          onClick={() => {
            setFilters({ court: '', judgmentFor: '', dateFrom: '', dateTo: '' });
            setQuery('');
          }}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          مسح الفلاتر
        </button>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>جاري البحث...</div>
        ) : (
          <>
            <h3 style={{ marginBottom: '16px' }}>وجدنا {total} نتيجة</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map(doc =>
