import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { AdminReport, AdminPost, ReportStatus } from '../../../types/admin';
import { adminApi } from '../../../services/adminApi';
import { useUserStore } from '../../../store/useUserStore';

type CommunitySubTab = 'reports' | 'posts' | 'writeNotice';

export const CommunityManagementTab: React.FC = () => {
  const [subTab, setSubTab] = useState<CommunitySubTab>('reports');
  const user = useUserStore((s) => ({ id: s.id, name: s.name, nickname: s.nickname }));

  // 1. 신고 접수함 상태
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportFilter, setReportFilter] = useState<ReportStatus | 'all'>('pending');
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);

  // 2. 게시글 목록 상태
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postSearch, setPostSearch] = useState<string>('');
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);

  // 3. 공지사항 작성 상태
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState<boolean>(false);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const data = await adminApi.getReports(reportFilter);
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await adminApi.getPosts({ search: postSearch, includeDeleted: true });
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (subTab === 'reports') {
      fetchReports();
    } else if (subTab === 'posts') {
      fetchPosts();
    }
  }, [subTab, reportFilter]);

  // 신고 처리 액션
  const handleReportAction = (
    report: AdminReport,
    action: 'resolve_and_delete' | 'dismiss'
  ) => {
    const isDelete = action === 'resolve_and_delete';
    Alert.alert(
      isDelete ? '게시글 숨김 및 신고 처리' : '신고 기각',
      isDelete
        ? '신고된 게시글을 커뮤니티에서 숨김(삭제) 처리하고 신고를 종결하시겠습니까?'
        : '해당 신고를 무혐의/기각 처리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: isDelete ? 'destructive' : 'default',
          onPress: async () => {
            const ok = await adminApi.handleReport(report.id, action);
            if (ok) {
              Alert.alert('처리 완료', isDelete ? '게시글이 숨김 처리되었습니다.' : '신고가 기각되었습니다.');
              setReports((prev) =>
                prev.map((r) =>
                  r.id === report.id
                    ? { ...r, status: isDelete ? 'resolved' : 'dismissed' }
                    : r
                )
              );
            } else {
              Alert.alert('오류', '신고 상태 업데이트에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 게시글 숨김/복구 토글
  const handleTogglePostDelete = async (post: AdminPost) => {
    const newDeleteState = !post.isDeleted;
    const ok = await adminApi.deletePost(post.id, newDeleteState);
    if (ok) {
      Alert.alert('성공', newDeleteState ? '게시글이 숨김 처리되었습니다.' : '게시글이 다시 노출됩니다.');
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isDeleted: newDeleteState } : p))
      );
    } else {
      Alert.alert('오류', '게시글 상태 변경에 실패했습니다.');
    }
  };

  // 공지사항 등록
  const handleCreateNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      Alert.alert('입력 확인', '공지사항 제목과 본문을 모두 입력해주세요.');
      return;
    }

    setIsSubmittingNotice(true);
    try {
      const ok = await adminApi.createNoticePost(
        noticeTitle,
        noticeContent,
        user.id || undefined,
        user.nickname || '우간다 운영팀'
      );
      if (ok) {
        Alert.alert('공지 등록 완료', '상단고정 공지사항이 성공적으로 등록되었습니다.');
        setNoticeTitle('');
        setNoticeContent('');
        setSubTab('posts');
      } else {
        Alert.alert('오류', '공지사항 작성에 실패했습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '공지사항 등록 중 예외가 발생했습니다.');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 서브 탭 헤더 */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'reports' && styles.subTabBtnActive]}
          onPress={() => setSubTab('reports')}
        >
          <Text
            style={[styles.subTabText, subTab === 'reports' && styles.subTabTextActive]}
          >
            신고 접수함
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'posts' && styles.subTabBtnActive]}
          onPress={() => setSubTab('posts')}
        >
          <Text
            style={[styles.subTabText, subTab === 'posts' && styles.subTabTextActive]}
          >
            게시글 관리
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'writeNotice' && styles.subTabBtnActive]}
          onPress={() => setSubTab('writeNotice')}
        >
          <Text
            style={[
              styles.subTabText,
              subTab === 'writeNotice' && styles.subTabTextActive,
            ]}
          >
            + 상단고정 공지작성
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 1. 신고 접수함 뷰 ── */}
      {subTab === 'reports' && (
        <View style={styles.tabContent}>
          {/* 상태 필터 */}
          <View style={styles.filterRow}>
            {[
              { key: 'pending', label: '미처리' },
              { key: 'resolved', label: '조치완료' },
              { key: 'dismissed', label: '기각됨' },
              { key: 'all', label: '전체' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  reportFilter === f.key && styles.filterChipActive,
                ]}
                onPress={() => setReportFilter(f.key as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    reportFilter === f.key && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoadingReports ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.centerBox}>
                  <Text style={styles.emptyText}>접수된 신고 내역이 없습니다.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.reportCard}>
                  <View style={styles.reportTop}>
                    <View style={styles.reportReasonBox}>
                      <Text style={styles.reportReasonText}>⚠️ {item.reason}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'pending'
                          ? styles.statusPending
                          : item.status === 'resolved'
                          ? styles.statusResolved
                          : styles.statusDismissed,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {item.status === 'pending'
                          ? '미처리'
                          : item.status === 'resolved'
                          ? '조치완료'
                          : '기각'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.targetBox}>
                    <Text style={styles.targetAuthor}>
                      작성자: {item.authorNickname || '익명 간호사'}
                    </Text>
                    {item.postTitle && (
                      <Text style={styles.targetTitle} numberOfLines={1}>
                        제목: {item.postTitle}
                      </Text>
                    )}
                    {item.postContent && (
                      <Text style={styles.targetContent} numberOfLines={2}>
                        "{item.postContent}"
                      </Text>
                    )}
                  </View>

                  <Text style={styles.reportDate}>
                    접수 시각: {item.createdAt ? item.createdAt.substring(0, 16).replace('T', ' ') : '-'}
                  </Text>

                  {item.status === 'pending' && (
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={styles.dismissBtn}
                        onPress={() => handleReportAction(item, 'dismiss')}
                      >
                        <Text style={styles.dismissBtnText}>신고 기각</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteActionBtn}
                        onPress={() => handleReportAction(item, 'resolve_and_delete')}
                      >
                        <Text style={styles.deleteActionBtnText}>
                          게시글 숨김 & 조치
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* ── 2. 게시글 관리 뷰 ── */}
      {subTab === 'posts' && (
        <View style={styles.tabContent}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="게시글 제목 검색..."
              value={postSearch}
              onChangeText={setPostSearch}
              onSubmitEditing={fetchPosts}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={fetchPosts}>
              <Text style={styles.searchBtnText}>검색</Text>
            </TouchableOpacity>
          </View>

          {isLoadingPosts ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.centerBox}>
                  <Text style={styles.emptyText}>게시글이 없습니다.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[styles.postCard, item.isDeleted && styles.postCardDeleted]}>
                  <View style={styles.postTop}>
                    <View style={styles.postBadges}>
                      {item.isNotice && (
                        <View style={styles.noticeBadge}>
                          <Text style={styles.noticeBadgeText}>📢 상단고정 공지</Text>
                        </View>
                      )}
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>{item.tag}</Text>
                      </View>
                      {item.isDeleted && (
                        <View style={styles.deletedBadge}>
                          <Text style={styles.deletedBadgeText}>숨김됨</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.postDate}>
                      {item.createdAt ? item.createdAt.substring(0, 10) : '-'}
                    </Text>
                  </View>

                  <Text style={styles.postTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.postSnippet} numberOfLines={2}>
                    {item.content}
                  </Text>

                  <View style={styles.postBottom}>
                    <Text style={styles.postMeta}>
                      작성: {item.authorNickname} · 조회 {item.views} · 좋아요 {item.likes}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.toggleDeleteBtn,
                        item.isDeleted ? styles.btnRestore : styles.btnHide,
                      ]}
                      onPress={() => handleTogglePostDelete(item)}
                    >
                      <Text
                        style={[
                          styles.toggleDeleteText,
                          item.isDeleted ? styles.textRestore : styles.textHide,
                        ]}
                      >
                        {item.isDeleted ? '게시글 복구' : '게시글 숨김'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* ── 3. 상단고정 공지사항 작성 뷰 ── */}
      {subTab === 'writeNotice' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.formContainer}>
          <View style={styles.noticeTipBox}>
            <Text style={styles.noticeTipTitle}>📢 상단고정 공지사항 가이드</Text>
            <Text style={styles.noticeTipDesc}>
              작성된 공지글은 커뮤니티 최상단에 고정되어 모든 간호사 회원에게 우선 노출됩니다.
              업데이트 소식, 근무표 팁, 운영 수칙 등을 등록하세요.
            </Text>
          </View>

          <Text style={styles.fieldLabel}>공지 제목</Text>
          <TextInput
            style={styles.formInput}
            placeholder="[필독] 공지사항 제목을 입력하세요"
            value={noticeTitle}
            onChangeText={setNoticeTitle}
          />

          <Text style={styles.fieldLabel}>공지 본문 내용</Text>
          <TextInput
            style={styles.formTextArea}
            placeholder="회원들에게 전달할 상세 공지 내용을 입력하세요..."
            value={noticeContent}
            onChangeText={setNoticeContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.submitNoticeBtn}
            onPress={handleCreateNotice}
            disabled={isSubmittingNotice}
            activeOpacity={0.8}
          >
            {isSubmittingNotice ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitNoticeText}>📢 상단고정 공지사항 등록하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  subTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#111827',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  reportTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportReasonBox: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportReasonText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#FEE2E2',
  },
  statusResolved: {
    backgroundColor: '#D1FAE5',
  },
  statusDismissed: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  targetBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
  },
  targetAuthor: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  targetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  targetContent: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  reportDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  dismissBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  deleteActionBtn: {
    flex: 2,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  postCardDeleted: {
    backgroundColor: '#F9FAFB',
    opacity: 0.7,
  },
  postTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  postBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noticeBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#4B5563',
  },
  deletedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deletedBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  postDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  postSnippet: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  postBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  postMeta: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  toggleDeleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  btnHide: {
    backgroundColor: '#FEE2E2',
  },
  btnRestore: {
    backgroundColor: '#D1FAE5',
  },
  toggleDeleteText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textHide: {
    color: '#DC2626',
  },
  textRestore: {
    color: '#059669',
  },
  formContainer: {
    padding: 16,
    gap: 8,
  },
  noticeTipBox: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  noticeTipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  noticeTipDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  formTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 140,
  },
  submitNoticeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitNoticeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
