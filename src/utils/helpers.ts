/**
 * 문자열이 비어있는지 확인합니다.
 */
export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

/**
 * 숫자에 천 단위 콤마(,)를 추가합니다.
 */
export function formatNumberWithComma(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 텍스트 말줄임표 처리 (truncate)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

