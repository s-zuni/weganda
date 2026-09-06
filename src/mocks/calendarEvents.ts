export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  location?: string;
}

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal_1',
    date: '2026-08-20',
    time: '17:30',
    title: '간호님과의 저녁 약속',
    location: '강남역 11번 출구',
  },
  {
    id: 'cal_2',
    date: '2026-08-20',
    time: '20:00',
    title: '필라테스 개인 레슨',
    location: '스튜디오 B',
  },
  {
    id: 'cal_3',
    date: '2026-08-22',
    time: '12:00',
    title: '동기 모임 브런치',
    location: '성수동 카페거리',
  },
];

