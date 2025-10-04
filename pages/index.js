import { signIn, signOut, useSession } from 'next-auth/react';
import DocumentSearch from '../components/DocumentSearch';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '100px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        direction: 'rtl'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>
          🏛️ نظام البحث في الأحكام القضائية
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
          نظام البحث في المستندات القانونية
        </p>
        <button 
          onClick={() => signIn('google')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          تسجيل الدخول بواسطة جوجل
        </button>
      </div>
    );
  }

  // Extract user ID from email (before @)
  const userId = session.user.email?.split('@')[0] || session.user.email;
  const userRole = session.user.role === 'ADMIN' ? 'مسؤول' : 'مستخدم';

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
            <span>{userId} ({userRole})</span>
            {session.user.role === 'ADMIN' && (
              <Link href="/admin/upload">
                <button style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  رفع مستند
                </button>
              </Link>
            )}
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
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <DocumentSearch />
      </div>
    </div>
  );
}
