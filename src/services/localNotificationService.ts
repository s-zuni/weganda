import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { AlarmRepeatMode } from '../types/alarm';

/** repeat 설정으로부터 알림을 울릴 누적 경과 분(offset) 목록을 계산 (단일 원천) */
export function computeAlarmOccurrenceOffsets(params: {
  repeatMode: AlarmRepeatMode;
  minutes?: number;
  intervalMinutes?: number;
  repeatCount?: number;
  customIntervals?: number[];
}): number[] {
  const { repeatMode, minutes, intervalMinutes, repeatCount, customIntervals } = params;

  if (repeatMode === 'interval' && intervalMinutes && intervalMinutes > 0) {
    const count = Math.max(1, Math.min(repeatCount || 1, 20));
    return Array.from({ length: count }, (_, i) => intervalMinutes * (i + 1));
  }

  if (repeatMode === 'custom' && customIntervals && customIntervals.length > 0) {
    let cumulative = 0;
    return customIntervals
      .filter((m) => m > 0)
      .map((m) => {
        cumulative += m;
        return cumulative;
      });
  }

  return [Math.max(minutes || 15, 1)];
}

// 앱 포그라운드 상태에서도 푸시 알림 팝업 및 소리 재생
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const localNotificationService = {
  // 알림 권한 확인 및 요청
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: '우간다 알림',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: COLORS.primary,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  },

  // 임상 퀵 프리셋 알람 스케줄링 (단발성, 분 단위) — 하위 호환용
  async scheduleClinicalAlarm(params: {
    patient: string;
    content: string;
    minutes: number;
  }): Promise<string | null> {
    const ids = await this.scheduleRepeatingClinicalAlarm({
      patient: params.patient,
      content: params.content,
      repeatMode: 'once',
      minutes: params.minutes,
    });
    return ids[0] || null;
  },

  /**
   * 반복 알람 스케줄링. repeatMode에 따라 여러 건의 로컬 알림을 순차적으로 예약하고
   * 각 알림의 식별자를 모두 반환한다 (토글/삭제 시 이 목록 전체를 취소해야 함).
   * - 'once': 단일 알림
   * - 'interval': intervalMinutes 간격으로 repeatCount회 반복 (예: 15분마다 4회)
   * - 'custom': customIntervals 순차 간격 시퀀스 (예: [15,20,25]분 → 15분 후, 그로부터 20분 후, 그로부터 25분 후)
   */
  async scheduleRepeatingClinicalAlarm(params: {
    patient: string;
    content: string;
    repeatMode: AlarmRepeatMode;
    minutes?: number;
    intervalMinutes?: number;
    repeatCount?: number;
    customIntervals?: number[];
  }): Promise<string[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const offsets = computeAlarmOccurrenceOffsets(params);
      const total = offsets.length;

      const identifiers: string[] = [];
      for (let i = 0; i < offsets.length; i++) {
        const offsetMinutes = offsets[i];
        const occurrenceLabel = total > 1 ? ` (${i + 1}/${total}회차)` : '';
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ 임상 알람: ${params.patient}${occurrenceLabel}`,
            body: `${params.content} (${offsetMinutes}분 경과)`,
            sound: true,
            data: { patient: params.patient, content: params.content },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(offsetMinutes * 60, 5),
          },
        });
        identifiers.push(identifier);
      }

      return identifiers;
    } catch (e) {
      console.error('Error scheduling repeating clinical alarm notification:', e);
      return [];
    }
  },

  // 등록된 알람 취소 (단일)
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Error canceling notification:', e);
    }
  },

  // 등록된 알람 취소 (반복 알람의 여러 예약분을 한 번에 취소)
  async cancelNotifications(notificationIds: string[]): Promise<void> {
    await Promise.all(notificationIds.map((id) => this.cancelNotification(id)));
  },
};
