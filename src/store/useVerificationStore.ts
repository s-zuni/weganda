import { create } from 'zustand';
import {
  VerificationRequest,
  VerificationStatus,
  VerificationSubmissionData,
} from '../types/verification';
import { verificationApi } from '../services/verificationApi';
import { useUserStore } from './useUserStore';

interface VerificationCounts {
  all: number;
  pending: number;
  verified: number;
  rejected: number;
}

interface VerificationState {
  myRequest: VerificationRequest | null;
  adminRequests: VerificationRequest[];
  isLoading: boolean;

  // Pagination & Filters (Admin)
  currentPage: number;
  pageSize: number;
  totalCount: number;
  statusFilter: VerificationStatus | 'all';
  counts: VerificationCounts;

  // Actions
  fetchMyRequest: (userId: string) => Promise<void>;
  submitVerification: (
    userId: string,
    userName: string,
    userEmail: string | undefined,
    data: VerificationSubmissionData
  ) => Promise<boolean>;

  // Admin Actions
  fetchAdminRequests: (status?: VerificationStatus | 'all', page?: number) => Promise<void>;
  setStatusFilter: (filter: VerificationStatus | 'all') => void;
  setPage: (page: number) => void;
  approveRequest: (requestId: string, targetUserId?: string, targetRole?: 'nurse' | 'student') => Promise<boolean>;
  rejectRequest: (requestId: string, reason: string) => Promise<boolean>;
}

export const useVerificationStore = create<VerificationState>((set, get) => ({
  myRequest: null,
  adminRequests: [],
  isLoading: false,

  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  statusFilter: 'pending', // 심사 대기 중인 목록부터 보이도록 기본값 설정
  counts: {
    all: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  },

  fetchMyRequest: async (userId: string) => {
    set({ isLoading: true });
    try {
      const req = await verificationApi.getMyVerificationRequest(userId);
      set({ myRequest: req, isLoading: false });

      // 유저 스토어 동기화
      if (req) {
        useUserStore.getState().setVerificationState({
          verificationStatus: req.status,
          verificationRole: req.targetRole,
          verificationRejectReason: req.rejectReason,
          isVerified: req.status === 'verified',
        });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  submitVerification: async (userId, userName, userEmail, data) => {
    set({ isLoading: true });
    try {
      const newReq = await verificationApi.submitVerification(userId, userName, userEmail, data);
      set({ myRequest: newReq, isLoading: false });

      // 유저 스토어 즉시 심사중 반영
      useUserStore.getState().setVerificationState({
        verificationStatus: 'pending',
        verificationRole: data.targetRole,
        verificationRejectReason: undefined,
        isVerified: false,
      });

      return true;
    } catch (e) {
      set({ isLoading: false });
      return false;
    }
  },

  fetchAdminRequests: async (status, page) => {
    const targetStatus = status !== undefined ? status : get().statusFilter;
    const targetPage = page !== undefined ? page : get().currentPage;
    const pageSize = get().pageSize;

    set({ isLoading: true });
    try {
      const res = await verificationApi.getAllRequests({
        status: targetStatus,
        page: targetPage,
        pageSize,
      });

      set({
        adminRequests: res.requests,
        totalCount: res.totalCount,
        counts: res.counts,
        statusFilter: targetStatus,
        currentPage: targetPage,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  setStatusFilter: (filter) => {
    set({ statusFilter: filter, currentPage: 1 });
    get().fetchAdminRequests(filter, 1);
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchAdminRequests(get().statusFilter, page);
  },

  approveRequest: async (requestId, targetUserId, targetRole = 'nurse') => {
    try {
      const ok = await verificationApi.approveRequest(requestId, targetUserId, targetRole);
      if (ok) {
        // 성공 시 목록 재조회
        await get().fetchAdminRequests();

        // 만약 본인 계정이 승인된 경우 즉시 유저 스토어 갱신
        const currentUserId = useUserStore.getState().id;
        if (targetUserId && currentUserId === targetUserId) {
          useUserStore.getState().setVerificationState({
            verificationStatus: 'verified',
            verificationRole: targetRole,
            isVerified: true,
          });
          useUserStore.getState().setUser({ role: targetRole });
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  rejectRequest: async (requestId, reason) => {
    try {
      const ok = await verificationApi.rejectRequest(requestId, reason);
      if (ok) {
        // 성공 시 목록 재조회
        await get().fetchAdminRequests();

        const currentReq = get().adminRequests.find((r) => r.id === requestId);
        if (currentReq && currentReq.userId === useUserStore.getState().id) {
          useUserStore.getState().setVerificationState({
            verificationStatus: 'rejected',
            verificationRejectReason: reason,
            isVerified: false,
          });
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
}));
