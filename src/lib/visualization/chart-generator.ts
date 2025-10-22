// 시각화 차트 생성기 - 잰스파크 차트엔진 연동
import { createClient } from '@supabase/supabase-js'
import type { QnaInput } from '../schemas/qset.schema'
import type { TemplateKey } from '../generator/ai-orchestrator'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 차트 타입별 정의
export type ChartType = 
  | 'tam_sam_som'      // TAM/SAM/SOM 파이차트
  | 'swot_matrix'      // SWOT 매트릭스  
  | 'financial_bar'    // 재무추정 막대그래프
  | 'roadmap_timeline' // 기술로드맵 타임라인
  | 'org_chart'        // 조직도
  | 'market_share'     // 시장점유율
  | 'growth_trend'     // 성장추세
  | 'competitive_map'  // 경쟁사 포지셔닝
  | 'revenue_model'    // 수익모델
  | 'funding_timeline' // 투자유치 타임라인
  | 'risk_matrix'      // 리스크 매트릭스
  | 'milestone_gantt'  // 마일스톤 간트차트
  | 'cost_breakdown'   // 비용 분해
  | 'market_trend'     // 시장 트렌드
  | 'technology_stack' // 기술 스택

export interface ChartData {
  type: ChartType
  title: string
  data: any // Chart.js/D3 호환 데이터
  config?: any // 차트 설정 (색상, 레이아웃 등)
}

export interface ChartSpec {
  planId: string
  sectionId: string
  chartType: ChartType
  chartTitle: string
  chartData: any
  chartConfig?: any
  displayOrder?: number
}

/**
 * 템플릿별 기본 차트 설정
 */
const TEMPLATE_CHARTS: Record<TemplateKey, ChartType[]> = {
  government: [
    'tam_sam_som',
    'technology_stack',
    'milestone_gantt',
    'cost_breakdown',
    'risk_matrix'
  ],
  investment: [
    'tam_sam_som',
    'swot_matrix', 
    'financial_bar',
    'competitive_map',
    'growth_trend',
    'roadmap_timeline',
    'funding_timeline'
  ],
  loan: [
    'financial_bar',
    'market_share',
    'cost_breakdown',
    'risk_matrix',
    'revenue_model'
  ]
}

/**
 * AI가 생성한 텍스트에서 시각화 데이터 추출
 */
export class ChartGenerator {
  private planId: string
  private templateKey: TemplateKey
  private answers: QnaInput

  constructor(planId: string, templateKey: TemplateKey, answers: QnaInput) {
    this.planId = planId
    this.templateKey = templateKey
    this.answers = answers
  }

  /**
   * 전체 차트 생성 파이프라인
   */
  async generateAllCharts(): Promise<ChartSpec[]> {
    const chartTypes = TEMPLATE_CHARTS[this.templateKey]
    const chartSpecs: ChartSpec[] = []

    for (let i = 0; i < chartTypes.length; i++) {
      const chartType = chartTypes[i]
      try {
        const chartData = await this.generateChartData(chartType)
        if (chartData) {
          const spec: ChartSpec = {
            planId: this.planId,
            sectionId: '', // 섹션 연결은 별도 처리
            chartType,
            chartTitle: chartData.title,
            chartData: chartData.data,
            chartConfig: chartData.config,
            displayOrder: i
          }
          chartSpecs.push(spec)
        }
      } catch (error) {
        console.error(`차트 생성 실패 (${chartType}):`, error)
      }
    }

    return chartSpecs
  }

  /**
   * 개별 차트 데이터 생성
   */
  private async generateChartData(chartType: ChartType): Promise<ChartData | null> {
    switch (chartType) {
      case 'tam_sam_som':
        return this.generateTamSamSomChart()
      case 'swot_matrix':
        return this.generateSwotMatrix()
      case 'financial_bar':
        return this.generateFinancialChart()
      case 'roadmap_timeline':
        return this.generateRoadmapTimeline()
      case 'org_chart':
        return this.generateOrgChart()
      case 'market_share':
        return this.generateMarketShare()
      case 'growth_trend':
        return this.generateGrowthTrend()
      case 'competitive_map':
        return this.generateCompetitiveMap()
      case 'revenue_model':
        return this.generateRevenueModel()
      case 'funding_timeline':
        return this.generateFundingTimeline()
      case 'risk_matrix':
        return this.generateRiskMatrix()
      case 'milestone_gantt':
        return this.generateMilestoneGantt()
      case 'cost_breakdown':
        return this.generateCostBreakdown()
      case 'market_trend':
        return this.generateMarketTrend()
      case 'technology_stack':
        return this.generateTechnologyStack()
      default:
        return null
    }
  }

  // ===================================
  // 차트별 데이터 생성 메서드들
  // ===================================

  /**
   * TAM/SAM/SOM 파이차트
   */
  private async generateTamSamSomChart(): Promise<ChartData> {
    // 사용자 답변에서 시장 규모 정보 추출 (간소화된 예시)
    const tamValue = this.extractMarketSize(this.answers.problem + this.answers.solution) || 100
    const samValue = Math.floor(tamValue * 0.3) // TAM의 30%
    const somValue = Math.floor(samValue * 0.15) // SAM의 15%

    return {
      type: 'tam_sam_som',
      title: 'TAM/SAM/SOM 시장 규모',
      data: {
        labels: ['TAM (전체시장)', 'SAM (유효시장)', 'SOM (점유가능시장)'],
        datasets: [{
          data: [tamValue, samValue, somValue],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || ''
                const value = context.parsed || 0
                return `${label}: ${value.toLocaleString()}억원`
              }
            }
          }
        }
      }
    }
  }

  /**
   * SWOT 매트릭스
   */
  private async generateSwotMatrix(): Promise<ChartData> {
    const strengths = this.extractSwotItems(this.answers.competition, 'strength')
    const weaknesses = this.extractSwotItems(this.answers.competition, 'weakness') 
    const opportunities = this.extractSwotItems(this.answers.problem, 'opportunity')
    const threats = this.extractSwotItems(this.answers.competition, 'threat')

    return {
      type: 'swot_matrix',
      title: 'SWOT 분석',
      data: {
        strengths,
        weaknesses,
        opportunities,
        threats
      },
      config: {
        layout: 'matrix',
        colors: {
          strengths: '#4CAF50',
          weaknesses: '#F44336', 
          opportunities: '#2196F3',
          threats: '#FF9800'
        }
      }
    }
  }

  /**
   * 재무추정 막대그래프
   */
  private async generateFinancialChart(): Promise<ChartData> {
    const years = ['2025', '2026', '2027', '2028', '2029']
    const revenue = this.generateFinancialProjections('revenue')
    const profit = this.generateFinancialProjections('profit')
    const expenses = this.generateFinancialProjections('expenses')

    return {
      type: 'financial_bar',
      title: '5개년 재무 전망',
      data: {
        labels: years,
        datasets: [
          {
            label: '매출',
            data: revenue,
            backgroundColor: '#36A2EB',
            borderColor: '#36A2EB',
            borderWidth: 1
          },
          {
            label: '영업이익',
            data: profit,
            backgroundColor: '#4BC0C0',
            borderColor: '#4BC0C0', 
            borderWidth: 1
          },
          {
            label: '비용',
            data: expenses,
            backgroundColor: '#FF6384',
            borderColor: '#FF6384',
            borderWidth: 1
          }
        ]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => `${value.toLocaleString()}억원`
            }
          }
        }
      }
    }
  }

  /**
   * 기술로드맵 타임라인
   */
  private async generateRoadmapTimeline(): Promise<ChartData> {
    const milestones = this.extractRoadmapMilestones(this.answers.roadmap)

    return {
      type: 'roadmap_timeline',
      title: '기술 개발 로드맵',
      data: {
        milestones: milestones.map((milestone, index) => ({
          id: index,
          title: milestone.title,
          date: milestone.date,
          description: milestone.description,
          status: milestone.status || 'planned'
        }))
      },
      config: {
        layout: 'timeline',
        colors: {
          completed: '#4CAF50',
          inProgress: '#FF9800',
          planned: '#9E9E9E'
        }
      }
    }
  }

  /**
   * 조직도
   */
  private async generateOrgChart(): Promise<ChartData> {
    const teamStructure = this.extractTeamStructure(this.answers.team)

    return {
      type: 'org_chart',
      title: '조직 구성도',
      data: {
        nodes: teamStructure.map((member, index) => ({
          id: index,
          name: member.name,
          position: member.position,
          department: member.department || '경영진',
          level: member.level || 0
        })),
        relationships: [] // 간소화
      },
      config: {
        layout: 'hierarchical',
        nodeStyle: {
          borderRadius: 8,
          padding: 10
        }
      }
    }
  }

  /**
   * 시장점유율 차트
   */
  private async generateMarketShare(): Promise<ChartData> {
    const competitors = this.extractCompetitors(this.answers.competition)

    return {
      type: 'market_share',
      title: '시장 점유율 현황',
      data: {
        labels: competitors.map(c => c.name),
        datasets: [{
          data: competitors.map(c => c.marketShare),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    }
  }

  /**
   * 성장 추세 차트
   */
  private async generateGrowthTrend(): Promise<ChartData> {
    const years = ['2020', '2021', '2022', '2023', '2024', '2025']
    const marketGrowth = [100, 115, 132, 152, 175, 200] // 연 15% 성장 가정
    
    return {
      type: 'growth_trend',
      title: '시장 성장 추세',
      data: {
        labels: years,
        datasets: [{
          label: '시장 규모',
          data: marketGrowth,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => `${value}%`
            }
          }
        }
      }
    }
  }

  // 추가 차트 메서드들 (간소화)
  private async generateCompetitiveMap(): Promise<ChartData> {
    return {
      type: 'competitive_map',
      title: '경쟁사 포지셔닝 맵',
      data: { /* 경쟁사 포지셔닝 데이터 */ },
      config: { layout: 'scatter' }
    }
  }

  private async generateRevenueModel(): Promise<ChartData> {
    return {
      type: 'revenue_model', 
      title: '수익 모델',
      data: { /* 수익 구조 데이터 */ },
      config: { layout: 'flow' }
    }
  }

  private async generateFundingTimeline(): Promise<ChartData> {
    return {
      type: 'funding_timeline',
      title: '투자 유치 타임라인', 
      data: { /* 투자 일정 데이터 */ },
      config: { layout: 'timeline' }
    }
  }

  private async generateRiskMatrix(): Promise<ChartData> {
    return {
      type: 'risk_matrix',
      title: '리스크 매트릭스',
      data: { /* 리스크 평가 데이터 */ },
      config: { layout: 'matrix' }
    }
  }

  private async generateMilestoneGantt(): Promise<ChartData> {
    return {
      type: 'milestone_gantt',
      title: '마일스톤 간트차트',
      data: { /* 일정 관리 데이터 */ },
      config: { layout: 'gantt' }
    }
  }

  private async generateCostBreakdown(): Promise<ChartData> {
    const fundingInfo = this.answers.fundingNeed || ''
    const costs = this.extractCostBreakdown(fundingInfo)
    
    return {
      type: 'cost_breakdown',
      title: '비용 구조 분석',
      data: {
        labels: costs.map(c => c.category),
        datasets: [{
          data: costs.map(c => c.amount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    }
  }

  private async generateMarketTrend(): Promise<ChartData> {
    return {
      type: 'market_trend',
      title: '시장 동향 분석',
      data: { /* 시장 트렌드 데이터 */ },
      config: { layout: 'line' }
    }
  }

  private async generateTechnologyStack(): Promise<ChartData> {
    return {
      type: 'technology_stack',
      title: '기술 스택',
      data: { /* 기술 구성 데이터 */ },
      config: { layout: 'hierarchy' }
    }
  }

  // ===================================
  // 데이터 추출 유틸리티 메서드들
  // ===================================

  private extractMarketSize(text: string): number {
    // 텍스트에서 숫자 추출 (간소화)
    const numbers = text.match(/\d+/g)
    return numbers ? parseInt(numbers[0]) * 10 : 1000
  }

  private extractSwotItems(text: string, type: 'strength' | 'weakness' | 'opportunity' | 'threat'): string[] {
    // SWOT 항목 추출 (간소화)
    const keywords = {
      strength: ['강점', '우위', '장점', '경쟁력'],
      weakness: ['약점', '단점', '한계', '부족'],
      opportunity: ['기회', '성장', '확장', '시장'],
      threat: ['위협', '리스크', '경쟁', '위험']
    }
    
    const items = keywords[type].filter(keyword => text.includes(keyword))
    return items.length > 0 ? items : [`${type} 항목 1`, `${type} 항목 2`]
  }

  private generateFinancialProjections(type: 'revenue' | 'profit' | 'expenses'): number[] {
    // 재무 전망 생성 (간소화)
    const baseValue = type === 'revenue' ? 50 : type === 'profit' ? 15 : 35
    const growthRate = type === 'revenue' ? 1.3 : type === 'profit' ? 1.4 : 1.2
    
    return Array.from({ length: 5 }, (_, i) => 
      Math.floor(baseValue * Math.pow(growthRate, i))
    )
  }

  private extractRoadmapMilestones(text: string): Array<{
    title: string
    date: string  
    description: string
    status?: string
  }> {
    // 로드맵 마일스톤 추출 (간소화)
    return [
      { title: '프로토타입 개발', date: '2025-Q2', description: '핵심 기능 구현' },
      { title: '베타 테스트', date: '2025-Q3', description: '사용자 검증' },
      { title: '정식 출시', date: '2025-Q4', description: '상용 서비스 개시' },
      { title: '기능 확장', date: '2026-Q1', description: '추가 기능 개발' }
    ]
  }

  private extractTeamStructure(text: string): Array<{
    name: string
    position: string
    department?: string
    level?: number
  }> {
    // 팀 구성 정보 추출 (간소화)
    return [
      { name: 'CEO', position: '대표이사', level: 0 },
      { name: 'CTO', position: '기술이사', level: 1 },
      { name: 'CFO', position: '재무이사', level: 1 },
      { name: '개발팀장', position: '팀장', level: 2 }
    ]
  }

  private extractCompetitors(text: string): Array<{
    name: string
    marketShare: number
  }> {
    // 경쟁사 정보 추출 (간소화)
    return [
      { name: '자사', marketShare: 15 },
      { name: '경쟁사A', marketShare: 25 },
      { name: '경쟁사B', marketShare: 20 },
      { name: '경쟁사C', marketShare: 18 },
      { name: '기타', marketShare: 22 }
    ]
  }

  private extractCostBreakdown(text: string): Array<{
    category: string
    amount: number
  }> {
    // 비용 구조 추출 (간소화)
    return [
      { category: '인건비', amount: 30 },
      { category: '마케팅', amount: 25 },
      { category: '연구개발', amount: 20 },
      { category: '운영비', amount: 15 },
      { category: '기타', amount: 10 }
    ]
  }
}

/**
 * 차트 스펙을 DB에 저장
 */
export async function saveChartsToDatabase(chartSpecs: ChartSpec[]): Promise<void> {
  if (chartSpecs.length === 0) return

  const { error } = await supabase
    .from('market_specs')
    .insert(
      chartSpecs.map(spec => ({
        plan_id: spec.planId,
        section_id: spec.sectionId || null,
        chart_type: spec.chartType,
        chart_title: spec.chartTitle,
        chart_data: spec.chartData,
        chart_config: spec.chartConfig || {},
        display_order: spec.displayOrder || 0,
        is_enabled: true
      }))
    )

  if (error) {
    console.error('차트 저장 오류:', error)
    throw error
  }
}

/**
 * 플랜의 차트들을 조회
 */
export async function getChartsByPlanId(planId: string): Promise<ChartSpec[]> {
  const { data, error } = await supabase
    .from('market_specs')
    .select('*')
    .eq('plan_id', planId)
    .eq('is_enabled', true)
    .order('display_order')

  if (error) {
    console.error('차트 조회 오류:', error)
    return []
  }

  return (data || []).map(item => ({
    planId: item.plan_id,
    sectionId: item.section_id || '',
    chartType: item.chart_type,
    chartTitle: item.chart_title,
    chartData: item.chart_data,
    chartConfig: item.chart_config,
    displayOrder: item.display_order
  }))
}