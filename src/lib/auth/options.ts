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
      if (account?.provider && token.sub) {
        token.uid = token.sub
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as any).id = String(token.uid)
        (session as any).accessToken = token.accessToken
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 🔍 DEBUG: Log redirect attempts
      console.log('🔍 [NextAuth] Redirect callback:', { url, baseUrl })
      
      // Allow same origin redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow callback URLs on same origin
      else if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
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
  // Enable debug logging
  debug: process.env.NODE_ENV !== 'production',
}