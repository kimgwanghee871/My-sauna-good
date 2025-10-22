// src/lib/visualization/chart-generator.ts
import type { QnaInput } from '../schemas/qset.schema'

export type TemplateKey = 'government' | 'investment' | 'loan'

export type ChartType = 
  | 'market_size_pie'
  | 'revenue_projection_line'
  | 'cost_breakdown_bar'
  | 'competitive_analysis_radar'
  | 'growth_timeline_line'
  | 'market_share_pie'
  | 'financial_summary_bar'
  | 'roi_projection_line'
  | 'risk_assessment_bar'
  | 'customer_segments_pie'
  | 'product_roadmap_timeline'
  | 'sales_funnel_waterfall'
  | 'cash_flow_line'
  | 'break_even_line'
  | 'investment_allocation_pie'

export type ChartSpec = {
  id: string
  type: ChartType
  title: string
  data: any[] // 실제 구현에서는 더 구체적인 타입 정의
  config?: Record<string, any>
  meta?: any
}

export type VisualizationConfig = {
  sectionId: string
  charts: ChartData[]
  theme?: 'light' | 'dark'
  responsive?: boolean
}

/**
 * 차트 생성기 클래스
 */
export class ChartGenerator {
  constructor(
    private readonly planId: string,
    private readonly templateKey: TemplateKey,
    private readonly answers: QnaInput
  ) {}

  /**
   * 모든 차트를 생성
   */
  async generateAllCharts(): Promise<ChartSpec[]> {
    const specs: ChartSpec[] = []

    // 템플릿별 기본 차트 생성
    switch (this.templateKey) {
      case 'government':
        specs.push(this.createPolicyAlignmentChart())
        specs.push(this.createTechnicalImpactChart())
        break
      case 'investment':
        specs.push(this.createMarketSizeChart())
        specs.push(this.createRevenueProjectionChart())
        specs.push(this.createCompetitiveAnalysisChart())
        break
      case 'loan':
        specs.push(this.createCashFlowChart())
        specs.push(this.createRiskAssessmentChart())
        break
    }

    return specs
  }

  private createMarketSizeChart(): ChartSpec {
    return {
      id: 'market_tam_sam_som',
      type: 'market_size_pie',
      title: '시장 규모 분석 (TAM/SAM/SOM)',
      data: this.estimateMarketSize(),
      meta: { yUnit: '억원' }
    }
  }

  private createRevenueProjectionChart(): ChartSpec {
    return {
      id: 'revenue_projection',
      type: 'revenue_projection_line',
      title: '5개년 매출 전망',
      data: this.estimateRevenue(),
      meta: { yUnit: '억원', years: 5 }
    }
  }

  private createCompetitiveAnalysisChart(): ChartSpec {
    return {
      id: 'competitive_radar',
      type: 'competitive_analysis_radar',
      title: '경쟁사 분석',
      data: this.analyzeCompetitors(),
      meta: { dimensions: ['기술력', '시장점유율', '자본력', '브랜드력', '혁신성'] }
    }
  }

  private createPolicyAlignmentChart(): ChartSpec {
    return {
      id: 'policy_alignment',
      type: 'financial_summary_bar',
      title: '정책 부합도 분석',
      data: [{ label: '정책 부합도', value: 85 }],
      meta: { yUnit: '%' }
    }
  }

  private createTechnicalImpactChart(): ChartSpec {
    return {
      id: 'technical_impact',
      type: 'risk_assessment_bar',
      title: '기술적 파급효과',
      data: [{ label: '기술 혁신도', value: 78 }],
      meta: { yUnit: '%' }
    }
  }

  private createCashFlowChart(): ChartSpec {
    return {
      id: 'cash_flow',
      type: 'cash_flow_line',
      title: '현금흐름 분석',
      data: this.estimateCashFlow(),
      meta: { yUnit: '백만원' }
    }
  }

  private createRiskAssessmentChart(): ChartSpec {
    return {
      id: 'risk_assessment',
      type: 'risk_assessment_bar',
      title: '리스크 평가',
      data: [{ label: '종합 리스크', value: 35 }],
      meta: { yUnit: '%' }
    }
  }

  private estimateMarketSize(): any[] {
    // answers를 이용해 추정치 도출 (스텁)
    return [
      { label: 'TAM', value: 1000 },
      { label: 'SAM', value: 400 },
      { label: 'SOM', value: 120 }
    ]
  }

  private estimateRevenue(): any[] {
    return [
      { year: 2024, revenue: 10 },
      { year: 2025, revenue: 35 },
      { year: 2026, revenue: 75 },
      { year: 2027, revenue: 120 },
      { year: 2028, revenue: 180 }
    ]
  }

  private analyzeCompetitors(): any[] {
    return [
      { competitor: '자사', 기술력: 85, 시장점유율: 15, 자본력: 60, 브랜드력: 40, 혁신성: 90 },
      { competitor: '경쟁사A', 기술력: 70, 시장점유율: 45, 자본력: 85, 브랜드력: 80, 혁신성: 60 },
      { competitor: '경쟁사B', 기술력: 60, 시장점유율: 30, 자본력: 70, 브랜드력: 65, 혁신성: 50 }
    ]
  }

  private estimateCashFlow(): any[] {
    return [
      { month: '2024-01', inflow: 50, outflow: 45 },
      { month: '2024-02', inflow: 60, outflow: 48 },
      { month: '2024-03', inflow: 75, outflow: 52 }
    ]
  }



  /**
   * 차트 데이터를 이미지로 렌더링
   */
  async renderChart(chart: ChartData): Promise<string> {
    // 2단계에서 실제 렌더링 구현
    // 지금은 플레이스홀더 반환
    return `data:image/svg+xml;base64,${btoa('<svg></svg>')}`
  }
}

/**
 * 생성된 차트를 데이터베이스에 저장
 */
export async function saveChartsToDatabase(
  charts: ChartSpec[]
): Promise<void> {
  try {
    // 2단계에서 Supabase 저장 로직 구현
    // 지금은 로그만 출력
    console.log(`Charts saved:`, charts.length)
  } catch (error) {
    console.error('차트 저장 오류:', error)
    // 에러가 있어도 전체 생성 과정은 계속 진행
  }
}