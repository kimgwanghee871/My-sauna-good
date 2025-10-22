import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string
    accessToken?: string
  }
}