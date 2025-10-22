-- Supabase 데이터베이스 스키마: AI 오케스트레이션 시스템
-- 40콜 파이프라인과 실시간 진행률 추적을 위한 테이블 구조

-- 1. 사업계획서 메인 테이블
CREATE TABLE business_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL CHECK (template_key IN ('government', 'investment', 'loan')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- 생성 대기
    'processing', -- AI 생성 진행 중
    'completed',  -- 생성 완료
    'failed',     -- 생성 실패
    'cancelled'   -- 사용자 취소
  )),
  
  -- 입력 데이터
  answers JSONB NOT NULL,           -- 사용자 10문항 답변
  attachments JSONB DEFAULT '[]',   -- 첨부파일 정보
  extra_notes TEXT,                 -- 추가 설명
  uploads_summary TEXT,             -- PDF 요약 텍스트
  
  -- 생성 결과
  outline JSONB,                    -- AI 생성된 목차 구조
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  final_content TEXT,               -- 최종 통합 콘텐츠
  
  -- 메타데이터
  total_api_calls INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2. 섹션별 콘텐츠 테이블
CREATE TABLE business_plan_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,       -- 'executive_summary', 'market_analysis' 등
  section_title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- 생성 대기
    'generating', -- 생성 중
    'completed',  -- 생성 완료
    'failed',     -- 생성 실패
    'regenerating' -- 재생성 중
  )),
  
  -- 콘텐츠
  draft_content TEXT,               -- 초안 (gpt-4.1-mini)
  refined_content TEXT,             -- 보정된 콘텐츠 (gpt-4.1)
  final_content TEXT,               -- 최종 콘텐츠 (인용 포함)
  
  -- AI 생성 정보
  model_used TEXT,                  -- 사용된 모델
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  generation_time_ms INTEGER,
  
  -- 시각화 데이터
  viz_spec JSONB,                   -- 차트/그래프 JSON 스펙
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(plan_id, section_code)
);

-- 3. AI 호출 로그 테이블 (40콜 추적)
CREATE TABLE generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  section_id UUID REFERENCES business_plan_sections(id) ON DELETE SET NULL,
  
  step_name TEXT NOT NULL,          -- 'outline', 'draft_section', 'refine', 'citation' 등
  step_order INTEGER NOT NULL,
  model TEXT NOT NULL,              -- 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini' 등
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'retrying'
  )),
  
  -- API 호출 정보
  prompt_text TEXT,
  response_text TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  
  -- 타이밍
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- 에러 정보
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 시각화 스펙 테이블 (잰스파크 차트엔진용)
CREATE TABLE market_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  section_id UUID REFERENCES business_plan_sections(id) ON DELETE CASCADE,
  
  chart_type TEXT NOT NULL CHECK (chart_type IN (
    'tam_sam_som',      -- TAM/SAM/SOM 파이차트
    'swot_matrix',      -- SWOT 매트릭스
    'financial_bar',    -- 재무추정 막대그래프
    'roadmap_timeline', -- 기술로드맵 타임라인
    'org_chart',        -- 조직도
    'market_share',     -- 시장점유율
    'growth_trend',     -- 성장추세
    'competitive_map',  -- 경쟁사 포지셔닝
    'revenue_model',    -- 수익모델
    'funding_timeline', -- 투자유치 타임라인
    'risk_matrix',      -- 리스크 매트릭스
    'milestone_gantt',  -- 마일스톤 간트차트
    'cost_breakdown',   -- 비용 분해
    'market_trend',     -- 시장 트렌드
    'technology_stack'  -- 기술 스택
  )),
  
  chart_title TEXT NOT NULL,
  chart_data JSONB NOT NULL,        -- Chart.js/D3 호환 데이터 구조
  chart_config JSONB DEFAULT '{}',  -- 차트 설정 (색상, 레이아웃 등)
  
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 인용 및 출처 테이블
CREATE TABLE citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  section_id UUID REFERENCES business_plan_sections(id) ON DELETE CASCADE,
  
  citation_text TEXT NOT NULL,      -- 인용된 텍스트
  source_type TEXT NOT NULL CHECK (source_type IN (
    'web_search',   -- 웹검색 결과
    'uploaded_doc', -- 업로드된 문서
    'policy_db',    -- 정책 DB (o3-심층연구)
    'market_report' -- 시장조사 보고서
  )),
  
  source_title TEXT,
  source_url TEXT,
  source_author TEXT,
  source_date DATE,
  
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'questionable', 'invalid'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 사용자 생성 통계 테이블 (크레딧 관리용)
CREATE TABLE user_generation_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  
  -- 월별 사용량
  current_month_plans INTEGER DEFAULT 0,
  current_month_tokens INTEGER DEFAULT 0,
  current_month_cost_usd DECIMAL(10,4) DEFAULT 0,
  
  -- 전체 사용량
  total_plans_created INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  
  -- 제한 및 등급
  monthly_plan_limit INTEGER DEFAULT 3,  -- Free 플랜 기본값
  plan_tier TEXT DEFAULT 'free',         -- 'free', 'pro', 'enterprise'
  
  last_reset_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- 인덱스 생성 (성능 최적화)
-- ================================

-- business_plans 인덱스
CREATE INDEX idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX idx_business_plans_status ON business_plans(status);
CREATE INDEX idx_business_plans_created_at ON business_plans(created_at DESC);

-- business_plan_sections 인덱스
CREATE INDEX idx_sections_plan_id ON business_plan_sections(plan_id);
CREATE INDEX idx_sections_status ON business_plan_sections(status);
CREATE INDEX idx_sections_order ON business_plan_sections(plan_id, section_order);

-- generation_logs 인덱스
CREATE INDEX idx_logs_plan_id ON generation_logs(plan_id);
CREATE INDEX idx_logs_step_order ON generation_logs(plan_id, step_order);
CREATE INDEX idx_logs_created_at ON generation_logs(created_at DESC);

-- market_specs 인덱스
CREATE INDEX idx_market_specs_plan_id ON market_specs(plan_id);
CREATE INDEX idx_market_specs_section_id ON market_specs(section_id);
CREATE INDEX idx_market_specs_chart_type ON market_specs(chart_type);

-- citations 인덱스
CREATE INDEX idx_citations_plan_id ON citations(plan_id);
CREATE INDEX idx_citations_section_id ON citations(section_id);

-- ================================
-- Row Level Security (RLS) 정책
-- ================================

-- business_plans RLS
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON business_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" ON business_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON business_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- business_plan_sections RLS
ALTER TABLE business_plan_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access sections of own plans" ON business_plan_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_plans 
      WHERE business_plans.id = business_plan_sections.plan_id 
      AND business_plans.user_id = auth.uid()
    )
  );

-- generation_logs RLS
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs of own plans" ON generation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_plans 
      WHERE business_plans.id = generation_logs.plan_id 
      AND business_plans.user_id = auth.uid()
    )
  );

-- market_specs RLS
ALTER TABLE market_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access specs of own plans" ON market_specs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_plans 
      WHERE business_plans.id = market_specs.plan_id 
      AND business_plans.user_id = auth.uid()
    )
  );

-- citations RLS
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access citations of own plans" ON citations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_plans 
      WHERE business_plans.id = citations.plan_id 
      AND business_plans.user_id = auth.uid()
    )
  );

-- user_generation_stats RLS
ALTER TABLE user_generation_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON user_generation_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_generation_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own stats" ON user_generation_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- 트리거 함수 (자동 업데이트)
-- ================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON business_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON business_plan_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_market_specs_updated_at
  BEFORE UPDATE ON market_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_generation_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================
-- 실시간 구독용 채널 설정
-- ================================

-- Realtime 활성화 (Supabase 대시보드에서도 설정 필요)
-- ALTER PUBLICATION supabase_realtime ADD TABLE business_plans;
-- ALTER PUBLICATION supabase_realtime ADD TABLE business_plan_sections;
-- ALTER PUBLICATION supabase_realtime ADD TABLE generation_logs;

-- 초기 데이터 삽입 (샘플)
INSERT INTO user_generation_stats (user_id, plan_tier, monthly_plan_limit) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- 임시 UUID, 실제로는 auth.users에서 가져옴
  'free', 
  3
) ON CONFLICT (user_id) DO NOTHING;