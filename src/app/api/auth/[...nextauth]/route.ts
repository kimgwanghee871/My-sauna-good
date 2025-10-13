import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.sub
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.id as string
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
