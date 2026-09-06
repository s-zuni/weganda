import { ShiftCode } from '../constants/shiftTypes';

export interface FriendDetail {
  id: string;
  name: string;
  avatarLetter: string;
  avatarBg: string;
  hospital: string;
  ward: string;
  role: string; // e.g. '7년차 • 51병동'
  todayShift: ShiftCode;
  isFavorite: boolean;
  statusMessage: string;
  sleepStatus?: string; // e.g. '나이트 퇴근 후 취침 중 (10:00~17:00 방해금지)'
  matchingOffDaysCount: number; // 이번 달 둘 다 쉬는 날 수
  monthlyShifts: { day: number; shift: ShiftCode }[];
}

export interface GroupChatMember {
  id: string;
  name: string;
  role: string;
  avatarLetter: string;
  avatarBg: string;
  monthlyShifts: { day: number; shift: ShiftCode }[];
}

export interface GroupChat {
  id: string;
  name: string;
  category: string;
  members: GroupChatMember[];
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or friendId
  text: string;
  timestamp: string;
  isSwapRequest?: boolean;
  swapDetails?: {
    myDate?: string;
    myShift: string;
    theirDate?: string;
    theirShift?: string;
    targetShift?: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

// ── 31일 Mock 듀티 패턴 생성 헬퍼 ──
const generateShifts = (pattern: ShiftCode[]): { day: number; shift: ShiftCode }[] => {
  return Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    shift: pattern[i % pattern.length],
  }));
};

// ── 친구 상세 목록 Mock Data ──
export const MOCK_FRIENDS_DETAILS: FriendDetail[] = [
  {
    id: 'f1',
    name: '김민지',
    avatarLetter: '김',
    avatarBg: '#FFE8EE',
    hospital: '서울아산병원',
    ward: '51병동',
    role: '7년차 • 51병동',
    todayShift: 'D',
    isFavorite: true,
    statusMessage: '오늘 데이 근무 파이팅! 끝나고 커피 한잔 ☕',
    matchingOffDaysCount: 4,
    monthlyShifts: generateShifts(['D', 'D', 'D', 'O', 'O', 'E', 'E', 'N', 'N', 'O', 'O']),
  },
  {
    id: 'f2',
    name: '박수현',
    avatarLetter: '박',
    avatarBg: '#F3F4F6',
    hospital: '서울대병원',
    ward: 'ICU (중환자실)',
    role: '3년차 • ICU',
    todayShift: 'N',
    isFavorite: true,
    statusMessage: '나이트 3연속 2일차 버티는 중 🔥',
    sleepStatus: '나이트 퇴근 후 취침 중 (10:00~17:00)',
    matchingOffDaysCount: 3,
    monthlyShifts: generateShifts(['N', 'N', 'N', 'O', 'O', 'D', 'D', 'E', 'E', 'O', 'O']),
  },
  {
    id: 'f3',
    name: '유세리',
    avatarLetter: '유',
    avatarBg: '#FFF0F3',
    hospital: '세브란스병원',
    ward: '응급실 (ER)',
    role: '5년차 • 응급실',
    todayShift: 'O',
    isFavorite: true,
    statusMessage: '꿀 같은 오프날! 밀린 드라마 정주행 🎬',
    matchingOffDaysCount: 5,
    monthlyShifts: generateShifts(['O', 'O', 'D', 'D', 'E', 'E', 'N', 'N', 'O', 'O', 'D']),
  },
  {
    id: 'f4',
    name: '한준혁',
    avatarLetter: '한',
    avatarBg: '#FEF3C7',
    hospital: '서울아산병원',
    ward: '51병동',
    role: '신규 • 51병동',
    todayShift: 'E',
    isFavorite: false,
    statusMessage: '이브닝 인계 준비 중입니다. 잘 부탁드립니다!',
    matchingOffDaysCount: 2,
    monthlyShifts: generateShifts(['E', 'E', 'O', 'D', 'D', 'N', 'N', 'O', 'O', 'E', 'E']),
  },
  {
    id: 'f5',
    name: '최수진',
    avatarLetter: '최',
    avatarBg: '#EFF6FF',
    hospital: '세브란스병원',
    ward: '소아청소년과',
    role: '4년차 • 소아병동',
    todayShift: 'E',
    isFavorite: false,
    statusMessage: '아이들이 오늘은 제발 얌전하게 자주길 👶',
    matchingOffDaysCount: 3,
    monthlyShifts: generateShifts(['D', 'E', 'E', 'O', 'O', 'N', 'N', 'O', 'D', 'D', 'E']),
  },
  {
    id: 'f6',
    name: '송지원',
    avatarLetter: '송',
    avatarBg: '#DCFCE7',
    hospital: '서울아산병원',
    ward: '51병동',
    role: '2년차 • 51병동',
    todayShift: 'D',
    isFavorite: false,
    statusMessage: '오늘도 안전하게 투약 무사고 목표!',
    matchingOffDaysCount: 4,
    monthlyShifts: generateShifts(['D', 'D', 'E', 'E', 'O', 'O', 'N', 'N', 'O', 'D', 'D']),
  },
  {
    id: 'f7',
    name: '강다은',
    avatarLetter: '강',
    avatarBg: '#F5F3FF',
    hospital: '서울아산병원',
    ward: '응급실 (ER)',
    role: '3년차 • 응급실',
    todayShift: 'E',
    isFavorite: false,
    statusMessage: '트리아지 듀티 화이팅...',
    matchingOffDaysCount: 2,
    monthlyShifts: generateShifts(['E', 'E', 'N', 'N', 'O', 'O', 'D', 'D', 'O', 'E', 'E']),
  },
];

// ── 단체 톡방 Mock Data ──
export const MOCK_GROUP_CHATS: GroupChat[] = [
  {
    id: 'g1',
    name: '51병동 동기방 (4명)',
    category: '병동 동기',
    lastMessage: '김민지: 오늘 인계 특이사항 단체방에 올렸어요!',
    lastTime: '오후 1:15',
    unreadCount: 2,
    members: [
      {
        id: 'me',
        name: '나 (간호사)',
        role: '나 • 51병동',
        avatarLetter: '나',
        avatarBg: '#FF507C',
        monthlyShifts: generateShifts(['D', 'D', 'D', 'O', 'O', 'E', 'N', 'N', 'O', 'O', 'D']),
      },
      {
        id: 'f1',
        name: '김민지',
        role: '7년차 • 51병동',
        avatarLetter: '김',
        avatarBg: '#FFE8EE',
        monthlyShifts: generateShifts(['D', 'D', 'D', 'O', 'O', 'E', 'E', 'N', 'N', 'O', 'O']),
      },
      {
        id: 'f4',
        name: '한준혁',
        role: '신규 • 51병동',
        avatarLetter: '한',
        avatarBg: '#FEF3C7',
        monthlyShifts: generateShifts(['E', 'E', 'O', 'D', 'D', 'N', 'N', 'O', 'O', 'E', 'E']),
      },
      {
        id: 'f6',
        name: '송지원',
        role: '2년차 • 51병동',
        avatarLetter: '송',
        avatarBg: '#DCFCE7',
        monthlyShifts: generateShifts(['D', 'D', 'E', 'E', 'O', 'O', 'N', 'N', 'O', 'D', 'D']),
      },
    ],
  },
  {
    id: 'g2',
    name: '서울아산 응급실 모임 (3명)',
    category: '특수 파트',
    lastMessage: '유세리: 이번 주 토요일 둘 다 오프인 사람 손!',
    lastTime: '오전 11:20',
    unreadCount: 0,
    members: [
      {
        id: 'me',
        name: '나 (간호사)',
        role: '나 • 응급실',
        avatarLetter: '나',
        avatarBg: '#FF507C',
        monthlyShifts: generateShifts(['D', 'D', 'D', 'O', 'O', 'E', 'N', 'N', 'O', 'O', 'D']),
      },
      {
        id: 'f3',
        name: '유세리',
        role: '5년차 • 응급실',
        avatarLetter: '유',
        avatarBg: '#FFF0F3',
        monthlyShifts: generateShifts(['O', 'O', 'D', 'D', 'E', 'E', 'N', 'N', 'O', 'O', 'D']),
      },
      {
        id: 'f7',
        name: '강다은',
        role: '3년차 • 응급실',
        avatarLetter: '강',
        avatarBg: '#F5F3FF',
        monthlyShifts: generateShifts(['E', 'E', 'N', 'N', 'O', 'O', 'D', 'D', 'O', 'E', 'E']),
      },
    ],
  },
];

// ── 1:1 대화 초기 Mock Messages ──
export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  f1: [
    { id: 'm1', senderId: 'f1', text: '선생님 오늘 데이 근무 수고 많으셨어요!', timestamp: '오후 1:10' },
    { id: 'm2', senderId: 'me', text: '민지 선생님도요! 오늘 투약 라운딩 도와주셔서 정말 든든했어요 ☕', timestamp: '오후 1:12' },
    {
      id: 'm3',
      senderId: 'f1',
      text: '혹시 다음 주 9월 12일(금) 제 이브닝이랑 선생님 데이 맞교환 가능하실까요?',
      timestamp: '오후 1:15',
      isSwapRequest: true,
      swapDetails: {
        myShift: '9/12(금) Day',
        targetShift: '9/12(금) Evening',
        status: 'pending',
      },
    },
  ],
};

