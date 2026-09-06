import { ShiftCode } from './shift';

export interface SalaryPrediction {
  month: string;
  baseSalary: number;
  nightAllowance: number;
  holidayAllowance: number;
  overtimeAllowance: number;
  totalEstimated: number;
  shiftBreakdown: {
    code: ShiftCode;
    count: number;
    amount: number;
  }[];
}

export interface MonthlySalaryHistory {
  month: string;
  total: number;
}

