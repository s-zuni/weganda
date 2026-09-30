import { Platform } from 'react-native';
import { supabase } from './supabase';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../constants/legal';

// 로그인 시점에 사용자가 동의한 약관 버전을 서버에 기록한다(분쟁·법적 입증 대비). RLS: 본인 행만 추가/조회.
// 세션이 없으면(게스트 등) no-op. 기록 실패가 로그인 흐름을 막지 않도록 호출부에서 예외를 삼킨다.
type ConsentType = 'age14' | 'terms' | 'privacy';

const AGE14_VERSION = 'v1'; // 만 14세 이상 확인 문구 버전

const CURRENT_CONSENTS: { type: ConsentType; version: string }[] = [
  { type: 'age14', version: AGE14_VERSION },
  { type: 'terms', version: TERMS_OF_SERVICE.version },
  { type: 'privacy', version: PRIVACY_POLICY.version },
];

export const consentApi = {
  // 현재 약관 버전에 대한 동의 이력이 없는 항목만 기록
  async recordCurrentConsents(): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const { data: existing, error: selectError } = await supabase
      .from('consent_logs')
      .select('consent_type, document_version')
      .eq('user_id', userId);

    if (selectError) {
      console.error('Error fetching consent logs:', selectError);
      throw selectError;
    }

    const recorded = new Set((existing || []).map((r) => `${r.consent_type}:${r.document_version}`));
    const rows = CURRENT_CONSENTS.filter((c) => !recorded.has(`${c.type}:${c.version}`)).map((c) => ({
      user_id: userId,
      consent_type: c.type,
      document_version: c.version,
      agreed: true,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
    }));

    if (rows.length === 0) return;

    const { error } = await supabase.from('consent_logs').insert(rows);
    if (error) {
      console.error('Error recording consent logs:', error);
      throw error;
    }
  },
};
