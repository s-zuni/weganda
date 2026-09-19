export type ShiftCode = 'D' | 'E' | 'N' | 'O' | 'V' | string;

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

export interface CustomShiftCode {
  code: string;
  name: string;
  color: string;
  textColor: string;
  isOff?: boolean;
}

export type ScheduleMap = Record<string, string>; // YYYY-MM-DD -> ShiftCode or custom code
