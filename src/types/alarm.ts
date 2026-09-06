export interface ClinicalAlarm {
  id: string;
  patient: string; // e.g. "502호 김환자"
  content: string; // e.g. "AST 알러지 테스트 판독"
  triggerTime: string; // e.g. "14:15" or "15분 후"
  remainingMinutes?: number;
  isActive: boolean;
  createdAt: string;
}

