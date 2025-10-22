import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session && token) {
        (session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: { 
    signIn: '/login', 
    error: '/auth/error' 
  },
  session: { 
    strategy: 'jwt' 
  },
  secret: process.env.NEXTAUTH_SECRET,
}