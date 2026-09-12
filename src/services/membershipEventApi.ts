import { supabase } from './supabase';
import { MembershipEventConfig } from '../types/membershipEvent';

const CONFIG_ROW_ID = 1;

export const membershipEventApi = {
  // 무료체험/얼리버드 할인 프로모션 설정 조회 — 로그인 여부와 무관하게 전체 사용자가 동일한 값을 본다.
  async getConfig(): Promise<MembershipEventConfig | null> {
    const { data, error } = await supabase
      .from('membership_event_config')
      .select('config')
      .eq('id', CONFIG_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      console.warn('[membershipEventApi] getConfig failed:', error?.message);
      return null;
    }

    return data.config as MembershipEventConfig;
  },

  // 프로모션 설정 갱신 — RLS가 관리자(check_is_admin())만 허용하므로,
  // 관리자가 아닌 사용자가 호출하면 서버에서 거부되어 false를 반환한다.
  async updateConfig(config: MembershipEventConfig): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();

    // RLS가 관리자가 아닌 요청을 조용히 0건 갱신으로 걸러내므로(에러 없이 실패),
    // .select()로 실제 갱신된 행이 있는지까지 확인해야 "권한 없는 요청이 성공한 척" 되는 것을 막을 수 있다.
    const { data, error } = await supabase
      .from('membership_event_config')
      .update({
        config,
        updated_at: new Date().toISOString(),
        updated_by: userData?.user?.id || null,
      })
      .eq('id', CONFIG_ROW_ID)
      .select('id');

    if (error) {
      console.warn('[membershipEventApi] updateConfig failed:', error.message);
      return false;
    }
    if (!data || data.length === 0) {
      console.warn('[membershipEventApi] updateConfig: no row updated (permission denied or missing row).');
      return false;
    }
    return true;
  },
};
