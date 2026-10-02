import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';
import { RealtimeChannel } from '@supabase/supabase-js';
import { INITIAL_GROUP_CHAT_MESSAGES } from '../mocks/friendsData';

export interface ChatMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  isSwapRequest: boolean;
  swapDetails?: {
    myDate: string;
    myShift: ShiftCode | string;
    theirDate: string;
    theirShift: ShiftCode | string;
    status: 'pending' | 'accepted' | 'rejected';
  };
  createdAt: string;
}

export interface GroupChatMessageItem {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isVerified?: boolean;
}

const isValidUUID = (id?: string | null): boolean =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const chatApi = {
  // 1:1 채팅 메시지 기록 조회 (CH1)
  async getChatMessages(
    myUserId: string,
    friendUserId: string,
    limit: number = 50
  ): Promise<ChatMessageItem[]> {
    if (!isValidUUID(myUserId) || !isValidUUID(friendUserId)) {
      return [];
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${myUserId},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${myUserId})`
      )
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      isRead: row.is_read ?? false,
      isSwapRequest: row.is_swap_request ?? false,
      swapDetails: row.is_swap_request
        ? {
            myDate: row.swap_my_date || '',
            myShift: row.swap_my_shift || 'D',
            theirDate: row.swap_their_date || '',
            theirShift: row.swap_their_shift || 'O',
            status: (row.swap_status as any) || 'pending',
          }
        : undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  // 일반 텍스트 메시지 발송 (CH2)
  async sendTextMessage(senderId: string, receiverId: string, content: string): Promise<string> {
    if (!isValidUUID(senderId) || !isValidUUID(receiverId)) {
      return `mock_msg_${Date.now()}`;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        is_read: false,
        is_swap_request: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
    return data.id;
  },

  // 듀티 맞교환 제안 메시지 발송 (CH4)
  async sendSwapRequest(params: {
    senderId: string;
    receiverId: string;
    senderName: string;
    myDate: string;
    myShift: string;
    theirDate: string;
    theirShift: string;
  }): Promise<string> {
    if (!isValidUUID(params.senderId) || !isValidUUID(params.receiverId)) {
      return `mock_swap_${Date.now()}`;
    }
    const messageContent = `[듀티 맞교환 제안]\n내 근무: ${params.myDate}(${params.myShift}) ⇄ 동료 근무: ${params.theirDate}(${params.theirShift})`;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: params.senderId,
        receiver_id: params.receiverId,
        content: messageContent,
        is_read: false,
        is_swap_request: true,
        swap_my_date: params.myDate,
        swap_my_shift: params.myShift,
        swap_their_date: params.theirDate,
        swap_their_shift: params.theirShift,
        swap_status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error sending swap request:', error);
      throw error;
    }

    // 상대방 알림 센터에도 알림 등록
    await supabase.from('notifications').insert({
      user_id: params.receiverId,
      type: 'swap',
      title: '듀티 맞교환 제안 도착',
      message: `${params.senderName}님이 ${params.myDate} 듀티 맞교환을 제안했습니다. 확인해 보세요!`,
      related_id: data.id,
    });

    return data.id;
  },

  // 듀티 맞교환 수락 / 거절 (CH5)
  async respondToSwap(messageId: string, accept: boolean): Promise<boolean> {
    if (accept) {
      // DB 트랜잭션 함수 호출 (두 사람의 schedules 테이블 듀티 자동 스왑)
      const { data, error } = await supabase.rpc('accept_duty_swap', {
        p_message_id: messageId,
      });

      if (error) {
        console.error('Error accepting duty swap:', error);
        throw error;
      }
      return (data as any)?.success ?? true;
    } else {
      // 거절 처리
      const { error } = await supabase
        .from('chat_messages')
        .update({ swap_status: 'rejected' })
        .eq('id', messageId);

      if (error) {
        console.error('Error rejecting swap request:', error);
        throw error;
      }
      return true;
    }
  },

  // 메시지 읽음 처리 (CH3)
  async markMessagesAsRead(myUserId: string, friendUserId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('receiver_id', myUserId)
      .eq('sender_id', friendUserId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
    return true;
  },

  // 실시간 1:1 채팅 메시지 수신 구독 (CH6 - Supabase Realtime)
  subscribeToChatMessages(
    myUserId: string,
    onNewMessage: (message: ChatMessageItem) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`chat_messages:${myUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${myUserId}`,
        },
        (payload: any) => {
          const row = payload.new;
          onNewMessage({
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            isRead: row.is_read ?? false,
            isSwapRequest: row.is_swap_request ?? false,
            swapDetails: row.is_swap_request
              ? {
                  myDate: row.swap_my_date || '',
                  myShift: row.swap_my_shift || 'D',
                  theirDate: row.swap_their_date || '',
                  theirShift: row.swap_their_shift || 'O',
                  status: (row.swap_status as any) || 'pending',
                }
              : undefined,
            createdAt: row.created_at || new Date().toISOString(),
          });
        }
      )
      .subscribe();

    return channel;
  },

  // 내가 보낸 메시지의 변경(맞교환 수락/거절, 읽음 처리) 실시간 수신
  subscribeToSentMessageUpdates(
    myUserId: string,
    onUpdate: (update: { id: string; receiverId: string; swapStatus?: string; isRead: boolean }) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`chat_messages_sent:${myUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${myUserId}`,
        },
        (payload: { new: { id: string; receiver_id: string; swap_status?: string | null; is_read?: boolean | null } }) => {
          const row = payload.new;
          onUpdate({
            id: row.id,
            receiverId: row.receiver_id,
            swapStatus: row.swap_status || undefined,
            isRead: row.is_read ?? false,
          });
        }
      )
      .subscribe();

    return channel;
  },

  // 실시간 알림 구독 (N4 - Supabase Realtime)
  subscribeToNotifications(
    myUserId: string,
    onNewNotification: (notification: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`notifications:${myUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${myUserId}`,
        },
        (payload: any) => {
          onNewNotification(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  // 채널 구독 해제
  unsubscribeChannel(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },

  // 단체 대화방 메시지 기록 조회 (CH7) — 실제 방은 서버(RLS: 멤버만), 게스트/프리뷰 방은 mocks 폴백
  async getGroupChatMessages(
    groupId: string,
    limit: number = 100
  ): Promise<GroupChatMessageItem[]> {
    if (!isValidUUID(groupId)) {
      const mockList = INITIAL_GROUP_CHAT_MESSAGES[groupId] || [];
      return mockList.map((m) => ({
        id: m.id,
        groupId,
        senderId: m.senderId,
        senderName: m.sender,
        content: m.text,
        createdAt: new Date().toISOString(),
        isVerified: m.isVerified ?? true,
      }));
    }

    const { data, error } = await supabase
      .from('group_chat_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching group chat messages:', error);
      throw error;
    }

    return (data || [])
      .map((row) => ({
        id: row.id,
        groupId: row.group_id,
        senderId: row.sender_id,
        senderName: row.sender_name || '동료 간호사',
        content: row.content,
        createdAt: row.created_at || new Date().toISOString(),
        isVerified: row.is_verified ?? true,
      }))
      .reverse();
  },

  // 단체 대화방 메시지 발송 (CH8) — 실패 시 예외를 던져 UI가 알 수 있게 한다
  async sendGroupChatMessage(params: {
    groupId: string;
    senderId: string;
    senderName: string;
    content: string;
    isVerified?: boolean;
  }): Promise<string> {
    if (!isValidUUID(params.groupId) || !isValidUUID(params.senderId)) {
      return `gmsg_${Date.now()}`; // 게스트/프리뷰 방: 로컬 전용
    }

    const { data, error } = await supabase
      .from('group_chat_messages')
      .insert({
        group_id: params.groupId,
        sender_id: params.senderId,
        sender_name: params.senderName,
        content: params.content,
        is_verified: params.isVerified ?? true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error sending group chat message:', error);
      throw error;
    }
    return data.id;
  },

  // 단체 대화방 실시간 수신 구독 (CH9)
  subscribeToGroupChatMessages(
    groupId: string,
    onNewMessage: (msg: GroupChatMessageItem) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`group_chat_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: any) => {
          const row = payload.new;
          onNewMessage({
            id: row.id,
            groupId: row.group_id,
            senderId: row.sender_id,
            senderName: row.sender_name || '동료 간호사',
            content: row.content,
            createdAt: row.created_at || new Date().toISOString(),
            isVerified: row.is_verified ?? true,
          });
        }
      )
      .subscribe();

    return channel;
  },
};

