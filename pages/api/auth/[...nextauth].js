import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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
      // Allow all sign-ins - we'll check authorization in session callback
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
      // Just pass through the Google user info
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      
      // Set default role - admin check happens on protected pages
      session.user.role = 'USER';
      session.user.authorized = true;
      
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
