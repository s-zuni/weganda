import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';
import { useUserStore } from '../store/useUserStore';
import { MOCK_FRIENDS_DETAILS } from '../mocks/friendsData';

export interface FriendItem {
  id: string; // friendship id
  friendUserId: string;
  name: string;
  nickname?: string;
  hospital?: string;
  ward?: string;
  experienceYears?: number;
  avatarUrl?: string;
  isFavorite: boolean;
  todayShift?: ShiftCode | string;
  matchingOffDaysCount?: number;
}

export interface MatchingOffDay {
  date: string;
  userShift: string;
  friendShift: string;
}

export const friendsApi = {
  // 내 친구 목록 조회 (FR1)
  async getFriends(userId: string): Promise<FriendItem[]> {
    if (userId === 'guest_user_preview' || useUserStore.getState().isGuest) {
      return MOCK_FRIENDS_DETAILS.map((f) => ({
        id: f.id,
        friendUserId: f.id,
        name: f.name,
        nickname: f.name,
        hospital: f.hospital,
        ward: f.ward,
        experienceYears: 3,
        isFavorite: f.isFavorite,
        todayShift: f.todayShift,
        matchingOffDaysCount: f.matchingOffDaysCount,
      }));
    }

    // 1. 내가 requester이거나 addressee인 수락된(accepted) 관계 조회
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        id, requester_id, addressee_id, status, is_favorite,
        requester:profiles!friendships_requester_id_fkey ( id, name, nickname, hospital_name, ward_name, experience_years, avatar_url ),
        addressee:profiles!friendships_addressee_id_fkey ( id, name, nickname, hospital_name, ward_name, experience_years, avatar_url )
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const results: FriendItem[] = [];
    for (const f of (friendships || []) as any[]) {
      const isRequesterMe = f.requester_id === userId;
      const targetProfile = isRequesterMe ? f.addressee : f.requester;
      if (!targetProfile) continue;

      // 오늘의 듀티 가져오기 (RLS 친구 스케줄 조회 권한 사용)
      const { data: shiftData } = await supabase
        .from('schedules')
        .select('shift_code')
        .eq('user_id', targetProfile.id)
        .eq('date', todayStr)
        .maybeSingle();

      results.push({
        id: f.id,
        friendUserId: targetProfile.id,
        name: targetProfile.name,
        nickname: targetProfile.nickname || undefined,
        hospital: targetProfile.hospital_name || undefined,
        ward: targetProfile.ward_name || undefined,
        experienceYears: targetProfile.experience_years ?? 1,
        avatarUrl: targetProfile.avatar_url || undefined,
        isFavorite: f.is_favorite ?? false,
        todayShift: (shiftData?.shift_code as ShiftCode) || 'O',
      });
    }

    // 즐겨찾기 순으로 정렬
    return results.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });
  },

  // 친구 요청 보내기 (FR2)
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<boolean> {
    const { error } = await supabase.from('friendships').insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    });

    if (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
    return true;
  },

  // 친구 요청 수락/거절 (FR3)
  async respondFriendRequest(friendshipId: string, accept: boolean): Promise<boolean> {
    if (accept) {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
      if (error) throw error;
    }
    return true;
  },

  // 즐겨찾기 토글 (FR4)
  async toggleFavorite(friendshipId: string, isFavorite: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('friendships')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', friendshipId);

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
    return true;
  },

  // 친구 삭제 (FR5)
  async deleteFriend(friendshipId: string): Promise<boolean> {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) {
      console.error('Error deleting friend:', error);
      throw error;
    }
    return true;
  },

  // 친구와 공통 오프일 계산 (RPC 함수 - FR6)
  async getMatchingOffDays(
    userId: string,
    friendUserId: string,
    yearMonth: string
  ): Promise<MatchingOffDay[]> {
    const { data, error } = await supabase.rpc('get_matching_off_days', {
      p_user_id: userId,
      p_friend_id: friendUserId,
      p_year_month: yearMonth,
    });

    if (error) {
      console.error('Error getting matching off days:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      date: row.date,
      userShift: row.user_shift,
      friendShift: row.friend_shift,
    }));
  },

  // 친구 월간 스케줄 조회 (FR7 - RLS 적용)
  async getFriendSchedule(friendUserId: string, yearMonth: string) {
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-31`;

    const { data, error } = await supabase
      .from('schedules')
      .select('date, shift_code, memo')
      .eq('user_id', friendUserId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching friend schedule:', error);
      return [];
    }
    return data || [];
  },

  // 7자리 간호사 고유번호로 프로필 검색 (FR8)
  async searchByNurseCode(userCode: string) {
    const trimmed = userCode.trim();
    if (!trimmed) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, nickname, hospital_name, ward_name, experience_years, avatar_url, user_code')
      .eq('user_code', trimmed)
      .maybeSingle();

    if (error) {
      console.error('Error searching profile by nurse code:', error);
      return null;
    }
    return data;
  },

  // 친구 직접 추가/요청 (FR9)
  async addFriendDirect(userId: string, targetUserId: string): Promise<boolean> {
    if (userId === targetUserId) {
      throw new Error('본인과는 친구를 맺을 수 없습니다.');
    }

    // 이미 존재하는 관계인지 확인
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('이미 친구로 등록된 동료 간호사입니다.');
      }
      // 대기 중이면 바로 수락 처리
      await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      return true;
    }

    const { error } = await supabase.from('friendships').insert({
      requester_id: userId,
      addressee_id: targetUserId,
      status: 'accepted',
    });

    if (error) {
      console.error('Error adding friend direct:', error);
      throw error;
    }
    return true;
  },
};

