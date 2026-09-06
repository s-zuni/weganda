export interface StudyGuideItem {
  id: string;
  title: string;
  category: '약물계산/투약' | '응급/ACLS' | '간호술기' | '바이탈/중재';
  summary: string;
  iconType: 'flask' | 'zap' | 'activity' | 'book';
  iconBg: string;
  author: string;
  meta: string;
  views: number;
  isBookmarked: boolean;
  keyPoints: string[];
  dangerAlert?: string;
  fullContent: string[];
}

export interface DrugPreset {
  id: string;
  name: string;
  defaultDose: number; // mcg/kg/min
  unit: string;
  drugTotalMg: number;
  fluidTotalMl: number;
  description: string;
}

export const MOCK_DRUG_PRESETS: DrugPreset[] = [
  {
    id: 'dopamine',
    name: '도파민 (Dopamine)',
    defaultDose: 5,
    unit: 'mcg/kg/min',
    drugTotalMg: 400, // 400mg in 200ml D5W
    fluidTotalMl: 200,
    description: '신혈류 증가 및 승압제 (400mg/200mL D5W 믹스 표준)',
  },
  {
    id: 'norepinephrine',
    name: '노르에피네프린 (Norpin)',
    defaultDose: 0.1,
    unit: 'mcg/kg/min',
    drugTotalMg: 8, // 8mg in 100ml D5W
    fluidTotalMl: 100,
    description: '패혈성 쇼크 1차 선택 승압제 (8mg/100mL D5W 표준)',
  },
  {
    id: 'dobutamine',
    name: '도부타민 (Dobutamine)',
    defaultDose: 5,
    unit: 'mcg/kg/min',
    drugTotalMg: 250, // 250mg in 250ml
    fluidTotalMl: 250,
    description: '심인성 쇼크 심근 수축력 강화 (250mg/250mL 표준)',
  },
  {
    id: 'nitroglycerin',
    name: '니트로글리세린 (NTG)',
    defaultDose: 10,
    unit: 'mcg/min',
    drugTotalMg: 50, // 50mg in 250ml
    fluidTotalMl: 250,
    description: '급성 관상동맥 증후군 및 폐부종 혈관 확장제',
  },
];

export const MOCK_STUDY_GUIDES: StudyGuideItem[] = [
  {
    id: 'sg1',
    title: '도파민(Dopamine) 점적 속도 및 gtt 계산법',
    category: '약물계산/투약',
    summary: '처방 mcg/kg/min을 인퓨전 펌프 cc/hr 및 자연 점적 gtt/min으로 환산하는 완벽 공식',
    iconType: 'flask',
    iconBg: '#FFF1F4',
    author: '중환자간호사회 발췌',
    meta: '약리학 · 1일 전',
    views: 1240,
    isBookmarked: true,
    keyPoints: [
      '농도(mcg/mL) = (약물 총 mg × 1,000) ÷ 총 수액 mL',
      '시간당 주입량(mL/hr) = (처방 mcg × 체중 kg × 60분) ÷ 농도(mcg/mL)',
      '분당 방울수(gtt/min) = (mL/hr × 점적계수 20 or 60) ÷ 60',
    ],
    dangerAlert: '도파민 주입 시 말초 혈관 외 유출(Extravasation) 시 조직 괴사 위험! 중심정맥관 투여 권장.',
    fullContent: [
      '1. 환자 기본 정보(체중, 투여 경로)를 반드시 투약 직전 더블 체킹합니다.',
      '2. 표준 조제: D5W 200mL에 도파민 400mg 믹스 시 농도는 2,000mcg/mL가 됩니다.',
      '3. 60kg 환자에게 5mcg/kg/min 처방 시: (5 × 60 × 60) ÷ 2,000 = 9mL/hr로 주입합니다.',
      '4. 혈압(BP) 및 심박수(HR)를 투약 시작 후 5분, 15분, 30분 간격으로 모니터링합니다.',
    ],
  },
  {
    id: 'sg2',
    title: '한국형 전문심장소생술 (K-ACLS) 퀵 레퍼런스',
    category: '응급/ACLS',
    summary: '제세동 가능 리듬(VF/pVT)과 불가능 리듬(PEA/Asystole) 약물 투여 타이밍 완벽 정리',
    iconType: 'zap',
    iconBg: '#FEF3C7',
    author: '대한심폐소생협회 지침',
    meta: '응급간호 · 3일 전',
    views: 980,
    isBookmarked: true,
    keyPoints: [
      'VF / Pulseless VT: 2차 제세동 직후 에피네프린 1mg 투여 (매 3~5분 반복)',
      '3차 제세동 후 항부정맥제 투여: 아미오다론 300mg IV bolus (2차는 150mg)',
      'Asystole / PEA: 제세동 금기! 즉시 CPR 유지하며 에피네프린 1mg 조기 투여',
    ],
    dangerAlert: '에피네프린 투여 후 반드시 생리식염수 20mL 플러싱 및 사지 거상 필수!',
    fullContent: [
      '1. 환자 무반응 및 무호흡(비정상 호흡) 확인 즉시 코드블루 방송 및 제세동기 요청.',
      '2. 가슴 압박: 분당 100~120회, 깊이 5cm 이상 유지 (2분마다 압박자 교대).',
      '3. 모니터 분석 시 Shockable 리듬이면 충전 중에도 압박 유지, "All Clear" 후 200J 쇼크.',
      '4. 쇼크 직후 맥박 확인 없이 즉시 2분간 가슴 압박 재개.',
    ],
  },
  {
    id: 'sg3',
    title: '수혈 간호(Transfusion) 5R 및 부작용 대처 프로토콜',
    category: '간호술기',
    summary: '수혈 전 2인 의료진 교차 확인 절차 및 급성 용혈성 반응 발생 시 즉각 중재법',
    iconType: 'book',
    iconBg: '#FEE2E2',
    author: '병원간호사회 지침',
    meta: '술기 · 5일 전',
    views: 850,
    isBookmarked: false,
    keyPoints: [
      '수혈 전 V/S 측정 필수 (체온 37.5℃ 이상 시 의사 노티 후 시작 여부 결정)',
      '수혈 시작 첫 15분간은 분당 15~20gtt로 천천히 주입하며 환자 곁에서 관찰',
      '반드시 전용 18G/20G 바늘 및 수혈 필터 세트 사용 (포도당 믹스 절대 금기)',
    ],
    dangerAlert: '오한, 발열, 호흡곤란, 요통 발생 시 즉시 수혈 중단 및 N/S KVO 라인 유지!',
    fullContent: [
      '1. 혈액제제 도착 후 간호사 2인이 혈액백 라벨과 환자 팔찌(성명, 등록번호, 혈액형, 혈액번호) 대조.',
      '2. 수혈 전, 시작 15분 후, 종료 시 활력징후를 기록합니다.',
      '3. 농축적혈구(RBC) 1unit은 세균 증식 방지를 위해 4시간 이내에 주입을 완료해야 합니다.',
      '4. 부작용 의심 시 주입 즉시 중단 → V/S 측정 → 의사 노티 → 남은 혈액 은행 반납.',
    ],
  },
  {
    id: 'sg4',
    title: '전해질 불균형 (K/Na) 임상 이상 징후 및 응급 중재',
    category: '바이탈/중재',
    summary: '고칼륨혈증(Hyperkalemia) 텐트형 T파와 저나트륨혈증 의식 변화 대처',
    iconType: 'activity',
    iconBg: '#E0E7FF',
    author: '임상전문간호사',
    meta: '중환자 · 1주일 전',
    views: 710,
    isBookmarked: false,
    keyPoints: [
      'K+ > 6.0 mEq/L: 심전도 Tall T파, 칼슘글루코네이트 1g 즉시 투여로 심근 보호',
      'RI 10u + 50% DW 50mL 투여로 K+ 세포 내 이동 유도',
      'K+ IV 투여 시 절대 단독 IV Push 금기! 반드시 수액에 믹스하여 정맥 점적',
    ],
    dangerAlert: 'KCl 원액 정주 시 치명적 심정지 발생! 원액 주입 절대 금지.',
    fullContent: [
      '1. 혈청 K+ 수치가 5.5 이상이면 EKG 모니터링을 시작합니다.',
      '2. 고칼륨혈증 급성 처치: Calcium gluconate → RI + 50% DW → Kayexalate 관장.',
      '3. Na+ 저하 시(120 이하) 급격한 3% NaCl 투여는 뇌교 탈수초 위험! 천천히 교정합니다.',
    ],
  },
];

