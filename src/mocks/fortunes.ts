export interface MockFortune {
  id: string;
  date: string;
  title: string;
  fortuneText: string;
  luckyItem: string;
  luckyColor: string;
  score: number;
  injectionScore: number;
  communicationScore: number;
  mentalScore: number;
}

export const MOCK_FORTUNES: Record<string, MockFortune> = {
  today: {
    id: 'fortune_today',
    date: '2026-08-27',
    title: '오늘의 간호 운세 & 바이오리듬',
    fortuneText: '오늘은 침착하고 유연한 대처가 돋보이는 날입니다. 복잡한 처방도 꼼꼼하게 확인되어 칼퇴 가능성이 매우 높습니다!',
    luckyItem: '3색 볼펜',
    luckyColor: '비바 코랄 핑크 (#FF507C)',
    score: 95,
    injectionScore: 98,
    communicationScore: 88,
    mentalScore: 92,
  },
};

