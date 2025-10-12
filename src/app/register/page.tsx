import { redirect } from 'next/navigation'

// 회원가입은 로그인 페이지에서 처리하므로 리다이렉트
export default function RegisterPage() {
  redirect('/login')
}