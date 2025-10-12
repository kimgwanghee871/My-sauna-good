import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'G-Won AI - AI 사업계획서 생성기',
  description: 'AI가 만들어주는 전문적인 사업계획서. 정부지원, 투자유치, 대출용 템플릿으로 10분 만에 완성하세요.',
  keywords: ['사업계획서', 'AI', '정부지원', '투자유치', '대출', '창업'],
  authors: [{ name: 'G-Won AI' }],
  openGraph: {
    title: 'G-Won AI - AI 사업계획서 생성기',
    description: 'AI가 만들어주는 전문적인 사업계획서',
    url: 'https://gwon-ai-planner.vercel.app',
    siteName: 'G-Won AI',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body className="min-h-screen antialiased bg-gradient-to-br from-slate-50 to-blue-50">
        {children}
      </body>
    </html>
  )
}