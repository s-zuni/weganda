import { SHIFT_TYPES } from '../constants/shiftTypes';

/** 근무 코드(D/E/N/O 또는 사용자 정의 코드)를 화면 표시용 이름으로 변환 */
export const shiftDisplayName = (
  code: string,
  customCodes: Record<string, { name: string }> = {}
): string => {
  if (!code) return '-';
  if (customCodes[code]) return customCodes[code].name;
  return SHIFT_TYPES[code]?.shortName ?? code;
};

const OFF_SHIFT_CODES = ['O', 'OFF', '/', 'F', 'V'];

/** 표준 오프/휴가 코드 여부 (사용자 정의 오프 코드는 customCodes로 추가 판별) */
export const isOffShift = (code: string, customCodes: Record<string, { isOff?: boolean }> = {}): boolean =>
  OFF_SHIFT_CODES.includes(code) || Boolean(customCodes[code]?.isOff);
