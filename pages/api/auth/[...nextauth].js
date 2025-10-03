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
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists, if not create them
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
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
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
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
