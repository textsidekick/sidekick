const COMPANY_ID = 'd2291138-e57b-458f-9128-693c0bd3fb0e';
const API = 'https://api.supabase.com/v1/projects/jzlfyxrrubersvankyjo/database/query';
const AUTH = 'Bearer sbp_7cee351c8a0fc3e3cf7f1f069dd5ed8aa931f6ff';

async function run(sql) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': AUTH },
    body: JSON.stringify({ query: sql })
  });
  const body = await res.text();
  if (res.status >= 400) throw new Error(`SQL error ${res.status}: ${body}`);
  return JSON.parse(body);
}

function esc(s) { return s.replace(/'/g, "''"); }

(async () => {
  // 1. Departments
  const depts = [
    { name: '생산부', desc: '매트리스 생산 라인 (봉제, 본딩, 조립, 포장)', color: '#2563EB' },
    { name: '품질관리부', desc: '완제품 및 원자재 품질 검사', color: '#DC2626' },
    { name: '설비관리부', desc: '생산 설비 유지보수 및 점검', color: '#D97706' },
    { name: '물류부', desc: '입출하, 재고 관리, 배송', color: '#059669' },
    { name: '인사부', desc: '채용, 교육, 복리후생', color: '#7C3AED' },
    { name: '연구개발부', desc: '신제품 개발 및 소재 연구', color: '#0891B2' },
  ];
  
  const deptIds = {};
  for (const d of depts) {
    const rows = await run(`INSERT INTO departments (company_id, name, description, color) VALUES ('${COMPANY_ID}', '${d.name}', '${esc(d.desc)}', '${d.color}') ON CONFLICT (company_id, name) DO UPDATE SET description = EXCLUDED.description RETURNING id, name`);
    deptIds[d.name] = rows[0].id;
    console.log('Dept:', d.name, rows[0].id);
  }

  // 2. Positions
  const positions = [
    { name: '봉제 기사', en: 'Sewing Technician', dept: '생산부', skills: ['봉제기 운전','퀼팅','원단 검수'] },
    { name: '본딩 기사', en: 'Bonding Technician', dept: '생산부', skills: ['본딩기 운전','접착제 취급','온도 관리'] },
    { name: '스프링 조립 기사', en: 'Spring Assembly Tech', dept: '생산부', skills: ['코일 조립','텐션 측정','프레임 세팅'] },
    { name: '포장 작업자', en: 'Packaging Operator', dept: '물류부', skills: ['포장기 운전','바코드 스캔','적재'] },
    { name: '품질검사원', en: 'QC Inspector', dept: '품질관리부', skills: ['불량 판정','ΔE 측정','치수 검사'] },
    { name: '설비 정비사', en: 'Maintenance Technician', dept: '설비관리부', skills: ['일상점검','고장 수리','예방 정비'] },
    { name: '생산 관리자', en: 'Production Supervisor', dept: '생산부', skills: ['공정 관리','인원 배치','생산 계획'] },
    { name: '신입 생산직', en: 'New Production Worker', dept: '생산부', skills: [] },
  ];

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const skillsArr = p.skills.length ? `ARRAY[${p.skills.map(s => `'${esc(s)}'`).join(',')}]::text[]` : `'{}'::text[]`;
    await run(`INSERT INTO positions (company_id, department_id, name, name_en, required_skills, sort_order) VALUES ('${COMPANY_ID}', '${deptIds[p.dept]}', '${p.name}', '${p.en}', ${skillsArr}, ${i}) ON CONFLICT (company_id, name) DO NOTHING`);
  }
  console.log('✅ 8 Positions created');

  // 3. SOPs
  const sops = [
    { slug: 'mattress-sewing', title: '매트리스 봉제 작업 표준', ver: 3, dept: '생산부', cat: '생산',
      content: `1. 작업 전 준비\n- 봉제기 전원 확인 및 윤활유 점검\n- 원단 종류별 바늘 규격 확인 (면: #16, 합성: #14)\n- 봉제실 색상 원단과 매칭 확인\n\n2. 봉제 작업\n- 원단 정렬: 퀼팅 패턴에 맞춰 원단 고정\n- 봉제 속도: 중속(2,500rpm)으로 시작, 직선 구간 고속(4,000rpm)\n- 코너 봉제 시 반드시 감속 후 방향 전환\n- 봉제폭 편차: ±2mm 이내\n\n3. 품질 체크포인트\n- 10매 단위로 봉제선 직진도 확인\n- 실 텐션 불균일 시 즉시 라인 정지\n\n⚠️ 안전수칙: 바늘 교체 시 반드시 전원 차단`,
      change: 'v3: 코너 봉제 감속 기준 추가, 봉제폭 허용 편차 명시' },
    { slug: 'bonding-machine', title: '본딩기 운전 절차', ver: 2, dept: '생산부', cat: '생산',
      content: `1. 시동 절차\n- 메인 전원 ON → 예열 시작 (목표: 160°C ±5°C)\n- 예열 완료까지 약 15분 소요\n- 접착제 투입구 잔여물 확인 후 신규 접착제 투입\n\n2. 운전 중 관리\n- 온도 모니터링: 30분마다 디스플레이 확인\n- 온도 이탈 시: 155°C 이하 또는 170°C 이상이면 즉시 정지\n- 접착제 잔량: 용기 1/4 이하 시 보충\n\n3. 종료 절차\n- 접착제 라인 퍼지 (5분 공운전)\n- 히터 OFF → 팬 냉각 30분\n- 잔여 접착제 밀봉 보관\n\n⚠️ 안전: 화상 방지 장갑 필수 착용`,
      change: 'v2: 온도 이탈 기준 구체화' },
    { slug: 'spring-assembly', title: '스프링 조립 공정 표준', ver: 4, dept: '생산부', cat: '생산',
      content: `1. 스프링 수입검사\n- 코일카운트 확인: 규격표 대비 ±2개 이내\n- 텐션 샘플 테스트: 5개/박스, 기준치 ±10% 이내\n\n2. 프레임 조립\n- 테두리 프레임 고정 후 스프링 배열\n- 각 스프링 간격: 균일 배치 (편차 ±3mm)\n- 연결선 고정 후 텐션 밸런스 확인\n\n3. 최종 검증\n- 전체 코일카운트 재확인\n- 하중 테스트: 규격 하중 적용 후 처짐량 측정\n\n⚠️ 스프링 절단면 날카로우므로 보호장갑 착용`,
      change: 'v4: 텐션 샘플 테스트 추가, 간격 편차 기준 강화' },
    { slug: 'packaging-shipping', title: '포장 및 출하 절차', ver: 2, dept: '물류부', cat: '물류',
      content: `1. 포장 준비\n- 제품 외관 최종 검사 (오염, 손상, 봉제 불량)\n- 사이즈별 포장재 확인\n\n2. 포장 작업\n- 비닐 압축 포장 → 밴딩 → 박스 또는 롤 포장\n- 바코드 라벨 부착 (제품코드 + 생산일자 + 라인번호)\n\n3. 적재 및 출하\n- 파레트 적재: 최대 4단, 단간 완충재 삽입\n- 출하 전 거래명세표 대조 확인\n- 운송차량 청결 상태 확인 후 상차`,
      change: 'v2: 바코드 라벨 항목 추가' },
    { slug: 'fabric-inspection', title: '원단 검수 기준서', ver: 3, dept: '품질관리부', cat: '품질',
      content: `1. 입고 검수\n- LOT별 샘플 3매 추출\n- 색상: ΔE ≤ 1.5 (기준 대비)\n- 인장강도: KS 기준 이상\n- 필링: 4급 이상\n\n2. 결점 검사\n- 4-Point System 적용\n- 결점 합계: 40점/100yd² 이하 합격\n- 주요 결점: 오염, 위사 틀어짐, 올 빠짐, 색상 편차\n\n3. 불합격 처리\n- 불합격 LOT 격리 보관 (적색 태그)\n- 공급업체 클레임 보고서 작성\n- 대체 원단 긴급 발주`,
      change: 'v3: ΔE 허용치 2.0→1.5 강화' },
    { slug: 'adhesive-safety', title: '접착제 안전 취급 지침', ver: 2, dept: '생산부', cat: '안전',
      content: `1. 보관\n- 직사광선 차단, 15~25°C 보관\n- MSDS 비치 필수\n- 소방법 기준 지정수량 이내 보관\n\n2. 사용 시\n- 보호구: 방독 마스크, 내화학 장갑, 보안경\n- 환기 장치 가동 확인 후 사용\n- 피부 접촉 시 즉시 비눗물 세척\n\n3. 폐기\n- 경화된 접착제: 일반 산업폐기물\n- 미경화 잔량: 유해화학물질 위탁 처리\n\n⚠️ 응급: 눈 접촉 시 15분 이상 흐르는 물로 세척 → 즉시 병원`,
      change: 'v2: MSDS 비치 의무화, 폐기 절차 추가' },
    { slug: 'daily-equipment-check', title: '설비 일상점검 체크리스트', ver: 5, dept: '설비관리부', cat: '설비',
      content: `매일 작업 시작 전 아래 항목 점검:\n\n□ 봉제기: 윤활유 잔량, 바늘 마모, 벨트 텐션\n□ 본딩기: 히터 작동, 온도 센서, 접착제 노즐\n□ 스프링 조립기: 유압 누유, 가이드 레일, 안전 가드\n□ 포장기: 필름 잔량, 실링 바, 컨베이어 벨트\n□ 컴프레서: 에어 압력 (6~7 kgf/cm²), 드레인 배출\n\n이상 발견 시:\n1. 해당 설비 "점검 중" 태그 부착\n2. 설비관리부 즉시 통보 (내선 4100)\n3. 수리 완료까지 대체 설비 사용\n\n⚠️ 절대 자가 수리 금지 (자격증 소지자만 수리 가능)`,
      change: 'v5: 컴프레서 점검 항목 및 에어 압력 기준 추가' },
    { slug: 'new-hire-training', title: '신입사원 현장 교육 가이드', ver: 3, dept: '인사부', cat: '교육',
      content: `1일차: 오리엔테이션\n- 회사 소개 및 안전 교육 (2시간)\n- 공장 견학 및 비상구/소화기 위치 확인\n- 개인 보호구 지급 및 착용법\n\n2~3일차: 기초 실습\n- 담당 공정 선배 직원과 1:1 매칭\n- 기본 장비 조작 실습 (관찰 → 보조 → 단독)\n- 일일 교육 일지 작성\n\n4~5일차: 독립 작업 전환\n- 선배 감독하에 단독 작업 시작\n- 품질 기준 숙지 확인 (퀴즈)\n- 안전 행동 체크리스트 자가 점검\n\n1주 후: 평가\n- 직속 상사 평가 면담\n- 부족 역량 추가 교육 계획 수립`,
      change: 'v3: 1:1 멘토 매칭 의무화, 교육 일지 양식 개선' },
    { slug: 'defect-handling', title: '불량 처리 절차', ver: 2, dept: '품질관리부', cat: '품질',
      content: `1. 불량 발견 시\n- 해당 제품 즉시 라인에서 분리\n- 불량 태그 부착 (일자, 발견자, 불량 유형)\n- 불량 유형: 봉제 불량 / 외관 불량 / 치수 불량 / 원단 결점 / 기타\n\n2. 보고 및 분석\n- 품질관리부 담당자에게 즉시 보고\n- 불량 원인 분석 (4M: Man, Machine, Material, Method)\n- 동일 LOT 전수검사 여부 결정\n\n3. 처리\n- 수리 가능: 재작업 후 재검사\n- 수리 불가: 폐기 처리 (폐기 대장 기록)\n- 시정 조치: 원인별 개선 대책 수립 → 실행 → 효과 확인`,
      change: 'v2: 4M 분석 추가, 시정 조치 프로세스 표준화' },
    { slug: 'shift-handoff', title: '교대 인수인계 절차', ver: 2, dept: '생산부', cat: '생산',
      content: `교대 시간 10분 전 시작:\n\n1. 생산 현황 인계\n- 금일 생산 수량 vs 목표\n- 잔여 작업 및 우선순위\n- 원자재 재고 상황\n\n2. 설비 상태 인계\n- 이상 발생 설비 및 조치 내용\n- 진행 중인 수리 건\n- 예정된 정비 일정\n\n3. 품질 이슈 인계\n- 불량 발생 건수 및 유형\n- 고객 클레임 관련 주의사항\n\n4. 안전 인계\n- 안전 사고 발생 여부\n- 특이사항 (방문자, 점검 등)\n\n✅ 인수자 확인 서명 후 교대 완료`,
      change: 'v2: 품질 이슈 항목 분리, 인수자 서명 의무화' },
  ];

  for (const s of sops) {
    await run(`INSERT INTO sops (company_id, department_id, slug, title, content, version_number, is_current, status, language, category, change_summary) VALUES ('${COMPANY_ID}', '${deptIds[s.dept]}', '${s.slug}', '${esc(s.title)}', '${esc(s.content)}', ${s.ver}, true, 'active', 'ko', '${s.cat}', '${esc(s.change)}') ON CONFLICT DO NOTHING`);
  }
  console.log('✅ 10 SOPs created');

  // 4. Terminology
  const terms = [
    { term: '본딩', def: '매트리스 내장재를 고온 접착제로 접합하는 공정. 온도 관리가 핵심.' },
    { term: '퀼팅', def: '원단과 충전재(솜, 폼)를 봉합하여 누비 패턴을 만드는 기법.' },
    { term: '텐션', def: '스프링의 탄성 강도. 매트리스 경도와 내구성을 결정하는 핵심 지표.' },
    { term: '필로우탑', def: '매트리스 상단에 추가되는 쿠션층. 수면 편안함을 높이는 프리미엄 사양.' },
    { term: '코일카운트', def: '매트리스에 사용되는 스프링 총 수량. 규격별 기준치가 다름.' },
    { term: '폼 밀도', def: '폴리우레탄 폼의 밀도(kg/m³). 높을수록 내구성↑, 가격↑.' },
    { term: 'ΔE (델타E)', def: '색차 측정값. 원단 LOT 간 색상 편차를 수치화한 것. 1.5 이하가 합격 기준.' },
    { term: '4-Point System', def: '원단 결점 평가 방법. 결점 크기별 1~4점 부여, 40점/100yd² 이하 합격.' },
    { term: 'MSDS', def: '물질안전보건자료. 접착제 등 화학물질 취급 시 반드시 비치해야 하는 문서.' },
    { term: '퍼지', def: '설비 종료 시 잔여 접착제/물질을 제거하는 공운전 과정.' },
  ];

  for (const t of terms) {
    await run(`INSERT INTO terminology (company_id, term, definition, language) VALUES ('${COMPANY_ID}', '${esc(t.term)}', '${esc(t.def)}', 'ko') ON CONFLICT (company_id, term) DO NOTHING`);
  }
  console.log('✅ 10 terminology entries');

  // 5. Training paths
  const pathData = [
    { name: '생산라인 신입 교육', desc: '생산부 신입사원 대상 기초 교육 과정', role: '신입 생산직', dept: '생산부', days: 5, autoEnroll: true,
      steps: [
        { title: '안전 교육', content: '공장 안전 규칙, 비상구 위치, 소화기 사용법, 개인 보호구 착용법을 학습합니다.' },
        { title: '공정 이해', content: '매트리스 생산 전체 공정: 원단 입고 → 재단 → 봉제 → 본딩 → 스프링 조립 → 포장 → 출하.' },
        { title: '장비 기초', content: '담당 공정의 주요 장비 명칭, 기본 조작법, 시동/정지 절차를 학습합니다.' },
        { title: '품질 기준', content: '불량 유형별 판정 기준을 학습합니다. 불량 발견 시 즉시 분리 후 보고.' },
        { title: '독립 작업', content: '선배 감독하에 단독 작업 시작. 일일 교육 일지 작성, 1주 후 평가.' },
      ]},
    { name: '봉제기술 전문과정', desc: '봉제 기사 대상 심화 과정', role: '봉제 기사', dept: '생산부', days: 10, autoEnroll: false,
      steps: [
        { title: '퀼팅 패턴 이해', content: '다이아몬드, 직선, 웨이브 등 주요 퀼팅 패턴별 봉제 기법을 학습합니다.' },
        { title: '원단별 세팅', content: '면, 합성, 자카드, 니트 등 원단 종류별 바늘 규격, 실 텐션, 봉제 속도 최적값.' },
        { title: '트러블슈팅', content: '밑실 끊김, 윗실 텐션 불균일, 봉제선 틀어짐 등 주요 불량 진단 및 조치.' },
        { title: '고급 기법', content: '더블 봉제, 테이핑, 파이핑 처리 등 고급 마감 기법 실습.' },
      ]},
    { name: '품질검사원 양성', desc: '품질검사원 대상 교육', role: '품질검사원', dept: '품질관리부', days: 7, autoEnroll: false,
      steps: [
        { title: '검사 기준 이해', content: 'KS 규격 및 사내 품질 기준서. 불량 유형별 합격/불합격 판정 기준.' },
        { title: '측정 장비 실습', content: '색차계(ΔE), 인장시험기, 치수 측정 도구 사용법과 교정 절차.' },
        { title: '4-Point 원단검수', content: '4-Point System을 활용한 원단 결점 평가 실습.' },
      ]},
    { name: '설비관리 기초', desc: '설비 정비사 기초 교육', role: '설비 정비사', dept: '설비관리부', days: 5, autoEnroll: false,
      steps: [
        { title: '일상점검 체크리스트', content: '주요 설비의 일상점검 항목과 절차를 학습합니다.' },
        { title: '이상 보고 절차', content: '설비 이상 발견 시 태그 부착, 통보, 대체 설비 사용 절차.' },
        { title: '예방 정비 기초', content: '주기별 정비 항목, 소모품 교체 주기, 정비 이력 관리.' },
      ]},
  ];

  for (const p of pathData) {
    const rows = await run(`INSERT INTO training_paths (company_id, department_id, name, description, role, estimated_days, auto_enroll) VALUES ('${COMPANY_ID}', '${deptIds[p.dept]}', '${esc(p.name)}', '${esc(p.desc)}', '${esc(p.role)}', ${p.days}, ${p.autoEnroll}) ON CONFLICT DO NOTHING RETURNING id`);
    if (rows.length) {
      for (let i = 0; i < p.steps.length; i++) {
        await run(`INSERT INTO training_steps (training_path_id, sort_order, title, content) VALUES ('${rows[0].id}', ${i+1}, '${esc(p.steps[i].title)}', '${esc(p.steps[i].content)}') ON CONFLICT DO NOTHING`);
      }
      console.log(`✅ Training: ${p.name} (${p.steps.length} steps)`);
    }
  }

  // 6. Update workers with department assignments
  const workerDepts = await run(`SELECT id, department FROM workers WHERE company_id = '${COMPANY_ID}'`);
  for (const w of workerDepts) {
    if (w.department && deptIds[w.department]) {
      await run(`UPDATE workers SET department_id = '${deptIds[w.department]}', department_name = '${w.department}' WHERE id = '${w.id}'`);
    }
  }
  console.log('✅ Workers linked to departments');

  console.log('\n🎉 All Ace Bed data seeded into new tables!');
})().catch(e => console.error('ERROR:', e.message));
