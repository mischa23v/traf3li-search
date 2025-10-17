import { signIn, signOut, useSession } from 'next-auth/react';
import DocumentSearch from '../components/DocumentSearch';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <>
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .hero-container {
            position: relative;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            overflow-x: hidden;
          }

          .hero-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }

          .logo-top {
            position: absolute;
            top: 40px;
            right: 50px;
            display: flex;
            align-items: center;
            gap: 15px;
            color: white;
            font-size: 1.8em;
            font-weight: 700;
            z-index: 10;
          }

          .logo-icon {
            font-size: 1.4em;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }

          .content {
            text-align: center;
            color: white;
            max-width: 900px;
            padding: 40px;
            position: relative;
            z-index: 1;
          }

          .scale-icon {
            font-size: 5em;
            margin-bottom: 30px;
            animation: float 3s ease-in-out infinite;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          h1 {
            font-size: 3.2em;
            font-weight: 800;
            margin-bottom: 25px;
            line-height: 1.2;
            text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
            background: linear-gradient(to left, #ffffff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .tagline {
            font-size: 1.6em;
            margin-bottom: 30px;
            font-weight: 300;
            opacity: 0.95;
            line-height: 1.5;
          }

          .description {
            font-size: 1.2em;
            line-height: 1.9;
            margin-bottom: 50px;
            opacity: 0.9;
            font-weight: 300;
          }

          .login-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 22px 60px;
            border: none;
            border-radius: 50px;
            font-size: 1.4em;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 15px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
          }

          .login-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .login-button:hover::before {
            left: 100%;
          }

          .login-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 20px 45px rgba(102, 126, 234, 0.6);
          }

          .login-button:active {
            transform: translateY(-2px) scale(1.02);
          }

          .google-icon {
            width: 28px;
            height: 28px;
            background: white;
            border-radius: 4px;
            padding: 3px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }

          .decorative-elements {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .circle {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
          }

          .circle1 {
            width: 400px;
            height: 400px;
            top: -100px;
            left: -100px;
            animation: pulse 8s ease-in-out infinite;
          }

          .circle2 {
            width: 300px;
            height: 300px;
            bottom: -50px;
            right: -50px;
            animation: pulse 6s ease-in-out infinite 1s;
          }

          .circle3 {
            width: 250px;
            height: 250px;
            top: 50%;
            left: 10%;
            animation: pulse 7s ease-in-out infinite 2s;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.5;
            }
          }

          .features-strip {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 60px;
            color: white;
            font-size: 0.95em;
            opacity: 0.8;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .feature-icon {
            font-size: 1.5em;
          }

          footer {
            background: #0a0a0a;
            color: white;
            padding: 60px 20px 30px;
          }

          .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
            margin-bottom: 40px;
            direction: rtl;
          }

          .footer-section h3 {
            font-size: 1.3em;
            margin-bottom: 20px;
            color: #fff;
            font-weight: 600;
          }

          .footer-section p {
            color: #a0aec0;
            line-height: 1.8;
            margin-bottom: 15px;
          }

          .footer-links {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .footer-links span {
            color: #a0aec0;
            cursor: not-allowed;
            opacity: 0.7;
            transition: opacity 0.3s;
          }

          .footer-links span:hover {
            opacity: 1;
          }

          .footer-bottom {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #2d3748;
            color: #718096;
            font-size: 0.95em;
          }

          @media (max-width: 768px) {
            .logo-top {
              top: 20px;
              right: 20px;
              font-size: 1.3em;
            }

            .content {
              padding: 20px;
            }

            .scale-icon {
              font-size: 3.5em;
            }

            h1 {
              font-size: 2em;
            }

            .tagline {
              font-size: 1.2em;
            }

            .description {
              font-size: 1em;
            }

            .login-button {
              padding: 18px 40px;
              font-size: 1.2em;
            }

            .features-strip {
              flex-direction: column;
              gap: 15px;
              bottom: 20px;
              font-size: 0.85em;
            }

            .circle1, .circle2, .circle3 {
              display: none;
            }

            .footer-content {
              grid-template-columns: 1fr;
              gap: 30px;
            }
          }
        `}</style>

        <div className="hero-container">
          <div className="decorative-elements">
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
          </div>

          <div className="logo-top">
            <span className="logo-icon">⚖️</span>
            <span>البحث القانوني</span>
          </div>

          <div className="content">
            <div className="scale-icon">⚖️</div>
            <h1>منصتك المتقدمة للبحث في الأحكام القضائية</h1>
            <p className="tagline">نساعد المحامين والمستشارين القانونيين على الفوز في أصعب القضايا</p>
            <p className="description">
              استفد من قوة الذكاء الاصطناعي للوصول الفوري إلى آلاف السوابق القضائية. 
              وفّر ساعات من البحث، وابنِ حججاً قانونية أقوى، واحصل على ميزة تنافسية في قضاياك المعقدة.
            </p>
            <button className="login-button" onClick={() => signIn('google')}>
              <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              تسجيل الدخول بواسطة Google
            </button>
          </div>

          <div className="features-strip">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>بحث ذكي ودقيق</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>نتائج فورية</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <span>آمن ومحمي</span>
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h3>عن المنصة</h3>
              <p>منصة متقدمة للبحث في الأحكام القضائية مدعومة بالذكاء الاصطناعي، مصممة خصيصاً لخدمة المحامين والمستشارين القانونيين في المملكة العربية السعودية.</p>
            </div>
            <div className="footer-section">
              <h3>روابط سريعة</h3>
              <div className="footer-links">
                <span>خدماتنا</span>
                <span>كيف يعمل النظام</span>
                <span>المزايا</span>
                <span>الأسئلة الشائعة</span>
              </div>
            </div>
            <div className="footer-section">
              <h3>الدعم القانوني</h3>
              <div className="footer-links">
                <span>شروط الاستخدام</span>
                <span>سياسة الخصوصية</span>
                <span>سياسة الاسترجاع</span>
                <span>اتصل بنا</span>
              </div>
            </div>
            <div className="footer-section">
              <h3>تواصل معنا</h3>
              <p>📧 mischa23v@gmail.com</p>
              <p>📞 0545451124</p>
              <p>📍 الخبر، المملكة العربية السعودية</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 نظام البحث في الأحكام القضائية - جميع الحقوق محفوظة</p>
          </div>
        </footer>
      </>
    );
  }

  // Extract user ID from email (before @)
  const userId = session.user.email?.split('@')[0] || session.user.email;
  const userRole = session.user.role === 'ADMIN' ? 'مسؤول' : 
                   session.user.isLawyer ? 'محامي' :
                   session.user.isClient ? 'عميل' : 'مستخدم';

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
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
            <h1 style={{ margin: 0, fontSize: '20px' }}>نظام البحث القانوني</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ 
              padding: '8px 16px', 
              background: '#f0f0f0', 
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {userId} ({userRole})
            </span>
            
            {/* Role-based navigation buttons */}
            {session.user.isLawyer && (
              <>
                <Link href="/lawyer/today">
                  <button style={{
                    padding: '10px 20px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#138496'}
                  onMouseLeave={(e) => e.target.style.background = '#17a2b8'}>
                    📅 عملي
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
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.background = '#6c757d'}>
                    👥 عملائي
                  </button>
                </Link>
              </>
            )}
            
            {session.user.isClient && (
              <>
                <Link href="/client/cases">
                  <button style={{
                    padding: '10px 20px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#138496'}
                  onMouseLeave={(e) => e.target.style.background = '#17a2b8'}>
                    📁 قضاياي
                  </button>
                </Link>
                <Link href="/client/lawyers">
                  <button style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.background = '#6c757d'}>
                    👨‍⚖️ البحث عن محامي
                  </button>
                </Link>
              </>
            )}
            
            {session.user.role === 'ADMIN' && (
              <Link href="/admin/upload">
                <button style={{
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#218838'}
                onMouseLeave={(e) => e.target.style.background = '#28a745'}>
                  📤 رفع مستند
                </button>
              </Link>
            )}
            
            <button 
              onClick={() => signOut()}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#c82333'}
              onMouseLeave={(e) => e.target.style.background = '#dc3545'}
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
