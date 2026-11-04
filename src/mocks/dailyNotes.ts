import { DailyPatientNote } from '../types/dailyNote';
export type { DailyPatientNote };

export const INITIAL_DAILY_NOTES: DailyPatientNote[] = [
  {
    id: 'note_1',
    date: '2026-08-19',
    patient: '오전 듀티 체크',
    diagnosis: '09:30 · 중요',
    note: '인수인계 특이사항 점검 완료. 물품 카운트 및 부서 공지사항 확인하기.',
    createdAt: '09:40',
  },
  {
    id: 'note_2',
    date: '2026-08-19',
    patient: '정기 라운딩',
    diagnosis: '11:00 · 루틴',
    note: '주요 측정 기기 충전 상태 확인 및 소모품 수량 체크.',
    createdAt: '11:15',
  },
  {
    id: 'note_3',
    date: '2026-08-18',
    patient: '퇴근 전 정리',
    diagnosis: '16:00 · 체크',
    note: '내일 근무 스케줄 확인 및 인수인계 메모 정리하기.',
    createdAt: '16:20',
  },
];
