'use client'

const testimonials = [
  {
    name: '김창업',
    position: 'CEO, 테크스타트업',
    company: 'AI 솔루션 스타트업',
    avatar: '👨‍💼',
    content: 'TIPS 선정을 위한 사업계획서를 준비하는데 보통 2-3주가 걸렸는데, G-Won AI로는 정말 10분 만에 완성됐습니다. 더 놀라운 건 퀄리티가 전문 컨설턴트가 만든 것만큼 좋다는 점이에요.',
    rating: 5,
    useCase: '정부지원용',
    result: 'TIPS 선정 성공',
  },
  {
    name: '박투자',
    position: 'Managing Partner',
    company: 'KV벤처파트너스',
    avatar: '👩‍💼',
    content: '스타트업들이 제출하는 사업계획서의 품질이 확실히 달라졌습니다. G-Won AI로 만든 계획서들은 구조도 체계적이고 재무계획도 현실적이어서 심사하기가 훨씬 수월합니다.',
    rating: 5,
    useCase: '투자유치용',
    result: '심사 효율성 증대',
  },
  {
    name: '이대출',
    position: '대표이사',
    company: '(주)제조기업',
    avatar: '👨‍🔧',
    content: '코로나19로 운영자금이 필요해서 급하게 대출을 받아야 했는데, 은행에서 요구하는 사업계획서를 하루 만에 완성할 수 있었습니다. 덕분에 빠르게 자금을 확보할 수 있었어요.',
    rating: 5,
    useCase: '대출용',
    result: '30억 대출 승인',
  },
  {
    name: '정정부',
    position: '팀장',
    company: '중소벤처기업부',
    avatar: '👨‍💻',
    content: '최근 들어 중소기업들이 제출하는 R&D 과제계획서의 완성도가 많이 높아졌습니다. 특히 시장분석이나 기술동향 부분이 체계적으로 잘 정리되어 있어서 심사가 수월합니다.',
    rating: 5,
    useCase: '정부지원용',
    result: '심사 품질 향상',
  },
  {
    name: '최성장',
    position: 'CTO',
    company: '바이오테크',
    avatar: '👩‍🔬',
    content: '시리즈 A 투자 준비하면서 여러 VC에 피칭해야 했는데, G-Won AI 덕분에 각 투자사별로 맞춤형 사업계획서를 쉽게 만들 수 있었습니다. 결국 3곳에서 투자 제안을 받았어요!',
    rating: 5,
    useCase: '투자유치용',
    result: '50억 시리즈A 성공',
  },
  {
    name: '홍컨설',
    position: '수석 컨설턴트',
    company: '경영컨설팅',
    avatar: '👔',
    content: '클라이언트 사업계획서 작성 업무가 80% 줄었습니다. 이제 G-Won AI가 초안을 만들어주면 저는 검토와 개선에만 집중할 수 있어서 훨씬 더 높은 품질의 서비스를 제공할 수 있게 됐어요.',
    rating: 5,
    useCase: '전체',
    result: '업무효율 80% 향상',
  },
]

const stats = [
  {
    number: '10,000+',
    label: '생성된 사업계획서',
    subtext: '누적 생성 건수',
  },
  {
    number: '95%',
    label: '심사 통과율',
    subtext: 'G-Won AI 사용자',
  },
  {
    number: '10분',
    label: '평균 완성 시간',
    subtext: '기존 대비 95% 단축',
  },
  {
    number: '4.9/5',
    label: '사용자 만족도',
    subtext: '1,500+ 리뷰 기준',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            이미 검증된 성과
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            수많은 기업과 전문가들이 G-Won AI로 성공을 만들어가고 있습니다.
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* 고객 후기 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* 평점 */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* 후기 내용 */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* 결과 뱃지 */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  testimonial.useCase === '정부지원용' ? 'bg-blue-100 text-blue-800' :
                  testimonial.useCase === '투자유치용' ? 'bg-green-100 text-green-800' :
                  testimonial.useCase === '대출용' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {testimonial.useCase}
                </span>
                <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ✨ {testimonial.result}
                </span>
              </div>

              {/* 작성자 정보 */}
              <div className="flex items-center">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.position}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 성공 사례 요약 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              실제 성공 사례들
            </h3>
            <p className="text-gray-600">
              G-Won AI 사용자들의 실제 성과입니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">🏛️</div>
              <h4 className="font-semibold text-gray-900 mb-2">정부지원 선정률</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">94%</p>
              <p className="text-sm text-gray-600">TIPS, K-스타트업 등</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-semibold text-gray-900 mb-2">투자 유치 성공률</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">87%</p>
              <p className="text-sm text-gray-600">시드~시리즈A</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-3">🏦</div>
              <h4 className="font-semibold text-gray-900 mb-2">대출 승인률</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">96%</p>
              <p className="text-sm text-gray-600">신보, 기보 등</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            당신도 G-Won AI로 성공 스토리를 만들어보세요
          </p>
          <Link href="/generate" className="inline-block">
            <Button size="xl" className="text-lg px-10 py-4">
              🚀 지금 바로 시작하기
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            무료 체험 • 신용카드 불필요 • 즉시 시작
          </p>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/Button'