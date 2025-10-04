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
    mainTitle: '',
    subTitle: '',
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

  // Filter subtitles based on selected mainTitle
  const filteredSubTitles = filters.mainTitle && aggregations.subTitles
    ? aggregations.subTitles.filter(s => s.mainTitle === filters.mainTitle)
    : aggregations.subTitles || [];

  if (!session?.user?.authorized) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', direction: 'rtl' }}>
        <h3>البحث في الأحكام القضائية</h3>
        <p>يرجى تسجيل الدخول للبحث في المستندات</p>
      </div>
    );
  }

  return (
    <div className="document-search" style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>البحث في الأحكام القانونية</h2>
        <p style={{ color: '#666' }}>ابحث في {total.toLocaleString('ar-SA')} حكم قضائي</p>
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
            textAlign: 'right'
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
            textAlign: 'right'
          }}
        >
          <option value="">جميع المحاكم</option>
          {aggregations.courts?.map(c => (
            <option key={c.court} value={c.court}>
              {c.court} ({c._count.court.toLocaleString('ar-SA')})
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
            textAlign: 'right'
          }}
        >
          <option value="">الحكم لصالح (الكل)</option>
          {aggregations.judgmentFors?.map(j => (
            <option key={j.judgmentFor} value={j.judgmentFor}>
              {j.judgmentFor} ({j._count.judgmentFor.toLocaleString('ar-SA')})
            </option>
          ))}
        </select>

        {/* NEW: Main Title Filter */}
        <select
          value={filters.mainTitle}
          onChange={(e) => {
            setFilters({ ...filters, mainTitle: e.target.value, subTitle: '' });
          }}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            textAlign: 'right'
          }}
        >
          <option value="">الموضوع الرئيسي (الكل)</option>
          {aggregations.mainTitles?.map(m => (
            <option key={m.mainTitle} value={m.mainTitle}>
              {m.mainTitle} ({m._count.mainTitle.toLocaleString('ar-SA')})
            </option>
          ))}
        </select>

        {/* NEW: Sub Title Filter (filtered based on mainTitle) */}
        <select
          value={filters.subTitle}
          onChange={(e) => setFilters({ ...filters, subTitle: e.target.value })}
          disabled={!filters.mainTitle}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            textAlign: 'right',
            background: !filters.mainTitle ? '#f0f0f0' : 'white',
            cursor: !filters.mainTitle ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">الموضوع الفرعي (الكل)</option>
          {filteredSubTitles.map(s => (
            <option key={s.subTitle} value={s.subTitle}>
              {s.subTitle} ({s._count.subTitle.toLocaleString('ar-SA')})
            </option>
          ))}
        </select>

        {/* Date Range with Labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>من تاريخ:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              textAlign: 'right'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>إلى تاريخ:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              textAlign: 'right'
            }}
          />
        </div>

        <button
          onClick={() => {
            setFilters({ court: '', judgmentFor: '', mainTitle: '', subTitle: '', dateFrom: '', dateTo: '' });
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
            <h3 style={{ marginBottom: '16px' }}>وجدنا {total.toLocaleString('ar-SA')} نتيجة</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    background: 'white'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      {doc.mainTitle && (
                        <>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
                            الموضوع الرئيسي:
                          </div>
                          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>
                            {doc.mainTitle}
                          </strong>
                        </>
                      )}
                      
                      {!doc.mainTitle && (
                        <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>
                          {doc.originalName}
                        </strong>
                      )}
                      
                      {doc.subTitle && (
                        <>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
                            الموضوع الفرعي:
                          </div>
                          <div style={{ 
                            fontSize: '15px', 
                            color: '#555',
                            fontWeight: '500',
                            marginBottom: '8px'
                          }}>
                            {doc.subTitle}
                          </div>
                        </>
                      )}
                    </div>
                    <span style={{ color: '#666', fontSize: '14px', whiteSpace: 'nowrap', marginRight: '12px' }}>
                      {(doc.fileSize / 1024).toFixed(1)} كيلوبايت
                    </span>
                  </div>

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

                <span>صفحة {page.toLocaleString('ar-SA')} من {Math.ceil(total / 10).toLocaleString('ar-SA')}</span>

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
