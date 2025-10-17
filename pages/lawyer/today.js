import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LawyerToday() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayCases, setTodayCases] = useState([]);
  const [upcomingCases, setUpcomingCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isLawyer) {
      router.push('/');
      return;
    }

    fetchTodayCases();
  }, [session, status]);

  async function fetchTodayCases() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/cases/today');
      
      if (!res.ok) {
        throw new Error('فشل في جلب قضايا اليوم');
      }
      
      const data = await res.json();
      setTodayCases(data.todayCases || []);
      setUpcomingCases(data.upcomingCases || []);
      setStats(data.stats || {});
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
            <h1 style={{ margin: 0, fontSize: '20px' }}>عملي اليوم</h1>
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
                🔍 البحث
              </button>
            </Link>
            <Link href="/lawyer/clients">
              <button style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                👥 العملاء
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📅</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
              {todayCases.length}
            </div>
            <div style={{ color: '#666' }}>جلسات اليوم</div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
              {stats.ACTIVE || 0}
            </div>
            <div style={{ color: '#666' }}>قضايا نشطة</div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
              {(stats.JUDGMENT || 0) + (stats.SETTLED || 0)}
            </div>
            <div style={{ color: '#666' }}>قضايا منتهية</div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.PENDING || 0}
            </div>
            <div style={{ color: '#666' }}>قيد الانتظار</div>
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

        {/* Today's Cases */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
            📅 جلسات اليوم ({todayCases.length})
          </h2>
          
          {todayCases.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3>لا توجد جلسات اليوم</h3>
              <p>استمتع بيومك!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {todayCases.map(caseItem => (
                <div
                  key={caseItem.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRight: '4px solid #007bff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                        قضية رقم: {caseItem.caseNumber}
                      </h3>
                      <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
                        <div><strong>المدعي:</strong> {caseItem.plaintiffName}</div>
                        <div><strong>المدعى عليه:</strong> {caseItem.defendantName}</div>
                        <div><strong>العميل:</strong> {caseItem.client.fullName}</div>
                        <div><strong>الموضوع:</strong> {getCaseTypeArabic(caseItem.caseType)} - {caseItem.subCategory}</div>
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
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <strong>⏰ الوقت:</strong> {caseItem.nextHearingTime || 'لم يحدد'}
                      </div>
                      <div>
                        <strong>🏛️ المحكمة:</strong> {caseItem.court}
                      </div>
                      <div>
                        <strong>📞 هاتف العميل:</strong> {caseItem.client.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => router.push(`/cases/${caseItem.id}`)}
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
                    <button
                      onClick={() => window.open(`tel:${caseItem.client.phone}`)}
                      style={{
                        padding: '10px 20px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📞 اتصال
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Cases */}
        <div>
          <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
            📆 الجلسات القادمة (الأسبوع القادم - {upcomingCases.length})
          </h2>
          
          {upcomingCases.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <p>لا توجد جلسات قادمة في الأسبوع القادم</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingCases.map(caseItem => (
                <div
                  key={caseItem.id}
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>
                      قضية رقم: {caseItem.caseNumber}
                    </h4>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <span><strong>العميل:</strong> {caseItem.client.fullName}</span>
                      <span style={{ margin: '0 12px' }}>•</span>
                      <span><strong>المحكمة:</strong> {caseItem.court}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
                      {new Date(caseItem.nextHearing).toLocaleDateString('ar-SA', { 
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {caseItem.nextHearingTime || 'لم يحدد الوقت'}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/cases/${caseItem.id}`)}
                    style={{
                      padding: '8px 16px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginRight: '16px'
                    }}
                  >
                    التفاصيل
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCaseTypeArabic(type) {
  const types = {
    'SALARY': 'أجر',
    'BONUS': 'مكافأة',
    'COMPENSATION': 'تعويض',
    'PROOF': 'إثبات',
    'OTHER': 'أخرى'
  };
  return types[type] || type;
}

function getStatusArabic(status) {
  const statuses = {
    'PENDING': 'قيد الانتظار',
    'ACTIVE': 'نشطة',
    'SETTLED': 'تسوية',
    'JUDGMENT': 'حكم',
    'APPEAL': 'استئناف',
    'CLOSED': 'منتهية'
  };
  return statuses[status] || status;
}

function getStatusColor(status) {
  const colors = {
    'PENDING': '#ffc107',
    'ACTIVE': '#17a2b8',
    'SETTLED': '#28a745',
    'JUDGMENT': '#6f42c1',
    'APPEAL': '#fd7e14',
    'CLOSED': '#6c757d'
  };
  return colors[status] || '#6c757d';
}
