export interface DailyPatientNote {
  id: string;
  date: string; // YYYY-MM-DD
  patient: string; // 환자명 및 병실
  diagnosis: string; // 진단명/병명
  note: string; // 특이사항 메모
  createdAt: string;
}

