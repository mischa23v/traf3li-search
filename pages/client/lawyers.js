import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function FindLawyer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: '',
    rating: '',
    acceptingCases: true
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isClient) {
      router.push('/');
      return;
    }

    fetchLawyers();
  }, [session, status, filters]);

  async function fetchLawyers() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.specialization) {
        params.append('specialization', filters.specialization);
      }
      
      if (filters.rating) {
        params.append('rating', filters.rating);
      }
      
      if (filters.acceptingCases) {
        params.append('acceptingCases', 'true');
      }
      
      const res = await fetch(`/api/lawyers?${params}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب المحامين');
      }
      
      const data = await res.json();
      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error('Error fetching lawyers:', err);
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

  if (!session?.user?.isClient) {
    return null;
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
            <span style={{ fontSize: '24px' }}>⚖️</span>
            <h1 style={{ margin: 0, fontSize: '20px' }}>ابحث عن محامي</h1>
          </div>
          <Link href="/client/cases">
            <button style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              📁 قضاياي
            </button>
          </Link>
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
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>تصفية النتائج</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {/* Specialization Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                التخصص
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textAlign: 'right'
                }}
              >
                <option value="">جميع التخصصات</option>
                <option value="قضايا عمالية">قضايا عمالية</option>
                <option value="قضايا تجارية">قضايا تجارية</option>
                <option value="قضايا أحوال شخصية">قضايا أحوال شخصية</option>
                <option value="قضايا إدارية">قضايا إدارية</option>
                <option value="التحكيم التجاري">التحكيم التجاري</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                التقييم الأدنى
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textAlign: 'right'
                }}
              >
                <option value="">جميع التقييمات</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="3.0">3.0+ ⭐</option>
              </select>
            </div>

            {/* Accepting Cases Filter */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '28px'
              }}>
                <input
                  type="checkbox"
                  checked={filters.acceptingCases}
                  onChange={(e) => setFilters({ ...filters, acceptingCases: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>يقبل قضايا جديدة فقط</span>
              </label>
            </div>
          </div>

          <button
            onClick={() => setFilters({ specialization: '', rating: '', acceptingCases: true })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
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
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚖️</div>
            <h3>لا يوجد محامون متاحون</h3>
            <p>جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {lawyers.map(lawyer => (
              <div
                key={lawyer.id}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {/* Lawyer Header */}
                <div style={{ display: 'flex', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#007bff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    marginLeft: '16px',
                    flexShrink: 0
                  }}>
                    {lawyer.image ? (
                      <img src={lawyer.image} alt={lawyer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      '⚖️'
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{lawyer.name}</h3>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {lawyer.officeName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ffc107', fontSize: '16px' }}>⭐</span>
                      <span style={{ fontWeight: 'bold' }}>{lawyer.rating.toFixed(1)}</span>
                      <span style={{ color: '#666', fontSize: '14px' }}>({lawyer.totalReviews} تقييم)</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {lawyer.bio && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555', 
                    lineHeight: 1.6,
                    marginBottom: '16px'
                  }}>
                    {lawyer.bio.substring(0, 120)}...
                  </p>
                )}

                {/* Specializations */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>التخصصات:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {lawyer.specializations.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 12px',
                          background: '#e7f3ff',
                          color: '#0066cc',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                      {lawyer.yearsExperience}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>سنوات خبرة</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                      {lawyer.totalCases}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>قضية</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                      {lawyer.successRate.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>نسبة النجاح</div>
                  </div>
                </div>

                {/* Fees */}
                {lawyer.feesRange && (
                  <div style={{ 
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '16px',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    💰 الأتعاب: {lawyer.feesRange}
                  </div>
                )}

                {/* Status Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: lawyer.acceptingCases ? '#d4edda' : '#f8d7da',
                  color: lawyer.acceptingCases ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}>
                  {lawyer.acceptingCases ? '✓ يقبل قضايا جديدة' : '✗ لا يقبل قضايا حالياً'}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push(`/lawyer/profile/${lawyer.id}`)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    عرض الملف الشخصي
                  </button>
                  {lawyer.acceptingCases && (
                    <button
                      onClick={() => router.push(`/client/new-case?lawyerId=${lawyer.id}`)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      تعيين المحامي
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
