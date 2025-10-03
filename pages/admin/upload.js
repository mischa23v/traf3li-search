import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminUpload() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  if (!session) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '40px',
        direction: 'rtl'
      }}>
        جاري التحميل...
      </div>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div style={{ direction: 'rtl' }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #eee',
          background: '#f8f9fa'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ margin: 0 }}>نظام البحث القانوني</h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span>{session.user.email} ({session.user.role === 'ADMIN' ? 'مسؤول' : 'مستخدم'})</span>
              <button 
                onClick={() => signOut()}
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>يتطلب صلاحيات المسؤول</h3>
          <p>يرجى تسجيل الدخول كمسؤول للوصول لهذه الصفحة</p>
          <button 
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
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
    const formData = new FormData();
    formData.append('document', file);
    formData.append('accessLevel', 'USER_ONLY');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`فشل الرفع: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      setResult(data);
      
      if (data.success) {
        setFile(null);
        document.querySelector('input[type="file"]').value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setResult({ error: err.message });
    }
    setUploading(false);
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header - exact match */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #eee',
        background: '#f8f9fa'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>نظام البحث القانوني</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{session.user.email} ({session.user.role === 'ADMIN' ? 'مسؤول' : 'مستخدم'})</span>
            <Link href="/">
              <button style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                البحث في الأحكام
              </button>
            </Link>
            <button 
              onClick={() => signOut()}
              style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div className="document-search">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '8px' }}>رفع مستند قانوني</h2>
            <p style={{ color: '#666' }}>قم برفع الأحكام القضائية بصيغة txt</p>
          </div>

          {/* Upload Form */}
          <div style={{ marginBottom: '16px' }}>
            <form onSubmit={handleUpload}>
              <input 
                type="file" 
                accept=".txt"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}
              />

              {file && (
                <div style={{ 
                  padding: '12px',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <strong>الملف المحدد:</strong> {file.name} ({(file.size / 1024).toFixed(1)} كيلوبايت)
                </div>
              )}

              <button 
                type="submit" 
                disabled={uploading || !file}
                style={{
                  padding: '8px 16px',
                  background: uploading || !file ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: uploading || !file ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {uploading ? 'جاري الرفع...' : 'رفع المستند'}
              </button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>
                {result.error ? 'حدث خطأ' : 'تم الرفع بنجاح'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    background: result.error ? '#f8d7da' : 'white',
                    direction: 'rtl'
                  }}
                >
                  {result.error ? (
                    <div style={{ color: '#721c24' }}>
                      <strong>خطأ:</strong> {result.error}
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <strong style={{ fontSize: '18px', color: '#155724' }}>
                          ✓ تم رفع المستند بنجاح
                        </strong>
                      </div>

                      {result.extractedInfo && (
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#666', 
                          marginBottom: '12px',
                          lineHeight: 1.6
                        }}>
                          {result.extractedInfo.court && (
                            <div>المحكمة: {result.extractedInfo.court}</div>
                          )}
                          {result.extractedInfo.caseNumber && (
                            <div>رقم القضية: {result.extractedInfo.caseNumber}</div>
                          )}
                          {result.extractedInfo.winningParty && (
                            <div>الطرف الفائز: {result.extractedInfo.winningParty}</div>
                          )}
                          {result.extractedInfo.victoryType && (
                            <div>نوع الفوز: {result.extractedInfo.victoryType}</div>
                          )}
                          {result.extractedInfo.field && (
                            <div>المجال: {result.extractedInfo.field}</div>
                          )}
                        </div>
                      )}

                      {result.extractedInfo?.summary && (
                        <p style={{ 
                          color: '#333', 
                          fontSize: '14px',
                          marginBottom: '12px',
                          lineHeight: 1.6
                        }}>
                          {result.extractedInfo.summary}
                        </p>
                      )}

                      {result.extractedInfo?.keywords?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          {result.extractedInfo.keywords.slice(0, 5).map((keyword, i) => (
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
                        onClick={() => {
                          setResult(null);
                          setFile(null);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        رفع مستند آخر
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
