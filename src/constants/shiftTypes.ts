export type ShiftCode = 'D' | 'E' | 'N' | 'O' | 'V';

export interface ShiftInfo {
  code: ShiftCode;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  description: string;
  isOff?: boolean;
}

export const SHIFT_TYPES: Record<ShiftCode, ShiftInfo> = {
  D: {
    code: 'D',
    name: '데이 (Day)',
    shortName: '데이',
    color: '#4F98CA',
    textColor: '#FFFFFF',
    defaultStartTime: '07:00',
    defaultEndTime: '15:30',
    description: '주간 근무',
    isOff: false,
  },
  E: {
    code: 'E',
    name: '이브닝 (Evening)',
    shortName: '이브ニング',
    color: '#E2703A',
    textColor: '#FFFFFF',
    defaultStartTime: '15:00',
    defaultEndTime: '23:00',
    description: '오후 근무',
    isOff: false,
  },
  N: {
    code: 'N',
    name: '나이트 (Night)',
    shortName: '나이트',
    color: '#272727',
    textColor: '#FFFFFF',
    defaultStartTime: '22:30',
    defaultEndTime: '07:30',
    description: '야간 근무',
    isOff: false,
  },
  O: {
    code: 'O',
    name: '오프 (Off)',
    shortName: '오프',
    color: '#E84A5F',
    textColor: '#FFFFFF',
    description: '휴무',
    isOff: true,
  },
  V: {
    code: 'V',
    name: '휴가 (Vacation)',
    shortName: '휴가',
    color: '#9B51E0',
    textColor: '#FFFFFF',
    description: '연차 / 휴가',
    isOff: true,
  },
};

