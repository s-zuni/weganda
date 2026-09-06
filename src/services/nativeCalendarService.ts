import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { SHIFT_TYPES, ShiftCode } from '../constants/shiftTypes';

const WEGANDA_CALENDAR_TITLE = '우간다 근무표 (Weganda)';

export interface NativeEventSummary {
  hasEvents: boolean;
  summaryText: string;
  eventsCount: number;
}

export const nativeCalendarService = {
  // 1. 캘린더 권한 확인 및 요청
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Calendar permission request error:', e);
      return false;
    }
  },

  // 2. 우간다 전용 캘린더 조회 또는 생성
  async getOrCreateWegandaCalendar(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const existing = calendars.find((c) => c.title === WEGANDA_CALENDAR_TITLE);
      if (existing) {
        return existing.id;
      }

      // 캘린더 새로 생성
      let defaultCalendarSource: Calendar.Source | undefined;
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        defaultCalendarSource = defaultCalendar.source;
      } else {
        defaultCalendarSource = {
          isLocalAccount: true,
          name: 'Weganda',
          type: Calendar.SourceType.LOCAL || 'LOCAL',
        };
      }

      const newCalendarId = await Calendar.createCalendarAsync({
        title: WEGANDA_CALENDAR_TITLE,
        color: '#FF507C',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource?.id,
        source: defaultCalendarSource,
        name: 'WegandaDutyCalendar',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    } catch (e) {
      console.error('Error creating Weganda calendar:', e);
      return null;
    }
  },

  // 3. 우간다 듀티 스케줄을 시스템 기본 캘린더로 일괄 동기화 (내보내기)
  async syncDutyScheduleToNativeCalendar(
    schedules: Record<string, string>,
    targetYearMonth?: string // YYYY-MM
  ): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const calendarId = await this.getOrCreateWegandaCalendar();
      if (!calendarId) {
        return {
          success: false,
          syncedCount: 0,
          message: '스마트폰 캘린더 권한이 거부되었거나 캘린더를 생성할 수 없습니다.',
        };
      }

      // 동기화 대상 날짜 필터링
      const ymPrefix = targetYearMonth || new Date().toISOString().slice(0, 7);
      const dateKeys = Object.keys(schedules).filter((k) => k.startsWith(ymPrefix));

      if (dateKeys.length === 0) {
        return {
          success: false,
          syncedCount: 0,
          message: '동기화할 근무표 일정이 등록되어 있지 않습니다.',
        };
      }

      // 기존 등록된 해당 월 우간다 이벤트 조회 후 중복 방지 정리
      const startOfMonth = new Date(`${ymPrefix}-01T00:00:00`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

      try {
        const existingEvents = await Calendar.getEventsAsync([calendarId], startOfMonth, endOfMonth);
        for (const ev of existingEvents) {
          await Calendar.deleteEventAsync(ev.id);
        }
      } catch (delError) {
        console.warn('Error clearing existing events:', delError);
      }

      let count = 0;

      for (const dateKey of dateKeys) {
        const shiftCode = schedules[dateKey] as ShiftCode;
        if (!shiftCode) continue;

        const [y, m, d] = dateKey.split('-').map(Number);
        const shiftInfo = SHIFT_TYPES[shiftCode];
        const shiftName = shiftInfo ? shiftInfo.shortName : shiftCode;

        if (shiftCode === 'O' || shiftCode === 'V') {
          // 오프 / 휴가는 종일(All-day) 이벤트로 생성
          const allDayDate = new Date(y, m - 1, d);
          await Calendar.createEventAsync(calendarId, {
            title: `[우간다] ${shiftName} 🎉`,
            startDate: allDayDate,
            endDate: new Date(y, m - 1, d, 23, 59, 59),
            allDay: true,
            notes: '우간다(Weganda) 간호사 교대근무 캘린더 자동 등록',
          });
          count++;
        } else {
          // 데이 / 이브닝 / 나이트 시간별 이벤트 및 1시간 전 알림
          let startHour = 7;
          let startMin = 0;
          let endHour = 15;
          let endMin = 30;
          let isOvernight = false;

          if (shiftCode === 'D') {
            startHour = 7;
            startMin = 0;
            endHour = 15;
            endMin = 30;
          } else if (shiftCode === 'E') {
            startHour = 15;
            startMin = 0;
            endHour = 23;
            endMin = 0;
          } else if (shiftCode === 'N') {
            startHour = 22;
            startMin = 30;
            endHour = 7;
            endMin = 30;
            isOvernight = true;
          }

          const startDate = new Date(y, m - 1, d, startHour, startMin, 0);
          const endDate = new Date(
            isOvernight ? y : y,
            isOvernight ? m - 1 : m - 1,
            isOvernight ? d + 1 : d,
            endHour,
            endMin,
            0
          );

          await Calendar.createEventAsync(calendarId, {
            title: `[우간다] ${shiftName} 근무 (${shiftInfo?.name || shiftCode})`,
            startDate,
            endDate,
            allDay: false,
            notes: `근무 시간: ${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} ~ ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}\n우간다(Weganda) 자동 동기화`,
            alarms: [{ relativeOffset: -60 }], // 근무 시작 1시간 전 스마트폰 알림
          });
          count++;
        }
      }

      return {
        success: true,
        syncedCount: count,
        message: `${count}개의 교대근무 일정이 휴대폰 기본 캘린더에 동기화되었습니다!`,
      };
    } catch (e: any) {
      console.error('Error syncing to native calendar:', e);
      return {
        success: false,
        syncedCount: 0,
        message: e?.message || '캘린더 동기화 중 오류가 발생했습니다.',
      };
    }
  },

  // 4. 시스템 기본 캘린더에서 내일의 개인 일정 읽어오기 (가져오기)
  async getTomorrowNativeEvents(): Promise<NativeEventSummary> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { hasEvents: false, summaryText: '스케줄 추가 가능 +', eventsCount: 0 };
      }

      const today = new Date();
      const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);
      const tomorrowEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 23, 59, 59);

      const allCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      // 우간다 자체 캘린더는 제외하고 순수 개인 일정 캘린더들만 조회
      const personalCalendarIds = allCalendars
        .filter((c) => c.title !== WEGANDA_CALENDAR_TITLE)
        .map((c) => c.id);

      if (personalCalendarIds.length === 0) {
        return { hasEvents: false, summaryText: '스케줄 추가 가능 +', eventsCount: 0 };
      }

      const events = await Calendar.getEventsAsync(personalCalendarIds, tomorrowStart, tomorrowEnd);

      if (!events || events.length === 0) {
        return { hasEvents: false, summaryText: '등록된 개인 일정 없음', eventsCount: 0 };
      }

      // 첫 번째 이벤트의 시간 및 제목 요약 포맷팅
      const firstEvent = events[0];
      const eventTime = firstEvent.allDay
        ? '종일'
        : new Date(firstEvent.startDate).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

      const firstTitle = firstEvent.title || '일정';
      const countSuffix = events.length > 1 ? ` 외 ${events.length - 1}건` : '';
      const summaryText = `🗓️ ${eventTime} ${firstTitle}${countSuffix}`;

      return {
        hasEvents: true,
        summaryText,
        eventsCount: events.length,
      };
    } catch (e) {
      console.warn('Error fetching native calendar events:', e);
      return { hasEvents: false, summaryText: '스케줄 추가 가능 +', eventsCount: 0 };
    }
  },
};
