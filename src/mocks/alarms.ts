export interface ClinicalAlarm {
  id: string;
  patient: string; // e.g. "502호 김환자"
  content: string; // e.g. "AST 알러지 테스트 판독"
  triggerTime: string; // e.g. "14:15" or "15분 후"
  remainingMinutes?: number;
  isActive: boolean;
  createdAt: string;
}

export const INITIAL_ALARMS: ClinicalAlarm[] = [
  {
    id: 'alarm_1',
    patient: '502호 김환자',
    content: 'Cefotaxime AST 알러지 테스트 판독',
    triggerTime: '15분 후 (14:25)',
    remainingMinutes: 15,
    isActive: true,
    createdAt: '14:10',
  },
  {
    id: 'alarm_2',
    patient: '505호 이환자',
    content: 'PRBC 1pint 수혈 15분 바이탈 체크',
    triggerTime: '15:00',
    remainingMinutes: 50,
    isActive: true,
    createdAt: '13:45',
  },
  {
    id: 'alarm_3',
    patient: '508호 박환자',
    content: 'Post-op 4hr 배뇨(Voiding) 확인',
    triggerTime: '17:30',
    remainingMinutes: 200,
    isActive: false,
    createdAt: '13:30',
  },
];

