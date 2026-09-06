import { ShiftCode } from '../constants/shiftTypes';

export interface MockFriend {
  id: string;
  name: string;
  hospital: string;
  ward: string;
  todayShift: ShiftCode;
  matchingOffDaysCount: number;
}

export const MOCK_FRIENDS: MockFriend[] = [
  {
    id: '1',
    name: '이지은',
    hospital: '서울아산병원',
    ward: '응급실',
    todayShift: 'O',
    matchingOffDaysCount: 4,
  },
  {
    id: '2',
    name: '박민수',
    hospital: '삼성서울병원',
    ward: 'ICU',
    todayShift: 'D',
    matchingOffDaysCount: 2,
  },
  {
    id: '3',
    name: '최수진',
    hospital: '세브란스병원',
    ward: '소아청소년과',
    todayShift: 'E',
    matchingOffDaysCount: 3,
  },
  {
    id: '4',
    name: '정현우',
    hospital: '서울대병원',
    ward: '71병동',
    todayShift: 'N',
    matchingOffDaysCount: 5,
  },
];

