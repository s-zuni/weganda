import { create } from 'zustand';
import { DailyPatientNote, INITIAL_DAILY_NOTES } from '../mocks/dailyNotes';
import { dailyNoteApi } from '../services/dailyNoteApi';

interface DailyNoteState {
  notes: DailyPatientNote[];
  isLoading: boolean;
  fetchNotes: (userId: string, date: string) => Promise<void>;
  addNote: (note: { date: string; patient: string; diagnosis: string; note: string }, userId?: string) => void;
  deleteNote: (id: string) => void;
}

export const useDailyNoteStore = create<DailyNoteState>((set) => ({
  notes: INITIAL_DAILY_NOTES,
  isLoading: false,

  fetchNotes: async (userId: string, date: string) => {
    try {
      set({ isLoading: true });
      const serverNotes = await dailyNoteApi.getDailyNotesByDate(userId, date);
      if (serverNotes && serverNotes.length > 0) {
        const mapped: DailyPatientNote[] = serverNotes.map((n) => ({
          id: n.id,
          date: n.date,
          patient: n.patient,
          diagnosis: n.diagnosis || '',
          note: n.note,
          createdAt: new Date(n.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        }));
        set({ notes: mapped, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Error fetching daily notes:', e);
      set({ isLoading: false });
    }
  },

  addNote: (newNote, userId) => {
    const localId = `note_${Date.now()}`;
    set((state) => ({
      notes: [
        {
          ...newNote,
          id: localId,
          createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
        ...state.notes,
      ],
    }));

    if (userId) {
      dailyNoteApi.addDailyNote({
        userId,
        date: newNote.date,
        patient: newNote.patient,
        diagnosis: newNote.diagnosis,
        note: newNote.note,
      }).catch((e) => console.error('Failed to add daily note on backend:', e));
    }
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
    dailyNoteApi.deleteDailyNote(id).catch((e) => console.error('Failed to delete daily note on backend:', e));
  },
}));

