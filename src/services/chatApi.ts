import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';
import { RealtimeChannel } from '@supabase/supabase-js';

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

export const chatApi = {
  // 1:1 채팅 메시지 기록 조회 (CH1)
  async getChatMessages(
    myUserId: string,
    friendUserId: string,
    limit: number = 50
  ): Promise<ChatMessageItem[]> {
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
};

