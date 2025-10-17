import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getStatusArabic } from '../../lib/helpers';

export default function LawyerClients() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isLawyer) {
      router.push('/');
      return;
    }

    fetchClients();
  }, [session, status, search, page]);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ 
        search, 
        page, 
        limit: 20 
      });
      
      const res = await fetch(`/api/clients?${params}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب العملاء');
      }
      
      const data = await res.json();
      setClients(data.clients || []);
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
            <span style={{ fontSize: '24px' }}>👥</span>
            <h1 style={{ margin: 0, fontSize: '20px' }}>عملائي</h1>
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
            <Link href="/lawyer/today">
              <button style={{
                padding: '10px 20px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                📅 عملي
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث عن عميل (الاسم، البريد، الهاتف، رقم الهوية)..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              textAlign: 'right'
            }}
          />
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

        {/* Clients List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>جاري تحميل العملاء...</p>
          </div>
        ) : clients.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
            <h3>لا يوجد عملاء</h3>
            <p>لم يتم العثور على عملاء مطابقين</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              إجمالي العملاء: {total.toLocaleString('ar-SA')}
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {clients.map(client => (
                <div
                  key={client.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {client.fullName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>
                        {client.fullName}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {client.cases.length} قضية
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: '#666', lineHeight: 2 }}>
                    <div>📧 {client.email}</div>
                    <div>📞 {client.phone}</div>
                    {client.occupation && <div>💼 {client.occupation}</div>}
                  </div>

                  {client.cases.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #eee'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                        آخر القضايا:
                      </div>
                      {client.cases.slice(0, 2).map(c => (
                        <div
                          key={c.id}
                          style={{
                            fontSize: '13px',
                            padding: '6px',
                            background: '#f8f9fa',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}
                        >
                          {c.caseNumber} - {getStatusArabic(c.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
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
                  صفحة {page} من {Math.ceil(total / 20)}
                </span>

                <button
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '10px 20px',
                    background: page >= Math.ceil(total / 20) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer'
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
