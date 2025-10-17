import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { validateEnv } from '../lib/validateEnv';
import '../styles/globals.css';

// Validate environment on startup (production only)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error.message);
    process.exit(1);
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Prevent context menu (right-click) on production
    if (process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  useEffect(() => {
    // Disable text selection and copy on production for security
    if (process.env.NODE_ENV === 'production') {
      const handleCopy = (e) => {
        const selection = window.getSelection().toString();
        if (selection.length > 100) {
          e.preventDefault();
          alert('نسخ كميات كبيرة من النص غير مسموح');
          return false;
        }
      };
      
      document.addEventListener('copy', handleCopy);
      
      return () => {
        document.removeEventListener('copy', handleCopy);
      };
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
