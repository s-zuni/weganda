export interface NotificationItem {
  id: string;
  type: 'swap' | 'shift' | 'comment' | 'friend';
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'swap',
    title: '듀티 맞교환 제안 도착',
    message: '김민지님이 9월 12일(금) 데이 맞교환을 제안했습니다. 확인해 보세요!',
    timeAgo: '10분 전',
    isRead: false,
  },
  {
    id: 'notif_2',
    type: 'shift',
    title: '근무 리마인더',
    message: '오늘 데이(Day) 출근 1시간 전입니다. 안전한 투약과 인계를 응원합니다!',
    timeAgo: '1시간 전',
    isRead: false,
  },
  {
    id: 'notif_3',
    type: 'comment',
    title: '커뮤니티 새 댓글',
    message: "'혈관 안 보이는 고령 환자 IV 원샷 비결...' 글에 새로운 응원 댓글이 달렸습니다.",
    timeAgo: '3시간 전',
    isRead: true,
  },
  {
    id: 'notif_4',
    type: 'friend',
    title: '동시 오프(Off) 매칭',
    message: '이번 주 일요일(9/14) 유세리님과 둘 다 쉬는 날이에요! 약속을 잡아보세요 ☕',
    timeAgo: '어제',
    isRead: true,
  },
];

