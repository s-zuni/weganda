import { create } from 'zustand';
import {
  VerificationRequest,
  VerificationStatus,
  VerificationSubmissionData,
} from '../types/verification';
import { verificationApi } from '../services/verificationApi';
import { useUserStore } from './useUserStore';

interface VerificationState {
  myRequest: VerificationRequest | null;
  adminRequests: VerificationRequest[];
  isLoading: boolean;

  // Actions
  fetchMyRequest: (userId: string) => Promise<void>;
  submitVerification: (
    userId: string,
    userName: string,
    userEmail: string | undefined,
    data: VerificationSubmissionData
  ) => Promise<boolean>;

  // Admin Actions
  fetchAdminRequests: (status?: VerificationStatus) => Promise<void>;
  approveRequest: (requestId: string, targetUserId: string, targetRole: 'nurse' | 'student') => Promise<boolean>;
  rejectRequest: (requestId: string, reason: string) => Promise<boolean>;
}

export const useVerificationStore = create<VerificationState>((set, get) => ({
  myRequest: null,
  adminRequests: [],
  isLoading: false,

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

  fetchAdminRequests: async (status) => {
    set({ isLoading: true });
    try {
      const list = await verificationApi.getAllRequests(status);
      set({ adminRequests: list, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  approveRequest: async (requestId, targetUserId, targetRole) => {
    try {
      const ok = await verificationApi.approveRequest(requestId);
      if (ok) {
        set((state) => ({
          adminRequests: state.adminRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'verified', reviewedAt: new Date().toISOString() } : r
          ),
          myRequest:
            state.myRequest?.id === requestId
              ? { ...state.myRequest, status: 'verified', reviewedAt: new Date().toISOString() }
              : state.myRequest,
        }));

        // 만약 본인 계정이 승인된 경우 즉시 유저 스토어 갱신
        const currentUserId = useUserStore.getState().id;
        if (currentUserId === targetUserId) {
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
        set((state) => ({
          adminRequests: state.adminRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'rejected', rejectReason: reason, reviewedAt: new Date().toISOString() }
              : r
          ),
          myRequest:
            state.myRequest?.id === requestId
              ? { ...state.myRequest, status: 'rejected', rejectReason: reason, reviewedAt: new Date().toISOString() }
              : state.myRequest,
        }));

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
