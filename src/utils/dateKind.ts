export type DateKind = 'past' | 'today' | 'future';

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = (): string => toDateKey(new Date());

/** YYYY-MM-DD 문자열 비교로 오늘 기준 과거/오늘/미래를 판별 */
export const getDateKind = (dateKey: string, today: string = todayKey()): DateKind => {
  if (dateKey === today) return 'today';
  return dateKey < today ? 'past' : 'future';
};

export const DATE_KIND_LABEL: Record<DateKind, string> = {
  past: '지난 기록',
  today: '오늘',
  future: '예정',
};

const parseKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const isValidDateKey = (key: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toDateKey(parseKey(key)) === key;
};

export const shiftDateKey = (key: string, days: number): string => {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const formatDateKeyKorean = (key: string): string => {
  const d = parseKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
};
