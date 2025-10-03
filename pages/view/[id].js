import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DocView() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session?.user) {
      setText('يرجى تسجيل الدخول لعرض المستندات');
      setLoading(false);
      return;
    }

    fetch(`/api/view/${id}`)
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'فشل التحميل' }));
          setText('خطأ: ' + (err.error || 'تعذر جلب المستند'));
          return;
        }
        const data = await res.json();
        setMetadata(data.metadata);
        setText(data.text);
      })
      .catch(() => setText('فشل تحميل المستند'))
      .finally(() => setLoading(false));
  }, [id, session, status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        جاري التحميل...
      </div>
    );
  }

  const isArabic = text.match(/[\u0600-\u06FF]/);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Watermark overlay */}
      <div style={{
        position: 'fixed',
        top: 12,
        right: 12,
        opacity: 0.1,
        fontSize: 10,
        pointerEvents: 'none',
        zIndex: 9999,
        color: '#000',
        direction: 'ltr'
      }}>
        {session?.user?.email} • {new Date().toLocaleString('ar-SA')}
      </div>

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ 
          borderBottom: '2px solid #333', 
          paddingBottom: '16px', 
          marginBottom: '24px',
          direction: 'rtl'
        }}>
          <button 
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px',
              marginBottom: '16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← العودة للبحث
          </button>

          <h2 style={{ margin: '8px 0' }}>{metadata?.title || 'عارض المستندات'}</h2>
          
          {metadata && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '12px',
              lineHeight: 1.8
            }}>
              {metadata.court && <div>المحكمة: {metadata.court}</div>}
              {metadata.caseNumber && <div>رقم القضية: {metadata.caseNumber}</div>}
              {metadata.dateDecided && (
                <div>التاريخ: {new Date(metadata.dateDecided).toLocaleDateString('ar-SA')}</div>
              )}
              {metadata.winningParty && <div>الطرف الفائز: {metadata.winningParty}</div>}
              {metadata.victoryType && <div>نوع الفوز: {metadata.victoryType}</div>}
              {metadata.field && <div>المجال: {metadata.field}</div>}
            </div>
          )}
        </div>

        {/* Document text */}
        <div style={{
          whiteSpace: 'pre-wrap',
          fontFamily: isArabic ? 'Tahoma, Arial, sans-serif' : 'Georgia, serif',
          lineHeight: 1.8,
          fontSize: '15px',
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: isArabic ? 'right' : 'left'
        }}>
          {text || 'لا يوجد محتوى متاح'}
        </div>

        {/* Footer warning */}
        <div style={{
          marginTop: '40px',
          padding: '16px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontSize: '13px',
          direction: 'rtl',
          textAlign: 'center'
        }}>
          ⚠️ هذا المستند سري. التوزيع غير المصرح به محظور. يتم تسجيل ومراقبة وصولك.
        </div>
      </div>
    </div>
  );
}