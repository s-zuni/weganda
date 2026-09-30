import { create } from 'zustand';

export interface MealStep {
  timing: string; // 예: "출근 전 (06:00~06:30)"
  mealName: string; // 예: "저혈당 예방 복합 탄수화물식"
  description: string;
  recommendedFoods: string[];
}

export interface ShiftMealGuide {
  shiftCode: 'D' | 'E' | 'N' | 'O';
  shiftName: string; // "데이 (Day)", "이브닝 (Evening)", "나이트 (Night)", "오프 (Off)"
  summary: string;
  coreRule: string; // 핵심 주의사항
  hydrationRule: string; // 수분 섭취 룰
  caffeineRule: string; // 카페인 가이드
  meals: MealStep[];
  foodsToAvoid: string[];
}

export interface DietPrescription {
  title: string;
  badge: string;
  summary: string;
  guidelines: string[];
}

export interface ShiftHealthReport {
  month: string; // YYYY-MM
  totalDutyDays: number;
  nodCount: number; // 퐁당퐁당 (N - O - D) 패턴 횟수
  consecutiveNightMax: number; // 최대 연속 나이트 일수
  consecutiveNightIncidents: number; // 3연속 이상 나이트 발생 횟수
  totalNightDays: number;
  sleepDebtHours: number; // 추정 수면 부채 시간 (시간)
  burnoutScore: number; // 0 ~ 100 점
  riskLevel: 'safe' | 'caution' | 'warning' | 'danger'; // 안전 | 주의 | 경고 | 위험
  riskTitle: string;
  advice: string;
  goldenSleepTime: string; // 최적 수면 골든타임 추천
  caffeineCutoffTime: string; // 카페인 컷오프 시간
  dietPrescription: DietPrescription; // 당월 스케줄 특화 AI 식단 처방
  shiftMealGuides: Record<'D' | 'E' | 'N' | 'O', ShiftMealGuide>; // 4대 듀티별 정밀 식단 가이드
}

export const SHIFT_MEAL_GUIDES: Record<'D' | 'E' | 'N' | 'O', ShiftMealGuide> = {
  D: {
    shiftCode: 'D',
    shiftName: '데이 (Day)',
    summary: '아침 라운딩 전 저혈당 방지와 점심 식곤증 완화에 집중합니다.',
    coreRule: '공복 출근 절대 금지! 혈당 급상승을 막는 복합 탄수화물과 가벼운 단백질 조합.',
    hydrationRule: '오전 투약/처치 중 텀블러를 비치하여 시간당 150ml씩 총 1.5L 이상 섭취',
    caffeineRule: '오전 07:30~08:00 1잔 이내 권장, 오후 14:00 이후 카페인 섭취 중단',
    meals: [
      {
        timing: '출근 전 (06:00~06:30)',
        mealName: '저혈당 방지 복합 탄수화물식',
        description: '공복 라운딩 시 식은땀과 집중력 저하를 막기 위해 혈당을 서서히 올리는 식품을 섭취합니다.',
        recommendedFoods: ['통밀 식빵 1장', '바나나 1개', '삶은 달걀 1개', '무가당 두유'],
      },
      {
        timing: '근무 중 점심 (12:30~13:30)',
        mealName: '오후 식곤증 예방 고단백·식이섬유 식단',
        description: '과도한 탄수화물은 오후 인계 시간 졸음을 유발하므로 단백질과 나물류 중심으로 구성합니다.',
        recommendedFoods: ['현미밥 2/3공기', '닭가슴살 샐러드', '생선구이', '시금치/브로콜리 나물'],
      },
      {
        timing: '퇴근 후 저녁 (18:30~19:30)',
        mealName: '교감신경 이완 및 숙면 유도식',
        description: '취침 3시간 전 식사를 마쳐 위장에 부담을 주지 않고 멜라토닌 합성을 돕습니다.',
        recommendedFoods: ['따뜻한 순두부찌개', '연어 스테이크', '데친 두부', '구운 채소'],
      },
    ],
    foodsToAvoid: ['오전 믹스커피 연속 섭취', '점심 짜장면/라면 등 밀가루 폭식', '퇴근 직전 고당류 간식'],
  },
  E: {
    shiftCode: 'E',
    shiftName: '이브닝 (Evening)',
    summary: '퇴근 후 심야 폭식과 역류성 식도염을 방지하는 야간 위장 보호 식단입니다.',
    coreRule: '퇴근 직후 기름진 야식 금지! 하루 주 식사는 출근 전 여유로운 점심으로 해결.',
    hydrationRule: '오후 15시~19시 오더 집중 구간에 미온수를 수시로 음용하여 목 건조 예방',
    caffeineRule: '출근 직후(14:00) 1잔만 허용, 16:00 이후 심야 수면을 위해 카페인 전면 차단',
    meals: [
      {
        timing: '출근 전 점심 (11:30~12:30)',
        mealName: '하루 메인 고에너지 한식',
        description: '이브닝 근무의 주 에너지원이 되도록 양질의 소화 잘되는 단백질과 잡곡을 섭취합니다.',
        recommendedFoods: ['잡곡밥', '소고기 안심구이 또는 제육볶음', '맑은 된장국', '쌈채소'],
      },
      {
        timing: '근무 중 저녁 (17:30~18:30)',
        mealName: '응급 처치 대비 가벼운 유동식',
        description: '응급실 전원, 수술 복귀 등 저녁 피크타임 복부 팽만감을 막기 위해 가볍게 섭취합니다.',
        recommendedFoods: ['단호박죽 또는 닭죽', '호밀 샌드위치 반 개', '두유', '삶은 달걀'],
      },
      {
        timing: '퇴근 후 취침 전 (23:30~24:00)',
        mealName: '위산 역류 없는 릴랙스 소량 스낵',
        description: '공복감으로 인한 입면 지연만 방지하도록 위산 자극이 전혀 없는 음료를 선택합니다.',
        recommendedFoods: ['따뜻한 카모마일 티', '데운 저지방 우유 반 컵', '구운 아몬드 5알'],
      },
    ],
    foodsToAvoid: ['퇴근 후 라면·치킨·떡볶이 등 배달 야식', '퇴근 후 맥주 한 캔 (수면 구조 파괴)', '매운 국물류'],
  },
  N: {
    shiftCode: 'N',
    shiftName: '나이트 (Night)',
    summary: '새벽 인슐린 저항성과 장 운동 정체에 맞춘 멜라토닌 보존 식단입니다.',
    coreRule: '새벽 2시 이후 탄수화물 소화 효소가 급감하므로 고체 탄수화물 섭취를 엄격히 제한합니다.',
    hydrationRule: '나이트 근무 중 찬물 대신 따뜻한 보리차/미온수로 위경련과 한기를 예방',
    caffeineRule: '새벽 03:00 정각 카페인 컷오프! 퇴근 4시간 전부터는 레몬수나 보리차로 대체',
    meals: [
      {
        timing: '출근 전 저녁 (19:30~20:30)',
        mealName: '소화 부담 없는 든든한 단백질식',
        description: '밤샘 라운딩을 버틸 수 있도록 위장에 머무는 시간이 적당한 단백질 위주로 구성합니다.',
        recommendedFoods: ['두부구이', '흰살생선', '기름기 적은 소고기뭇국', '잡곡밥 반 공기'],
      },
      {
        timing: '심야 근무 중 (01:30~02:30)',
        mealName: '소화관 휴식을 위한 스마트 미니 스낵',
        description: '심야 인슐린 분비 저하 구간이므로 혈당 스파이크가 없는 유제품이나 견과류로 허기를 달랩니다.',
        recommendedFoods: ['무가당 그릭 요거트', '삶은 달걀 1개', '블루베리 한 줌', '단백질 셰이크'],
      },
      {
        timing: '퇴근 후 아침 (08:00~08:30)',
        mealName: '숙면 방해 없는 미니 공복 해소식',
        description: '퇴근 후 거하게 먹으면 위산이 역류해 잠에서 깹니다. 과일이나 미음 소량으로 즉시 취침합니다.',
        recommendedFoods: ['바나나 반 개', '키위 1개 (수면 유도 멜라토닌 풍부)', '따뜻한 꿀물 반 잔'],
      },
    ],
    foodsToAvoid: ['새벽 03~05시 컵라면 섭취 (소화 불량 1위)', '초콜릿·도넛 등 초가공 당류', '퇴근길 순대국밥/해장국'],
  },
  O: {
    shiftCode: 'O',
    shiftName: '오프 / 휴무 (Off)',
    summary: '체내 코르티솔을 낮추고 교대근무로 손상된 장 점막과 간 해독을 돕습니다.',
    coreRule: '하루 종일 굶거나 몰아먹지 않고, 정상적인 3끼 리듬으로 생체 시계를 리셋합니다.',
    hydrationRule: '기상 직후 미온수 500ml로 신장 노폐물 배출, 하루 2L 이상 충분한 수분 공급',
    caffeineRule: '오전 10:00~12:00 가벼운 커피 1잔 허용, 오후에는 세로토닌 합성을 위해 야외 산책 추천',
    meals: [
      {
        timing: '기상 직후 (09:30~10:00)',
        mealName: '장 점막 회복 & 디톡스 스타터',
        description: '위장관 내벽을 안정시키고 교대근무 불규칙성으로 망가진 장내 미생물 생태계를 복원합니다.',
        recommendedFoods: ['미온수 1잔', '유산균', '사과 반 쪽', '따뜻한 양배추즙'],
      },
      {
        timing: '점심 (12:30~13:30)',
        mealName: '항산화 & 간 해독 영양식',
        description: '체내 누적된 활성산소를 제거하고 간 기능을 회복시키는 녹황색 채소와 불포화 지방산을 섭취합니다.',
        recommendedFoods: ['아보카도 샐러드', '연어 또는 등푸른생선구이', '올리브오일 드레싱', '귀리밥'],
      },
      {
        timing: '저녁 (18:30~19:30)',
        mealName: '세로토닌 & 트립토판 숙면식',
        description: '정상 수면 리듬 복원을 위해 멜라토닌의 전구물질인 트립토판이 풍부한 식품을 섭취합니다.',
        recommendedFoods: ['닭가슴살 채소 볶음', '따뜻한 콩나물국', '구운 버섯', '따뜻한 우유 또는 바나나'],
      },
    ],
    foodsToAvoid: ['오프 전날 야식 후 수면', '알코올(술) 과음 (REM 수면을 억제하여 피로 가중)', '배달 탄산음료'],
  },
};

interface BurnoutState {
  analyzeSchedules: (
    schedules: Record<string, string>,
    yearMonth: string,
    customCodes?: Record<string, { code: string; isOff?: boolean; name?: string }>
  ) => ShiftHealthReport;
}

export const useBurnoutStore = create<BurnoutState>(() => ({
  analyzeSchedules: (schedules, yearMonth, customCodes = {}) => {
    // 1. 해당 월의 날짜 키 정렬
    const dateKeys = Object.keys(schedules)
      .filter((k) => k.startsWith(yearMonth))
      .sort();

    let totalDutyDays = 0;
    let totalNightDays = 0;
    let nodCount = 0;
    let consecutiveNightMax = 0;
    let currentNightStreak = 0;
    let consecutiveNightIncidents = 0;

    const getNormCode = (k: string): string => {
      const raw = schedules[k];
      if (!raw) return 'O';
      if (raw === 'N' || customCodes[raw]?.name?.includes('나이트')) return 'N';
      if (raw === 'D' || customCodes[raw]?.name?.includes('데이')) return 'D';
      if (raw === 'E' || customCodes[raw]?.name?.includes('이브닝')) return 'E';
      if (raw === 'O' || raw === 'V' || raw === '/' || raw === 'OFF' || customCodes[raw]?.isOff) return 'O';
      return raw;
    };

    // 2. 일별 패턴 스캔
    for (let i = 0; i < dateKeys.length; i++) {
      const code = getNormCode(dateKeys[i]);

      if (code !== 'O') totalDutyDays++;
      if (code === 'N') {
        totalNightDays++;
        currentNightStreak++;
        if (currentNightStreak > consecutiveNightMax) {
          consecutiveNightMax = currentNightStreak;
        }
      } else {
        if (currentNightStreak >= 3) {
          consecutiveNightIncidents++;
        }
        currentNightStreak = 0;
      }

      // N - O - D (퐁당퐁당) 패턴 감지: 어제 N, 오늘 O, 내일 D
      if (i >= 1 && i < dateKeys.length - 1) {
        const prev = getNormCode(dateKeys[i - 1]);
        const curr = getNormCode(dateKeys[i]);
        const next = getNormCode(dateKeys[i + 1]);
        if (prev === 'N' && curr === 'O' && next === 'D') {
          nodCount++;
        }
      }
    }
    if (currentNightStreak >= 3) {
      consecutiveNightIncidents++;
    }

    // 3. 수면 부채 (Sleep Debt) 계산
    const sleepDebtHours = Math.min(
      60,
      totalNightDays * 3.5 + nodCount * 6 + consecutiveNightIncidents * 8
    );

    // 4. 번아웃 점수 (0 ~ 100) 산정
    let score = 20; // 기본 체력 베이스
    score += totalNightDays * 4; // 나이트 1회당 4점
    score += nodCount * 14; // 퐁당퐁당 1회당 14점 (치명적)
    score += consecutiveNightIncidents * 18; // 3연나이트 이상 회당 18점
    if (totalDutyDays >= 22) score += 15; // 초과 근무
    const burnoutScore = Math.min(98, Math.max(15, Math.round(score)));

    // 5. 위험 등급 및 조언
    let riskLevel: ShiftHealthReport['riskLevel'] = 'safe';
    let riskTitle = '안정 단계 (신체 리듬 양호)';
    let advice = '현재 근무 패턴은 신체 리듬 회복이 원활한 편입니다. 규칙적인 식사와 가벼운 유산소 운동을 유지하세요.';

    if (burnoutScore >= 80) {
      riskLevel = 'danger';
      riskTitle = '위험 단계 (신체 탈진 및 번아웃 고위험)';
      advice = '퐁당퐁당 또는 연속 나이트로 수면 결손이 매우 심각합니다. 오프 날 밀린 잠보다는 90분 단위 토막잠과 즉각적인 듀티 조율을 권장합니다.';
    } else if (burnoutScore >= 60) {
      riskLevel = 'warning';
      riskTitle = '경고 단계 (만성 피로 누적 주의)';
      advice = '나이트 근무가 집중되어 멜라토닌 분비가 억제되고 있습니다. 나이트 퇴근 시 반드시 선글라스를 착용하고 암막 커튼을 활용하세요.';
    } else if (burnoutScore >= 40) {
      riskLevel = 'caution';
      riskTitle = '주의 단계 (신체 적응 필요)';
      advice = '교대 근무 전환 구간에서 피로도가 축적되고 있습니다. 근무 전 20분 파워 냅을 추천합니다.';
    }

    // 6. 스케줄 특성에 따른 AI 맞춤 식단 처방 (Diet Prescription) 생성
    let dietPrescription: DietPrescription;
    if (totalNightDays >= 6) {
      dietPrescription = {
        title: '나이트 집중월 위장관 & 인슐린 감수성 보호 처방',
        badge: '야간 대사 케어',
        summary: '야간 근무가 집중된 달에는 심야 인슐린 감수성이 떨어져 복부 비만과 역류성 식도염 위험이 급증합니다.',
        guidelines: [
          '새벽 02시 이후에는 혈당 스파이크를 일으키는 컵라면·믹스커피 대신 삶은 달걀 또는 두유 1팩으로 허기만 달래세요.',
          '나이트 퇴근길 식사는 위산 역류를 유발하므로 바나나 1개 또는 키위로 공복감만 채우고 암막 수면에 들어가세요.',
          '오프 날에는 간 해독을 돕는 타우린·아르기닌 식품(낙지, 조개류, 브로콜리)을 점심 식단에 적극 포함하세요.',
        ],
      };
    } else if (nodCount > 0) {
      dietPrescription = {
        title: 'N-O-D(퐁당퐁당) 급격한 신체 쇼크 방어 영양 처방',
        badge: '생체 리듬 리셋',
        summary: '나이트-오프-데이 전환은 소화 효소 분비 리듬을 완전히 교란하므로 부드러운 유동식 위주의 식단이 필수적입니다.',
        guidelines: [
          '나이트 퇴근 날 점심은 절대 과식하지 말고 호박죽, 달걀찜 등 소화 흡수가 빠른 식사를 선택하세요.',
          '데이 출근 당일 아침에는 공복 라운딩을 피하기 위해 바나나와 미온수를 출근 30분 전에 섭취하세요.',
          '신경 안정과 근육 이완을 위해 마그네슘이 풍부한 견과류(아몬드 5알)와 따뜻한 카모마일 티를 수면 전에 음용하세요.',
        ],
      };
    } else if (consecutiveNightIncidents > 0) {
      dietPrescription = {
        title: '연속 나이트 탈수 & 전해질 불균형 집중 회복 처방',
        badge: '전해질·피로 회복',
        summary: '3일 이상 지속되는 연속 나이트는 체내 수분과 전해질이 급속히 고갈되어 만성 두통과 피로를 부릅니다.',
        guidelines: [
          '근무 중 찬물 대신 따뜻한 이온 음료나 미온수를 매시간 150ml씩 규칙적으로 보충하세요.',
          '고당류 에너지 드링크는 일시적 각성 후 급격한 무기력증을 유발하므로 비타민B 복합제나 과일로 대체하세요.',
          '연속 나이트가 끝난 첫 오프에는 알코올을 피하고 충분한 양질의 단백질(생선구이, 두부)로 세포 재생을 유도하세요.',
        ],
      };
    } else {
      dietPrescription = {
        title: '규칙적 생체 리듬 유지 및 면역력 강화 식단 처방',
        badge: '면역 밸런스',
        summary: '현재 안정적인 듀티 흐름을 유지하고 있습니다. 장내 미생물 균형과 규칙적인 식습관에 집중하세요.',
        guidelines: [
          '아침 기상 직후 미온수 1잔과 유산균 섭취로 장 점막을 활성화하세요.',
          '점심과 저녁은 정제 탄수화물보다는 신선한 채소와 복합 탄수화물(현미, 귀리) 비율을 50% 이상 유지하세요.',
          '오프 날 야외 산책(30분 이상)과 함께 비타민D 합성을 돕는 버섯류, 달걀노른자를 식단에 곁들이세요.',
        ],
      };
    }

    return {
      month: yearMonth,
      totalDutyDays,
      nodCount,
      consecutiveNightMax,
      consecutiveNightIncidents,
      totalNightDays,
      sleepDebtHours: Math.round(sleepDebtHours),
      burnoutScore,
      riskLevel,
      riskTitle,
      advice,
      goldenSleepTime: totalNightDays > 0 ? '오전 09:30 ~ 오후 15:30 (1차 숙면)' : '오후 23:00 ~ 오전 07:00',
      caffeineCutoffTime: totalNightDays > 0 ? '새벽 03:00 (퇴근 4시간 전 섭취 중단)' : '오후 15:00',
      dietPrescription,
      shiftMealGuides: SHIFT_MEAL_GUIDES,
    };
  },
}));
