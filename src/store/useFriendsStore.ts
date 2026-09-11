import { create } from 'zustand';
import {
  FriendDetail,
  GroupChat,
  ChatMessage,
  MOCK_FRIENDS_DETAILS,
  MOCK_GROUP_CHATS,
  INITIAL_CHAT_MESSAGES,
} from '../mocks/friendsData';
import { friendsApi } from '../services/friendsApi';
import { chatApi } from '../services/chatApi';
import { RealtimeChannel } from '@supabase/supabase-js';

interface FriendsState {
  friends: FriendDetail[];
  groupChats: GroupChat[];
  chatMessages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  activeChatChannel?: RealtimeChannel;

  // Actions
  fetchFriends: (userId: string) => Promise<void>;
  fetchChatMessages: (myUserId: string, friendUserId: string) => Promise<void>;
  toggleFavorite: (friendId: string) => Promise<void>;
  sendMessage: (
    friendId: string,
    text: string,
    isSwapRequest?: boolean,
    swapDetails?: ChatMessage['swapDetails'],
    myUserId?: string
  ) => Promise<void>;
  respondToSwap: (friendId: string, messageId: string, accept: boolean) => Promise<void>;
  createGroupChat: (name: string, category: string, members: FriendDetail[]) => void;
  subscribeRealtimeChat: (myUserId: string) => void;
  unsubscribeRealtimeChat: () => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  groupChats: [],
  chatMessages: {},
  isLoading: false,

  createGroupChat: (name: string, category: string, members: FriendDetail[]) => {
    const newGroup: GroupChat = {
      id: `group_${Date.now()}`,
      name,
      category,
      unreadCount: 0,
      lastMessage: '단체 모임이 개설되었습니다.',
      lastTime: '방금',
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        avatarLetter: m.avatarLetter,
        avatarBg: m.avatarBg,
        todayShift: m.todayShift,
        monthlyShifts: m.monthlyShifts,
      })),
    };
    set((state) => ({ groupChats: [newGroup, ...state.groupChats] }));
  },

  // 친구 목록 DB 조회
  fetchFriends: async (userId: string) => {
    try {
      set({ isLoading: true });
      const serverFriends = await friendsApi.getFriends(userId);
      if (serverFriends && serverFriends.length > 0) {
        const mapped: FriendDetail[] = serverFriends.map((f) => ({
          id: f.id,
          name: f.name,
          avatarLetter: f.name.charAt(0) || '간',
          avatarBg: '#FF507C',
          hospital: f.hospital || '종합병원',
          ward: f.ward || '병동',
          role: `${f.experienceYears || 1}년차 • ${f.ward || '병동'}`,
          statusMessage: f.hospital ? `${f.hospital} 근무 중` : '오늘도 안전 간호!',
          isFavorite: f.isFavorite,
          todayShift: (f.todayShift as any) || 'O',
          matchingOffDaysCount: f.matchingOffDaysCount || 0,
          monthlyShifts: [],
        }));
        set({ friends: mapped, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Error fetching friends from backend:', e);
      set({ isLoading: false });
    }
  },

  // 특정 친구와의 대화 기록 조회
  fetchChatMessages: async (myUserId: string, friendUserId: string) => {
    try {
      const messages = await chatApi.getChatMessages(myUserId, friendUserId);
      if (messages) {
        const mapped: ChatMessage[] = messages.map((m) => ({
          id: m.id,
          senderId: m.senderId === myUserId ? 'me' : 'other',
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isSwapRequest: m.isSwapRequest,
          swapDetails: m.swapDetails
            ? {
                myDate: m.swapDetails.myDate,
                myShift: m.swapDetails.myShift,
                theirDate: m.swapDetails.theirDate,
                theirShift: m.swapDetails.theirShift,
                targetShift: m.swapDetails.theirShift,
                status: m.swapDetails.status,
              }
            : undefined,
        }));
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [friendUserId]: mapped,
          },
        }));
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    }
  },

  // 즐겨찾기 토글
  toggleFavorite: async (friendId: string) => {
    const friend = get().friends.find((f) => f.id === friendId);
    const nextVal = !friend?.isFavorite;

    set((state) => {
      const updated = state.friends.map((f) =>
        f.id === friendId ? { ...f, isFavorite: nextVal } : f
      );
      const sorted = [...updated].sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return 0;
        return a.isFavorite ? -1 : 1;
      });
      return { friends: sorted };
    });

    try {
      await friendsApi.toggleFavorite(friendId, nextVal);
    } catch (e) {
      console.error('Failed to toggle favorite on backend:', e);
    }
  },

  // 메시지 발송 (낙관적 UI + DB 저장)
  sendMessage: async (friendId, text, isSwapRequest, swapDetails, myUserId) => {
    const currentList = get().chatMessages[friendId] || [];
    const localId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: localId,
      senderId: 'me',
      text,
      timestamp: '방금 전',
      isSwapRequest,
      swapDetails,
    };

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [friendId]: [...currentList, newMsg],
      },
    }));

    if (myUserId) {
      try {
        if (isSwapRequest && swapDetails) {
          await chatApi.sendSwapRequest({
            senderId: myUserId,
            receiverId: friendId,
            senderName: '나 (간호사)',
            myDate: swapDetails.myDate || new Date().toISOString().split('T')[0],
            myShift: swapDetails.myShift,
            theirDate: swapDetails.theirDate || new Date().toISOString().split('T')[0],
            theirShift: swapDetails.theirShift || swapDetails.targetShift || 'O',
          });
        } else {
          await chatApi.sendTextMessage(myUserId, friendId, text);
        }
      } catch (e) {
        console.error('Failed to send message to backend:', e);
      }
    }
  },

  // 맞교환 수락 / 거절 (원자적 DB 트랜잭션 호출)
  respondToSwap: async (friendId, messageId, accept) => {
    const currentList = get().chatMessages[friendId] || [];
    const updated = currentList.map((m) =>
      m.id === messageId && m.swapDetails
        ? {
            ...m,
            swapDetails: {
              ...m.swapDetails,
              status: accept ? ('accepted' as const) : ('rejected' as const),
            },
          }
        : m
    );

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [friendId]: updated,
      },
    }));

    try {
      await chatApi.respondToSwap(messageId, accept);
    } catch (e) {
      console.error('Failed to respond to swap on backend:', e);
    }
  },

  // Supabase Realtime 채널 구독
  subscribeRealtimeChat: (myUserId: string) => {
    const existing = get().activeChatChannel;
    if (existing) {
      chatApi.unsubscribeChannel(existing);
    }

    const channel = chatApi.subscribeToChatMessages(myUserId, (newMsg) => {
      const friendId = newMsg.senderId;
      const currentList = get().chatMessages[friendId] || [];
      const msgItem: ChatMessage = {
        id: newMsg.id,
        senderId: 'other',
        text: newMsg.content,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isSwapRequest: newMsg.isSwapRequest,
        swapDetails: newMsg.swapDetails as any,
      };

      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [friendId]: [...currentList, msgItem],
        },
      }));
    });

    set({ activeChatChannel: channel });
  },

  unsubscribeRealtimeChat: () => {
    const existing = get().activeChatChannel;
    if (existing) {
      chatApi.unsubscribeChannel(existing);
      set({ activeChatChannel: undefined });
    }
  },
}));

