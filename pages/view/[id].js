import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DocView() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session?.user) {
      setError('يرجى تسجيل الدخول لعرض المستندات');
      setLoading(false);
      return;
    }

    fetch(`/api/view/${id}`)
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'فشل التحميل' }));
          throw new Error(err.error || 'تعذر جلب المستند');
        }
        return res.json();
      })
      .then(data => {
        setMetadata(data.metadata);
        setText(data.text);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setText('');
      })
      .finally(() => setLoading(false));
  }, [id, session, status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>جاري تحميل المستند...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ marginBottom: '8px', color: '#721c24' }}>حدث خطأ</h3>
        <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
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
    );
  }

  const isArabic = text.match(/[\u0600-\u06FF]/);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none', 
        direction: 'rtl',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}
    >
      {/* Watermark overlay */}
      <div style={{
        position: 'fixed',
        top: 12,
        right: 12,
        opacity: 0.08,
        fontSize: 10,
        pointerEvents: 'none',
        zIndex: 9999,
        color: '#000',
        direction: 'ltr',
        fontFamily: 'monospace'
      }}>
        {session?.user?.email} • {new Date().toLocaleString('ar-SA')}
      </div>

      {/* Header Bar */}
      <div style={{ 
        padding: '16px 20px', 
        background: 'white',
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Link href="/">
            <button 
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← العودة للبحث
            </button>
          </Link>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>
              {metadata?.mainTitle || 'عارض المستندات'}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
        {/* Document Header Card */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {metadata?.subTitle && (
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '16px', 
              color: '#666',
              fontWeight: 'normal'
            }}>
              {metadata.subTitle}
            </h3>
          )}
          
          {metadata && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              lineHeight: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {metadata.court && (
                <div>
                  <strong style={{ color: '#333' }}>المحكمة:</strong> {metadata.court}
                </div>
              )}
              {metadata.plaintiff && (
                <div>
                  <strong style={{ color: '#333' }}>المدعي:</strong> {metadata.plaintiff}
                </div>
              )}
              {metadata.judgmentFor && (
                <div>
                  <strong style={{ color: '#333' }}>الحكم لصالح:</strong> {metadata.judgmentFor}
                </div>
              )}
              {metadata.caseDate && (
                <div>
                  <strong style={{ color: '#333' }}>تاريخ الدعوى:</strong> {new Date(metadata.caseDate).toLocaleDateString('ar-SA')}
                </div>
              )}
            </div>
          )}
          
          {metadata?.summary && (
            <div style={{ 
              marginTop: '16px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '6px',
              borderRight: '4px solid #007bff'
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                ملخص الحكم:
              </strong>
              <p style={{ margin: 0, lineHeight: 1.6, color: '#555' }}>
                {metadata.summary}
              </p>
            </div>
          )}
        </div>

        {/* Document Content Card */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            whiteSpace: 'pre-wrap',
            fontFamily: isArabic ? 'Tahoma, Arial, sans-serif' : 'Georgia, serif',
            lineHeight: 1.9,
            fontSize: '15px',
            direction: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
            color: '#2d3748'
          }}>
            {text || 'لا يوجد محتوى متاح'}
          </div>
        </div>

        {/* Footer Warning Card */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          fontSize: '13px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>تحذير هام</strong>
          هذا المستند سري ومحمي. التوزيع غير المصرح به محظور. يتم تسجيل ومراقبة جميع عمليات الوصول.
        </div>
      </div>
    </div>
  );
}
