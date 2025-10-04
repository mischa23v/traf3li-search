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
              {results.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    background: 'white',
                    direction: 'rtl'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <strong style={{ fontSize: '18px' }}>
                      {doc.mainTitle || doc.originalName}
                    </strong>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {(doc.fileSize / 1024).toFixed(1)} كيلوبايت
                    </span>
                  </div>

                  {doc.subTitle && (
                    <div style={{ 
                      fontSize: '15px', 
                      color: '#555',
                      marginBottom: '12px',
                      fontWeight: '500'
                    }}>
                      {doc.subTitle}
                    </div>
                  )}

                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    marginBottom: '12px',
                    lineHeight: 1.6
                  }}>
                    {doc.court && <div>المحكمة: {doc.court}</div>}
                    {doc.plaintiff && <div>المدعي: {doc.plaintiff}</div>}
                    {doc.judgmentFor && <div>الحكم لصالح: {doc.judgmentFor}</div>}
                    {doc.caseDate && (
                      <div>تاريخ الدعوى: {new Date(doc.caseDate).toLocaleDateString('ar-SA')}</div>
                    )}
                  </div>

                  {doc.summary && (
                    <p style={{ 
                      color: '#333', 
                      fontSize: '14px',
                      marginBottom: '12px',
                      lineHeight: 1.6
                    }}>
                      {doc.summary}
                    </p>
                  )}

                  {doc.keywords?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      {doc.keywords.slice(0, 5).map((keyword, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            margin: '4px',
                            background: '#e9ecef',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => router.push(`/view/${doc.id}`)}
                    style={{
                      padding: '8px 16px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    عرض الحكم
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '16px',
                marginTop: '24px'
              }}>
                <button
                  disabled={page === 1}
                  onClick={() => performSearch(page - 1)}
                  style={{
                    padding: '8px 16px',
                    background: page === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← السابق
                </button>

                <span>صفحة {page} من {Math.ceil(total / 10)}</span>

                <button
                  disabled={page >= Math.ceil(total / 10)}
                  onClick={() => performSearch(page + 1)}
                  style={{
                    padding: '8px 16px',
                    background: page >= Math.ceil(total / 10) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer'
                  }}
                >
                  التالي →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
