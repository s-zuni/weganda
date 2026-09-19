import { create } from 'zustand';
import {
  SupportInquiry,
  CreateInquiryDTO,
  CreateReplyDTO,
  InquiryStatus,
} from '../types/support';
import { supportApi, INITIAL_MOCK_INQUIRIES } from '../services/supportApi';

interface SupportState {
  inquiries: SupportInquiry[];
  userInquiries: SupportInquiry[];
  isLoading: boolean;
  selectedInquiry: SupportInquiry | null;

  // 액션
  fetchUserInquiries: (userEmail?: string, userId?: string) => Promise<void>;
  fetchAllInquiries: () => Promise<void>;
  createInquiry: (
    dto: CreateInquiryDTO,
    userId?: string,
    userEmail?: string,
    userName?: string
  ) => Promise<SupportInquiry>;
  addReply: (
    dto: CreateReplyDTO,
    userId?: string,
    authorName?: string,
    isAdmin?: boolean
  ) => Promise<void>;
  updateStatus: (inquiryId: string, status: InquiryStatus) => Promise<void>;
  setSelectedInquiry: (inquiry: SupportInquiry | null) => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  inquiries: INITIAL_MOCK_INQUIRIES,
  userInquiries: INITIAL_MOCK_INQUIRIES,
  isLoading: false,
  selectedInquiry: null,

  fetchUserInquiries: async (userEmail, userId) => {
    set({ isLoading: true });
    try {
      const list = await supportApi.getUserInquiries(userEmail, userId);
      set({ userInquiries: list, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchAllInquiries: async () => {
    set({ isLoading: true });
    try {
      const list = await supportApi.getAllInquiries();
      set({ inquiries: list, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createInquiry: async (dto, userId, userEmail, userName) => {
    set({ isLoading: true });
    try {
      const newInquiry = await supportApi.createInquiry(dto, userId, userEmail, userName);
      set((state) => ({
        userInquiries: [newInquiry, ...state.userInquiries],
        inquiries: [newInquiry, ...state.inquiries],
        isLoading: false,
      }));
      return newInquiry;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  addReply: async (dto, userId, authorName, isAdmin = false) => {
    try {
      const reply = await supportApi.replyInquiry(dto, userId, authorName, isAdmin);
      const updateInquiryList = (list: SupportInquiry[]) =>
        list.map((item) => {
          if (item.id === dto.inquiryId) {
            return {
              ...item,
              status: isAdmin ? ('resolved' as InquiryStatus) : item.status,
              updatedAt: new Date().toISOString(),
              replies: [...(item.replies || []), reply],
            };
          }
          return item;
        });

      set((state) => {
        const nextUserInquiries = updateInquiryList(state.userInquiries);
        const nextInquiries = updateInquiryList(state.inquiries);
        const currentSelected =
          state.selectedInquiry && state.selectedInquiry.id === dto.inquiryId
            ? {
                ...state.selectedInquiry,
                status: isAdmin ? ('resolved' as InquiryStatus) : state.selectedInquiry.status,
                updatedAt: new Date().toISOString(),
                replies: [...(state.selectedInquiry.replies || []), reply],
              }
            : state.selectedInquiry;

        return {
          userInquiries: nextUserInquiries,
          inquiries: nextInquiries,
          selectedInquiry: currentSelected,
        };
      });
    } catch (e) {
      console.error('Failed to add reply:', e);
    }
  },

  updateStatus: async (inquiryId, status) => {
    await supportApi.updateInquiryStatus(inquiryId, status);
    set((state) => ({
      inquiries: state.inquiries.map((inq) =>
        inq.id === inquiryId ? { ...inq, status, updatedAt: new Date().toISOString() } : inq
      ),
      userInquiries: state.userInquiries.map((inq) =>
        inq.id === inquiryId ? { ...inq, status, updatedAt: new Date().toISOString() } : inq
      ),
      selectedInquiry:
        state.selectedInquiry && state.selectedInquiry.id === inquiryId
          ? { ...state.selectedInquiry, status, updatedAt: new Date().toISOString() }
          : state.selectedInquiry,
    }));
  },

  setSelectedInquiry: (inquiry) => set({ selectedInquiry: inquiry }),
}));

