import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyPatientNote } from '../mocks/dailyNotes';
import { dailyNoteApi } from '../services/dailyNoteApi';
import { ExpoSecureStoreAdapter } from '../services/supabase';

const GUEST_USER_ID = 'guest_user_preview';
const isLocalId = (id: string) => id.startsWith('note_');

const formatTime = (iso?: string) =>
  (iso ? new Date(iso) : new Date()).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

interface DailyNoteState {
  /** 모든 날짜의 노트 (날짜별로 영구 보관 — 날짜가 바뀌어도 삭제되지 않음) */
  notes: DailyPatientNote[];
  isLoading: boolean;
  fetchNotes: (userId: string) => Promise<void>;
  addNote: (note: { date: string; patient: string; diagnosis: string; note: string }, userId?: string) => void;
  updateNote: (id: string, patch: { patient: string; diagnosis: string; note: string }) => void;
  deleteNote: (id: string) => void;
}

export const useDailyNoteStore = create<DailyNoteState>()(
  persist(
    (set) => ({
      notes: [],
      isLoading: false,

      fetchNotes: async (userId) => {
        if (!userId || userId === GUEST_USER_ID) return;
        try {
          set({ isLoading: true });
          const serverNotes = await dailyNoteApi.getAllDailyNotes(userId);
          const mapped: DailyPatientNote[] = serverNotes.map((n) => ({
            id: n.id,
            date: n.date,
            patient: n.patient,
            diagnosis: n.diagnosis || '',
            note: n.note,
            createdAt: formatTime(n.createdAt),
          }));
          // 서버 미동기화(로컬 id) 노트는 유지하고, 서버 노트로 나머지를 교체
          set((state) => ({
            notes: [...mapped, ...state.notes.filter((n) => isLocalId(n.id))],
            isLoading: false,
          }));
        } catch (e) {
          // 조회 실패 시 기존(캐시된) 노트를 지우지 않는다
          console.warn('Error fetching daily notes from backend:', e);
          set({ isLoading: false });
        }
      },

      addNote: (newNote, userId) => {
        const localId = `note_${Date.now()}`;
        const newEntry: DailyPatientNote = {
          ...newNote,
          id: localId,
          createdAt: formatTime(),
        };

        set((state) => ({ notes: [...state.notes, newEntry] }));

        if (userId && userId !== GUEST_USER_ID) {
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

      updateNote: (id, patch) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        }));
        if (!isLocalId(id)) {
          dailyNoteApi
            .updateDailyNote(id, patch)
            .catch((e) => console.warn('Failed to update daily note on backend:', e));
        }
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
        if (!isLocalId(id)) {
          dailyNoteApi
            .deleteDailyNote(id)
            .catch((e) => console.warn('Failed to delete daily note on backend:', e));
        }
      },
    }),
    {
      name: 'weganda-daily-note-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
