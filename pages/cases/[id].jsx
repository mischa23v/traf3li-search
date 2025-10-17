import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCaseTypeArabic, getStatusArabic, getStatusColor, getCourtTypeArabic, getAIDocTypeArabic } from '../../lib/helpers';

export default function CaseDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, hearings, documents, notes
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    fetchCase();
  }, [session, status, id]);

  async function fetchCase() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/cases/${id}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب تفاصيل القضية');
      }
      
      const data = await res.json();
      setCaseData(data.case);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateAIDocument(documentType) {
    if (!confirm(`هل تريد إنشاء ${documentType === 'LAWSUIT_PETITION' ? 'صحيفة دعوى' : 'مذكرة دفاع'} باستخدام الذكاء الاصطناعي؟`)) {
      return;
    }

    setGeneratingAI(true);
    
    try {
      const res = await fetch(`/api/cases/${id}/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'فشل في إنشاء المستند');
      }
      
      const data = await res.json();
      alert('تم إنشاء المستند بنجاح!');
      fetchCase(); // Refresh to show new AI document
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingAI(false);
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

  if (error || !caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
        <h3>حدث خطأ</h3>
        <p style={{ color: '#666' }}>{error || 'القضية غير موجودة'}</p>
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
    );
  }

  const canEdit = session.user.role === 'ADMIN' || 
                  (session.user.isLawyer && caseData.lawyerId === session.user.lawyerId);

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
            <button
              onClick={() => router.back()}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← العودة
            </button>
            <span style={{ fontSize: '24px' }}>📋</span>
            <h1 style={{ margin: 0, fontSize: '20px' }}>
              قضية رقم: {caseData.caseNumber}
            </h1>
          </div>
          <div style={{
            padding: '8px 16px',
            background: getStatusColor(caseData.status),
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {getStatusArabic(caseData.status)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          {/* Sidebar */}
          <div>
            {/* Case Info Card */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>معلومات القضية</h3>
              <div style={{ fontSize: '14px', lineHeight: 2, color: '#666' }}>
                <div><strong>النوع:</strong> {getCaseTypeArabic(caseData.caseType)}</div>
                <div><strong>الفئة:</strong> {caseData.subCategory}</div>
                <div><strong>المحكمة:</strong> {caseData.court}</div>
                <div><strong>نوع المحكمة:</strong> {getCourtTypeArabic(caseData.courtType)}</div>
                <div><strong>تاريخ الرفع:</strong> {new Date(caseData.issueDate).toLocaleDateString('ar-SA')}</div>
                {caseData.claimAmount && (
                  <div><strong>قيمة المطالبة:</strong> {caseData.claimAmount.toLocaleString('ar-SA')} ريال</div>
                )}
              </div>
            </div>

            {/* Client Info Card */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>العميل</h3>
              <div style={{ fontSize: '14px', lineHeight: 2, color: '#666' }}>
                <div><strong>الاسم:</strong> {caseData.client.fullName}</div>
                <div><strong>البريد:</strong> {caseData.client.email}</div>
                <div><strong>الهاتف:</strong> {caseData.client.phone}</div>
              </div>
            </div>

            {/* Lawyer Info Card */}
            {caseData.lawyer && (
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>المحامي</h3>
                <div style={{ fontSize: '14px', lineHeight: 2, color: '#666' }}>
                  <div><strong>الاسم:</strong> {caseData.lawyer.user.name}</div>
                  <div><strong>البريد:</strong> {caseData.lawyer.user.email}</div>
                </div>
              </div>
            )}

            {/* AI Tools (for lawyers only) */}
            {canEdit && (
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>🤖 أدوات الذكاء الاصطناعي</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => generateAIDocument('LAWSUIT_PETITION')}
                    disabled={generatingAI}
                    style={{
                      padding: '10px',
                      background: generatingAI ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: generatingAI ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {generatingAI ? 'جاري الإنشاء...' : '📄 إنشاء صحيفة دعوى'}
                  </button>
                  <button
                    onClick={() => generateAIDocument('DEFENSE_MEMO')}
                    disabled={generatingAI}
                    style={{
                      padding: '10px',
                      background: generatingAI ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: generatingAI ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {generatingAI ? 'جاري الإنشاء...' : '📝 إنشاء مذكرة دفاع'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div>
            {/* Tabs */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  fontWeight: '500'
                }}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('hearings')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'hearings' ? '#007bff' : 'transparent',
                  color: activeTab === 'hearings' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                الجلسات ({caseData.hearings?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'documents' ? '#007bff' : 'transparent',
                  color: activeTab === 'documents' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                المستندات ({(caseData.documents?.length || 0) + (caseData.aiDocuments?.length || 0)})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'notes' ? '#007bff' : 'transparent',
                  color: activeTab === 'notes' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                الملاحظات ({caseData.notes?.length || 0})
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
                  <h3 style={{ marginBottom: '16px' }}>تفاصيل القضية</h3>
                  
                  {/* Parties */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#007bff' }}>أطراف القضية</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#28a745' }}>
                          المدعي
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                          <div><strong>الاسم:</strong> {caseData.plaintiffName}</div>
                          {caseData.plaintiffAddress && <div><strong>العنوان:</strong> {caseData.plaintiffAddress}</div>}
                          {caseData.plaintiffPhone && <div><strong>الهاتف:</strong> {caseData.plaintiffPhone}</div>}
                          {caseData.plaintiffEmail && <div><strong>البريد:</strong> {caseData.plaintiffEmail}</div>}
                        </div>
                      </div>

                      <div style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#dc3545' }}>
                          المدعى عليه
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
                          <div><strong>الاسم:</strong> {caseData.defendantName}</div>
                          <div><strong>النوع:</strong> {caseData.defendantType}</div>
                          {caseData.defendantAddress && <div><strong>العنوان:</strong> {caseData.defendantAddress}</div>}
                          {caseData.defendantCR && <div><strong>السجل التجاري:</strong> {caseData.defendantCR}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#007bff' }}>وصف القضية</h4>
                    <div style={{
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {caseData.description}
                    </div>
                  </div>

                  {/* Next Hearing */}
                  {caseData.nextHearing && (
                    <div style={{
                      padding: '16px',
                      background: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '6px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        📅 الجلسة القادمة
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>التاريخ:</strong> {new Date(caseData.nextHearing).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {caseData.nextHearingTime && ` - ${caseData.nextHearingTime}`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hearings Tab */}
              {activeTab === 'hearings' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>الجلسات</h3>
                  {caseData.hearings?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                      <p>لا توجد جلسات مسجلة</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {caseData.hearings?.map(hearing => (
                        <div
                          key={hearing.id}
                          style={{
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            borderRight: '4px solid #007bff'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              {new Date(hearing.hearingDate).toLocaleDateString('ar-SA')} - {hearing.hearingTime}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                              {hearing.court}
                            </div>
                          </div>
                          {hearing.judge && (
                            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                              <strong>القاضي:</strong> {hearing.judge}
                            </div>
                          )}
                          {hearing.outcome && (
                            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                              <strong>النتيجة:</strong> {hearing.outcome}
                            </div>
                          )}
                          {hearing.nextHearingDate && (
                            <div style={{ 
                              marginTop: '12px',
                              padding: '8px',
                              background: '#fff3cd',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}>
                              <strong>الجلسة القادمة:</strong> {new Date(hearing.nextHearingDate).toLocaleDateString('ar-SA')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>المستندات</h3>
                  
                  {/* AI Documents */}
                  {caseData.aiDocuments?.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ marginBottom: '12px', color: '#28a745' }}>
                        🤖 مستندات الذكاء الاصطناعي
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {caseData.aiDocuments.map(doc => (
                          <div
                            key={doc.id}
                            style={{
                              padding: '16px',
                              background: '#d4edda',
                              border: '1px solid #c3e6cb',
                              borderRadius: '6px'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                  {getAIDocTypeArabic(doc.documentType)} (نسخة {doc.version})
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  تم الإنشاء: {new Date(doc.createdAt).toLocaleDateString('ar-SA')}
                                </div>
                              </div>
                              <div style={{
                                padding: '6px 12px',
                                background: doc.approved ? '#28a745' : '#ffc107',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                {doc.approved ? '✓ معتمد' : '⏳ قيد المراجعة'}
                              </div>
                            </div>
                            <div style={{ 
                              marginTop: '12px',
                              fontSize: '14px',
                              maxHeight: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {doc.content.substring(0, 300)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Documents */}
                  {caseData.documents?.length === 0 && caseData.aiDocuments?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                      <p>لا توجد مستندات</p>
                    </div>
                  ) : caseData.documents?.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '12px', color: '#007bff' }}>
                        📎 المستندات المرفقة
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {caseData.documents.map(doc => (
                          <div
                            key={doc.id}
                            style={{
                              padding: '16px',
                              background: '#f8f9fa',
                              borderRadius: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {doc.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {(doc.fileSize / 1024).toFixed(2)} KB - تم الرفع: {new Date(doc.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            </div>
                            <button
                              style={{
                                padding: '8px 16px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              تحميل
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>الملاحظات</h3>
                  {caseData.notes?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                      <p>لا توجد ملاحظات</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {caseData.notes?.map(note => (
                        <div
                          key={note.id}
                          style={{
                            padding: '16px',
                            background: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            marginBottom: '8px'
                          }}>
                            {note.createdBy} - {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                          <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
