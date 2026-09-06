export interface DailyPatientNote {
  id: string;
  date: string; // YYYY-MM-DD
  patient: string; // 환자명 및 병실
  diagnosis: string; // 진단명/병명
  note: string; // 특이사항 메모
  createdAt: string;
}

export const INITIAL_DAILY_NOTES: DailyPatientNote[] = [
  {
    id: 'note_1',
    date: '2026-08-19',
    patient: '503호 정환자',
    diagnosis: 'Acute Appendicitis s/p Op',
    note: '수술 부위 드레싱 삼출물(oozing) 소량 관찰되어 주치의 노티 완료. 15:00 드레싱 교체 및 항생제 투여 예정.',
    createdAt: '09:40',
  },
  {
    id: 'note_2',
    date: '2026-08-19',
    patient: '506호 강환자',
    diagnosis: 'Pneumonia (폐렴)',
    note: 'SpO2 91%로 저하되어 Nasal cannula 2L/min 산소 투여 시작함. 30분 후 ABGA f/u 계획.',
    createdAt: '11:15',
  },
  {
    id: 'note_3',
    date: '2026-08-18',
    patient: '501호 이환자',
    diagnosis: 'Total Knee Replacement',
    note: '수술 후 PCA 투여 중 오심(Nausea) 호소하여 맥페란 1ample 투여함.',
    createdAt: '16:20',
  },
];

