const CID = 'd2291138-e57b-458f-9128-693c0bd3fb0e';
const API = 'https://api.supabase.com/v1/projects/jzlfyxrrubersvankyjo/database/query';
const AUTH = 'Bearer sbp_7cee351c8a0fc3e3cf7f1f069dd5ed8aa931f6ff';

async function run(sql) {
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': AUTH }, body: JSON.stringify({ query: sql }) });
  const body = await res.text();
  if (res.status >= 400) throw new Error(`SQL ${res.status}: ${body}`);
  return JSON.parse(body);
}

function esc(s) { return s.replace(/'/g, "''"); }
function d(daysAgo) { return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10); }
function ts(daysAgo, hoursOffset = 0) { return new Date(Date.now() - daysAgo * 86400000 + hoursOffset * 3600000).toISOString(); }

(async () => {
  // 1. Assets
  const assets = [
    { name: 'JUKI LU-2810 봉제기 #1', tag: 'SEW-001', type: 'Sewing Machine', mfr: 'JUKI', model: 'LU-2810', serial: 'JK-2810-4421', loc: '안산 본공장 A동', install: '2019-03-15', health: 82, status: 'operational' },
    { name: 'JUKI LU-2810 봉제기 #2', tag: 'SEW-002', type: 'Sewing Machine', mfr: 'JUKI', model: 'LU-2810', serial: 'JK-2810-4422', loc: '안산 본공장 A동', install: '2019-03-15', health: 91, status: 'operational' },
    { name: 'JUKI LU-2810 봉제기 #3', tag: 'SEW-003', type: 'Sewing Machine', mfr: 'JUKI', model: 'LU-2810', serial: 'JK-2810-4423', loc: '화성 제2공장', install: '2021-06-01', health: 95, status: 'operational' },
    { name: '본딩기 HM-300', tag: 'BOND-001', type: 'Bonding Machine', mfr: 'Nordmeccanica', model: 'HM-300', serial: 'NM-300-1182', loc: '안산 본공장 B동', install: '2018-08-20', health: 58, status: 'operational', notes: '온도 센서 노후화 진행 중. 2024년 교체 예정이었으나 미실시.' },
    { name: '본딩기 HM-300 #2', tag: 'BOND-002', type: 'Bonding Machine', mfr: 'Nordmeccanica', model: 'HM-300', serial: 'NM-300-1183', loc: '화성 제2공장', install: '2022-01-10', health: 88, status: 'operational' },
    { name: '스프링 조립기 SA-500', tag: 'SPR-001', type: 'Spring Assembly', mfr: 'Spuhl', model: 'SA-500', serial: 'SP-500-7891', loc: '안산 본공장 C동', install: '2017-11-01', health: 45, status: 'maintenance', notes: '유압 실린더 누유 반복 발생. 전면 교체 검토 중.' },
    { name: '스프링 조립기 SA-500 #2', tag: 'SPR-002', type: 'Spring Assembly', mfr: 'Spuhl', model: 'SA-500', serial: 'SP-500-7892', loc: '화성 제2공장', install: '2023-04-15', health: 97, status: 'operational' },
    { name: '포장기 AP-2000', tag: 'PKG-001', type: 'Packaging Machine', mfr: 'Signode', model: 'AP-2000', serial: 'SG-2000-3344', loc: '인천 물류센터', install: '2020-05-10', health: 74, status: 'operational' },
    { name: '포장기 AP-2000 #2', tag: 'PKG-002', type: 'Packaging Machine', mfr: 'Signode', model: 'AP-2000', serial: 'SG-2000-3345', loc: '인천 물류센터', install: '2020-05-10', health: 79, status: 'operational' },
    { name: '에어 컴프레서 GA-55', tag: 'COMP-001', type: 'Compressor', mfr: 'Atlas Copco', model: 'GA-55', serial: 'AC-55-9012', loc: '안산 본공장 유틸리티동', install: '2016-02-01', health: 62, status: 'operational', notes: '드레인 밸브 주기적 점검 필요. 에어 누출 의심 구간 있음.' },
    { name: '퀼팅기 QM-800', tag: 'QUILT-001', type: 'Quilting Machine', mfr: 'Gribetz', model: 'QM-800', serial: 'GR-800-5567', loc: '안산 본공장 A동', install: '2020-09-01', health: 85, status: 'operational' },
    { name: '원단 재단기 CT-400', tag: 'CUT-001', type: 'Cutting Machine', mfr: 'Eastman', model: 'CT-400', serial: 'EM-400-2211', loc: '안산 본공장 A동', install: '2019-07-15', health: 71, status: 'operational' },
    { name: '라텍스 발포기 LF-200', tag: 'LAT-001', type: 'Latex Foaming', mfr: 'Sapsa Bedding', model: 'LF-200', serial: 'SB-200-8834', loc: '화성 제2공장', install: '2021-11-20', health: 90, status: 'operational' },
    { name: '메모리폼 성형기 MF-150', tag: 'FOAM-001', type: 'Foam Molding', mfr: 'Cannon Viking', model: 'MF-150', serial: 'CV-150-4456', loc: '화성 제2공장', install: '2022-03-01', health: 93, status: 'operational' },
    { name: '지게차 #1', tag: 'FLT-001', type: 'Forklift', mfr: 'Toyota', model: '8FBN25', serial: 'TY-25-1122', loc: '인천 물류센터', install: '2020-01-15', health: 68, status: 'operational', notes: '배터리 수명 70% 잔여. 2025년 교체 필요.' },
    { name: '지게차 #2', tag: 'FLT-002', type: 'Forklift', mfr: 'Toyota', model: '8FBN25', serial: 'TY-25-1123', loc: '안산 본공장', install: '2021-06-01', health: 83, status: 'operational' },
  ];

  for (const a of assets) {
    const notes = a.notes ? `'${esc(a.notes)}'` : 'NULL';
    await run(`INSERT INTO assets (company_id, name, asset_tag, type, manufacturer, model, serial_number, location, install_date, health_score, status, notes, created_at) VALUES ('${CID}', '${esc(a.name)}', '${a.tag}', '${a.type}', '${a.mfr}', '${a.model}', '${a.serial}', '${esc(a.loc)}', '${a.install}', ${a.health}, '${a.status}', ${notes}, NOW()) ON CONFLICT DO NOTHING`);
  }
  console.log('✅ 16 assets created');

  // 2. Get asset IDs for work orders
  const assetRows = await run(`SELECT id, asset_tag, name FROM assets WHERE company_id = '${CID}' ORDER BY asset_tag`);
  const byTag = {};
  assetRows.forEach(a => byTag[a.asset_tag] = a);

  // 3. Work orders (mix of completed and open, various dates)
  const wos = [
    // BOND-001 — lots of issues (low health)
    { asset: 'BOND-001', title: '본딩기 온도 센서 오작동', desc: '160°C 설정인데 디스플레이 145°C 표시. 실제 온도 정상으로 추정. 센서 교정 필요.', priority: 'high', status: 'completed', cat: 'repair', days: 45, dur: 120 },
    { asset: 'BOND-001', title: '접착제 노즐 막힘', desc: '접착제 흐름 불균일. 노즐 분해 청소 실시.', priority: 'medium', status: 'completed', cat: 'repair', days: 30, dur: 45 },
    { asset: 'BOND-001', title: '본딩기 히터 이상 과열', desc: '170°C 초과 경보 발생. 히터 릴레이 교체.', priority: 'critical', status: 'completed', cat: 'repair', days: 15, dur: 180 },
    { asset: 'BOND-001', title: '본딩기 온도 편차 재발', desc: '좌측 히터 온도 편차 ±8°C. 센서 교체 필요.', priority: 'high', status: 'open', cat: 'repair', days: 2, dur: null },
    // SPR-001 — critical (lowest health)
    { asset: 'SPR-001', title: '유압 실린더 누유', desc: '메인 실린더 하부 오일 누출. 실링 교체.', priority: 'high', status: 'completed', cat: 'repair', days: 60, dur: 240 },
    { asset: 'SPR-001', title: '가이드 레일 마모', desc: '스프링 정렬 불량 발생. 레일 연마 및 윤활.', priority: 'medium', status: 'completed', cat: 'maintenance', days: 40, dur: 90 },
    { asset: 'SPR-001', title: '유압 누유 재발', desc: '동일 실린더 재누유. 실린더 전체 교체 검토.', priority: 'critical', status: 'completed', cat: 'repair', days: 20, dur: 360 },
    { asset: 'SPR-001', title: '안전 가드 센서 고장', desc: '안전 가드 닫힘 감지 불가. 근접 센서 교체.', priority: 'critical', status: 'open', cat: 'safety', days: 1, dur: null },
    // SEW-001 — moderate issues
    { asset: 'SEW-001', title: '봉제기 바늘 꺾임 빈발', desc: '2주간 바늘 3회 파손. 바늘대 정렬 점검.', priority: 'medium', status: 'completed', cat: 'repair', days: 25, dur: 60 },
    { asset: 'SEW-001', title: '윤활유 부족 경고', desc: '자동 급유 시스템 오작동. 수동 급유 후 센서 점검.', priority: 'low', status: 'completed', cat: 'maintenance', days: 10, dur: 30 },
    // COMP-001 — moderate
    { asset: 'COMP-001', title: '에어 압력 저하', desc: '6.0 kgf/cm² 이하로 떨어짐. 에어 라인 누출 점검.', priority: 'high', status: 'completed', cat: 'repair', days: 35, dur: 150 },
    { asset: 'COMP-001', title: '드레인 밸브 고착', desc: '자동 드레인 작동 안 됨. 밸브 교체.', priority: 'medium', status: 'completed', cat: 'repair', days: 12, dur: 45 },
    // CUT-001
    { asset: 'CUT-001', title: '재단 칼날 마모', desc: '절단면 불균일. 칼날 교체 및 연마.', priority: 'medium', status: 'completed', cat: 'maintenance', days: 20, dur: 40 },
    // FLT-001
    { asset: 'FLT-001', title: '지게차 배터리 충전 불량', desc: '충전 완료 후 4시간 만에 방전. 배터리 셀 점검.', priority: 'high', status: 'completed', cat: 'repair', days: 18, dur: 120 },
    { asset: 'FLT-001', title: '브레이크 패드 교체', desc: '정기 점검 시 마모 확인. 전륜 패드 교체.', priority: 'medium', status: 'completed', cat: 'maintenance', days: 8, dur: 60 },
    // PKG-001
    { asset: 'PKG-001', title: '실링 바 온도 불균일', desc: '우측 실링 불완전. 히팅 엘리먼트 점검.', priority: 'medium', status: 'completed', cat: 'repair', days: 22, dur: 90 },
    { asset: 'PKG-001', title: '컨베이어 벨트 미끄러짐', desc: '벨트 텐션 약화. 장력 조정 및 벨트 상태 점검.', priority: 'low', status: 'completed', cat: 'maintenance', days: 5, dur: 30 },
    // PM work orders
    { asset: 'QUILT-001', title: '퀼팅기 월간 정비', desc: '바늘 교체, 벨트 텐션 조정, 윤활유 보충.', priority: 'low', status: 'completed', cat: 'pm', days: 7, dur: 60 },
    { asset: 'LAT-001', title: '라텍스 발포기 분기 정비', desc: '믹싱 헤드 청소, 온도 센서 교정, 금형 점검.', priority: 'low', status: 'completed', cat: 'pm', days: 14, dur: 120 },
    { asset: 'FOAM-001', title: '메모리폼 성형기 월간 점검', desc: '금형 온도 교정, 주입 노즐 청소, 경화 타이머 검증.', priority: 'low', status: 'completed', cat: 'pm', days: 3, dur: 45 },
  ];

  const workers = await run(`SELECT id, phone, name FROM workers WHERE company_id = '${CID}' LIMIT 5`);
  
  for (const wo of wos) {
    const asset = byTag[wo.asset];
    if (!asset) { console.log('Skip:', wo.asset); continue; }
    const completedAt = wo.status === 'completed' ? `'${ts(wo.days - 1)}'` : 'NULL';
    const actualTime = wo.dur ? wo.dur : 'NULL';
    const reporter = workers[Math.floor(Math.random() * workers.length)];
    await run(`INSERT INTO work_orders (company_id, asset_id, asset_name, asset_tag, title, description, priority, status, category, source, reported_by, created_at, completed_at, actual_time_minutes, worker_phone) VALUES ('${CID}', '${asset.id}', '${esc(asset.name)}', '${wo.asset}', '${esc(wo.title)}', '${esc(wo.desc)}', '${wo.priority}', '${wo.status}', '${wo.cat}', 'worker_sms', '${reporter.name}', '${ts(wo.days)}', ${completedAt}, ${actualTime}, '${reporter.phone}') ON CONFLICT DO NOTHING`);
  }
  console.log('✅ 20 work orders created');

  // 4. Asset health history entries
  const healthAssets = [
    { tag: 'BOND-001', scores: [75, 70, 65, 62, 58] },
    { tag: 'SPR-001', scores: [70, 60, 55, 50, 45] },
    { tag: 'COMP-001', scores: [78, 72, 68, 65, 62] },
    { tag: 'FLT-001', scores: [82, 78, 74, 70, 68] },
    { tag: 'SEW-001', scores: [90, 88, 86, 84, 82] },
  ];

  for (const h of healthAssets) {
    const asset = byTag[h.tag];
    if (!asset) continue;
    for (let i = 0; i < h.scores.length; i++) {
      await run(`INSERT INTO asset_health_history (asset_id, health_score, notes, recorded_at) VALUES ('${asset.id}', ${h.scores[i]}, 'Monthly health assessment', '${ts(30 * (h.scores.length - i))}') ON CONFLICT DO NOTHING`);
    }
  }
  console.log('✅ Asset health history seeded');

  console.log('\\n🎉 All Ace Bed assets + work orders seeded!');
})().catch(e => console.error('ERROR:', e.message));
