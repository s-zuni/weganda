import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyPatientNote } from '../mocks/dailyNotes';
import { dailyNoteApi } from '../services/dailyNoteApi';
import { ExpoSecureStoreAdapter } from '../services/supabase';

interface DailyNoteState {
  notes: DailyPatientNote[];
  isLoading: boolean;
  fetchNotes: (userId: string, date: string) => Promise<void>;
  addNote: (note: { date: string; patient: string; diagnosis: string; note: string }, userId?: string) => void;
  deleteNote: (id: string) => void;
}

export const useDailyNoteStore = create<DailyNoteState>()(
  persist(
    (set) => ({
  notes: [],
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
          createdAt: new Date(n.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        }));
        set({ notes: mapped, isLoading: false });
      } else {
        set({ notes: [], isLoading: false });
      }
    } catch (e) {
      console.warn('Error fetching daily notes from backend:', e);
      set({ notes: [], isLoading: false });
    }
  },

  addNote: (newNote, userId) => {
    const localId = `note_${Date.now()}`;
    const newEntry: DailyPatientNote = {
      ...newNote,
      id: localId,
      createdAt: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    set((state) => ({
      notes: [newEntry, ...state.notes],
    }));

    if (userId) {
      dailyNoteApi
        .addDailyNote({
          userId,
          date: newNote.date,
          patient: newNote.patient,
          diagnosis: newNote.diagnosis,
          note: newNote.note,
        })
        .then((savedId) => {
          if (savedId) {
            set((state) => ({
              notes: state.notes.map((n) => (n.id === localId ? { ...n, id: savedId } : n)),
            }));
          }
        })
        .catch((e) => console.warn('Failed to add daily note on backend:', e));
    }
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));

    if (!id.startsWith('note_')) {
      dailyNoteApi.deleteDailyNote(id).catch((e) =>
        console.warn('Failed to delete daily note on backend:', e)
      );
    }
  },
}),
    {
      name: 'weganda-daily-note-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
);
