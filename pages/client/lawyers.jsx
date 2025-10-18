import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ClientLawyers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: '',
    acceptingCases: 'true'
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    fetchLawyers();
  }, [session, status, filters, page]);

  async function fetchLawyers() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ 
        ...filters,
        page, 
        limit: 12 
      });
      
      const res = await fetch(`/api/lawyers?${params}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب المحامين');
      }
      
      const data = await res.json();
      setLawyers(data.lawyers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #eee',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>👨‍⚖️</span>
            <h1 style={{ margin: 0, fontSize: '20px' }}>البحث عن محامي</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/">
              <button style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🔍 البحث في الأحكام
              </button>
            </Link>
            {session.user.isClient && (
              <Link href="/client/cases">
                <button style={{
                  padding: '10px 20px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  📁 قضاياي
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Filters */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>تصفية النتائج</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                التخصص:
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">جميع التخصصات</option>
                <option value="قضايا عمالية">قضايا عمالية</option>
                <option value="قضايا تجارية">قضايا تجارية</option>
                <option value="قضايا أحوال شخصية">قضايا أحوال شخصية</option>
                <option value="قضايا جنائية">قضايا جنائية</option>
                <option value="قضايا إدارية">قضايا إدارية</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                الحد الأدنى للتقييم:
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">جميع التقييمات</option>
                <option value="4.5">⭐ 4.5 فأعلى</option>
                <option value="4.0">⭐ 4.0 فأعلى</option>
                <option value="3.5">⭐ 3.5 فأعلى</option>
                <option value="3.0">⭐ 3.0 فأعلى</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                متاح لقبول القضايا:
              </label>
              <select
                value={filters.acceptingCases}
                onChange={(e) => setFilters({ ...filters, acceptingCases: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">الكل</option>
                <option value="true">متاح فقط</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            color: '#721c24',
            marginBottom: '20px'
          }}>
            <strong>خطأ:</strong> {error}
          </div>
        )}

        {/* Lawyers List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>جاري تحميل المحامين...</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍⚖️</div>
            <h3>لا يوجد محامون</h3>
            <p>لم يتم العثور على محامين مطابقين لمعايير البحث</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              وجدنا {total.toLocaleString('ar-SA')} محامي
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {lawyers.map(lawyer => (
                <div
                  key={lawyer.id}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => router.push(`/lawyers/${lawyer.id}`)}
                >
                  {/* Header with gradient */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'white',
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {lawyer.name?.charAt(0) || '👨‍⚖️'}
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                      {lawyer.name || 'محامي'}
                    </h3>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      {lawyer.officeName || 'محامي مستقل'}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '20px' }}>
                    {/* Rating */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                          {'⭐'.repeat(Math.round(lawyer.rating || 0))}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {(lawyer.rating || 0).toFixed(1)} ({lawyer.totalReviews || 0} تقييم)
                        </div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                          {lawyer.totalCases || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          قضية
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        <strong>الخبرة:</strong> {lawyer.yearsExperience || 0} سنة
                      </div>
                      {lawyer.licenseNumber && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>رقم الترخيص:</strong> {lawyer.licenseNumber}
                        </div>
                      )}
                    </div>

                    {/* Specializations */}
                    {lawyer.specializations?.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                          التخصصات:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {lawyer.specializations.slice(0, 3).map((spec, i) => (
                            <span
                              key={i}
                              style={{
                                padding: '4px 12px',
                                background: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {lawyer.bio && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {lawyer.bio}
                      </p>
                    )}

                    {/* Status Badge */}
                    <div style={{
                      padding: '8px',
                      background: lawyer.acceptingCases ? '#d4edda' : '#f8d7da',
                      color: lawyer.acceptingCases ? '#155724' : '#721c24',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}>
                      {lawyer.acceptingCases ? '✓ متاح لقبول القضايا' : '✗ غير متاح حالياً'}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/lawyers/${lawyer.id}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.background = '#007bff'}
                    >
                      عرض الملف الشخصي
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '10px 20px',
                    background: page === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← السابق
                </button>

                <span>
                  صفحة {page} من {Math.ceil(total / 12)}
                </span>

                <button
                  disabled={page >= Math.ceil(total / 12)}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '10px 20px',
                    background: page >= Math.ceil(total / 12) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page >= Math.ceil(total / 12) ? 'not-allowed' : 'pointer'
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
