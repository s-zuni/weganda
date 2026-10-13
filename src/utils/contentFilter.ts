/**
 * contentFilter.ts
 * 커뮤니티 부적절한 콘텐츠 및 비속어/욕설/혐오 표현 실시간 필터링 유틸
 * (Apple App Store Guideline 1.2 Safety - User Generated Content 준수)
 */

// 부적절/유해/욕설/비하 키워드 목록
// 간호 임상 용어(자살·자해·마약·대마 등)와 일반 단어("새끼손가락", "장애자" 등 부분 일치)가
// 정상 게시글을 막지 않도록 욕설·혐오·성매매·불법도박 위주로 한정한다.
const OBJECTIONABLE_KEYWORDS = [
  '시발', '씨발', '개새끼', '병신', '지랄', '존나', '썅', '미친년', '미친놈',
  '창녀', '꺼져', '닥쳐', '정신병자',
  'ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㄲㅈ', 'ㄷㅊ', '섹스', '야동', '조건만남',
  '성매매', '불법도박', '카지노'
];

export interface FilterResult {
  hasObjectionableContent: boolean;
  matchedWord?: string;
}

/**
 * 텍스트 내 유해/부적절 단어 포함 여부 검사
 */
export const checkObjectionableContent = (text: string): FilterResult => {
  if (!text || typeof text !== 'string') {
    return { hasObjectionableContent: false };
  }

  const normalized = text.replace(/[\s\-_.,!?~`@#$%^&*()+=/\\|<>]/g, '').toLowerCase();

  for (const keyword of OBJECTIONABLE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        hasObjectionableContent: true,
        matchedWord: keyword,
      };
    }
  }

  return { hasObjectionableContent: false };
};

/**
 * 게시글 제목 및 본문 검증 헬퍼
 */
export const validatePostContent = (
  title: string,
  content: string
): { isValid: boolean; errorMessage?: string } => {
  const titleCheck = checkObjectionableContent(title);
  if (titleCheck.hasObjectionableContent) {
    return {
      isValid: false,
      errorMessage: '제목에 커뮤니티 가이드라인에 위배되는 부적절한 단어가 포함되어 있습니다.',
    };
  }

  const contentCheck = checkObjectionableContent(content);
  if (contentCheck.hasObjectionableContent) {
    return {
      isValid: false,
      errorMessage: '본문에 커뮤니티 가이드라인에 위배되는 부적절한 단어가 포함되어 있습니다.',
    };
  }

  return { isValid: true };
};

