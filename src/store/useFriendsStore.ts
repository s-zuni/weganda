import { create } from 'zustand';
import {
  FriendDetail,
  GroupChat,
  ChatMessage,
  GroupChatMessage,
  MOCK_FRIENDS_DETAILS,
  MOCK_GROUP_CHATS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_GROUP_CHAT_MESSAGES,
} from '../mocks/friendsData';
import { friendsApi } from '../services/friendsApi';
import { chatApi } from '../services/chatApi';
import { groupChatApi } from '../services/groupChatApi';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getAppTheme } from '../constants/theme';
import { useUserStore } from './useUserStore';
import { useShiftScheduleStore } from './useShiftScheduleStore';
import { todayKey } from '../utils/dateKind';

const OFF_SHIFT_CODES = ['O', 'OFF', '/', 'F', 'V'];

// 내 근무표와 친구 월간 근무표를 대조해 둘 다 쉬는 날 수를 계산
const countMatchingOffDays = (
  monthlyShifts: { day: number; shift: string }[],
  yearMonth: string
): number => {
  const { schedules, customCodes } = useShiftScheduleStore.getState();
  return monthlyShifts.filter((s) => {
    const myCode = schedules[`${yearMonth}-${String(s.day).padStart(2, '0')}`];
    if (!myCode) return false;
    const isMyOff = OFF_SHIFT_CODES.includes(myCode) || Boolean(customCodes[myCode]?.isOff);
    return isMyOff && OFF_SHIFT_CODES.includes(s.shift);
  }).length;
};

const currentYearMonth = (): string => todayKey().slice(0, 7);

const isValidUUID = (id?: string | null): id is string =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface FriendsState {
  friends: FriendDetail[];
  groupChats: GroupChat[];
  chatMessages: Record<string, ChatMessage[]>;
  groupChatMessages: Record<string, GroupChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  activeChatChannel?: RealtimeChannel;
  activeSentChannel?: RealtimeChannel;
  activeGroupChatChannels?: Record<string, RealtimeChannel>;

  // Actions
  fetchFriends: (userId: string) => Promise<void>;
  fetchChatMessages: (myUserId: string, friendUserId: string) => Promise<void>;
  fetchGroupChatMessages: (groupId: string) => Promise<void>;
  toggleFavorite: (friendId: string) => Promise<void>;
  /** 서버 저장까지 성공하면 true, 실패하면 낙관적 메시지를 되돌리고 false */
  sendMessage: (
    friendId: string,
    text: string,
    isSwapRequest?: boolean,
    swapDetails?: ChatMessage['swapDetails'],
    myUserId?: string
  ) => Promise<boolean>;
  /** 'me'/미지정이면 로그인 사용자 정보로 발송. 실패 시 낙관적 메시지를 되돌리고 false */
  sendGroupChatMessage: (
    groupId: string,
    text: string,
    senderName?: string,
    myUserId?: string,
    isVerified?: boolean
  ) => Promise<boolean>;
  respondToSwap: (friendId: string, messageId: string, accept: boolean) => Promise<boolean>;
  fetchGroups: (userId: string) => Promise<void>;
  /** 서버 생성 성공 시 true (게스트는 로컬 생성) */
  createGroupChat: (name: string, category: string, members: FriendDetail[]) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  subscribeRealtimeChat: (myUserId: string) => void;
  unsubscribeRealtimeChat: () => void;
  subscribeRealtimeGroupChat: (groupId: string) => void;
  unsubscribeRealtimeGroupChat: (groupId: string) => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  groupChats: [],
  chatMessages: {},
  groupChatMessages: INITIAL_GROUP_CHAT_MESSAGES,
  activeGroupChatChannels: {},
  isLoading: false,
  error: null,

  // 내 단체방 목록 + 멤버 + 멤버 월간 근무표 조회 (게스트는 mocks 폴백)
  fetchGroups: async (userId) => {
    const isGuest = userId === 'guest_user_preview' || useUserStore.getState().isGuest || !isValidUUID(userId);
    if (isGuest) {
      if (get().groupChats.length === 0) set({ groupChats: MOCK_GROUP_CHATS });
      return;
    }

    try {
      const groups = await groupChatApi.getMyGroups();
      const ym = currentYearMonth();
      const theme = getAppTheme(useUserStore.getState().appThemeColor);

      const mapped: GroupChat[] = await Promise.all(
        groups.map(async (g) => {
          const rows = await groupChatApi.getGroupMemberSchedules(g.id, ym);
          const byUser: Record<string, { day: number; shift: string }[]> = {};
          rows.forEach((r) => {
            (byUser[r.userId] ||= []).push({ day: Number(r.date.slice(8, 10)), shift: r.shiftCode });
          });
          return {
            id: g.id,
            name: g.name,
            category: g.category,
            unreadCount: 0,
            lastMessage: g.lastMessage || '아직 대화가 없어요. 첫 메시지를 남겨보세요!',
            lastTime: g.lastMessageAt
              ? new Date(g.lastMessageAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              : '',
            members: g.members.map((m) => ({
              id: m.id,
              name: m.id === userId ? '나' : m.name,
              role: `${m.experienceYears ?? 1}년차 • ${m.ward || '병동'}`,
              avatarLetter: (m.id === userId ? '나' : m.name).charAt(0) || '간',
              avatarBg: m.id === userId ? theme.primary : theme.primaryTint,
              monthlyShifts: (byUser[m.id] || []) as GroupChat['members'][number]['monthlyShifts'],
            })),
          };
        })
      );
      set({ groupChats: mapped });
    } catch (e) {
      console.error('Error fetching groups from backend:', e);
    }
  },

  createGroupChat: async (name, category, members) => {
    const myId = useUserStore.getState().id;
    const isGuest = useUserStore.getState().isGuest || !isValidUUID(myId);

    if (isGuest) {
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
      return true;
    }

    try {
      await groupChatApi.createGroup(name, category, members.map((m) => m.id));
      await get().fetchGroups(myId as string);
      return true;
    } catch (e) {
      console.error('Failed to create group:', e);
      return false;
    }
  },

  leaveGroup: async (groupId) => {
    const myId = useUserStore.getState().id;
    if (isValidUUID(groupId) && isValidUUID(myId)) {
      try {
        await groupChatApi.leaveGroup(groupId, myId);
      } catch (e) {
        console.error('Failed to leave group:', e);
        return false;
      }
    }
    set((state) => ({ groupChats: state.groupChats.filter((g) => g.id !== groupId) }));
    return true;
  },

  // 친구 목록 DB 조회
  fetchFriends: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const serverFriends = await friendsApi.getFriends(userId);
      const ym = currentYearMonth();
      const isGuest = userId === 'guest_user_preview' || useUserStore.getState().isGuest;

      // 친구 스케줄 대조용 이번 달 근무표 (게스트는 mocks 폴백)
      const monthly: Record<string, { day: number; shift: string }[]> = {};
      if (isGuest) {
        MOCK_FRIENDS_DETAILS.forEach((m) => {
          monthly[m.id] = m.monthlyShifts;
        });
      } else if (serverFriends.length > 0) {
        const rows = await friendsApi.getFriendsMonthlySchedules(
          serverFriends.map((f) => f.friendUserId),
          ym
        );
        Object.entries(rows).forEach(([friendId, list]) => {
          monthly[friendId] = list.map((r) => ({ day: Number(r.date.slice(8, 10)), shift: r.shiftCode }));
        });
      }

      const mapped: FriendDetail[] = serverFriends.map((f) => {
        const monthlyShifts = (monthly[f.friendUserId || f.id] || []) as FriendDetail['monthlyShifts'];
        return {
          id: f.friendUserId || f.id,
          friendshipId: f.id,
          name: f.name,
          avatarLetter: f.name.charAt(0) || '간',
          avatarBg: getAppTheme(useUserStore.getState().appThemeColor).primary,
          hospital: f.hospital || '종합병원',
          ward: f.ward || '병동',
          role: `${f.experienceYears || 1}년차 • ${f.ward || '병동'}`,
          statusMessage: f.hospital ? `${f.hospital} 근무 중` : '오늘도 안전 간호!',
          isFavorite: f.isFavorite,
          todayShift: (f.todayShift as any) || 'O',
          matchingOffDaysCount: countMatchingOffDays(monthlyShifts, ym),
          monthlyShifts,
        };
      });
      // 친구가 없어졌을 때(삭제 등) 이전 목록이 남지 않도록 항상 교체
      set({ friends: mapped, isLoading: false, error: null });
    } catch (e) {
      console.error('Error fetching friends from backend:', e);
      set({ isLoading: false, error: '동기 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  },

  // 특정 친구와의 대화 기록 조회
  fetchChatMessages: async (myUserId: string, friendUserId: string) => {
    if (!isValidUUID(myUserId) || !isValidUUID(friendUserId)) {
      return;
    }

    try {
      const messages = await chatApi.getChatMessages(myUserId, friendUserId);
      if (messages) {
        chatApi.markMessagesAsRead(myUserId, friendUserId).catch(() => undefined);
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
      const targetFriendshipId = friend?.friendshipId || friendId;
      await friendsApi.toggleFavorite(targetFriendshipId, nextVal);
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
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isSwapRequest,
      swapDetails,
    };

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [friendId]: [...currentList, newMsg],
      },
    }));

    const senderId = myUserId || useUserStore.getState().id;
    if (!isValidUUID(senderId) || !isValidUUID(friendId)) {
      // 게스트/프리뷰: 서버 저장 없이 로컬에만 유지
      return true;
    }

    try {
      let savedId: string;
      if (isSwapRequest && swapDetails) {
        savedId = await chatApi.sendSwapRequest({
          senderId,
          receiverId: friendId,
          senderName: useUserStore.getState().name || '간호사',
          myDate: swapDetails.myDate || todayKey(),
          myShift: swapDetails.myShift,
          theirDate: swapDetails.theirDate || todayKey(),
          theirShift: swapDetails.theirShift || swapDetails.targetShift || 'O',
        });
      } else {
        savedId = await chatApi.sendTextMessage(senderId, friendId, text);
      }
      // 로컬 임시 id를 서버 id로 교체 (이후 실시간 업데이트·맞교환 응답에서 같은 id로 매칭)
      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [friendId]: (state.chatMessages[friendId] || []).map((m) =>
            m.id === localId ? { ...m, id: savedId } : m
          ),
        },
      }));
      return true;
    } catch (e) {
      console.error('Failed to send message to backend:', e);
      // 전송 실패 시 보낸 것처럼 남지 않도록 낙관적 메시지 제거
      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [friendId]: (state.chatMessages[friendId] || []).filter((m) => m.id !== localId),
        },
      }));
      return false;
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
      if (accept) {
        // 서버가 두 사람의 근무표를 교환했으므로 내 근무표를 다시 불러온다
        const swap = currentList.find((m) => m.id === messageId)?.swapDetails;
        const myId = useUserStore.getState().id;
        if (myId && swap) {
          const months = new Set(
            [swap.myDate, swap.theirDate].filter((d): d is string => !!d).map((d) => d.slice(0, 7))
          );
          months.forEach((ym) => useShiftScheduleStore.getState().fetchMonthlySchedule(myId, ym));
        }
        if (myId) get().fetchFriends(myId);
      }
      return true;
    } catch (e) {
      console.error('Failed to respond to swap on backend:', e);
      // 서버 반영 실패 시 낙관적 상태 되돌리기
      set((state) => ({
        chatMessages: { ...state.chatMessages, [friendId]: currentList },
      }));
      return false;
    }
  },

  // Supabase Realtime 채널 구독
  subscribeRealtimeChat: (myUserId: string) => {
    const existing = get().activeChatChannel;
    if (existing) {
      chatApi.unsubscribeChannel(existing);
    }

    const existingSent = get().activeSentChannel;
    if (existingSent) {
      chatApi.unsubscribeChannel(existingSent);
    }

    const channel = chatApi.subscribeToChatMessages(myUserId, (newMsg) => {
      const friendId = newMsg.senderId;
      const currentList = get().chatMessages[friendId] || [];
      if (currentList.some((m) => m.id === newMsg.id)) return; // 중복 수신 방지
      const msgItem: ChatMessage = {
        id: newMsg.id,
        senderId: 'other',
        text: newMsg.content,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isSwapRequest: newMsg.isSwapRequest,
        swapDetails: newMsg.swapDetails
          ? { ...newMsg.swapDetails, targetShift: newMsg.swapDetails.theirShift }
          : undefined,
      };

      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [friendId]: [...(state.chatMessages[friendId] || []), msgItem],
        },
      }));
    });

    // 내가 보낸 맞교환 제안이 상대방에 의해 수락/거절되면 상태를 실시간 반영
    const sentChannel = chatApi.subscribeToSentMessageUpdates(myUserId, (update) => {
      if (!update.swapStatus) return;
      set((state) => {
        const list = state.chatMessages[update.receiverId];
        if (!list) return state;
        return {
          chatMessages: {
            ...state.chatMessages,
            [update.receiverId]: list.map((m) =>
              m.id === update.id && m.swapDetails
                ? { ...m, swapDetails: { ...m.swapDetails, status: update.swapStatus as 'pending' | 'accepted' | 'rejected' } }
                : m
            ),
          },
        };
      });
      if (update.swapStatus === 'accepted') {
        useShiftScheduleStore.getState().fetchMonthlySchedule(myUserId);
      }
    });

    set({ activeChatChannel: channel, activeSentChannel: sentChannel });
  },

  unsubscribeRealtimeChat: () => {
    const existing = get().activeChatChannel;
    if (existing) {
      chatApi.unsubscribeChannel(existing);
      set({ activeChatChannel: undefined });
    }
    const sent = get().activeSentChannel;
    if (sent) {
      chatApi.unsubscribeChannel(sent);
      set({ activeSentChannel: undefined });
    }
  },

  // 단체 톡방 대화 기록 조회 (서비스 계층 경유)
  fetchGroupChatMessages: async (groupId: string) => {
    try {
      const myId = useUserStore.getState().id;
      const messages = await chatApi.getGroupChatMessages(groupId);
      const mapped: GroupChatMessage[] = messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        sender: m.senderName,
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === 'me' || (!!myId && m.senderId === myId),
        isVerified: m.isVerified,
      }));
      set((state) => ({
        groupChatMessages: { ...state.groupChatMessages, [groupId]: mapped },
      }));
    } catch (e) {
      console.error('Error fetching group chat messages:', e);
    }
  },

  // 단체 톡방 메시지 발송 (낙관적 UI + 서비스 계층 경유)
  sendGroupChatMessage: async (groupId, text, senderName, myUserId, isVerified = true) => {
    const user = useUserStore.getState();
    const senderId = !myUserId || myUserId === 'me' ? user.id || 'me' : myUserId;
    const name = !senderName || senderName === '나 (간호사)' ? user.nickname || user.name || '나 (간호사)' : senderName;
    const localId = `gmsg_${Date.now()}`;
    const newMsg: GroupChatMessage = {
      id: localId,
      senderId,
      sender: name,
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isVerified,
    };

    set((state) => ({
      groupChatMessages: {
        ...state.groupChatMessages,
        [groupId]: [...(state.groupChatMessages[groupId] || []), newMsg],
      },
    }));

    try {
      const savedId = await chatApi.sendGroupChatMessage({
        groupId,
        senderId,
        senderName: name,
        content: text,
        isVerified,
      });
      set((state) => ({
        groupChatMessages: {
          ...state.groupChatMessages,
          [groupId]: (state.groupChatMessages[groupId] || []).map((m) =>
            m.id === localId ? { ...m, id: savedId } : m
          ),
        },
      }));
      return true;
    } catch (e) {
      console.error('Failed to send group chat message:', e);
      set((state) => ({
        groupChatMessages: {
          ...state.groupChatMessages,
          [groupId]: (state.groupChatMessages[groupId] || []).filter((m) => m.id !== localId),
        },
      }));
      return false;
    }
  },

  // 단체 톡방 실시간 구독
  subscribeRealtimeGroupChat: (groupId: string) => {
    const existing = get().activeGroupChatChannels?.[groupId];
    if (existing) {
      chatApi.unsubscribeChannel(existing);
    }

    const channel = chatApi.subscribeToGroupChatMessages(groupId, (newMsg) => {
      const myId = useUserStore.getState().id;
      if (newMsg.senderId === 'me' || (myId && newMsg.senderId === myId)) return; // 내 메시지는 낙관적 UI로 이미 표시
      const currentList = get().groupChatMessages[groupId] || [];
      if (currentList.some((m) => m.id === newMsg.id)) return; // 중복 방지
      const item: GroupChatMessage = {
        id: newMsg.id,
        senderId: newMsg.senderId,
        sender: newMsg.senderName,
        text: newMsg.content,
        time: new Date(newMsg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        isVerified: newMsg.isVerified,
      };

      set((state) => ({
        groupChatMessages: {
          ...state.groupChatMessages,
          [groupId]: [...(state.groupChatMessages[groupId] || []), item],
        },
      }));
    });

    set((state) => ({
      activeGroupChatChannels: {
        ...state.activeGroupChatChannels,
        [groupId]: channel,
      },
    }));
  },

  unsubscribeRealtimeGroupChat: (groupId: string) => {
    const channel = get().activeGroupChatChannels?.[groupId];
    if (channel) {
      chatApi.unsubscribeChannel(channel);
      set((state) => {
        const updated = { ...state.activeGroupChatChannels };
        delete updated[groupId];
        return { activeGroupChatChannels: updated };
      });
    }
  },
}));

