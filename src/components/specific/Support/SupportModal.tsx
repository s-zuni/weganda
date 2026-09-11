import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { useSupportStore } from '../../../store/useSupportStore';
import {
  InquiryCategory,
  INQUIRY_CATEGORIES,
  SupportInquiry,
  BUSINESS_INFO,
} from '../../../types/support';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: InquiryCategory;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
  initialCategory = '서비스 문의',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'faq'>('create');
  const [category, setCategory] = useState<InquiryCategory>(initialCategory);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  const { id: userId, email: userEmail, nickname: userNickname } = useUserStore();
  const {
    userInquiries,
    fetchUserInquiries,
    createInquiry,
    addReply,
    isLoading,
  } = useSupportStore();

  useEffect(() => {
    if (visible) {
      fetchUserInquiries(userEmail || undefined, userId || undefined);
    }
  }, [visible, userEmail, userId]);

  // 사진 첨부 핸들러
  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('사진 첨부 제한', '사진은 최대 3장까지 첨부할 수 있습니다.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setImages((prev) => [...prev, imageUri]);
      }
    } catch (e) {
      Alert.alert('사진 선택 오류', '사진을 불러오는 중 문제가 발생했습니다.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 1:1 문의 제출
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('필수 입력', '문의 제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('필수 입력', '문의 내용을 자세히 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry(
        {
          category,
          title: title.trim(),
          content: content.trim(),
          images,
          userEmail: userEmail || 'guest@weganda.kr',
          userName: userNickname || '간호사 회원',
        },
        userId || undefined,
        userEmail || undefined,
        userNickname || undefined
      );

      Alert.alert(
        '문의 접수 완료',
        '소중한 문의가 정상적으로 접수되었습니다. 고객지원팀에서 확인 후 신속히 답변 드리겠습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setTitle('');
              setContent('');
              setImages([]);
              setActiveTab('list');
            },
          },
        ]
      );
    } catch {
      Alert.alert('오류', '문의를 등록하는 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사용자 추가 답변 등록
  const handleSendReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;

    const inqId = selectedInquiry.id;
    const text = replyText.trim();
    setReplyText('');

    await addReply(
      { inquiryId: inqId, content: text },
      userId || undefined,
      userNickname || '회원',
      false
    );

    // 상세 보기 상태 최신화
    setSelectedInquiry((prev) =>
      prev
        ? {
            ...prev,
            replies: [
              ...(prev.replies || []),
              {
                id: `rep-${Date.now()}`,
                inquiryId: inqId,
                userId: userId || undefined,
                authorName: userNickname || '회원',
                content: text,
                isAdmin: false,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : null
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고객센터</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 상단 탭 (문의 작성 / 내 문의 내역 / FAQ) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'create' && styles.tabItemActive]}
            onPress={() => {
              setSelectedInquiry(null);
              setActiveTab('create');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
              1:1 문의하기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'list' && styles.tabItemActive]}
            onPress={() => {
              setSelectedInquiry(null);
              setActiveTab('list');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
              내 문의 내역 ({userInquiries.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'faq' && styles.tabItemActive]}
            onPress={() => {
              setSelectedInquiry(null);
              setActiveTab('faq');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
              자주 묻는 질문
            </Text>
          </TouchableOpacity>
        </View>

        {/* 본문 콘텐츠 */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ──────────────── 1. 1:1 문의 작성 탭 ──────────────── */}
          {activeTab === 'create' && (
            <View style={styles.formContainer}>
              {/* 고객센터 안내 배너 */}
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerTitle}>🎧 무엇을 도와드릴까요?</Text>
                <Text style={styles.infoBannerText}>
                  3교대 근무표, weganda+ 멤버십 결제, 버그 신고 등 불편하셨던 점이나 건의사항을 남겨주시면 담당자가 24시간 이내에 정성껏 답변해 드립니다.
                </Text>
              </View>

              {/* 카테고리 선택 */}
              <Text style={styles.inputLabel}>문의 카테고리</Text>
              <View style={styles.categoryGrid}>
                {INQUIRY_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 제목 입력 */}
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.textInput}
                placeholder="문의 제목을 간략히 입력해 주세요"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />

              {/* 내용 입력 */}
              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="문의하실 내용을 자세히 작성해 주세요. 결제 오류의 경우 스토어 영수증 번호나 스크린샷을 첨부해 주시면 더 빠르게 도와드릴 수 있습니다."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />

              {/* 사진 첨부 */}
              <Text style={styles.inputLabel}>사진 첨부 (최대 3장)</Text>
              <View style={styles.imageRow}>
                {images.map((imgUri, idx) => (
                  <View key={idx} style={styles.imageThumbWrapper}>
                    <Image source={{ uri: imgUri }} style={styles.imageThumb} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(idx)}
                    >
                      <Text style={styles.removeImageBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {images.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addImageIcon}>📷</Text>
                    <Text style={styles.addImageText}>사진 추가</Text>
                    <Text style={styles.addImageCount}>{images.length}/3</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 제출 버튼 */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>문의 접수하기</Text>
                )}
              </TouchableOpacity>

              {/* 고객센터 운영 정보 */}
              <View style={styles.footerContactBox}>
                <Text style={styles.footerContactTitle}>운영 및 사업자 정보</Text>
                <Text style={styles.footerContactItem}>• 상호명: {BUSINESS_INFO.companyName}</Text>
                <Text style={styles.footerContactItem}>• 대표자: {BUSINESS_INFO.representative}</Text>
                <Text style={styles.footerContactItem}>• 사업자등록번호: {BUSINESS_INFO.businessNumber}</Text>
                <Text style={styles.footerContactItem}>• 고객센터: {BUSINESS_INFO.tel}</Text>
                <Text style={styles.footerContactItem}>• 공식 이메일: {BUSINESS_INFO.email}</Text>
                <Text style={styles.footerContactItem}>• 상담 시간: {BUSINESS_INFO.hours}</Text>
              </View>
            </View>
          )}

          {/* ──────────────── 2. 내 문의 내역 탭 ──────────────── */}
          {activeTab === 'list' && (
            <View style={styles.listContainer}>
              {selectedInquiry ? (
                /* 문의 상세 뷰 */
                <View style={styles.detailContainer}>
                  <TouchableOpacity
                    style={styles.backToListBtn}
                    onPress={() => setSelectedInquiry(null)}
                  >
                    <Text style={styles.backToListText}>‹ 목록으로 돌아가기</Text>
                  </TouchableOpacity>

                  <View style={styles.detailCard}>
                    <View style={styles.detailHeaderRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{selectedInquiry.category}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          selectedInquiry.status === 'resolved'
                            ? styles.statusBadgeResolved
                            : styles.statusBadgePending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            selectedInquiry.status === 'resolved'
                              ? styles.statusTextResolved
                              : styles.statusTextPending,
                          ]}
                        >
                          {selectedInquiry.status === 'resolved' ? '답변 완료' : '답변 대기중'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.detailTitle}>{selectedInquiry.title}</Text>
                    <Text style={styles.detailDate}>
                      {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.detailContent}>{selectedInquiry.content}</Text>

                    {/* 첨부 이미지 */}
                    {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                      <View style={styles.detailImageGrid}>
                        {selectedInquiry.images.map((img, i) => (
                          <Image key={i} source={{ uri: img }} style={styles.detailImageThumb} />
                        ))}
                      </View>
                    )}
                  </View>

                  {/* 관리자 답변 및 대화 목록 */}
                  <Text style={styles.repliesSectionTitle}>답변 및 대화 내역</Text>

                  {(!selectedInquiry.replies || selectedInquiry.replies.length === 0) && (
                    <View style={styles.emptyReplyBox}>
                      <Text style={styles.emptyReplyText}>
                        담당 관리자가 문의를 확인하고 있습니다.{'\n'}조금만 기다려 주시면 빠른 시일 내에 답변을 남겨드리겠습니다.
                      </Text>
                    </View>
                  )}

                  {(selectedInquiry.replies || []).map((rep) => (
                    <View
                      key={rep.id}
                      style={[styles.replyBubble, rep.isAdmin && styles.replyBubbleAdmin]}
                    >
                      <View style={styles.replyHeader}>
                        <Text
                          style={[
                            styles.replyAuthor,
                            rep.isAdmin && styles.replyAuthorAdmin,
                          ]}
                        >
                          {rep.isAdmin ? '👑 우간다 고객지원팀' : rep.authorName}
                        </Text>
                        <Text style={styles.replyDate}>
                          {new Date(rep.createdAt).toLocaleString('ko-KR', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.replyContent}>{rep.content}</Text>
                    </View>
                  ))}

                  {/* 추가 답변/메시지 입력창 */}
                  <View style={styles.replyInputRow}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="추가 질문이나 메시지를 입력하세요"
                      placeholderTextColor="#94A3B8"
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <TouchableOpacity
                      style={styles.replySendBtn}
                      onPress={handleSendReply}
                      disabled={!replyText.trim()}
                    >
                      <Text style={styles.replySendBtnText}>전송</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* 문의 목록 뷰 */
                <View>
                  {isLoading && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />}

                  {userInquiries.length === 0 ? (
                    <View style={styles.emptyListCard}>
                      <Text style={styles.emptyListEmoji}>📫</Text>
                      <Text style={styles.emptyListTitle}>접수된 문의 내역이 없습니다</Text>
                      <Text style={styles.emptyListDesc}>
                        궁금한 점이나 서비스 이용 중 발생한 문제가 있으시면 언제든 1:1 문의를 남겨주세요.
                      </Text>
                      <TouchableOpacity
                        style={styles.goCreateBtn}
                        onPress={() => setActiveTab('create')}
                      >
                        <Text style={styles.goCreateBtnText}>문의 작성하기</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    userInquiries.map((inq) => (
                      <TouchableOpacity
                        key={inq.id}
                        style={styles.inquiryCard}
                        onPress={() => setSelectedInquiry(inq)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.inquiryCardHeader}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{inq.category}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              inq.status === 'resolved'
                                ? styles.statusBadgeResolved
                                : styles.statusBadgePending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                inq.status === 'resolved'
                                  ? styles.statusTextResolved
                                  : styles.statusTextPending,
                              ]}
                            >
                              {inq.status === 'resolved' ? '답변 완료' : '답변 대기'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.inquiryCardTitle} numberOfLines={1}>
                          {inq.title}
                        </Text>
                        <Text style={styles.inquiryCardSnippet} numberOfLines={2}>
                          {inq.content}
                        </Text>

                        <View style={styles.inquiryCardFooter}>
                          <Text style={styles.inquiryCardDate}>
                            {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                          </Text>
                          {inq.replies && inq.replies.length > 0 && (
                            <Text style={styles.replyCountBadge}>
                              답변 {inq.replies.length}개
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          )}

          {/* ──────────────── 3. 자주 묻는 질문 (FAQ) 탭 ──────────────── */}
          {activeTab === 'faq' && (
            <View style={styles.faqContainer}>
              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>Q. weganda+ 7일 무료체험 중 해지하면 요금이 청구되나요?</Text>
                <Text style={styles.faqA}>
                  A. 아닙니다. 무료체험 시작 후 7일 이내에 구독을 취소하시면 어떠한 비용도 발생하지 않습니다. 마이페이지 또는 앱스토어/구글플레이 구독 관리 메뉴에서 언제든 위약금 없이 해지하실 수 있습니다.
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>Q. 동기 듀티 연동은 몇 명까지 가능한가요?</Text>
                <Text style={styles.faqA}>
                  A. 무료 회원은 최대 3명까지 연동하여 캘린더를 공유하실 수 있으며, weganda+ 프리미엄 회원은 인원 제한 없이 병동 전체 동기들과 듀티를 실시간으로 공유하고 AI 모임 날짜 추천을 받으실 수 있습니다.
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>Q. 듀티 운세는 하루에 몇 번 볼 수 있나요?</Text>
                <Text style={styles.faqA}>
                  A. 무료 회원은 월 5회까지 사주 운세를 조회하실 수 있으며, 매월 1일 자정에 카운트가 초기화됩니다. weganda+ 회원은 횟수 제한 없이 매일 듀티 맞춤 사주를 확인하실 수 있습니다.
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>Q. 기기를 변경했는데 프리미엄 구독이 사라졌어요.</Text>
                <Text style={styles.faqA}>
                  A. 구독하신 Apple ID 또는 Google 계정으로 로그인하신 후 [마이페이지 › weganda+ 프리미엄 › 구매 내역 복원하기] 버튼을 누르시면 추가 결제 없이 즉시 멤버십이 복원됩니다.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 19,
  },
  formContainer: {},
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  imageThumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  addImageIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  addImageText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  addImageCount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerContactBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  footerContactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  footerContactItem: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  listContainer: {},
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inquiryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeResolved: {
    backgroundColor: '#DEF7EC',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextResolved: {
    color: '#03543F',
  },
  inquiryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  inquiryCardSnippet: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  inquiryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inquiryCardDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  replyCountBadge: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyListCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyListEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyListDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  goCreateBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  goCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailContainer: {},
  backToListBtn: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  backToListText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  detailDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  detailContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  detailImageGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  detailImageThumb: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  repliesSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyReplyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyReplyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  replyBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyBubbleAdmin: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  replyAuthorAdmin: {
    color: COLORS.primary,
  },
  replyDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  replyContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  replyInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 30,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  replySendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replySendBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  faqContainer: {},
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  faqA: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
