import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function AdminUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  if (status === 'loading') {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '40px',
        direction: 'rtl'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
        <ResponsiveHeader session={session} />
        
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
          <h3 style={{ marginBottom: '8px' }}>يتطلب صلاحيات المسؤول</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>يرجى تسجيل الدخول كمسؤول للوصول لهذه الصفحة</p>
          <button 
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            العودة للبحث
          </button>
        </div>
      </div>
    );
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('accessLevel', 'USER_ONLY');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `فشل الرفع: ${res.status}`);
      }
      
      setResult(data);
      
      if (data.success) {
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setResult({ error: err.message });
    }
    setUploading(false);
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
      <ResponsiveHeader session={session} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>📤 رفع مستند قانوني</h2>
            <p style={{ color: '#666' }}>قم برفع الأحكام القضائية بصيغة txt (الحد الأقصى: 10 ميجابايت)</p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload}>
            <div style={{ 
              border: '2px dashed #ddd', 
              borderRadius: '8px', 
              padding: '40px',
              textAlign: 'center',
              marginBottom: '24px',
              background: '#fafafa',
              transition: 'all 0.3s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#007bff';
              e.currentTarget.style.background = '#f0f8ff';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.background = '#fafafa';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.background = '#fafafa';
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.name.endsWith('.txt')) {
                setFile(droppedFile);
              }
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ marginBottom: '16px', color: '#666' }}>اسحب الملف هنا أو انقر للاختيار</p>
              <input 
                type="file" 
                accept=".txt"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {file && (
              <div style={{ 
                padding: '16px',
                background: '#e7f3ff',
                border: '1px solid #b3d9ff',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>✓ الملف المحدد:</strong> {file.name}
                  </div>
                  <div style={{ color: '#666' }}>
                    {(file.size / 1024).toFixed(1)} كيلوبايت
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading || !file}
              style={{
                padding: '14px 32px',
                background: uploading || !file ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: uploading || !file ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                width: '100%',
                transition: 'background 0.3s'
              }}
            >
              {uploading ? '⏳ جاري الرفع...' : '📤 رفع المستند'}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>
                {result.error ? '❌ حدث خطأ' : '✅ تم الرفع بنجاح'}
              </h3>

              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '24px',
                background: result.error ? '#fff5f5' : '#f0fff4',
                borderColor: result.error ? '#feb2b2' : '#9ae6b4'
              }}>
                {result.error ? (
                  <div style={{ color: '#c53030' }}>
                    <strong>خطأ:</strong> {result.error}
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      fontSize: '18px',
                      color: '#22543d',
                      marginBottom: '16px',
                      fontWeight: 'bold'
                    }}>
                      ✓ تم رفع المستند بنجاح
                    </div>

                    {result.extractedInfo && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        marginBottom: '16px',
                        lineHeight: 1.8,
                        borderTop: '1px solid #e0e0e0',
                        paddingTop: '16px'
                      }}>
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ marginBottom: '12px', color: '#333' }}>المعلومات المستخرجة:</h4>
                          {result.extractedInfo.court && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>المحكمة:</strong> {result.extractedInfo.court}
                            </div>
                          )}
                          {result.extractedInfo.plaintiff && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>المدعي:</strong> {result.extractedInfo.plaintiff}
                            </div>
                          )}
                          {result.extractedInfo.judgmentFor && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>الحكم لصالح:</strong> {result.extractedInfo.judgmentFor}
                            </div>
                          )}
                          {result.extractedInfo.mainTitle && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>العنوان الرئيسي:</strong> {result.extractedInfo.mainTitle}
                            </div>
                          )}
                          {result.extractedInfo.subTitle && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>العنوان الفرعي:</strong> {result.extractedInfo.subTitle}
                            </div>
                          )}
                          {result.extractedInfo.caseDate && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>تاريخ الدعوى:</strong> {new Date(result.extractedInfo.caseDate).toLocaleDateString('ar-SA')}
                            </div>
                          )}
                        </div>

                        {result.extractedInfo.summary && (
                          <div style={{ 
                            padding: '16px',
                            background: '#f7fafc',
                            borderRadius: '6px',
                            marginBottom: '16px'
                          }}>
                            <strong style={{ display: 'block', marginBottom: '8px' }}>الملخص:</strong>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>
                              {result.extractedInfo.summary}
                            </p>
                          </div>
                        )}

                        {result.extractedInfo.keywords?.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', marginBottom: '8px' }}>الكلمات المفتاحية:</strong>
                            <div>
                              {result.extractedInfo.keywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    margin: '4px',
                                    background: '#e2e8f0',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                  }}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        onClick={() => {
                          setResult(null);
                          setFile(null);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1
                        }}
                      >
                        📤 رفع مستند آخر
                      </button>
                      
                      <button
                        onClick={() => router.push(`/view/${result.documentId}`)}
                        style={{
                          padding: '10px 20px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1
                        }}
                      >
                        👁️ عرض المستند
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
