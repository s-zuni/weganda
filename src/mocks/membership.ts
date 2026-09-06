import { SalaryPrediction } from '../types/membership';
export type { SalaryPrediction };

export const MOCK_SALARY_PREDICTION: SalaryPrediction = {
  month: '2026년 10월 (예상)',
  baseSalary: 2800000,
  nightAllowance: 450000,
  holidayAllowance: 180000,
  overtimeAllowance: 120000,
  totalEstimated: 3550000,
  shiftBreakdown: [
    { code: 'D', count: 10, amount: 0 },
    { code: 'E', count: 6, amount: 180000 },
    { code: 'N', count: 5, amount: 450000 },
    { code: 'O', count: 8, amount: 0 },
    { code: 'V', count: 1, amount: 0 },
  ],
};

export const MOCK_MONTHLY_SALARY_HISTORY = [
  { month: '7월', total: 3200000 },
  { month: '8월', total: 3450000 },
  { month: '9월', total: 3380000 },
  { month: '10월', total: 3550000 },
];
