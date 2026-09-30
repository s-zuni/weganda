// [임시 진단] 로그인 직후 로그인 화면으로 되돌아오는 현상 추적용 인메모리 로그.
// 릴리스(TestFlight)에서는 콘솔을 볼 수 없으므로, 로그인 화면 타이틀을 길게 눌러 확인한다. 원인 확정 후 제거.
const MAX_ENTRIES = 80;
const entries: string[] = [];

export const authDebug = (tag: string, detail?: string): void => {
  const time = new Date().toISOString().slice(11, 23);
  const line = `${time} ${tag}${detail ? ` ${detail}` : ''}`;
  entries.push(line);
  if (entries.length > MAX_ENTRIES) entries.shift();
  if (__DEV__) console.log('[AUTH]', line);
};

export const getAuthDebugLog = (): string => (entries.length ? entries.join('\n') : '(기록 없음)');
