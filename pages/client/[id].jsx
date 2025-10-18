import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import { getStatusArabic, getStatusColor, getCaseTypeArabic } from '../../lib/helpers';

export default function ClientProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, cases, invoices

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    fetchClient();
  }, [session, status, id]);

  async function fetchClient() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/clients/${id}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب معلومات العميل');
      }
      
      const data = await res.json();
      setClient(data.client);
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

  if (error || !client) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
        <ResponsiveHeader session={session} />
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h3>حدث خطأ</h3>
          <p style={{ color: '#666' }}>{error || 'العميل غير موجود'}</p>
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

  const canEdit = session.user.role === 'ADMIN' || session.user.id === client.userId;

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
      <ResponsiveHeader session={session} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: '0 4px 16px rgba(33, 147, 176, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#2193b0',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {client.fullName.charAt(0)}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                {client.fullName}
              </h1>
              <div style={{ fontSize: '16px', opacity: 0.95, marginBottom: '12px' }}>
                {client.occupation || 'عميل'}
              </div>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {client.cases?.length || 0}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    قضية
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {client.cases?.filter(c => c.status === 'ACTIVE').length || 0}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    نشطة
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {client.cases?.filter(c => ['JUDGMENT', 'SETTLED', 'CLOSED'].includes(c.status)).length || 0}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    منتهية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Content */}
          <div>
            {/* Tabs */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'overview' ? '#007bff' : 'transparent',
                  color: activeTab === 'overview' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'cases' ? '#007bff' : 'transparent',
                  color: activeTab === 'cases' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                القضايا ({client.cases?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'invoices' ? '#007bff' : 'transparent',
                  color: activeTab === 'invoices' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                الفواتير ({client.invoices?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '400px'
            }}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>المعلومات الشخصية</h3>
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '16px',
                    lineHeight: 2
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>رقم الهوية الوطنية:</strong>
                      <div style={{ marginTop: '4px', color: '#666' }}>{client.nationalId}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>البريد الإلكتروني:</strong>
                      <div style={{ marginTop: '4px', color: '#666' }}>{client.email}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>رقم الهاتف:</strong>
                      <div style={{ marginTop: '4px', color: '#666' }}>{client.phone}</div>
                    </div>
                    {client.address && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>العنوان:</strong>
                        <div style={{ marginTop: '4px', color: '#666' }}>{client.address}</div>
                      </div>
                    )}
                    {client.occupation && (
                      <div>
                        <strong>المهنة:</strong>
                        <div style={{ marginTop: '4px', color: '#666' }}>{client.occupation}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cases Tab */}
              {activeTab === 'cases' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>القضايا</h3>
                  {client.cases?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                      <p>لا توجد قضايا</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {client.cases?.map(caseItem => (
                        <div
                          key={caseItem.id}
                          style={{
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.3s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                          onClick={() => router.push(`/cases/${caseItem.id}`)}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                                قضية رقم: {caseItem.caseNumber}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {getCaseTypeArabic(caseItem.caseType)} - {caseItem.subCategory}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 12px',
                              background: getStatusColor(caseItem.status),
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {getStatusArabic(caseItem.status)}
                            </div>
                          </div>
                          {caseItem.lawyer && (
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              المحامي: {caseItem.lawyer.user.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>الفواتير</h3>
                  {client.invoices?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                      <p>لا توجد فواتير</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {client.invoices?.map(invoice => (
                        <div
                          key={invoice.id}
                          style={{
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderRight: `4px solid ${invoice.paid ? '#28a745' : '#ffc107'}`
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                فاتورة رقم: {invoice.invoiceNumber}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                المبلغ: {invoice.amount.toLocaleString('ar-SA')} ريال
                              </div>
                            </div>
                            <div style={{
                              padding: '6px 12px',
                              background: invoice.paid ? '#28a745' : '#ffc107',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              height: 'fit-content'
                            }}>
                              {invoice.paid ? 'مدفوعة' : 'غير مدفوعة'}
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            <div>تاريخ الإصدار: {new Date(invoice.createdAt).toLocaleDateString('ar-SA')}</div>
                            <div>تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</div>
                            {invoice.paid && invoice.paidDate && (
                              <div>تاريخ الدفع: {new Date(invoice.paidDate).toLocaleDateString('ar-SA')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Account Status */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>حالة الحساب</h3>
              <div style={{
                padding: '12px',
                background: client.user.active ? '#d4edda' : '#f8d7da',
                color: client.user.active ? '#155724' : '#721c24',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {client.user.active ? '✓ نشط' : '✗ غير نشط'}
              </div>
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>إجراءات سريعة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => window.location.href = `mailto:${client.email}`}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📧 إرسال بريد
                  </button>
                  <button
                    onClick={() => window.open(`tel:${client.phone}`)}
                    style={{
                      width: '100%',
                      padding: '10px',
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
            )}

            {/* Registration Info */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>معلومات التسجيل</h3>
              <div style={{ fontSize: '14px', lineHeight: 2, color: '#666' }}>
                <div>
                  <strong>تاريخ التسجيل:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
            </div>
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
