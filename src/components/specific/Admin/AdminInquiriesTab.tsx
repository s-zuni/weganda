import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSupportStore } from '../../../store/useSupportStore';
import {
  SupportInquiry,
  InquiryCategory,
  INQUIRY_CATEGORIES,
  InquiryStatus,
} from '../../../types/support';

export const AdminInquiriesTab: React.FC = () => {
  const {
    inquiries,
    fetchAllInquiries,
    addReply,
    updateStatus,
    isLoading,
  } = useSupportStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    fetchAllInquiries();
  }, []);

  // 필터링된 문의 목록
  const filteredInquiries = inquiries.filter((inq) => {
    const matchCategory = selectedCategory === 'all' || inq.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || inq.status === selectedStatus;
    return matchCategory && matchStatus;
  });

  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;

  // 관리자 답변 전송
  const handleSendAdminReply = async () => {
    if (!selectedInquiry || !replyText.trim()) {
      Alert.alert('알림', '답변 내용을 입력해 주세요.');
      return;
    }

    setIsSendingReply(true);
    const inqId = selectedInquiry.id;
    const text = replyText.trim();
    setReplyText('');

    try {
      await addReply(
        { inquiryId: inqId, content: text },
        undefined,
        '우간다 고객지원팀',
        true
      );

      // 선택된 문의 상세 상태 즉각 업데이트
      setSelectedInquiry((prev) =>
        prev
          ? {
              ...prev,
              status: 'resolved',
              replies: [
                ...(prev.replies || []),
                {
                  id: `rep-${Date.now()}`,
                  inquiryId: inqId,
                  authorName: '우간다 고객지원팀',
                  content: text,
                  isAdmin: true,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : null
      );

      Alert.alert('답변 등록 완료', '답변이 성공적으로 전송되었으며, 상태가 [답변 완료]로 변경되었습니다.');
    } catch {
      Alert.alert('오류', '답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSendingReply(false);
    }
  };

  // 상태 직접 변경 토글
  const handleToggleStatus = async (inq: SupportInquiry) => {
    const nextStatus: InquiryStatus = inq.status === 'pending' ? 'resolved' : 'pending';
    await updateStatus(inq.id, nextStatus);
    setSelectedInquiry((prev) => (prev && prev.id === inq.id ? { ...prev, status: nextStatus } : prev));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ── 상단 통계 카드 ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>총 접수 문의</Text>
          <Text style={styles.statValue}>{inquiries.length}건</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPending]}>
          <Text style={[styles.statLabel, styles.statLabelPending]}>답변 대기 중 (미처리)</Text>
          <Text style={[styles.statValue, styles.statValuePending]}>{pendingCount}건</Text>
        </View>
        <View style={[styles.statCard, styles.statCardResolved]}>
          <Text style={[styles.statLabel, styles.statLabelResolved]}>답변 완료</Text>
          <Text style={[styles.statValue, styles.statValueResolved]}>{resolvedCount}건</Text>
        </View>
      </View>

      {/* ── 필터 바 ── */}
      <View style={styles.filterSection}>
        {/* 상태 필터 */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>처리 상태:</Text>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'pending' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('pending')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'pending' && styles.filterChipTextActive]}>
              답변 대기 ({pendingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'resolved' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('resolved')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'resolved' && styles.filterChipTextActive]}>
              답변 완료 ({resolvedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 필터 */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>카테고리:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>
                전체
              </Text>
            </TouchableOpacity>
            {INQUIRY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* ── 메인 영역: 좌측 목록 & 우측 상세 뷰 ── */}
      <View style={styles.mainLayout}>
        {/* 문의 목록 */}
        <View style={styles.listCol}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>문의 목록 ({filteredInquiries.length}건)</Text>
            <TouchableOpacity onPress={() => fetchAllInquiries()}>
              <Text style={styles.refreshText}>🔄 새로고침</Text>
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator color="#0F172A" style={{ marginVertical: 20 }} />}

          {filteredInquiries.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>해당 조건에 맞는 문의가 없습니다.</Text>
            </View>
          )}

          {filteredInquiries.map((inq) => {
            const isSelected = selectedInquiry?.id === inq.id;
            return (
              <TouchableOpacity
                key={inq.id}
                style={[styles.inquiryRowCard, isSelected && styles.inquiryRowCardSelected]}
                onPress={() => setSelectedInquiry(inq)}
                activeOpacity={0.7}
              >
                <View style={styles.inquiryRowTop}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{inq.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      inq.status === 'resolved' ? styles.statusBadgeResolved : styles.statusBadgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        inq.status === 'resolved' ? styles.statusTextResolved : styles.statusTextPending,
                      ]}
                    >
                      {inq.status === 'resolved' ? '답변 완료' : '답변 대기'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.inquiryRowTitle} numberOfLines={1}>
                  {inq.title}
                </Text>
                <Text style={styles.inquiryRowSnippet} numberOfLines={2}>
                  {inq.content}
                </Text>

                <View style={styles.inquiryRowMeta}>
                  <Text style={styles.inquiryRowAuthor}>
                    👤 {inq.userName} ({inq.userEmail})
                  </Text>
                  <Text style={styles.inquiryRowDate}>
                    {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                  </Text>
                </View>

                {inq.images && inq.images.length > 0 && (
                  <Text style={styles.imageCountBadge}>📷 사진 {inq.images.length}장</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 문의 상세 & 답변 작성 영역 */}
        <View style={styles.detailCol}>
          {selectedInquiry ? (
            <View style={styles.detailCard}>
              {/* 상단 액션 바 */}
              <View style={styles.detailActionBar}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{selectedInquiry.category}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    selectedInquiry.status === 'resolved'
                      ? styles.statusToggleBtnPending
                      : styles.statusToggleBtnResolved,
                  ]}
                  onPress={() => handleToggleStatus(selectedInquiry)}
                >
                  <Text style={styles.statusToggleBtnText}>
                    {selectedInquiry.status === 'resolved' ? '답변 대기로 되돌리기' : '✓ 답변 완료로 변경'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.detailTitle}>{selectedInquiry.title}</Text>

              {/* 작성자 정보 카드 */}
              <View style={styles.authorInfoBox}>
                <Text style={styles.authorInfoText}>
                  <Text style={styles.authorInfoLabel}>작성자: </Text>
                  {selectedInquiry.userName}
                </Text>
                <Text style={styles.authorInfoText}>
                  <Text style={styles.authorInfoLabel}>이메일: </Text>
                  {selectedInquiry.userEmail}
                </Text>
                <Text style={styles.authorInfoText}>
                  <Text style={styles.authorInfoLabel}>접수일시: </Text>
                  {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
                </Text>
              </View>

              {/* 문의 원문 본문 */}
              <Text style={styles.detailBodyLabel}>문의 내용</Text>
              <View style={styles.contentBox}>
                <Text style={styles.detailContentText}>{selectedInquiry.content}</Text>
              </View>

              {/* 첨부 이미지 */}
              {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                <View style={styles.attachedImagesSection}>
                  <Text style={styles.detailBodyLabel}>
                    첨부 사진 ({selectedInquiry.images.length}장)
                  </Text>
                  <View style={styles.imagesGrid}>
                    {selectedInquiry.images.map((img, i) => (
                      <Image key={i} source={{ uri: img }} style={styles.detailImageThumb} resizeMode="cover" />
                    ))}
                  </View>
                </View>
              )}

              {/* 답변 및 대화 히스토리 */}
              <View style={styles.repliesSection}>
                <Text style={styles.detailBodyLabel}>답변 히스토리</Text>

                {(!selectedInquiry.replies || selectedInquiry.replies.length === 0) && (
                  <View style={styles.noReplyBox}>
                    <Text style={styles.noReplyText}>아직 등록된 답변이 없습니다. 아래 입력창에서 답변을 작성해 주세요.</Text>
                  </View>
                )}

                {(selectedInquiry.replies || []).map((rep) => (
                  <View
                    key={rep.id}
                    style={[styles.replyCard, rep.isAdmin && styles.replyCardAdmin]}
                  >
                    <View style={styles.replyCardHeader}>
                      <Text style={[styles.replyAuthor, rep.isAdmin && styles.replyAuthorAdmin]}>
                        {rep.isAdmin ? '👑 우간다 고객지원팀 (관리자)' : `👤 ${rep.authorName}`}
                      </Text>
                      <Text style={styles.replyDate}>
                        {new Date(rep.createdAt).toLocaleString('ko-KR')}
                      </Text>
                    </View>
                    <Text style={styles.replyContent}>{rep.content}</Text>
                  </View>
                ))}
              </View>

              {/* 관리자 답글 작성 영역 */}
              <View style={styles.replyComposer}>
                <Text style={styles.composerLabel}>관리자 공식 답변 작성</Text>
                <TextInput
                  style={styles.composerInput}
                  placeholder="간호사 고객님께 전달할 정성스러운 답변을 작성하세요. (답변 작성 시 상태가 '답변 완료'로 자동 변경됩니다)"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={replyText}
                  onChangeText={setReplyText}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.sendReplyBtn, isSendingReply && styles.sendReplyBtnDisabled]}
                  onPress={handleSendAdminReply}
                  disabled={isSendingReply}
                  activeOpacity={0.8}
                >
                  {isSendingReply ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.sendReplyBtnText}>답변 등록 및 전송</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyDetailCard}>
              <Text style={styles.emptyDetailEmoji}>👈</Text>
              <Text style={styles.emptyDetailTitle}>문의를 선택해 주세요</Text>
              <Text style={styles.emptyDetailDesc}>
                좌측 목록에서 문의를 선택하면 상세 내용과 첨부 사진을 확인하고 관리자 답변을 작성할 수 있습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statCardPending: {
    borderColor: '#D97706',
    backgroundColor: '#1E293B',
  },
  statCardResolved: {
    borderColor: '#059669',
    backgroundColor: '#1E293B',
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '500',
  },
  statLabelPending: {
    color: '#FBBF24',
  },
  statLabelResolved: {
    color: '#34D399',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statValuePending: {
    color: '#F59E0B',
  },
  statValueResolved: {
    color: '#10B981',
  },
  filterSection: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    width: 75,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#FF507C',
    borderColor: '#FF507C',
  },
  filterChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  listCol: {
    flex: 1,
  },
  detailCol: {
    flex: 1.4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  refreshText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  inquiryRowCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inquiryRowCardSelected: {
    borderColor: '#FF507C',
    backgroundColor: '#262F40',
  },
  inquiryRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#F59E0B',
  },
  statusTextResolved: {
    color: '#10B981',
  },
  inquiryRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  inquiryRowSnippet: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 10,
  },
  inquiryRowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inquiryRowAuthor: {
    fontSize: 12,
    color: '#64748B',
  },
  inquiryRowDate: {
    fontSize: 11,
    color: '#64748B',
  },
  imageCountBadge: {
    marginTop: 6,
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusToggleBtnPending: {
    backgroundColor: '#334155',
  },
  statusToggleBtnResolved: {
    backgroundColor: '#059669',
  },
  statusToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  authorInfoBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  authorInfoText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  authorInfoLabel: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailBodyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailContentText: {
    fontSize: 14,
    color: '#F8FAFC',
    lineHeight: 22,
  },
  attachedImagesSection: {
    marginBottom: 20,
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  detailImageThumb: {
    width: 110,
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  repliesSection: {
    marginBottom: 20,
  },
  noReplyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  noReplyText: {
    fontSize: 12,
    color: '#64748B',
  },
  replyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyCardAdmin: {
    borderColor: '#FF507C',
    backgroundColor: '#241724',
  },
  replyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  replyAuthorAdmin: {
    color: '#FF507C',
  },
  replyDate: {
    fontSize: 11,
    color: '#64748B',
  },
  replyContent: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  replyComposer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  composerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  composerInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    fontSize: 13,
    color: '#F8FAFC',
    height: 90,
    marginBottom: 12,
  },
  sendReplyBtn: {
    backgroundColor: '#FF507C',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sendReplyBtnDisabled: {
    opacity: 0.6,
  },
  sendReplyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyDetailCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyDetailEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptyDetailDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});

