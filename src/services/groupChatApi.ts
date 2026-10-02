import { supabase } from './supabase';

export interface GroupMemberItem {
  id: string;
  name: string;
  ward?: string;
  experienceYears?: number;
}

export interface GroupItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  members: GroupMemberItem[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface GroupShiftRow {
  userId: string;
  date: string; // YYYY-MM-DD
  shiftCode: string;
}

interface RawMember {
  id: string;
  name: string | null;
  ward: string | null;
  experience: number | null;
}

interface RawGroupRow {
  group_id: string;
  name: string;
  category: string;
  created_at: string;
  members: RawMember[] | null;
  last_message: string | null;
  last_message_at: string | null;
}

export const groupChatApi = {
  // 내가 속한 단체방 목록 + 멤버 + 마지막 메시지 (RLS: 멤버만 조회)
  async getMyGroups(): Promise<GroupItem[]> {
    const { data, error } = await supabase.rpc('get_my_groups');
    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
    return ((data || []) as RawGroupRow[]).map((row) => ({
      id: row.group_id,
      name: row.name,
      category: row.category,
      createdAt: row.created_at,
      members: (row.members || []).map((m) => ({
        id: m.id,
        name: m.name || '동료 간호사',
        ward: m.ward || undefined,
        experienceYears: m.experience ?? undefined,
      })),
      lastMessage: row.last_message || undefined,
      lastMessageAt: row.last_message_at || undefined,
    }));
  },

  // 단체방 생성 — 서버가 친구 관계를 검증하고 그룹·멤버를 원자적으로 만든다
  async createGroup(name: string, category: string, memberIds: string[]): Promise<string> {
    const { data, error } = await supabase.rpc('create_group_chat', {
      p_name: name,
      p_category: category,
      p_member_ids: memberIds,
    });
    if (error) {
      console.error('Error creating group:', error);
      throw error;
    }
    return data as string;
  },

  // 단체방 나가기 (내 멤버십 삭제)
  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
    return true;
  },

  // 같은 그룹 멤버들의 월간 근무표 (스케줄 비교용)
  async getGroupMemberSchedules(groupId: string, yearMonth: string): Promise<GroupShiftRow[]> {
    const { data, error } = await supabase.rpc('get_group_member_schedules', {
      p_group_id: groupId,
      p_year_month: yearMonth,
    });
    if (error) {
      console.error('Error fetching group schedules:', error);
      return [];
    }
    return ((data || []) as { user_id: string; date: string; shift_code: string }[]).map((r) => ({
      userId: r.user_id,
      date: r.date,
      shiftCode: r.shift_code,
    }));
  },
};
