export type AlarmRepeatMode = 'once' | 'interval' | 'custom';

export interface ClinicalAlarm {
  id: string;
  patient: string; // e.g. "502호 김환자"
  content: string; // e.g. "AST 알러지 테스트 판독"
  triggerTime: string; // e.g. "14:15" or "15분 후"
  remainingMinutes?: number;
  isActive: boolean;
  createdAt: string;

  /** 알람 반복 방식: 'once'(1회) / 'interval'(고정 간격 반복) / 'custom'(커스텀 간격 시퀀스) */
  repeatMode?: AlarmRepeatMode;
  /** 'interval' 모드: 몇 분마다 반복할지 (예: 15분마다) */
  intervalMinutes?: number;
  /** 'interval' 모드: 총 반복 횟수 (예: 4회) */
  repeatCount?: number;
  /** 'custom' 모드: 순차적으로 이어지는 간격 목록, 분 단위 (예: [15, 20, 25] → 15분 후 → 그로부터 20분 후 → 그로부터 25분 후) */
  customIntervals?: number[];
  /** 실제 기기에 예약된 로컬 알림 식별자 목록 (반복 시 여러 건 발생 — 토글/삭제 시 함께 취소) */
  notificationIds?: string[];
}
