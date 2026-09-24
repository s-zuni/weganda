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
  Platform,
} from 'react-native';
import { useVerificationStore } from '../../../store/useVerificationStore';
import { VerificationRequest, VerificationStatus } from '../../../types/verification';

export const AdminVerificationTab: React.FC = () => {
  const {
    adminRequests,
    counts,
    totalCount,
    currentPage,
    pageSize,
    statusFilter,
    setStatusFilter,
    setPage,
    fetchAdminRequests,
    approveRequest,
    rejectRequest,
    isLoading,
  } = useVerificationStore();

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

  // 컴포넌트 진입 시 기본 'pending' (심사 대기중) 목록 1페이지 로드
  useEffect(() => {
    fetchAdminRequests('pending', 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // 알림 헬퍼 (Web & Native 호환)
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleApprove = (req: VerificationRequest) => {
    const roleTitle = req.targetRole === 'nurse' ? '간호사' : '간호학생';
    const message = `[${req.userName}] 님의 ${roleTitle} 인증을 승인하시겠습니까?\n\n승인 시 회원 역할이 즉시 [${roleTitle}]로 승격되며 커뮤니티 권한이 부여됩니다.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        executeApprove(req);
      }
    } else {
      Alert.alert('인증 승인 확인', message, [
        { text: '취소', style: 'cancel' },
        {
          text: '승인하기',
          style: 'default',
          onPress: () => executeApprove(req),
        },
      ]);
    }
  };

  const executeApprove = async (req: VerificationRequest) => {
    setIsProcessing(true);
    const ok = await approveRequest(req.id, req.userId, req.targetRole);
    setIsProcessing(false);
    if (ok) {
      showAlert('승인 완료', `[${req.userName}] 님의 서류가 정상 승인되었습니다.`);
      if (selectedRequest?.id === req.id) {
        setSelectedRequest(null);
      }
    } else {
      showAlert('오류', '승인 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleOpenRejectModal = (req: VerificationRequest) => {
    setRejectTargetRequest(req);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetRequest) return;
    if (!rejectReason.trim()) {
      showAlert('확인 필요', '반려 사유를 입력하거나 추천 사유를 선택해 주세요.');
      return;
    }

    setIsProcessing(true);
    const ok = await rejectRequest(rejectTargetRequest.id, rejectReason.trim());
    setIsProcessing(false);

    if (ok) {
      showAlert('반려 완료', `[${rejectTargetRequest.userName}] 님의 서류가 반려되었습니다.`);
      setIsRejectModalOpen(false);
      setRejectTargetRequest(null);
      setRejectReason('');
      if (selectedRequest?.id === rejectTargetRequest.id) {
        setSelectedRequest(null);
      }
    } else {
      showAlert('오류', '반려 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'license':
        return '간호사 면허증';
      case 'employment':
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
        return '자격 증빙 서류';
    }
  };

  // 1-10 페이지 번호 배열 생성
  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxButtons = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const isActive = p === currentPage;
      pageButtons.push(
        <TouchableOpacity
          key={`page-${p}`}
          style={[styles.pageBtn, isActive && styles.pageBtnActive]}
          onPress={() => setPage(p)}
          activeOpacity={0.8}
        >
          <Text style={[styles.pageBtnText, isActive && styles.pageBtnTextActive]}>
            {p}
          </Text>
        </TouchableOpacity>
      );
    }
    return pageButtons;
  };

  const startItemNum = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemNum = Math.min(currentPage * pageSize, totalCount);

  return (
    <View style={styles.container}>
      {/* ── 상단 통계 요약 카드 (실데이터 연동) ── */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, statusFilter === 'all' && styles.statCardSelected]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={styles.statLabel}>전체 신청</Text>
          <Text style={styles.statVal}>{counts.all}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: '#F59E0B' },
            statusFilter === 'pending' && styles.statCardSelected,
          ]}
          onPress={() => setStatusFilter('pending')}
          activeOpacity={0.8}
        >
          <View style={styles.statHeaderRow}>
            <Text style={styles.statLabel}>심사 대기</Text>
            {counts.pending > 0 && <View style={styles.pendingDot} />}
          </View>
          <Text style={[styles.statVal, { color: '#D97706' }]}>{counts.pending}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: '#10B981' },
            statusFilter === 'verified' && styles.statCardSelected,
          ]}
          onPress={() => setStatusFilter('verified')}
          activeOpacity={0.8}
        >
          <Text style={styles.statLabel}>승인 완료</Text>
          <Text style={[styles.statVal, { color: '#059669' }]}>{counts.verified}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: '#EF4444' },
            statusFilter === 'rejected' && styles.statCardSelected,
          ]}
          onPress={() => setStatusFilter('rejected')}
          activeOpacity={0.8}
        >
          <Text style={styles.statLabel}>반려 건수</Text>
          <Text style={[styles.statVal, { color: '#DC2626' }]}>{counts.rejected}</Text>
        </TouchableOpacity>
      </View>

      {/* ── 필터 탭 (기본: 심사 대기중) ── */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'pending' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('pending')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, statusFilter === 'pending' && styles.tabTextActive]}>
            심사 대기중 ({counts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'all' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, statusFilter === 'all' && styles.tabTextActive]}>
            전체 ({counts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'verified' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('verified')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, statusFilter === 'verified' && styles.tabTextActive]}>
            승인 완료 ({counts.verified})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, statusFilter === 'rejected' && styles.tabBtnActive]}
          onPress={() => setStatusFilter('rejected')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, statusFilter === 'rejected' && styles.tabTextActive]}>
            반려 ({counts.rejected})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 신청 리스트 (10건 단위 페이징) ── */}
      <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF507C" />
            <Text style={styles.loadingText}>Supabase 실시간 서류 목록을 불러오는 중...</Text>
          </View>
        ) : adminRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {statusFilter === 'pending'
                ? '현재 심사 대기 중인 인증 서류가 없습니다.'
                : '해당 조건의 인증 신청 내역이 없습니다.'}
            </Text>
          </View>
        ) : (
          adminRequests.map((req) => {
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
                    <Text style={styles.userEmail}>({req.userEmail || '이메일 정보 없음'})</Text>
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

                {/* Body Details */}
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>소속 기관 / 학교:</Text>
                    <Text style={styles.detailVal}>{req.hospitalOrSchool || req.organizationName || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>부서 / 학과:</Text>
                    <Text style={styles.detailVal}>{req.departmentOrMajor || '-'}</Text>
                  </View>
                  {req.licenseNumber ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>면허 번호:</Text>
                      <Text style={styles.detailVal}>{req.licenseNumber}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>증빙 유형:</Text>
                    <Text style={styles.detailDocType}>{getDocTypeBadge(req.verificationType)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>신청 시각:</Text>
                    <Text style={styles.detailValTime}>
                      {new Date(req.submittedAt).toLocaleString('ko-KR')}
                    </Text>
                  </View>

                  {/* 반려 사유 표시 */}
                  {req.status === 'rejected' && req.rejectReason ? (
                    <View style={styles.rejectReasonBox}>
                      <Text style={styles.rejectReasonTitle}>반려 사유:</Text>
                      <Text style={styles.rejectReasonContent}>{req.rejectReason}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.viewDocBtn}
                    onPress={() => setSelectedRequest(req)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewDocText}>🔍 서류 원본 확인</Text>
                  </TouchableOpacity>

                  {isPending ? (
                    <View style={styles.actionBtnGroup}>
                      <TouchableOpacity
                        style={styles.rejectActionBtn}
                        onPress={() => handleOpenRejectModal(req)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectActionText}>반려</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveActionBtn}
                        onPress={() => handleApprove(req)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.approveActionText}>승인</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── 하단 1-10 페이지 네비게이션 (10개 신청씩) ── */}
      {!isLoading && totalCount > 0 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfoText}>
            총 <Text style={styles.boldText}>{totalCount}</Text>건 중{' '}
            <Text style={styles.boldText}>{startItemNum}</Text> -{' '}
            <Text style={styles.boldText}>{endItemNum}</Text>번째 신청 표시중
          </Text>

          <View style={styles.paginationNavRow}>
            {/* 이전 버튼 */}
            <TouchableOpacity
              style={[styles.arrowBtn, currentPage <= 1 && styles.arrowBtnDisabled]}
              onPress={() => currentPage > 1 && setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              activeOpacity={0.7}
            >
              <Text style={[styles.arrowBtnText, currentPage <= 1 && styles.arrowBtnTextDisabled]}>
                ‹ 이전
              </Text>
            </TouchableOpacity>

            {/* 1 ~ 10 페이지 번호 버튼 목록 */}
            <View style={styles.pageNumberGroup}>
              {renderPaginationButtons()}
            </View>

            {/* 다음 버튼 */}
            <TouchableOpacity
              style={[styles.arrowBtn, currentPage >= totalPages && styles.arrowBtnDisabled]}
              onPress={() => currentPage < totalPages && setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.arrowBtnText,
                  currentPage >= totalPages && styles.arrowBtnTextDisabled,
                ]}
              >
                다음 ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 서류 원본 상세 확인 모달 ── */}
      <Modal
        visible={!!selectedRequest}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>증빙 서류 정밀 심사</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedRequest?.userName} 님의 {getDocTypeBadge(selectedRequest?.verificationType || '')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedRequest(null)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 이미지/서류 미리보기 */}
              <View style={styles.docImageContainer}>
                {selectedRequest?.documentUrl ? (
                  <Image
                    source={{ uri: selectedRequest.documentUrl }}
                    style={styles.docImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.noImageBox}>
                    <Text style={styles.noImageText}>📄 등록된 서류 이미지/URL이 없습니다.</Text>
                  </View>
                )}
              </View>

              {/* 신청 상세 메타데이터 */}
              <View style={styles.modalMetaSection}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>신청 회원:</Text>
                  <Text style={styles.metaVal}>{selectedRequest?.userName}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>이메일:</Text>
                  <Text style={styles.metaVal}>{selectedRequest?.userEmail || '-'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>신청 대상 역할:</Text>
                  <Text style={[styles.metaVal, { fontWeight: '700', color: '#1D4ED8' }]}>
                    {selectedRequest?.targetRole === 'nurse' ? '정규 간호사 (전체 커뮤니티 권한)' : '간호학생 (3개 게시판 제한 권한)'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>소속 병원/학교:</Text>
                  <Text style={styles.metaVal}>{selectedRequest?.hospitalOrSchool || selectedRequest?.organizationName || '-'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>부서/학과:</Text>
                  <Text style={styles.metaVal}>{selectedRequest?.departmentOrMajor || '-'}</Text>
                </View>
                {selectedRequest?.licenseNumber ? (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>면허 번호:</Text>
                    <Text style={styles.metaVal}>{selectedRequest?.licenseNumber}</Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>서류 파일명:</Text>
                  <Text style={styles.metaVal}>{selectedRequest?.documentName || '파일 명칭 없음'}</Text>
                </View>
              </View>
            </ScrollView>

            {/* 모달 하단 버튼 */}
            <View style={styles.modalFooter}>
              {selectedRequest?.status === 'pending' ? (
                <>
                  <TouchableOpacity
                    style={styles.modalRejectBtn}
                    onPress={() => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenRejectModal(req);
                    }}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalRejectText}>반려하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalApproveBtn}
                    onPress={() => {
                      if (selectedRequest) handleApprove(selectedRequest);
                    }}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalApproveText}>인증 승인</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.modalCloseFooterBtn}
                  onPress={() => setSelectedRequest(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseFooterText}>닫기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 반려 사유 입력 모달 ── */}
      <Modal
        visible={isRejectModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRejectModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 520 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>서류 반려 사유 작성</Text>
                <Text style={styles.modalSubtitle}>
                  {rejectTargetRequest?.userName} 님에게 전달될 안내 사유를 입력하세요.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsRejectModalOpen(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rejectModalBody}>
              <Text style={styles.presetLabel}>추천 빠른 사유 선택</Text>
              <View style={styles.presetContainer}>
                {REJECT_PRESETS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => setRejectReason(preset)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetChipText}>{preset}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.presetLabel, { marginTop: 16 }]}>직접 작성 또는 수정</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="상세한 반려 사유를 입력하세요..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={rejectReason}
                onChangeText={setRejectReason}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsRejectModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmRejectBtn,
                  !rejectReason.trim() && { opacity: 0.5 },
                ]}
                onPress={handleConfirmReject}
                disabled={!rejectReason.trim() || isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmRejectText}>반려 확정</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardSelected: {
    borderColor: '#FF507C',
    backgroundColor: '#FFF5F7',
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  tabBtnActive: {
    backgroundColor: '#FF507C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listArea: {
    flex: 1,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyBox: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 14,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    width: 110,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailDocType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF507C',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailValTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rejectReasonBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectReasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  rejectReasonContent: {
    fontSize: 13,
    color: '#991B1B',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDocBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  viewDocText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  rejectActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  approveActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  approveActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── 1-10 페이지 네비게이션 스타일 ──
  paginationContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
  paginationNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  arrowBtnDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  arrowBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  arrowBtnTextDisabled: {
    color: '#D1D5DB',
  },
  pageNumberGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  pageBtn: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#F3F4F6',
  },
  pageBtnActive: {
    backgroundColor: '#FF507C',
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  pageBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ── 서류 확인 모달 스타일 ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  docImageContainer: {
    width: '100%',
    height: 360,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  noImageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalMetaSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaKey: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalRejectBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  modalRejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalApproveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  modalApproveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseFooterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  modalCloseFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // ── 반려 모달 스타일 ──
  rejectModalBody: {
    padding: 20,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  presetContainer: {
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    height: 100,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalConfirmRejectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  modalConfirmRejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
