import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';

export default function ResponsiveHeader({ session }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const userId = session?.user?.email?.split('@')[0] || session?.user?.email;
  const userRole = session?.user?.role === 'ADMIN' ? 'مسؤول' : 
                   session?.user?.isLawyer ? 'محامي' :
                   session?.user?.isClient ? 'عميل' : 'مستخدم';

  return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .menu-overlay {
          animation: fadeIn 0.3s ease;
        }

        .menu-drawer {
          animation: slideIn 0.3s ease;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-hamburger {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #eee',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        direction: 'rtl'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚖️</span>
            <h1 style={{ margin: 0, fontSize: '20px' }}>نظام البحث القانوني</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ 
              padding: '8px 16px', 
              background: '#f0f0f0', 
              borderRadius: '20px',
              fontSize: '14px',
              marginLeft: '8px'
            }}>
              {userId} ({userRole})
            </span>

            {session?.user?.isLawyer && (
              <>
                <Link href="/lawyer/today">
                  <button style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(33, 147, 176, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(33, 147, 176, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(33, 147, 176, 0.3)';
                  }}>
                    📅 عملي
                  </button>
                </Link>
                <Link href="/lawyer/clients">
                  <button style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(242, 153, 74, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(242, 153, 74, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(242, 153, 74, 0.3)';
                  }}>
                    👥 عملائي
                  </button>
                </Link>
              </>
            )}

            {session?.user?.isClient && (
              <>
                <Link href="/client/cases">
                  <button style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(33, 147, 176, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(33, 147, 176, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(33, 147, 176, 0.3)';
                  }}>
                    📁 قضاياي
                  </button>
                </Link>
                <Link href="/client/lawyers">
                  <button style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(242, 153, 74, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(242, 153, 74, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(242, 153, 74, 0.3)';
                  }}>
                    👨‍⚖️ البحث عن محامي
                  </button>
                </Link>
              </>
            )}

            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin/upload">
                <button style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
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
                  📤 رفع مستند
                </button>
              </Link>
            )}

            <button 
              onClick={() => signOut()}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(235, 51, 73, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(235, 51, 73, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(235, 51, 73, 0.3)';
              }}
            >
              تسجيل الخروج
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="mobile-hamburger"
            onClick={() => setMenuOpen(true)}
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '5px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <div style={{ width: '28px', height: '3px', background: '#333', borderRadius: '2px' }}></div>
            <div style={{ width: '28px', height: '3px', background: '#333', borderRadius: '2px' }}></div>
            <div style={{ width: '28px', height: '3px', background: '#333', borderRadius: '2px' }}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          {/* Dark overlay */}
          <div 
            className="menu-overlay"
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998
            }}
          />

          {/* Slide-out menu */}
          <div 
            className="menu-drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '85vw',
              background: 'white',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
              zIndex: 999,
              overflowY: 'auto',
              direction: 'rtl'
            }}
          >
            {/* Menu Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>القائمة</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{userId}</div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '20px' }}>
              <div style={{
                padding: '12px',
                background: '#f0f0f0',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{userRole}</div>
              </div>

              {session?.user?.isLawyer && (
                <>
                  <Link href="/lawyer/today">
                    <button onClick={() => setMenuOpen(false)} style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(33, 147, 176, 0.3)'
                    }}>
                      <span>📅</span>
                      <span>عملي</span>
                    </button>
                  </Link>
                  <Link href="/lawyer/clients">
                    <button onClick={() => setMenuOpen(false)} style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(242, 153, 74, 0.3)'
                    }}>
                      <span>👥</span>
                      <span>عملائي</span>
                    </button>
                  </Link>
                </>
              )}

              {session?.user?.isClient && (
                <>
                  <Link href="/client/cases">
                    <button onClick={() => setMenuOpen(false)} style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(33, 147, 176, 0.3)'
                    }}>
                      <span>📁</span>
                      <span>قضاياي</span>
                    </button>
                  </Link>
                  <Link href="/client/lawyers">
                    <button onClick={() => setMenuOpen(false)} style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(242, 153, 74, 0.3)'
                    }}>
                      <span>👨‍⚖️</span>
                      <span>البحث عن محامي</span>
                    </button>
                  </Link>
                </>
              )}

              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin/upload">
                  <button onClick={() => setMenuOpen(false)} style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)'
                  }}>
                    <span>📤</span>
                    <span>رفع مستند</span>
                  </button>
                </Link>
              )}

              <div style={{ 
                borderTop: '1px solid #eee', 
                marginTop: '20px', 
                paddingTop: '20px' 
              }}>
                <button 
                  onClick={() => signOut()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(235, 51, 73, 0.3)'
                  }}
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
