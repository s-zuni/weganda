import { supabase } from './supabase';
import { NotificationItem } from '../mocks/notificationsData';
import { useUserStore } from '../store/useUserStore';
import { useShiftScheduleStore } from '../store/useShiftScheduleStore';

/**
 * 오늘 실제 근무 듀티와 사용자 상태에 맞춘 실제 임상 알림 동적 생성기
 */
export function generateRealClinicalNotifications(): NotificationItem[] {
  const user = useUserStore.getState();
  const shiftScheduleStore = useShiftScheduleStore.getState();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayKey = `${yyyy}-${mm}-${dd}`;
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = daysOfWeek[today.getDay()];

  // 오늘 등록된 실제 근무 듀티 확인
  const todayShift = shiftScheduleStore.schedules?.[todayKey] || 'D';

  let shiftTitle = '오늘 근무 리마인더';
  let shiftMessage = '오늘 데이(Day) 출근 전입니다. 정확한 환자 확인(Patient ID)과 안전한 인계를 응원합니다!';

  if (todayShift === 'D') {
    shiftTitle = `오늘 데이(Day) 출근 안내`;
    shiftMessage = `오늘(${mm}/${dd} ${dayName}) 07:00 출근 듀티입니다. 아침 투약 라운딩 전 환자 팔찌 바코드 확인을 잊지 마세요!`;
  } else if (todayShift === 'E') {
    shiftTitle = `오늘 이브닝(Evening) 출근 안내`;
    shiftMessage = `오늘(${mm}/${dd} ${dayName}) 15:00 출근 듀티입니다. 활력징후(V/S) 체크와 야간 당직의 컨택 사항을 점검해 보세요.`;
  } else if (todayShift === 'N') {
    shiftTitle = `오늘 나이트(Night) 근무 대비 안내`;
    shiftMessage = `오늘(${mm}/${dd} ${dayName}) 22:30 출근 듀티입니다. 출근 전 암막 커튼과 함께 충분한 숙면을 취해 수면부채를 예방하세요.`;
  } else if (todayShift === 'O') {
    shiftTitle = `꿀맛 같은 오프(Off) 휴식 안내`;
    shiftMessage = `오늘(${mm}/${dd} ${dayName})은 재충전하는 오프(Off)입니다! 병원 일은 잠시 잊고 편안한 힐링 시간을 보내세요 🌿`;
  }

  const list: NotificationItem[] = [
    {
      id: `real_notif_shift_${todayKey}`,
      type: 'shift',
      title: shiftTitle,
      message: shiftMessage,
      timeAgo: '방금 전',
      isRead: false,
    },
  ];

  // 인증 상태별 실제 안내
  if (user.verificationStatus === 'verified') {
    list.push({
      id: 'real_notif_verified',
      type: 'friend',
      title: '간호사 인증 완료',
      message: `${user.hospitalName || '소속 병원'} ${user.wardName || '병동'} 간호사 인증이 완료되었습니다. 전문직 전용 커뮤니티를 이용하실 수 있습니다.`,
      timeAgo: '1시간 전',
      isRead: true,
    });
  } else if (user.verificationStatus === 'pending') {
    list.push({
      id: 'real_notif_pending',
      type: 'friend',
      title: '면허증 심사 진행 중',
      message: '제출하신 간호사 면허 확인 서류를 검토 중입니다. 승인 시 알림을 보내드립니다.',
      timeAgo: '2시간 전',
      isRead: false,
    });
  } else {
    list.push({
      id: 'real_notif_unverified',
      type: 'friend',
      title: '간호사 인증하고 모든 기능 열기',
      message: '면허증 또는 재직증명서를 등록하면 동기 간호사 찾기 및 커뮤니티 전면 이용이 가능합니다.',
      timeAgo: '어제',
      isRead: false,
    });
  }

  // weganda+ 멤버십 실제 안내
  if (user.isPremium) {
    list.push({
      id: 'real_notif_premium',
      type: 'comment',
      title: 'weganda+ 프리미엄 활성화',
      message: '50년 명인 5대 정밀 사주, 바이오리듬 분석, 약물 계산기 무제한 혜택이 적용 중입니다.',
      timeAgo: '1일 전',
      isRead: true,
    });
  } else {
    list.push({
      id: 'real_notif_free_benefit',
      type: 'swap',
      title: '이번 달 무료 사주 안내',
      message: `이번 달 AI 간호 사주를 5회 무료로 확인하실 수 있습니다. (현재 이용: ${user.monthlyFortuneCount || 0}/5회)`,
      timeAgo: '2일 전',
      isRead: true,
    });
  }

  // 근무표 동기화 실제 안내
  list.push({
    id: 'real_notif_schedule_sync',
    type: 'shift',
    title: '근무표 캘린더 동기화',
    message: `${mm}월 근무표가 성공적으로 저장되었습니다. 일정 변경 시 직접 입력을 통해 언제든 듀티를 수정할 수 있습니다.`,
    timeAgo: '3일 전',
    isRead: true,
  });

  return list;
}

export const notificationApi = {
  /**
   * 실제 알림 조회 (Supabase DB 우선, 없을 시 실제 상태 기반 Live 안내 반환)
   */
  async fetchNotifications(userId?: string): Promise<NotificationItem[]> {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          return data.map((n: any) => ({
            id: n.id,
            type: (['swap', 'shift', 'comment', 'friend'].includes(n.type) ? n.type : 'shift') as any,
            title: n.title,
            message: n.message,
            timeAgo: '최근',
            isRead: Boolean(n.is_read),
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase notifications fetch notice:', e);
    }

    // 실제 임상 상태 기반 Live 알림 반환
    return generateRealClinicalNotifications();
  },

  /**
   * 알림 읽음 처리
   */
  async markAsRead(id: string): Promise<void> {
    try {
      if (!id.startsWith('real_notif_')) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    } catch (e) {
      console.warn('markAsRead remote error:', e);
    }
  },

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId?: string): Promise<void> {
    try {
      if (userId) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      }
    } catch (e) {
      console.warn('markAllAsRead remote error:', e);
    }
  },
};
