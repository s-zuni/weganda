import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useVerificationStore } from '../../../store/useVerificationStore';
import { VerificationRequest, VerificationStatus } from '../../../types/verification';

export const AdminVerificationTab: React.FC = () => {
  const { adminRequests, fetchAdminRequests, approveRequest, rejectRequest, isLoading } =
    useVerificationStore();

  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetRequest, setRejectTargetRequest] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const REJECT_PRESETS = [
    '제출하신 서류의 글씨 또는 사진이 흐려 식별이 어렵습니다.',
    '서류의 유효기간이 만료되었습니다. 최근 발급본을 제출해 주세요.',
    '신청자 성명과 서류에 기재된 성명이 일치하지 않습니다.',
    '간호학과 또는 간호사 면허 관련 내용이 확인되지 않는 서류입니다.',
  ];

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const filteredList = adminRequests.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const counts = {
    all: adminRequests.length,
    pending: adminRequests.filter((r) => r.status === 'pending').length,
    verified: adminRequests.filter((r) => r.status === 'verified').length,
    rejected: adminRequests.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = (req: VerificationRequest) => {
    Alert.alert(
      '인증 승인 확인',
      `[${req.userName}] 님의 ${req.targetRole === 'nurse' ? '간호사' : '간호학생'} 인증을 승인하시겠습니까?\n승인 시 커뮤니티 권한이 즉시 부여됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인하기',
          style: 'default',
          onPress: async () => {
            setIsProcessing(true);
            const ok = await approveRequest(req.id, req.userId, req.targetRole);
            setIsProcessing(false);
            if (ok) {
              Alert.alert('완료', '인증이 성공적으로 승인되었습니다.');
              if (selectedRequest?.id === req.id) {
                setSelectedRequest(null);
              }
            } else {
              Alert.alert('오류', '승인 처리에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleOpenRejectModal = (req: VerificationRequest) => {
    setRejectTargetRequest(req);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetRequest) return;
    if (!rejectReason.trim()) {
      Alert.alert('확인', '반려 사유를 입력하거나 추천 사유를 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    const ok = await rejectRequest(rejectTargetRequest.id, rejectReason.trim());
    setIsProcessing(false);

    if (ok) {
      Alert.alert('반려 완료', '해당 서류가 사유와 함께 반려 처리되었습니다.');
      setIsRejectModalOpen(false);
      setRejectTargetRequest(null);
      setRejectReason('');
      if (selectedRequest?.id === rejectTargetRequest.id) {
        setSelectedRequest(null);
      }
    } else {
      Alert.alert('오류', '반려 처리에 실패했습니다.');
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'license':
        return '간호사 면허증';
      case 'employment_cert':
        return '재직증명서';
      case 'work_email':
        return '병원 웹메일';
      case 'employee_id':
        return '사원증';
      case 'student_id':
        return '학생증';
      case 'enrollment_cert':
        return '재학증명서';
      case 'tuition_bill':
        return '등록금영수증';
      default:
        return '증빙서류';
    }
  };

  return (
    <View style={styles.container}>
      {/* ── 상단 통계 요약 카드 ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>전체 신청</Text>
          <Text style={styles.statVal}>{counts.all}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.statLabel}>심사 대기</Text>
          <Text style={[styles.statVal, { color: '#D97706' }]}>{counts.pending}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.statLabel}>승인 완료</Text>
          <Text style={[styles.statVal, { color: '#059669' }]}>{counts.verified}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.statLabel}>반려 건수</Text>
          <Text style={[styles.statVal, { color: '#DC2626' }]}>{counts.rejected}</Text>
        </View>
      </View>

      {/* ── 필터 탭 ── */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'all' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.tabText, statusFilter === 'all' && styles.tabTextActive]}>
            전체 ({counts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'pending' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('pending')}
        >
          <Text style={[styles.tabText, statusFilter === 'pending' && styles.tabTextActive]}>
            대기중 ({counts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'verified' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('verified')}
        >
          <Text style={[styles.tabText, statusFilter === 'verified' && styles.tabTextActive]}>
            승인완료 ({counts.verified})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'rejected' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('rejected')}
        >
          <Text style={[styles.tabText, statusFilter === 'rejected' && styles.tabTextActive]}>
            반려 ({counts.rejected})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 신청 리스트 ── */}
      <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF507C" />
            <Text style={styles.loadingText}>서류 신청 목록을 불러오는 중...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>해당 조건의 인증 신청 내역이 없습니다.</Text>
          </View>
        ) : (
          filteredList.map((req) => {
            const isPending = req.status === 'pending';
            const isNurse = req.targetRole === 'nurse';

            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userMeta}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: isNurse ? '#EFF6FF' : '#F5F3FF' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: isNurse ? '#1D4ED8' : '#6D28D9' },
                        ]}
                      >
                        {isNurse ? '👩‍⚕️ 간호사 신청' : '🎓 간호학생 신청'}
                      </Text>
                    </View>
                    <Text style={styles.userName}>{req.userName}</Text>
                    <Text style={styles.userEmail}>({req.userEmail || '이메일 없음'})</Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusPill,
                      req.status === 'pending' && { backgroundColor: '#FEF3C7' },
                      req.status === 'verified' && { backgroundColor: '#DEF7EC' },
                      req.status === 'rejected' && { backgroundColor: '#FDE8E8' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        req.status === 'pending' && { color: '#B45309' },
                        req.status === 'verified' && { color: '#03543F' },
                        req.status === 'rejected' && { color: '#9B1C1C' },
                      ]}
                    >
                      {req.status === 'pending'
                        ? '대기중'
                        : req.status === 'verified'
                        ? '승인완료'
                        : '반려됨'}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>소속 기관/대학</Text>
                    <Text style={styles.detailVal}>{req.organizationName || req.hospitalOrSchool || '-'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>제출 서류 종류</Text>
                    <Text style={styles.detailVal}>{getDocTypeBadge(req.verificationType)}</Text>
                  </View>
                  {req.licenseNumber && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>면허번호</Text>
                      <Text style={styles.detailVal}>{req.licenseNumber}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>신청 일시</Text>
                    <Text style={styles.detailVal}>{req.submittedAt.slice(0, 16)}</Text>
                  </View>
                </View>

                {/* Reject Reason Display (if rejected) */}
                {req.status === 'rejected' && req.rejectReason && (
                  <View style={styles.cardRejectBox}>
                    <Text style={styles.cardRejectLabel}>반려 사유:</Text>
                    <Text style={styles.cardRejectText}>{req.rejectReason}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.viewDocBtn}
                    onPress={() => setSelectedRequest(req)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDocBtnText}>🔍 서류 확인 ({req.documentName || '첨부서류'})</Text>
                  </TouchableOpacity>

                  {isPending && (
                    <View style={styles.pendingActions}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleOpenRejectModal(req)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.rejectBtnText}>반려 (사유작성)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(req)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.approveBtnText}>✓ 승인 (수락)</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── 서류 미리보기 모달 ── */}
      {selectedRequest && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  [{selectedRequest.userName}] 님의 증빙 서류 확인
                </Text>
                <TouchableOpacity
                  style={styles.previewClose}
                  onPress={() => setSelectedRequest(null)}
                >
                  <Text style={styles.previewCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.previewBody}>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewMetaText}>
                    • 대상: {selectedRequest.targetRole === 'nurse' ? '간호사' : '간호학생'}
                  </Text>
                  <Text style={styles.previewMetaText}>
                    • 소속: {selectedRequest.organizationName || selectedRequest.hospitalOrSchool || '-'}
                  </Text>
                  <Text style={styles.previewMetaText}>
                    • 서류명: {selectedRequest.documentName || '증빙서류'}
                  </Text>
                  {selectedRequest.licenseNumber && (
                    <Text style={styles.previewMetaText}>
                      • 면허번호: {selectedRequest.licenseNumber}
                    </Text>
                  )}
                </View>

                {/* Image Preview */}
                <View style={styles.imageContainer}>
                  {selectedRequest.documentUrl ? (
                    <Image
                      source={{ uri: selectedRequest.documentUrl }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.noImageText}>미리보기 이미지가 없습니다.</Text>
                  )}
                </View>
              </ScrollView>

              {/* Bottom Actions inside Modal */}
              <View style={styles.previewFooter}>
                {selectedRequest.status === 'pending' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { flex: 1, paddingVertical: 12 }]}
                      onPress={() => {
                        handleOpenRejectModal(selectedRequest);
                      }}
                    >
                      <Text style={styles.rejectBtnText}>반려하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.approveBtn, { flex: 1, paddingVertical: 12 }]}
                      onPress={() => handleApprove(selectedRequest)}
                    >
                      <Text style={styles.approveBtnText}>승인 (수락)</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.doneCloseBtn}
                    onPress={() => setSelectedRequest(null)}
                  >
                    <Text style={styles.doneCloseBtnText}>닫기</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── 반려 사유 입력 모달 ── */}
      {isRejectModalOpen && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.rejectModalBox}>
              <Text style={styles.rejectModalTitle}>
                [{rejectTargetRequest?.userName}] 님 서류 반려
              </Text>
              <Text style={styles.rejectModalSubtitle}>
                사용자에게 노출될 정확한 반려 사유를 선택하거나 입력해 주세요.
              </Text>

              {/* Presets */}
              <Text style={styles.presetTitle}>자주 쓰는 반려 사유 템플릿</Text>
              <View style={styles.presetsList}>
                {REJECT_PRESETS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetItem,
                      rejectReason === preset && styles.presetItemActive,
                    ]}
                    onPress={() => setRejectReason(preset)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        rejectReason === preset && styles.presetTextActive,
                      ]}
                    >
                      • {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <Text style={styles.inputLabel}>직접 입력 사유</Text>
              <TextInput
                style={styles.rejectInput}
                placeholder="사용자가 서류를 재보완할 수 있도록 명확한 사유를 적어주세요."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={rejectReason}
                onChangeText={setRejectReason}
              />

              <View style={styles.rejectModalBtns}>
                <TouchableOpacity
                  style={styles.rejectCancelBtn}
                  onPress={() => {
                    setIsRejectModalOpen(false);
                    setRejectTargetRequest(null);
                  }}
                  disabled={isProcessing}
                >
                  <Text style={styles.rejectCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectSubmitBtn}
                  onPress={handleConfirmReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.rejectSubmitText}>반려 확정</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  listArea: {
    flex: 1,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  cardRejectBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  cardRejectLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  cardRejectText: {
    fontSize: 13,
    color: '#450A0A',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  viewDocBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDocBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  approveBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewClose: {
    padding: 4,
  },
  previewCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  previewBody: {
    padding: 16,
  },
  previewMeta: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4,
  },
  previewMetaText: {
    fontSize: 13,
    color: '#334155',
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 280,
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 320,
  },
  noImageText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  previewFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneCloseBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneCloseBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  rejectModalBox: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
  },
  rejectModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  rejectModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  presetsList: {
    gap: 6,
    marginBottom: 16,
  },
  presetItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  presetItemActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  presetText: {
    fontSize: 12,
    color: '#475569',
  },
  presetTextActive: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 16,
  },
  rejectModalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  rejectCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  rejectCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  rejectSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  rejectSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
