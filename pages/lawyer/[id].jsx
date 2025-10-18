import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function LawyerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    fetchLawyer();
  }, [session, status, id]);

  async function fetchLawyer() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/lawyers/${id}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب معلومات المحامي');
      }
      
      const data = await res.json();
      setLawyer(data.lawyer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
        <ResponsiveHeader session={session} />
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h3>حدث خطأ</h3>
          <p style={{ color: '#666' }}>{error || 'المحامي غير موجود'}</p>
          <button 
            onClick={() => router.back()}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
      <ResponsiveHeader session={session} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#667eea',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {lawyer.user.name?.charAt(0) || '👨‍⚖️'}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 12px 0', fontSize: '32px' }}>
                {lawyer.user.name}
              </h1>
              <div style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.95 }}>
                {lawyer.officeName || 'محامي مستقل'}
              </div>
              
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {'⭐'.repeat(Math.round(lawyer.averageRating || 0))}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {lawyer.averageRating} ({lawyer.reviewCount} تقييم)
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {lawyer.completedCases}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    قضية منتهية
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {lawyer.yearsExperience}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    سنة خبرة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Content */}
          <div>
            {/* About Section */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>نبذة عن المحامي</h2>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: 1.8, 
                color: '#666',
                whiteSpace: 'pre-wrap'
              }}>
                {lawyer.bio || 'لا توجد معلومات متاحة'}
              </p>
            </div>

            {/* Specializations */}
            {lawyer.specializations?.length > 0 && (
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>التخصصات</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {lawyer.specializations.map((spec, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {lawyer.languages?.length > 0 && (
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>اللغات</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {lawyer.languages.map((lang, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        borderRadius: '16px',
                        fontSize: '14px'
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {lawyer.reviews?.length > 0 && (
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
                  التقييمات ({lawyer.reviewCount})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {lawyer.reviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        borderRight: '4px solid #ffc107'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontSize: '18px', color: '#ffc107' }}>
                          {'⭐'.repeat(review.rating)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      {review.comment && (
                        <p style={{ 
                          fontSize: '14px', 
                          lineHeight: 1.6, 
                          color: '#666',
                          margin: 0
                        }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Contact Card */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>معلومات التواصل</h3>
              <div style={{ fontSize: '14px', lineHeight: 2, color: '#666' }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>📧 البريد الإلكتروني:</strong>
                  <div style={{ marginTop: '4px' }}>{lawyer.user.email}</div>
                </div>
                {lawyer.officeAddress && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>📍 العنوان:</strong>
                    <div style={{ marginTop: '4px' }}>{lawyer.officeAddress}</div>
                  </div>
                )}
                {lawyer.licenseNumber && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>🎓 رقم الترخيص:</strong>
                    <div style={{ marginTop: '4px' }}>{lawyer.licenseNumber}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Fees */}
            {lawyer.feesRange && (
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>نطاق الأتعاب</h3>
                <div style={{
                  padding: '16px',
                  background: '#f0f8ff',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {lawyer.feesRange}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>الحالة</h3>
              <div style={{
                padding: '16px',
                background: lawyer.acceptingCases ? '#d4edda' : '#f8d7da',
                color: lawyer.acceptingCases ? '#155724' : '#721c24',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {lawyer.acceptingCases ? '✓ متاح لقبول القضايا الجديدة' : '✗ غير متاح حالياً'}
              </div>
            </div>

            {/* Action Buttons */}
            {session?.user?.isClient && lawyer.acceptingCases && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => router.push(`/client/new-case?lawyerId=${lawyer.id}`)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ➕ بدء قضية جديدة
                </button>
                
                <button
                  onClick={() => window.location.href = `mailto:${lawyer.user.email}`}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  📧 إرسال بريد إلكتروني
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 350px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
