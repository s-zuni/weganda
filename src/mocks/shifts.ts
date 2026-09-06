import { ShiftCode } from '../constants/shiftTypes';

export interface MockSchedule {
  date: string;
  shiftCode: ShiftCode;
  memo?: string;
}

export const MOCK_SCHEDULES: MockSchedule[] = [
  { date: '2026-08-01', shiftCode: 'D', memo: '인계 준비 철저' },
  { date: '2026-08-02', shiftCode: 'D' },
  { date: '2026-08-03', shiftCode: 'E' },
  { date: '2026-08-04', shiftCode: 'E', memo: '신환 입원 예정' },
  { date: '2026-08-05', shiftCode: 'N' },
  { date: '2026-08-06', shiftCode: 'N' },
  { date: '2026-08-07', shiftCode: 'O', memo: '동기 모임' },
  { date: '2026-08-08', shiftCode: 'O' },
  { date: '2026-08-09', shiftCode: 'D' },
  { date: '2026-08-10', shiftCode: 'D' },
  { date: '2026-08-11', shiftCode: 'E' },
  { date: '2026-08-12', shiftCode: 'E' },
  { date: '2026-08-13', shiftCode: 'N' },
  { date: '2026-08-14', shiftCode: 'N' },
  { date: '2026-08-15', shiftCode: 'O', memo: '광복절 휴식' },
  { date: '2026-08-16', shiftCode: 'O' },
  { date: '2026-08-17', shiftCode: 'D' },
  { date: '2026-08-18', shiftCode: 'D' },
  { date: '2026-08-19', shiftCode: 'E' },
  { date: '2026-08-20', shiftCode: 'E' },
  { date: '2026-08-21', shiftCode: 'N' },
  { date: '2026-08-22', shiftCode: 'N' },
  { date: '2026-08-23', shiftCode: 'O' },
  { date: '2026-08-24', shiftCode: 'O' },
  { date: '2026-08-25', shiftCode: 'D' },
  { date: '2026-08-26', shiftCode: 'D' },
  { date: '2026-08-27', shiftCode: 'D', memo: '오늘 듀티' },
  { date: '2026-08-28', shiftCode: 'E' },
  { date: '2026-08-29', shiftCode: 'N' },
  { date: '2026-08-30', shiftCode: 'O' },
  { date: '2026-08-31', shiftCode: 'O' },
];

