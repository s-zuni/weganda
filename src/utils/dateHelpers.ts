import { ShiftCode } from '../constants/shiftTypes';

/**
 * 날짜 객체를 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 'YYYY-MM' 형식의 연월 문자열을 반환합니다.
 */
export function getYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 해당 월의 일수(마지막 날짜)를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 한 달 동안의 D / E / N / O / V 근무 횟수 통계를 계산합니다.
 */
export function calculateMonthlyShiftStats(schedules: { shiftCode: ShiftCode }[]) {
  const stats: Record<ShiftCode, number> = {
    D: 0,
    E: 0,
    N: 0,
    O: 0,
    V: 0,
  };

  schedules.forEach((item) => {
    if (stats[item.shiftCode] !== undefined) {
      stats[item.shiftCode]++;
    }
  });

  return stats;
}

/**
 * 특정 요일 문자열(일, 월, 화 등)을 반환합니다.
 */
export function getKoreanDayOfWeek(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

