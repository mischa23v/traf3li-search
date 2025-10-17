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

// Fixed topic structure
const MAIN_TOPICS = {
  'أجر': ['أجر فعلي', 'أجر إجازات', 'أجور متأخرة', 'أجر إجازات سنوية'],
  'مكافأة': ['مكافأة نهاية الخدمة'],
  'التعويض': ['تعويض عن إنهاء عقد', 'التعويض عن الإنهاء الغير مشروع'],
  'إثبات': ['إثبات سبب الإنهاء الصحيح']
};

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
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const debounced = useDebounce(query, 300);

  async function performSearch(p = 1) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ 
        q: debounced, 
        page: p, 
        limit: 10, 
        ...filters 
      });
      
      const res = await fetch(`/api/search?${params}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل البحث');
      }
      
      const data = await res.json();
      setResults(data.documents || []);
      setAggregations(data.aggregations || {});
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      console.error('Search error:', e);
      setError(e.message || 'حدث خطأ أثناء البحث');
      setResults([]);
      setTotal(0);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session?.user?.authorized) {
      performSearch(1);
    }
  }, [debounced, filters, session]);

  // Get subtitles for selected main title
  const availableSubTitles = filters.mainTitle ? MAIN_TOPICS[filters.mainTitle] || [] : [];

  const hasActiveFilters = query || filters.court || filters.judgmentFor || 
                          filters.mainTitle || filters.subTitle || 
                          filters.dateFrom || filters.dateTo;

  if (!session?.user?.authorized) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', direction: 'rtl' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h3>البحث في الأحكام القضائية</h3>
        <p style={{ color: '#666' }}>يرجى تسجيل الدخول للبحث في المستندات</p>
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
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && performSearch(1)}
          placeholder="ابحث عن رقم القضية، الأطراف، المحكمة، الكلمات المفتاحية..."
          aria-label="حقل البحث الرئيسي"
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            textAlign: 'right',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#999'
            }}
            aria-label="مسح البحث"
          >
            ×
          </button>
        )}
      </div>

      {/* Filters - Row 1 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '12px'
      }}
      className="filters-row">
        <select
          value={filters.court}
          onChange={(e) => setFilters({ ...filters, court: e.target.value })}
          aria-label="تصفية حسب المحكمة"
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'right',
            cursor: 'pointer'
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
          aria-label="تصفية حسب الحكم لصالح"
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'right',
            cursor: 'pointer'
          }}
        >
          <option value="">الحكم لصالح (الكل)</option>
          {aggregations.judgmentFors?.map(j => (
            <option key={j.judgmentFor} value={j.judgmentFor}>
              {j.judgmentFor} ({j._count.judgmentFor.toLocaleString('ar-SA')})
            </option>
          ))}
        </select>
      </div>

      {/* Filters - Row 2 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '12px'
      }}
      className="filters-row">
        <select
          value={filters.mainTitle}
          onChange={(e) => {
            setFilters({ ...filters, mainTitle: e.target.value, subTitle: '' });
          }}
          aria-label="تصفية حسب الموضوع الرئيسي"
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'right',
            cursor: 'pointer'
          }}
        >
          <option value="">الموضوع الرئيسي (الكل)</option>
          {Object.keys(MAIN_TOPICS).map(topic => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <select
          value={filters.subTitle}
          onChange={(e) => setFilters({ ...filters, subTitle: e.target.value })}
          disabled={!filters.mainTitle}
          aria-label="تصفية حسب الموضوع الفرعي"
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'right',
            background: !filters.mainTitle ? '#f0f0f0' : 'white',
            cursor: !filters.mainTitle ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">الموضوع الفرعي (الكل)</option>
          {availableSubTitles.map(subTopic => (
            <option key={subTopic} value={subTopic}>
              {subTopic}
            </option>
          ))}
        </select>
      </div>

      {/* Filters - Row 3: Dates and Clear Button */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 200px',
        gap: '12px',
        marginBottom: '24px'
      }}
      className="filters-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="dateFrom" style={{ fontSize: '12px', color: '#666' }}>من تاريخ:</label>
          <input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            aria-label="من تاريخ"
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              textAlign: 'right'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="dateTo" style={{ fontSize: '12px', color: '#666' }}>إلى تاريخ:</label>
          <input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            aria-label="إلى تاريخ"
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
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
          disabled={!hasActiveFilters}
          aria-label="مسح جميع الفلاتر"
          style={{
            padding: '10px 16px',
            background: hasActiveFilters ? '#6c757d' : '#e0e0e0',
            color: hasActiveFilters ? 'white' : '#999',
            border: 'none',
            borderRadius: '8px',
            cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
            marginTop: '20px',
            transition: 'all 0.3s'
          }}
        >
          مسح الفلاتر
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '16px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24',
          marginBottom: '16px'
        }}>
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {/* Results */}
      <div>
        {loading ? (
          <div>
            <h3 style={{ marginBottom: '16px' }}>جاري البحث...</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#f8f9fa'
                }}>
                  <div style={{ height: '24px', background: '#ddd', borderRadius: '4px', marginBottom: '12px', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                  <div style={{ height: '16px', background: '#ddd', borderRadius: '4px', marginBottom: '8px', width: '90%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                  <div style={{ height: '16px', background: '#ddd', borderRadius: '4px', width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h3 style={{ marginBottom: '16px' }}>
              {total > 0 ? `وجدنا ${total.toLocaleString('ar-SA')} نتيجة` : 'لا توجد نتائج'}
            </h3>

            {results.length === 0 && !error ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ marginBottom: '8px' }}>لم يتم العثور على نتائج</h3>
                <p>جرب تعديل معايير البحث أو استخدام كلمات مفتاحية مختلفة</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.map(doc => (
                  <div
                    key={doc.id}
                    className="document-card"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '16px',
                      background: 'white',
                      transition: 'box-shadow 0.3s, transform 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
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
                      aria-label={`عرض الحكم ${doc.mainTitle || doc.originalName}`}
                      style={{
                        padding: '10px 20px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.background = '#007bff'}
                    >
                      عرض الحكم
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 10 && (
              <div className="pagination" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '16px',
                marginTop: '24px'
              }}>
                <button
                  disabled={page === 1}
                  onClick={() => performSearch(page - 1)}
                  aria-label="الصفحة السابقة"
                  style={{
                    padding: '10px 20px',
                    background: page === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  ← السابق
                </button>

                <span style={{ fontWeight: '500' }}>
                  صفحة {page.toLocaleString('ar-SA')} من {Math.ceil(total / 10).toLocaleString('ar-SA')}
                </span>

                <button
                  disabled={page >= Math.ceil(total / 10)}
                  onClick={() => performSearch(page + 1)}
                  aria-label="الصفحة التالية"
                  style={{
                    padding: '10px 20px',
                    background: page >= Math.ceil(total / 10) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  التالي →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .filters-row {
            grid-template-columns: 1fr !important;
          }
          
          .pagination {
            flex-direction: column;
            gap: 8px;
          }
          
          .document-card {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
