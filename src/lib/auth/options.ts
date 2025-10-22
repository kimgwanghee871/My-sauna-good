import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      // OAuth 로그인 직후 token.sub가 유저 고유 ID
      if (account?.provider && token.sub) {
        token.uid = token.sub
      }
      // 액세스토큰 부가 저장(선택)
      if ((account as any)?.access_token) {
        token.accessToken = (account as any).access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        // ✅ 올바른 문자열 변환
        (session.user as any).id = String(token.uid)
      }
      // 액세스토큰 전달(선택)
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: { 
    signIn: '/login', 
    error: '/auth/error' 
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
}