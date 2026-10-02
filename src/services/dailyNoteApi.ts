import { supabase } from './supabase';

export interface DailyPatientNoteItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  patient: string;
  diagnosis?: string;
  note: string;
  createdAt: string;
}

type DailyNoteRow = {
  id: string;
  user_id: string;
  date: string;
  patient: string;
  diagnosis: string | null;
  note: string;
  created_at: string | null;
};

const mapRow = (row: DailyNoteRow): DailyPatientNoteItem => ({
  id: row.id,
  userId: row.user_id,
  date: row.date,
  patient: row.patient,
  diagnosis: row.diagnosis || undefined,
  note: row.note,
  createdAt: row.created_at || new Date().toISOString(),
});

export const dailyNoteApi = {
  // 사용자의 전체 데일리 노트 조회 (날짜별 보관 — 과거/오늘/미래 모두)
  async getAllDailyNotes(userId: string): Promise<DailyPatientNoteItem[]> {
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching all daily notes:', error);
      throw error;
    }
    return (data || []).map(mapRow);
  },

  // 데일리 노트 수정
  async updateDailyNote(
    noteId: string,
    patch: { date?: string; patient?: string; diagnosis?: string; note?: string }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('daily_notes')
      .update({
        ...(patch.date !== undefined && { date: patch.date }),
        ...(patch.patient !== undefined && { patient: patch.patient }),
        ...(patch.diagnosis !== undefined && { diagnosis: patch.diagnosis || null }),
        ...(patch.note !== undefined && { note: patch.note }),
      })
      .eq('id', noteId);
    if (error) {
      console.error('Error updating daily note:', error);
      throw error;
    }
    return true;
  },

  // 특정 날짜의 데일리 노트 목록 조회 (DN1)
  async getDailyNotesByDate(userId: string, date: string): Promise<DailyPatientNoteItem[]> {
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily notes:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      patient: row.patient,
      diagnosis: row.diagnosis || undefined,
      note: row.note,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  // 데일리 노트 추가 (DN2)
  async addDailyNote(note: {
    userId: string;
    date: string;
    patient: string;
    diagnosis?: string;
    note: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('daily_notes')
      .insert({
        user_id: note.userId,
        date: note.date,
        patient: note.patient,
        diagnosis: note.diagnosis || null,
        note: note.note,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding daily note:', error);
      throw error;
    }
    return data.id;
  },

  // 데일리 노트 삭제 (DN3)
  async deleteDailyNote(noteId: string): Promise<boolean> {
    const { error } = await supabase.from('daily_notes').delete().eq('id', noteId);
    if (error) {
      console.error('Error deleting daily note:', error);
      throw error;
    }
    return true;
  },
};

