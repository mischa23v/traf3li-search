import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user }) {
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
            where: { email: token.email }
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.authorized = dbUser.active;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name;
            session.user.image = token.picture;
          } else {
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.image = token.picture;
            session.user.role = 'USER';
            session.user.authorized = false;
          }
        } catch (error) {
          console.error('Session lookup error:', error);
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.image = token.picture;
          session.user.role = 'USER';
          session.user.authorized = false;
        } finally {
          await prisma.$disconnect();
        }
      }
      
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
