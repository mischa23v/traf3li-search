import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '../../../lib/prisma';

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
    async signIn({ user, account, profile }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'USER',
              active: true
            }
          });
        }
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.authorized = dbUser.active;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/'
  }
};

export default NextAuth(authOptions);
