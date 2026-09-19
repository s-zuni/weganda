import { ShiftCode } from './shift';

export interface FriendDetail {
  id: string; // friend's user id (profiles.id)
  friendshipId?: string; // friendship record id
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
  isVerified?: boolean; // 공식 간호사 인증 여부
}

export interface GroupChatMember {
  id: string;
  name: string;
  role: string;
  avatarLetter: string;
  avatarBg: string;
  monthlyShifts: { day: number; shift: ShiftCode }[];
  isVerified?: boolean;
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

export interface ShiftSwapProposal {
  myDate?: string;
  myShift: string;
  theirDate?: string;
  theirShift?: string;
  targetShift?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or friendId
  text: string;
  timestamp: string;
  isSwapRequest?: boolean;
  swapDetails?: ShiftSwapProposal;
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
  isVerified?: boolean;
}

