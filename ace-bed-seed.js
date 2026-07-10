/**
 * Ace Bed (에이스침대) Demo Data Seed
 * Uses existing Supabase tables + applies KM migrations via REST
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jzlfyxrrubersvankyjo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZ5eHJydWJlcnN2YW5reWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA1NjI2MCwiZXhwIjoyMDg0NjMyMjYwfQ.MQIykndAz5zrhGaWfzAEP9UVMbDQussXsCMidDUj7L8';

const s = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
async function check(label, result) {
  if (result.error) {
    console.error(`ERROR [${label}]:`, result.error.message);
    return null;
  }
  log(`OK [${label}]`);
  return result.data;
}

async function main() {
  log('Starting Ace Bed demo data seed...');

  // ─── 1. Company ───────────────────────────────────────────
  log('Creating company: 에이스침대 (Ace Bed)...');
  const companyResult = await s.from('companies').insert({
    name: '에이스침대 (Ace Bed)',
    industry: '침대/매트리스 제조 (Mattress Manufacturing)',
    address: '경기도 안산시 단원구 성곡동 산업단지 에이스로 123',
    manager_name: '김진환 (Jin Hwan Kim)',
    manager_phone: '+821012345678',
    default_language: 'ko',
    preferred_channel: 'sms',
    worker_count: 500,
    onboarding_completed: true,
    onboarding_progress: { completed: true, steps: ['company', 'workers', 'knowledge', 'training'] },
    invite_signups_enabled: true,
    worker_join_code: 'ACEBED',
    locations: [
      { id: 'loc-1', name: '안산 본공장', city: '안산', state: '경기도' },
      { id: 'loc-2', name: '화성 제2공장', city: '화성', state: '경기도' },
      { id: 'loc-3', name: '인천 물류센터', city: '인천', state: '인천광역시' }
    ],
    metadata: {
      founded: '1963',
      description: '국내 최대 침대/매트리스 전문 제조기업. 전국 500명 임직원, 생산직 300명.',
      departments: ['생산부', '품질관리부', '물류부', '설비관리부', '인사부', '연구개발부'],
      employee_count: 500,
      production_workers: 300,
      demo_company: true,
      demo_contact: 'Jin Hwan'
    }
  }).select('id').single();

  const company = await check('company', companyResult);
  if (!company) {
    // Try to fetch if already exists
    const existing = await s.from('companies').select('id').eq('name', '에이스침대 (Ace Bed)').single();
    if (existing.data) {
      log(`Using existing company: ${existing.data.id}`);
      return runWithCompany(existing.data.id);
    }
    throw new Error('Could not create or find company');
  }
  
  const companyId = company.id;
  log(`✓ Company ID: ${companyId}`);
  await runWithCompany(companyId);
}

async function runWithCompany(companyId) {
  // ─── 2. Workers ───────────────────────────────────────────
  log('Creating workers...');
  const workers = [
    // 생산부
    { name: '박민준', phone: '+821011112222', department: '생산부 (Production)', role: '매트리스 봉제 기사 (Sewing Technician)', shift: '주간', skills: ['재봉기 운용', '원단 취급', '퀼팅'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '이수진', phone: '+821022223333', department: '생산부 (Production)', role: '본딩 기사 (Bonding Technician)', shift: '주간', skills: ['본딩기 운전', '접착제 취급'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '최동현', phone: '+821033334444', department: '생산부 (Production)', role: '스프링 조립 기사 (Spring Assembly Technician)', shift: '야간', skills: ['스프링 조립', '코일카운트 검사'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '정아름', phone: '+821044445555', department: '생산부 (Production)', role: '포장 담당 (Packaging Operator)', shift: '주간', skills: ['포장 작업', '출하 관리'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '김태호', phone: '+821055556666', department: '생산부 (Production)', role: '신입 생산직 (New Hire - Production)', shift: '주간', skills: [], preferred_language: 'ko', status: 'active', verified: true },
    // 품질관리부
    { name: '윤서현', phone: '+821066667777', department: '품질관리부 (Quality Control)', role: '품질 검사원 (QC Inspector)', shift: '주간', skills: ['원단 검수', '치수 측정', '불량 판정'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '한지민', phone: '+821077778888', department: '품질관리부 (Quality Control)', role: '수석 품질 관리자 (Senior QC Manager)', shift: '주간', skills: ['품질 분석', 'SOP 관리', '검사 기준 수립'], preferred_language: 'ko', status: 'active', verified: true },
    // 설비관리부
    { name: '오경민', phone: '+821088889999', department: '설비관리부 (Facility Maintenance)', role: '설비 기사 (Maintenance Technician)', shift: '주간', skills: ['기계 점검', '용접', '전기 배선'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '강현우', phone: '+821099990000', department: '설비관리부 (Facility Maintenance)', role: '설비 주임 (Maintenance Lead)', shift: '야간', skills: ['설비 관리', 'PM 계획', '안전 관리'], preferred_language: 'ko', status: 'active', verified: true },
    // 물류부
    { name: '신예린', phone: '+821011223344', department: '물류부 (Logistics)', role: '물류 담당 (Logistics Operator)', shift: '주간', skills: ['입출고 관리', '재고 관리', '지게차 운전'], preferred_language: 'ko', status: 'active', verified: true },
    // 인사부
    { name: '배준영', phone: '+821022334455', department: '인사부 (HR)', role: '인사 교육 담당 (HR Training Coordinator)', shift: '주간', skills: ['교육 기획', '신입사원 온보딩', '역량 평가'], preferred_language: 'ko', status: 'active', verified: true },
    // 연구개발부
    { name: '유하은', phone: '+821033445566', department: '연구개발부 (R&D)', role: '소재 연구원 (Materials Researcher)', shift: '주간', skills: ['폼 소재 연구', '텐션 분석', '신제품 개발'], preferred_language: 'ko', status: 'active', verified: true },
    { name: '임재현', phone: '+821044556677', department: '연구개발부 (R&D)', role: '수석 연구원 (Senior Researcher)', shift: '주간', skills: ['매트리스 설계', '코일카운트 최적화', '필로우탑 개발'], preferred_language: 'ko', status: 'active', verified: true },
  ];

  for (const w of workers) {
    const r = await s.from('workers').insert({ ...w, company_id: companyId });
    if (r.error && !r.error.message.includes('duplicate')) {
      console.error('Worker insert error:', r.error.message, w.name);
    }
  }
  log(`✓ Created ${workers.length} workers`);

  // ─── 3. Documents (SOPs) ─────────────────────────────────
  log('Creating SOP documents...');
  
  const sops = [
    {
      name: '[SOP v3] 매트리스 봉제 작업 표준 절차서',
      content: `# 매트리스 봉제 작업 SOP (v3)
개정일: 2026-05-01 | 승인자: 김진환 생산부장 | 이전버전: v2 (2025-11-15)

## ⚠️ 안전 주의사항
- 재봉기 작동 전 반드시 안전 커버 확인
- 바늘 교체 시 전원 OFF 후 작업
- 긴 머리카락은 묶고, 헐렁한 옷 착용 금지
- PPE: 안전화, 면장갑 착용 필수

## 1. 작업 준비
1. 작업지시서(작업표) 확인 및 모델 번호 파악
2. 해당 모델 원단 불출 → 자재창고 요청서 작성
3. 원단 치수 확인: 가로/세로 ±2mm 허용
4. 재봉기 오일 레벨 확인 (하한선 이상 유지)
5. 바늘 상태 점검: 구부러짐/마모 시 즉시 교체

## 2. 봉제 작업 절차
1. 원단 정렬: 무늬 방향 확인 (퀼팅 패턴 기준)
2. 상단 패널과 사이드 패널 맞춤 후 핀 고정
3. 재봉 시작점에서 되감기 3회 (실 풀림 방지)
4. 봉제 속도: 중속 유지, 곡선 구간 저속
5. 코너 처리: 바늘 꽂은 상태에서 방향 전환
6. 완료 후 실 끝 처리 (매듭 or 열처리)

## 3. 완성 검사
- 봉제선 직선도: 허용 편차 ±3mm
- 땀수: 2.5cm당 5~7땀
- 실 끊김/뛰어넘음: 0 허용 (불량 처리)

## 4. 변경 이력
- v3 (2026-05): 코너 처리 절차 상세화, 안전 주의 추가
- v2 (2025-11): 봉제 속도 기준 명확화
- v1 (2025-03): 최초 제정`,
      metadata: { sop_version: 3, department: '생산부', category: '봉제작업', language: 'ko', slug: 'sewing-sop', is_sop: true, previous_versions: 2, status: 'active', approved_by: '김진환' }
    },
    {
      name: '[SOP v2] 본딩기 운전 절차서',
      content: `# 본딩기 운전 절차 SOP (v2)
개정일: 2026-03-10 | 승인자: 박민준 반장 | 이전버전: v1 (2025-09-01)

## ⚠️ 안전 주의사항 (필독)
- 본딩기는 고온(최대 180°C) 접착제를 사용하므로 화상 위험
- 작업 시 내열 장갑 착용 필수
- 환기 시스템 ON 확인 후 작업 시작
- 접착제 흡입 주의: 마스크 착용
- 긴급 정지 버튼 위치 숙지 (기계 좌측 빨간 버튼)

## 1. 가동 전 점검
1. 접착제 탱크 레벨 확인 → 최소 30% 이상 유지
2. 노즐 막힘 여부 확인 (전일 청소 완료 확인)
3. 온도 설정: 기본 160°C (동계: 165°C, 하계: 155°C)
4. 컨베이어 속도 설정: 2.5m/min
5. 예열: 설정 온도 도달까지 약 15분 대기

## 2. 작업 절차
1. 매트리스 내장재(폼, 스프링)를 컨베이어에 정위치
2. 본딩 도포 폭: 30mm ± 5mm
3. 도포 후 압착 롤러 통과 (압력: 2.0~2.5 bar)
4. 냉각 시간: 실온에서 최소 5분
5. 박리 테스트: 무작위 1회/로트 → 2kgf 이상

## 3. 이상 발생 시
- 노즐 막힘: 즉시 정지 → 설비관리부 호출
- 온도 편차 ±10°C 이상: 작업 중단, 품질관리부 통보
- 접착 불량: 해당 제품 불량 태그 부착

## 4. 변경 이력
- v2 (2026-03): 계절별 온도 기준 추가, 박리 테스트 절차 명확화
- v1 (2025-09): 최초 제정`,
      metadata: { sop_version: 2, department: '생산부', category: '본딩작업', language: 'ko', slug: 'bonding-machine-sop', is_sop: true, previous_versions: 1, status: 'active', approved_by: '이수진' }
    },
    {
      name: '[SOP v4] 스프링 조립 공정 표준 절차서',
      content: `# 스프링 조립 공정 SOP (v4)
개정일: 2026-06-01 | 승인자: 최동현 기사 | 이전버전: v3 (2026-01-15)

## ⚠️ 안전 주의사항
- 스프링 조립 시 압착 기계 손끼임 주의
- 코일 와이어 끝단: 날카로움, 반드시 장갑 착용
- 자동조립기 작동 중 손 투입 절대 금지

## 1. 자재 준비
1. 코일 규격 확인: 작업지시서의 코일카운트 및 직경 확인
   - 일반형: 256코일/〥uble (퀸사이즈 기준)
   - 포켓스프링: 320코일 이상
2. 와이어 직경 확인: 버니어캘리퍼스로 측정
3. 자동조립기 금형 교체 (모델별 상이)

## 2. 조립 절차
1. 코일 정렬 지그에 와이어 세팅
2. 자동조립기 기동: 속도 설정 → 표준 45rpm
3. 조립 완료 유닛 검사: 코일 수, 높이 균일성
4. 코일 높이 편차: ±2mm 이내
5. 텐션 테스트: 지정 하중(80kg)에서 변형량 측정

## 3. 텐션 검사 기준
- 소프트: 변형량 25~30mm
- 미디엄: 변형량 18~24mm  
- 하드: 변형량 12~17mm
- 기준 이탈 시: 와이어 교체 후 재작업

## 4. 변경 이력
- v4 (2026-06): 포켓스프링 코일카운트 기준 상향 (288→320)
- v3 (2026-01): 텐션 검사 기준 세분화 (소프트/미디엄/하드)
- v2 (2025-08): 자동조립기 속도 기준 45rpm으로 통일
- v1 (2025-03): 최초 제정`,
      metadata: { sop_version: 4, department: '생산부', category: '스프링조립', language: 'ko', slug: 'spring-assembly-sop', is_sop: true, previous_versions: 3, status: 'active', approved_by: '최동현' }
    },
    {
      name: '[SOP v2] 포장 및 출하 절차서',
      content: `# 포장 및 출하 절차 SOP (v2)
개정일: 2026-04-20 | 승인자: 정아름 담당 | 이전버전: v1 (2025-10-01)

## 1. 포장 재료 준비
- 비닐 포장지 (제품 크기별 3종: S/Q/K)
- 코너 보호대 (EPS 발포 스티로폼)
- PP 밴딩 테이프
- 라벨 프린터 (제품 정보 라벨)

## 2. 포장 절차
1. 완제품 외관 최종 검사 (오염, 훼손 확인)
2. 비닐 포장: 제품에 밀착 후 열봉합
3. 코너 보호대 4개소 부착
4. PP 밴딩: 가로 2줄, 세로 1줄
5. 라벨 부착: 제품명, 모델코드, 제조일, QR코드

## 3. 출하 전 확인
- 출하 지시서와 제품 수량 대조
- 운송장 번호 시스템 입력
- 차량 적재: 눕혀 적재 금지 (세워서 고정)

## 4. 변경 이력
- v2 (2026-04): 코너 보호대 규격 변경, QR코드 라벨 추가
- v1 (2025-10): 최초 제정`,
      metadata: { sop_version: 2, department: '물류부', category: '포장출하', language: 'ko', slug: 'packaging-shipping-sop', is_sop: true, status: 'active' }
    },
    {
      name: '[SOP v3] 원단 검수 기준서',
      content: `# 원단 검수 기준 SOP (v3)
개정일: 2026-05-15 | 승인자: 한지민 수석 | 이전버전: v2 (2025-12-01)

## 검수 대상
매트리스 원단 (니트 원단, 자카드, 폴리에스터 혼방)

## 검수 기준
### 외관 검사
- 오염: 3cm² 이상 오염 → 불량
- 구멍/찢김: 1mm 이상 → 불량
- 색상 편차: 동일 Lot 내 ΔE ≤ 1.5

### 치수 검사
- 폭: ±10mm
- 길이: ±20mm

### 물성 검사
- 인장강도: 경방향 ≥ 800N, 위방향 ≥ 600N
- 필링: 4급 이상 (KS K ISO 12945-2)
- 마찰견뢰도: 4급 이상

## 변경 이력
- v3 (2026-05): 색상 편차 기준 ΔE ≤ 2.0 → 1.5로 강화
- v2 (2025-12): 물성 검사 항목 추가
- v1 (2025-06): 최초 제정`,
      metadata: { sop_version: 3, department: '품질관리부', category: '원단검수', language: 'ko', slug: 'fabric-inspection-sop', is_sop: true, status: 'active', approved_by: '한지민' }
    },
    {
      name: '[SOP v2] 접착제 안전 취급 지침서',
      content: `# 접착제 안전 취급 SOP (v2)
개정일: 2026-02-28 | 승인자: 오경민 기사 | 이전버전: v1 (2025-07-01)

## ⚠️ 위험물 취급 주의
- 가연성 물질: 화기 엄금
- 증기 흡입 금지: 반드시 국소 배기 하에 작업
- 피부/눈 접촉 시: 즉시 15분 이상 흐르는 물로 세척

## 개인 보호구
- 방독 마스크 (유기용제용 필터)
- 내화학성 장갑
- 보안경
- 방호 앞치마

## 보관 방법
1. 전용 약품 창고 (별도 환기 시설 구비)
2. 보관 온도: 5°C ~ 25°C
3. 화기/스파크 발생원으로부터 3m 이상 이격
4. 개봉 후 밀폐 보관, 직사광선 차단

## 폐기 방법
- 빈 용기: 지정 폐기물 업체 처리
- 사용 불가 접착제: 환경부 지침에 따라 처리

## 변경 이력
- v2 (2026-02): PPE 기준 강화, 폐기 절차 추가
- v1 (2025-07): 최초 제정`,
      metadata: { sop_version: 2, department: '생산부', category: '안전관리', language: 'ko', slug: 'adhesive-safety-sop', is_sop: true, status: 'active' }
    },
    {
      name: '[SOP v5] 설비 일상점검 체크리스트',
      content: `# 설비 일상점검 체크리스트 SOP (v5)
개정일: 2026-07-01 | 승인자: 강현우 주임 | 이전버전: v4 (2026-03-01)

## 점검 시기
- 1일 1회 (각 교대 시작 전 15분)

## 공통 점검 항목
### 전기 계통
□ 전원 공급 전압 확인 (380V ± 10%)
□ 누전 차단기 동작 테스트 (월 1회)
□ 전선 피복 손상 여부

### 기계/구동 계통
□ 오일 레벨 (하한선 이상)
□ 냉각수 레벨 (최소 80% 이상)
□ 벨트/체인 장력 및 마모 상태
□ 볼트/너트 풀림 (육안 확인)
□ 이상 소음/진동 유무

### 재봉기 전용
□ 바늘 상태 (구부러짐, 마모)
□ 실 장력 균일성
□ 하판 보빈 실량

### 본딩기 전용
□ 접착제 탱크 레벨 (30% 이상)
□ 노즐 클리어링 상태
□ 온도 설정값 확인

## 이상 발견 시
1. 즉시 작업 중단
2. 설비관리부 긴급연락 (내선: 1234)
3. 이상 내용 설비관리 일지에 기록

## 변경 이력
- v5 (2026-07): QR코드 기반 점검 기록 시스템 연동
- v4 (2026-03): 재봉기/본딩기 전용 항목 분리
- v3 (2025-11): 누전 차단기 월 1회 테스트 항목 추가
- v2 (2025-07): 냉각수 점검 항목 추가
- v1 (2025-01): 최초 제정`,
      metadata: { sop_version: 5, department: '설비관리부', category: '설비점검', language: 'ko', slug: 'equipment-inspection-sop', is_sop: true, previous_versions: 4, status: 'active', approved_by: '강현우' }
    },
    {
      name: '[SOP v3] 신입사원 현장 교육 가이드',
      content: `# 신입사원 현장 교육 가이드 SOP (v3)
개정일: 2026-06-15 | 승인자: 배준영 HR담당 | 이전버전: v2 (2026-01-10)

## 교육 목적
신규 입사자가 현장 업무에 안전하게 투입되기 위한 최소 교육 기준 수립

## 1주차: 안전 및 기본 규정
**1일차**: 회사 소개, 취업규칙, 급여/복리후생
**2일차**: 산업안전보건법 기초, PPE 착용법
**3~4일차**: 화학물질 취급 교육 (MSDS 교육)
**5일차**: 비상 대피 훈련, 소화기 사용법

## 2주차: 현장 OJT
**6~7일차**: 배치 부서 기초 공정 이해
**8~9일차**: 선임 작업자 동행 관찰
**10일차**: 간이 실습 (지도 하에)

## 3주차: 실무 적응
**11~13일차**: 단순 작업 배치 (숙련 목표 50%)
**14~15일차**: 수습 평가 (기술 테스트 + 안전 퀴즈)

## 평가 기준 (수습 완료 조건)
- 안전 규정 이해도: 80점 이상
- 기술 숙련도: 담당 SOP 기준 70% 달성
- 불량률: 5% 이하

## 변경 이력
- v3 (2026-06): Sidekick SMS 교육 시스템 연동, 평가 기준 추가
- v2 (2026-01): 3주 과정으로 확대 (기존 2주)
- v1 (2025-06): 최초 제정`,
      metadata: { sop_version: 3, department: '인사부', category: '신입교육', language: 'ko', slug: 'new-hire-training-sop', is_sop: true, status: 'active', approved_by: '배준영' }
    },
    {
      name: '[SOP v2] 불량 처리 절차서',
      content: `# 불량 처리 절차 SOP (v2)
개정일: 2026-04-01 | 승인자: 윤서현 검사원 | 이전버전: v1 (2025-10-01)

## 불량 등급 분류
- **A급 불량** (치명): 안전 관련 결함 → 즉시 격리, 전수 검사
- **B급 불량** (주요): 기능 영향 결함 → 격리, 개선 조치
- **C급 불량** (경미): 외관 결함 → 수정 가능 여부 판단

## 처리 절차
1. 불량 발견 즉시 생산 라인 정지 (또는 격리)
2. 빨간 불량 태그 부착 (불량 내용, 발견자, 일시 기재)
3. 불량품 격리 구역 이동 (빨간 선 내부)
4. 품질관리부 통보 (내선 2345 또는 Sidekick 앱)
5. 원인 분석 실시 (5-Why 기법)
6. 시정 조치 보고서 작성 (24시간 이내)

## 재작업 기준
- 봉제 불량: 실 제거 후 재봉 가능
- 오염: 전용 세정제로 제거 후 재검사
- 치수 불량: 원칙상 재작업 불가 (A급 폐기)

## 변경 이력
- v2 (2026-04): Sidekick 앱 보고 절차 추가
- v1 (2025-10): 최초 제정`,
      metadata: { sop_version: 2, department: '품질관리부', category: '불량처리', language: 'ko', slug: 'defect-handling-sop', is_sop: true, status: 'active' }
    },
    {
      name: '[SOP v2] 교대 인수인계 절차서',
      content: `# 교대 인수인계 절차 SOP (v2)
개정일: 2026-05-20 | 승인자: 강현우 주임 | 이전버전: v1 (2025-11-01)

## 인수인계 시간
- 주간 → 야간: 오후 6시 (30분 중첩 운영)
- 야간 → 주간: 오전 6시 (30분 중첩 운영)

## 인계 항목 (반드시 구두 + 기록)
### 생산 현황
□ 당일 생산 목표 대비 실적
□ 진행 중인 작업 건수 및 잔여량
□ 긴급 주문 여부

### 설비 현황
□ 이상 발생 설비 목록 및 조치 사항
□ 소모품 교체 필요 항목
□ 정비 예정 작업

### 품질 현황
□ 발생 불량 내역 및 조치 사항
□ 미결 시정 조치 사항

### 안전/환경
□ 아차 사고 발생 여부
□ 위험 요인 잔존 여부

## 기록 방법
Sidekick 앱 → 교대 인수인계 메뉴에서 항목별 체크 및 특이사항 입력

## 변경 이력
- v2 (2026-05): Sidekick 앱 기록 의무화
- v1 (2025-11): 최초 제정`,
      metadata: { sop_version: 2, department: '생산부', category: '교대관리', language: 'ko', slug: 'shift-handoff-sop', is_sop: true, status: 'active' }
    },
  ];

  const docIds = [];
  for (const sop of sops) {
    const r = await s.from('documents').insert({
      company_id: companyId,
      name: sop.name,
      content: sop.content,
      metadata: sop.metadata
    }).select('id').single();
    if (r.error) {
      console.error('Document error:', r.error.message);
    } else {
      docIds.push(r.data.id);
    }
  }
  log(`✓ Created ${docIds.length} SOP documents`);

  // ─── 4. Knowledge Articles (Training content + KM) ────────
  log('Creating knowledge articles...');
  const articles = [
    {
      title: '[교육] 생산라인 신입 1단계: 공장 안전 규정',
      equipment_type: '신입교육',
      problem: '신규 입사자의 현장 안전 사고 방지',
      symptoms: '안전 규정 미숙지로 인한 사고 위험',
      solution: `## 생산라인 신입 교육 - 1단계: 공장 안전 기초

### 에이스침대 안전 수칙 TOP 10
1. **PPE 항상 착용**: 안전화, 귀마개, 필요 시 마스크
2. **통행로 준수**: 황색 선 내부로만 이동
3. **기계 임의 조작 금지**: 지정 작업자만 조작
4. **이상 발견 즉시 보고**: Sidekick 앱 또는 내선 전화
5. **화기 금지 구역 준수**: 본딩 작업실, 화학물질 보관실
6. **무거운 물건 2인 1조**: 20kg 이상 단독 취급 금지
7. **주변 정리정돈**: 작업 전·후 5분 청소
8. **지게차 구역 주의**: 경광등/경적 시 즉시 대피
9. **비상구 위치 숙지**: 배치 당일 반드시 확인
10. **아차 사고도 보고**: 처벌 없음, 안전 개선에 활용

### 퀴즈 (합격 기준: 8/10)
Q1. 무거운 물건은 몇 kg 이상일 때 2인 1조 작업해야 하나요? (정답: 20kg)
Q2. 이상 발견 시 보고 방법 2가지는? (정답: Sidekick 앱, 내선 전화)`,
      tags: ['신입교육', '안전', '생산부'],
      time_estimate_minutes: 60,
      times_referenced: 45,
      metadata: { training_step: 1, training_path: '생산라인 신입 교육', department: '생산부', language: 'ko' }
    },
    {
      title: '[교육] 생산라인 신입 2단계: 재봉기 기초 조작',
      equipment_type: '재봉기',
      problem: '신입 작업자의 재봉기 조작 미숙',
      symptoms: '불량 봉제, 장비 손상 위험',
      solution: `## 생산라인 신입 교육 - 2단계: 재봉기 기초

### 재봉기 각 부위 명칭
- **바늘**: 원단에 구멍을 뚫고 실을 꿰는 핵심 부품
- **노루발**: 원단을 눌러 이송하는 부품
- **보빈**: 하실(밑실)을 감은 실패
- **장력 조절기**: 실 장력(Tension) 조절

### 기본 조작 순서
1. 전원 ON → 초록 램프 확인
2. 상실/밑실 세팅 (시연 영상 참조)
3. 원단 올려놓기 → 노루발 내리기
4. 되감기 3회 후 정방향 봉제 시작
5. 끝점에서 되감기 3회 후 실 자르기

### 자주 하는 실수
❌ 보빈 실 방향 반대로 세팅
❌ 되감기 없이 시작 → 실 풀림 불량
❌ 고속으로 시작 → 첫 구간 불량`,
      tags: ['신입교육', '재봉기', '생산부'],
      time_estimate_minutes: 90,
      times_referenced: 38,
      metadata: { training_step: 2, training_path: '생산라인 신입 교육', department: '생산부', language: 'ko' }
    },
    {
      title: '[교육] 봉제 전문과정: 퀼팅 기법 마스터',
      equipment_type: '퀼팅기',
      problem: '봉제 전문 기술 향상',
      symptoms: '퀼팅 패턴 불균일, 완성도 저하',
      solution: `## 봉제기술 전문과정 - 퀼팅 기법

### 퀼팅(Quilting)이란?
원단과 충전재(솜, 폼)를 규칙적인 패턴으로 봉합하는 기법.
매트리스 상면 외관 품질과 충전재 고정에 핵심적 역할.

### 주요 퀼팅 패턴 (에이스침대 표준)
1. **다이아몬드**: 가장 기본 패턴, 45° 격자
2. **플라워**: 원형 반복, 프리미엄 라인 적용
3. **웨이브**: 곡선 연속, 현대적 디자인

### 패턴별 기계 설정값 (패턴 파일 코드)
- 다이아몬드: PR-DM-001 (간격: 50mm)
- 플라워: PR-FL-003 (스케일: 100%)
- 웨이브: PR-WV-002 (주기: 80mm)

### 품질 체크 포인트
- 패턴 시작점 정렬 (±3mm)
- 실 장력 균일성 (육안 확인)
- 원단 당김 방지 (장력 조절기 활용)`,
      tags: ['봉제전문', '퀼팅', '생산부'],
      time_estimate_minutes: 120,
      times_referenced: 22,
      metadata: { training_step: 1, training_path: '봉제기술 전문과정', department: '생산부', language: 'ko' }
    },
    {
      title: '[교육] 품질검사원 양성: 불량 판정 기준',
      equipment_type: '품질검사',
      problem: '품질 검사원의 일관된 불량 판정',
      symptoms: '검사원별 판정 기준 차이로 인한 불일치',
      solution: `## 품질검사원 양성과정 - 불량 판정 기준

### 판정 원칙
- **객관적 기준 우선**: 눈대중이 아닌 측정값으로 판정
- **불명확할 경우**: 선임 검사원 또는 팀장과 협의
- **기록 의무**: 모든 불량은 Sidekick에 즉시 입력

### 봉제 불량 판정 기준
| 항목 | 합격 | 불합격 |
|------|------|--------|
| 봉제선 편차 | ±3mm 이내 | 초과 |
| 실 끊김 | 0개 | 1개 이상 |
| 땀수 | 5~7땀/2.5cm | 범위 이탈 |

### 원단 불량 판정 기준
| 항목 | 합격 | 불합격 |
|------|------|--------|
| 오염 | 1cm² 미만 | 이상 |
| 구멍 | 0 | 1mm 이상 |
| 색상 편차 | ΔE ≤ 1.5 | 초과 |

### 판정 후 조치
- 합격: 합격 스티커 부착 → 다음 공정
- 불합격: 빨간 태그 + 불량품 격리 → 품질팀 통보`,
      tags: ['품질검사', '불량판정', '품질관리부'],
      time_estimate_minutes: 90,
      times_referenced: 31,
      metadata: { training_step: 2, training_path: '품질검사원 양성', department: '품질관리부', language: 'ko' }
    },
    {
      title: '[교육] 설비관리 기초: 일상점검 방법',
      equipment_type: '설비점검',
      problem: '설비 담당자의 체계적 일상점검 역량 부족',
      symptoms: '점검 누락, 갑작스러운 설비 고장',
      solution: `## 설비관리 기초과정 - 일상점검 방법

### 왜 일상점검인가?
전체 설비 고장의 70%는 일상점검으로 예방 가능.
작은 이상을 조기 발견하면 수리 비용이 1/10로 줄어든다.

### 오감 점검법 (SOFTER 기법)
- **S**ight(보기): 오염, 변형, 누유
- **O**dor(냄새): 탄 냄새, 이상한 냄새
- **F**eel(느끼기): 진동, 열기, 흔들림
- **T**aste×(맛)→ **T**emperature: 온도계로 측정
- **E**ar(듣기): 이상 소음 (삐거덕, 끼이익)
- **R**ecord(기록): 발견 즉시 기록

### 설비별 점검 주기
| 설비 | 일점검 | 주점검 | 월점검 |
|------|--------|--------|--------|
| 재봉기 | 오일, 바늘 | 벨트 장력 | 분해 청소 |
| 본딩기 | 온도, 노즐 | 필터 교체 | 펌프 점검 |
| 컨베이어 | 체인 장력 | 롤러 마모 | 베어링 교체 |

### Sidekick 앱 활용
점검 완료 후 앱에서 체크리스트 완료 처리 → 자동 기록 저장`,
      tags: ['설비관리', '일상점검', '설비관리부'],
      time_estimate_minutes: 60,
      times_referenced: 19,
      metadata: { training_step: 1, training_path: '설비관리 기초', department: '설비관리부', language: 'ko' }
    },
    {
      title: '[용어] 매트리스 제조 핵심 용어 사전',
      equipment_type: '용어/글로서리',
      problem: '현장 용어 미숙지로 인한 소통 오류',
      symptoms: '신입직원이 현장 용어를 이해 못해 작업 실수 발생',
      solution: `## 에이스침대 매트리스 제조 핵심 용어 사전

### 공정 관련 용어
**본딩 (Bonding)**
매트리스 내장재(폼, 스프링, 원단)를 접착제로 결합하는 공정.
"본딩 온도 올려" = 본딩기 온도 설정값 높이기

**퀼팅 (Quilting)**
원단과 충전재를 규칙적 패턴으로 봉합하는 기법.
퀼팅 패턴이 매트리스 외관 디자인을 결정.

**텐션 (Tension)**  
① 스프링의 탄성 강도 (소프트/미디엄/하드)
② 재봉기 실 장력

### 소재 관련 용어
**필로우탑 (Pillow Top)**
매트리스 상단에 추가된 별도 쿠션층. 고급 라인에 적용.
두께: 보통 5~8cm

**폼 밀도 (Foam Density)**
폼 소재의 밀도 (kg/m³). 높을수록 내구성/지지력 우수.
에이스침대 기준: 고급 ≥ 35kg/m³, 일반 ≥ 25kg/m³

**코일카운트 (Coil Count)**
매트리스 내 스프링(코일) 수량 규격.
퀸사이즈 기준: 일반 256개, 포켓스프링 320개 이상

**ILD (Impression Load Deflection)**
폼 경도 측정 단위. 숫자 높을수록 단단함.

### 품질 관련 용어
**ΔE (Delta E)**
색상 차이를 수치화한 값. 낮을수록 색상 균일.

**ILD/IFD**
폼 경도 측정 국제 규격`,
      tags: ['용어사전', '신입교육', '전부서'],
      time_estimate_minutes: 30,
      times_referenced: 67,
      metadata: { type: 'glossary', department: 'all', language: 'ko' }
    },
  ];

  for (const article of articles) {
    const r = await s.from('knowledge_articles').insert({
      company_id: companyId,
      title: article.title,
      equipment_type: article.equipment_type,
      problem: article.problem,
      symptoms: article.symptoms,
      solution: article.solution,
      tags: article.tags,
      time_estimate_minutes: article.time_estimate_minutes,
      times_referenced: article.times_referenced,
      metadata: article.metadata
    });
    if (r.error) console.error('Article error:', r.error.message);
  }
  log(`✓ Created ${articles.length} knowledge articles`);

  // ─── 5. Knowledge Gaps ────────────────────────────────────
  log('Creating knowledge gaps...');
  const gaps = [
    {
      id: `kg-ace-001-${Date.now()}`,
      company_id: companyId,
      topic: '본딩기 온도 이탈 시 처리 방법',
      cluster: ['본딩기', '온도 관리', '이상 대응'],
      suggested_policy: '본딩기 온도 이탈(±10°C) 발생 시 즉각 작업 중단 → 품질관리부 통보 → 시정 조치 후 재기동 절차를 SOP에 명확히 기재하고 전 작업자에게 교육 필요',
      priority: 1,
      frequency: 23,
      unique_workers: 8,
      trend: 'increasing'
    },
    {
      id: `kg-ace-002-${Date.now()}`,
      company_id: companyId,
      topic: '스프링 코일카운트 불일치 시 처리',
      cluster: ['스프링 조립', '코일카운트', '규격'],
      suggested_policy: '코일카운트가 작업지시서와 다를 경우의 처리 절차(재작업 vs 불량 처리) 기준이 불명확. QC 팀장 판단 의존도 높음 → 명확한 판정 기준 수립 및 교육 필요',
      priority: 2,
      frequency: 15,
      unique_workers: 6,
      trend: 'stable'
    },
    {
      id: `kg-ace-003-${Date.now()}`,
      company_id: companyId,
      topic: '야간 교대 시 설비 이상 보고 절차',
      cluster: ['교대 인수인계', '설비 이상', '야간 작업'],
      suggested_policy: '야간에 설비 이상 발생 시 설비관리부 담당자가 부재중일 때의 긴급 연락 체계 및 임시 조치 범위가 불명확. 비상 연락망 갱신 및 야간 자체 처리 가능 범위 교육 필요',
      priority: 2,
      frequency: 11,
      unique_workers: 5,
      trend: 'decreasing'
    },
    {
      id: `kg-ace-004-${Date.now()}`,
      company_id: companyId,
      topic: '원단 색상 편차 판정 기준 (ΔE 측정)',
      cluster: ['원단 검수', '색상 품질', 'ΔE 측정'],
      suggested_policy: 'ΔE 측정값 해석 방법과 판정 도구 사용법에 대한 교육 부족. 색차계 사용법 실습 교육 및 기준 ΔE 샘플 패널 비치 필요',
      priority: 3,
      frequency: 9,
      unique_workers: 4,
      trend: 'stable'
    },
    {
      id: `kg-ace-005-${Date.now()}`,
      company_id: companyId,
      topic: '필로우탑 봉제 시 패딩 균일성 유지',
      cluster: ['필로우탑', '봉제', '품질'],
      suggested_policy: '필로우탑 봉제 시 내부 패딩이 한쪽으로 쏠리는 현상 방지 방법에 대한 노하우가 숙련자에게만 있고 문서화 미비. 숙련자 인터뷰를 통한 암묵지 SOP화 필요',
      priority: 1,
      frequency: 18,
      unique_workers: 7,
      trend: 'increasing'
    },
    {
      id: `kg-ace-006-${Date.now()}`,
      company_id: companyId,
      topic: '폼 밀도 등급 구분 방법',
      cluster: ['폼 소재', '밀도', '자재 구분'],
      suggested_policy: '같은 외관의 폼 소재가 밀도별로 혼재되어 있어 작업자가 육안으로 구분하기 어려움. 색상 코딩 또는 물리적 라벨링 시스템 도입 및 구분 교육 필요',
      priority: 3,
      frequency: 7,
      unique_workers: 9,
      trend: 'stable'
    },
  ];

  const gapResult = await s.from('knowledge_gaps').insert(gaps);
  await check('knowledge_gaps', gapResult);

  // ─── 6. Sample Questions (Worker Q&A showing KM loop) ─────
  log('Creating sample worker questions (KM loop demonstration)...');
  const questions = [
    {
      company_id: companyId,
      worker_phone: '+821011112222',
      worker_name: '박민준',
      question: '본딩기 온도가 170도 이상 올라갔어요. 어떻게 해야 하나요?',
      answer: '⚠️ 즉시 작업 중단하세요!\n\n1. 본딩기 전원을 끄고 냉각 대기\n2. 설비관리부 내선 1234 또는 강현우 주임에게 연락\n3. 해당 제품은 품질 검사 후 이상 없으면 재사용 가능\n\n온도 이탈(±10°C)은 반드시 설비 점검 후 재가동해야 합니다. (본딩기 운전 절차서 SOP v2 참조)',
      confidence: 0.85,
      language: 'ko',
      channel: 'sms',
      topic: '본딩기 온도 이탈',
      manager_notified: true
    },
    {
      company_id: companyId,
      worker_phone: '+821055556666',
      worker_name: '김태호',
      question: '재봉기 밑실이 자꾸 끊겨요. 왜 그런건가요?',
      answer: '밑실(보빈 실) 끊김 원인 TOP 3:\n\n1️⃣ 보빈 실 방향이 반대 → 보빈을 꺼내서 방향 확인 후 재삽입\n2️⃣ 실 장력이 너무 강함 → 장력 조절기를 조금 느슨하게\n3️⃣ 바늘 구부러짐 → 바늘 교체 (반드시 전원 OFF 후)\n\n그래도 계속되면 선임자(박민준 기사)에게 도움 요청하세요! 💪',
      confidence: 0.92,
      language: 'ko',
      channel: 'sms',
      topic: '재봉기 밑실 끊김',
      manager_notified: false
    },
    {
      company_id: companyId,
      worker_phone: '+821066667777',
      worker_name: '윤서현',
      question: '원단 색상 편차가 ΔE 1.8 나왔는데 이게 불합격인가요?',
      answer: '네, 불합격입니다.\n\n에이스침대 기준 원단 색상 편차: **ΔE ≤ 1.5** (SOP v3 기준)\n측정값 1.8은 기준 초과입니다.\n\n📋 처리 방법:\n1. 해당 원단에 빨간 불량 태그 부착\n2. 격리 구역 이동\n3. 한지민 수석 또는 공급업체에 통보\n4. 불량 처리 절차서 SOP v2에 따라 시정 조치 보고서 작성\n\n동일 LOT 전체 추가 확인도 권장합니다.',
      confidence: 0.95,
      language: 'ko',
      channel: 'sms',
      topic: 'ΔE 색상 편차 판정',
      manager_notified: false
    },
    {
      company_id: companyId,
      worker_phone: '+821033334444',
      worker_name: '최동현',
      question: '포켓스프링 코일카운트가 작업지시서에는 320개인데 부품이 288개짜리로 왔어요.',
      answer: '이 경우 즉시 작업을 중단하고 아래 절차를 따르세요:\n\n1. 해당 자재를 별도 보관 (혼합 금지)\n2. 자재창고 담당자에게 연락: 불일치 확인 요청\n3. 품질관리부 한지민 수석에게 통보\n4. 작업지시서 재확인 요청 (발주 오류 가능성 확인)\n\n⚠️ 승인 없이 288개짜리 사용하면 제품 규격 미달 → A급 불량 처리!\n\n혼란스러우시면 바로 연락 주세요. 이런 상황 처리 기준을 SOP에 추가할 예정입니다.',
      confidence: 0.78,
      language: 'ko',
      channel: 'sms',
      topic: '스프링 코일카운트 불일치',
      manager_notified: true
    },
    {
      company_id: companyId,
      worker_phone: '+821055556666',
      worker_name: '김태호',
      question: '필로우탑 봉제할 때 안에 솜이 한쪽으로 쏠려요. 어떻게 하면 되나요?',
      answer: '좋은 질문이에요! 이건 숙련자만 아는 노하우예요 👍\n\n✅ 필로우탑 패딩 균일성 유지 팁:\n1. 봉제 전 손으로 패딩을 고르게 펼치기 (중앙에서 바깥쪽으로)\n2. 봉제 속도: 반드시 **저속** 유지 (고속이면 쏠림 심해짐)\n3. 시작점에서 패딩 가장자리를 핀으로 고정\n4. 중간중간 손으로 패딩 위치 확인하면서 진행\n\n박민준 기사님이 이 부분 전문가이시니 직접 시연도 요청해보세요!\n\n📝 이 내용 SOP에 추가하도록 건의해두겠습니다.',
      confidence: 0.72,
      language: 'ko',
      channel: 'sms',
      topic: '필로우탑 봉제 패딩 균일성',
      manager_notified: true
    },
  ];

  for (const q of questions) {
    const r = await s.from('questions').insert(q);
    if (r.error) console.error('Question error:', r.error.message);
  }
  log(`✓ Created ${questions.length} sample worker questions`);

  // ─── Final summary ─────────────────────────────────────────
  log('\n========================================');
  log('✅ Ace Bed demo data seed COMPLETE!');
  log(`   Company ID: ${companyId}`);
  log(`   Workers: ${workers.length}`);
  log(`   SOP Documents: ${docIds.length}`);
  log(`   Knowledge Articles: ${articles.length}`);
  log(`   Knowledge Gaps: ${gaps.length}`);
  log(`   Sample Q&A: ${questions.length}`);
  log('========================================\n');
  log(`COMPANY_ID=${companyId}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
