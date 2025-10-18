import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import { getCaseTypeArabic, getStatusArabic, getStatusColor } from '../../lib/helpers';

export default function ClientCases() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, closed

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isClient) {
      router.push('/');
      return;
    }

    fetchCases();
  }, [session, status, filter]);

  async function fetchCases() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ 
        clientId: session.user.clientId
      });
      
      if (filter === 'active') {
        params.append('status', 'ACTIVE');
      } else if (filter === 'closed') {
        params.append('status', 'CLOSED');
      }
      
      const res = await fetch(`/api/cases?${params}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب القضايا');
      }
      
      const data = await res.json();
      setCases(data.cases || []);
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
      <ResponsiveHeader session={session} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>📁 قضاياي</h2>
          <p style={{ color: '#666' }}>إدارة ومتابعة جميع قضاياك</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          marginBottom: '24px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              background: filter === 'all' ? '#007bff' : 'transparent',
              color: filter === 'all' ? 'white' : '#666',
              border: filter === 'all' ? 'none' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            جميع القضايا
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{
              padding: '10px 20px',
              background: filter === 'active' ? '#007bff' : 'transparent',
              color: filter === 'active' ? 'white' : '#666',
              border: filter === 'active' ? 'none' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            القضايا النشطة
          </button>
          <button
            onClick={() => setFilter('closed')}
            style={{
              padding: '10px 20px',
              background: filter === 'closed' ? '#007bff' : 'transparent',
              color: filter === 'closed' ? 'white' : '#666',
              border: filter === 'closed' ? 'none' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            القضايا المنتهية
          </button>
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

        {/* Cases List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>جاري تحميل القضايا...</p>
          </div>
        ) : cases.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📁</div>
            <h3>لا توجد قضايا</h3>
            <p>ابدأ بإنشاء قضية جديدة</p>
            <Link href="/client/new-case">
              <button style={{
                marginTop: '16px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(17, 153, 142, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.3)';
              }}>
                ➕ قضية جديدة
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cases.map(caseItem => (
              <div
                key={caseItem.id}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onClick={() => router.push(`/cases/${caseItem.id}`)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
                      قضية رقم: {caseItem.caseNumber}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: 2 }}>
                      <div><strong>النوع:</strong> {getCaseTypeArabic(caseItem.caseType)} - {caseItem.subCategory}</div>
                      <div><strong>المحكمة:</strong> {caseItem.court}</div>
                      {caseItem.lawyer && (
                        <div><strong>المحامي:</strong> {caseItem.lawyer.user.name}</div>
                      )}
                      {caseItem.nextHearing && (
                        <div>
                          <strong>الجلسة القادمة:</strong>{' '}
                          {new Date(caseItem.nextHearing).toLocaleDateString('ar-SA')}
                          {caseItem.nextHearingTime && ` - ${caseItem.nextHearingTime}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    background: getStatusColor(caseItem.status),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    {getStatusArabic(caseItem.status)}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px'
                }}>
                  <strong>الوصف:</strong> {caseItem.description.substring(0, 150)}...
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/cases/${caseItem.id}`);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  عرض التفاصيل
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
