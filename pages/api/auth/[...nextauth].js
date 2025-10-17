import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { logError, logInfo } from '../../../lib/logger';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/',
    error: '/',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        logInfo('AUTH_SIGNIN', 'User attempting to sign in', { email: user.email });
        return true;
      } catch (error) {
        logError('AUTH_SIGNIN', error);
        return false;
      }
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token?.email) {
        const prisma = new PrismaClient();
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: {
              lawyer: true,
              client: true
            }
          });
          
          if (dbUser) {
            // User exists in database
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.authorized = dbUser.active;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name || token.name;
            session.user.image = token.picture;
            
            // Add lawyer/client specific data
            if (dbUser.lawyer) {
              session.user.lawyerId = dbUser.lawyer.id;
              session.user.isLawyer = true;
            }
            
            if (dbUser.client) {
              session.user.clientId = dbUser.client.id;
              session.user.isClient = true;
            }
            
            // Check if access has expired
            if (new Date() > new Date(dbUser.accessEnd)) {
              session.user.authorized = false;
              logInfo('AUTH_SESSION', 'User access expired', { email: dbUser.email });
            }
          } else {
            // User not in database - unauthorized
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.image = token.picture;
            session.user.role = 'USER';
            session.user.authorized = false;
            session.user.isLawyer = false;
            session.user.isClient = false;
            
            logInfo('AUTH_SESSION', 'User not authorized in database', { email: token.email });
          }
        } catch (error) {
          logError('AUTH_SESSION', error, token.email);
          
          // Fallback for database errors
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.image = token.picture;
          session.user.role = 'USER';
          session.user.authorized = false;
          session.user.isLawyer = false;
          session.user.isClient = false;
        } finally {
          await prisma.$disconnect();
        }
      }
      
      return session;
    }
  },
  
  events: {
    async signIn({ user }) {
      logInfo('AUTH_EVENT', 'User signed in', { email: user.email });
    },
    async signOut({ token }) {
      logInfo('AUTH_EVENT', 'User signed out', { email: token?.email });
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
