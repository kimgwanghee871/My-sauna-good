import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { 
    strategy: 'jwt' 
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'google' && token.sub) {
        token.uid = token.sub
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as any).id = token.uid
      }
      return session
    },
  },
  pages: { 
    signIn: '/login', 
    error: '/auth/error' 
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}