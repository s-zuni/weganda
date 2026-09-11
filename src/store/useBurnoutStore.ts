import { create } from 'zustand';

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
}

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

    // 3. 수면 부채 (Sleep Debt) 계산: 나이트 1회당 4시간, 퐁당퐁당 1회당 6시간, 3연속 나이트 1회당 8시간 수면 결손
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
    };
  },
}));

