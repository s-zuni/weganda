import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
          lightColor: '#FF507C',
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

  // 임상 퀵 프리셋 알람 스케줄링 (분 단위)
  async scheduleClinicalAlarm(params: {
    patient: string;
    content: string;
    minutes: number;
  }): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ 임상 알람: ${params.patient}`,
          body: `${params.content} (${params.minutes}분 경과)`,
          sound: true,
          data: { patient: params.patient, content: params.content },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(params.minutes * 60, 5),
        },
      });

      return identifier;
    } catch (e) {
      console.error('Error scheduling clinical alarm notification:', e);
      return null;
    }
  },

  // 등록된 알람 취소
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Error canceling notification:', e);
    }
  },
};
