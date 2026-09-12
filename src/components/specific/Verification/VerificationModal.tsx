import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { useVerificationStore } from '../../../store/useVerificationStore';
import {
  VerificationTargetRole,
  VerificationType,
  VerificationSubmissionData,
} from '../../../types/verification';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import { DocumentPickerActionSheet, PickedDocument } from '../../common/DocumentPickerActionSheet';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NURSE_DOC_TYPES: { type: VerificationType; label: string; desc: string }[] = [
  { type: 'license', label: '간호사 면허증', desc: '보건복지부 발급 간호사 면허증 사본/사진' },
  { type: 'employment_cert', label: '재직증명서', desc: '최근 3개월 이내 발급된 병원 재직증명서' },
  { type: 'work_email', label: '병원 업무 이메일', desc: '병원 도메인 웹메일 수신함/인증 화면' },
  { type: 'employee_id', label: '병원 사원증', desc: '성명과 병원명이 명확히 표기된 사원증' },
];

const STUDENT_DOC_TYPES: { type: VerificationType; label: string; desc: string }[] = [
  { type: 'student_id', label: '학생증', desc: '간호학과 표기된 모바일 또는 실물 학생증' },
  { type: 'enrollment_cert', label: '재학증명서', desc: '최근 1개월 이내 발급된 재학증명서' },
  { type: 'tuition_bill', label: '등록금 납부확인서', desc: '당해 학기 간호학과 등록금 납부 영수증' },
];


export const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const theme = useAppTheme();
  const {
    id: userId,
    name: userName,
    email: userEmail,
    role,
    verificationStatus,
    verificationRole,
    verificationRejectReason,
  } = useUserStore();

  const { myRequest, fetchMyRequest, submitVerification, isLoading } = useVerificationStore();

  const [targetRole, setTargetRole] = useState<VerificationTargetRole>(
    verificationRole === 'student' ? 'student' : 'nurse'
  );
  const [verificationType, setVerificationType] = useState<VerificationType>('license');
  const [organizationName, setOrganizationName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [pickerSheetVisible, setPickerSheetVisible] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchMyRequest(userId);
    }
  }, [visible, userId]);

  useEffect(() => {
    // 기본 선택 서류 타입 초기화
    if (targetRole === 'nurse') {
      setVerificationType('license');
    } else {
      setVerificationType('student_id');
    }
  }, [targetRole]);

  const currentStatus = myRequest ? myRequest.status : verificationStatus;
  const currentRejectReason = myRequest?.rejectReason || verificationRejectReason;

  const handleSelectDoc = (doc: PickedDocument) => {
    setDocumentName(doc.name);
    setDocumentUrl(doc.uri);
  };

  const handleSubmit = async () => {
    if (!organizationName.trim()) {
      Alert.alert('확인', targetRole === 'nurse' ? '소속 병원명을 입력해주세요.' : '소속 대학교명을 입력해주세요.');
      return;
    }
    if (!documentUrl) {
      Alert.alert('확인', '인증 증빙 서류를 첨부해주세요.');
      return;
    }
    if (!agreedPrivacy) {
      Alert.alert('동의 필요', '자격 인증을 위한 개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    const payload: VerificationSubmissionData = {
      targetRole,
      verificationType,
      organizationName: organizationName.trim(),
      licenseNumber: licenseNumber.trim() || undefined,
      documentUrl,
      documentName,
    };

    const ok = await submitVerification(userId || 'user_demo', userName || '사용자', userEmail || undefined, payload);
    if (ok) {
      Alert.alert(
        '인증 신청 완료',
        '서류가 성공적으로 접수되었습니다. 관리자 심사 후 24시간 이내에 승인 결과를 안내해 드립니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setIsReapplying(false);
              onSuccess?.();
            },
          },
        ]
      );
    } else {
      Alert.alert('오류', '인증 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const docTypeList = targetRole === 'nurse' ? NURSE_DOC_TYPES : STUDENT_DOC_TYPES;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="92%">
      <View style={styles.sheetContainer}>
        {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>간호 전문직 및 학생 인증</Text>
              <Text style={styles.headerSubtitle}>
                커뮤니티 및 전문 서비스 이용을 위한 안전한 인증 시스템
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Status Banners */}
            {currentStatus === 'pending' && !isReapplying && (
              <View style={[styles.statusCard, styles.pendingCard]}>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: '#FFF3C4' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#B7791F' }]}>⏳ 심사 대기 중</Text>
                  </View>
                  <Text style={styles.statusDateText}>
                    {myRequest?.submittedAt ? myRequest.submittedAt.slice(0, 10) : '최근 신청'}
                  </Text>
                </View>
                <Text style={styles.statusTitle}>관리자가 서류를 심사하고 있습니다</Text>
                <Text style={styles.statusDesc}>
                  제출하신 서류({myRequest?.documentName || '인증 서류'})를 꼼꼼히 확인 중입니다. 보통 24시간 이내에 심사가 완료됩니다.
                </Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>신청 정보</Text>
                  <Text style={styles.infoBoxItem}>• 신분: {myRequest?.targetRole === 'nurse' ? '간호사' : '간호대생'}</Text>
                  <Text style={styles.infoBoxItem}>• 소속: {myRequest?.organizationName || myRequest?.hospitalOrSchool || '-'}</Text>
                </View>
              </View>
            )}

            {currentStatus === 'verified' && !isReapplying && (
              <View style={[styles.statusCard, styles.verifiedCard]}>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: '#DEF7EC' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#03543F' }]}>✓ 인증 완료</Text>
                  </View>
                  <Text style={styles.statusDateText}>
                    {myRequest?.reviewedAt ? myRequest.reviewedAt.slice(0, 10) : '승인 완료'}
                  </Text>
                </View>
                <Text style={styles.statusTitle}>
                  {verificationRole === 'student' ? '간호대학생' : '간호사'} 인증이 완료되었습니다
                </Text>
                <Text style={styles.statusDesc}>
                  모든 커뮤니티 권한 및 간호사/간호대생 전용 기능이 활성화되었습니다.
                </Text>
                <TouchableOpacity
                  style={styles.reapplyTextBtn}
                  onPress={() => setIsReapplying(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reapplyText}>다른 신분이나 서류로 재인증하기 &gt;</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStatus === 'rejected' && !isReapplying && (
              <View style={[styles.statusCard, styles.rejectedCard]}>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: '#FDE8E8' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#9B1C1C' }]}>✕ 인증 반려</Text>
                  </View>
                  <Text style={styles.statusDateText}>
                    {myRequest?.reviewedAt ? myRequest.reviewedAt.slice(0, 10) : '반려됨'}
                  </Text>
                </View>
                <Text style={styles.statusTitle}>인증 서류가 반려되었습니다</Text>
                <View style={styles.rejectReasonBox}>
                  <Text style={styles.rejectReasonLabel}>반려 사유:</Text>
                  <Text style={styles.rejectReasonText}>
                    {currentRejectReason || '서류 식별이 어렵거나 유효하지 않습니다.'}
                  </Text>
                </View>
                <Text style={styles.statusDesc}>
                  반려 사유를 확인하신 후, 정확한 정보와 선명한 서류로 다시 신청해 주세요.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setIsReapplying(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>서류 재제출하기</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Application Form (Show if status is none or user is reapplying) */}
            {(currentStatus === 'none' || isReapplying) && (
              <View style={styles.formContainer}>
                {isReapplying && (
                  <TouchableOpacity
                    style={styles.cancelReapplyBtn}
                    onPress={() => setIsReapplying(false)}
                  >
                    <Text style={styles.cancelReapplyText}>← 이전 상태로 돌아가기</Text>
                  </TouchableOpacity>
                )}

                {/* Target Role Selector */}
                <Text style={styles.sectionLabel}>1. 인증할 신분을 선택해주세요</Text>
                <View style={styles.roleTabRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleTab,
                      targetRole === 'nurse' && [styles.roleTabActive, { borderColor: theme.primary }],
                    ]}
                    onPress={() => setTargetRole('nurse')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleTabText,
                        targetRole === 'nurse' && [styles.roleTabTextActive, { color: theme.primary }],
                      ]}
                    >
                      👩‍⚕️ 임상 간호사
                    </Text>
                    <Text style={styles.roleTabSub}>면허증 / 재직증명서 / 웹메일</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleTab,
                      targetRole === 'student' && [styles.roleTabActive, { borderColor: theme.primary }],
                    ]}
                    onPress={() => setTargetRole('student')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleTabText,
                        targetRole === 'student' && [styles.roleTabTextActive, { color: theme.primary }],
                      ]}
                    >
                      🎓 간호대학생
                    </Text>
                    <Text style={styles.roleTabSub}>학생증 / 재학증명서</Text>
                  </TouchableOpacity>
                </View>

                {/* Document Type Selector */}
                <Text style={styles.sectionLabel}>2. 제출할 증빙 서류 유형</Text>
                <View style={styles.docTypeContainer}>
                  {docTypeList.map((item) => {
                    const isSelected = verificationType === item.type;
                    return (
                      <TouchableOpacity
                        key={item.type}
                        style={[
                          styles.docTypeItem,
                          isSelected && [styles.docTypeItemActive, { borderColor: theme.primary }],
                        ]}
                        onPress={() => setVerificationType(item.type)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.docTypeRadio}>
                          {isSelected && <View style={[styles.docTypeRadioDot, { backgroundColor: theme.primary }]} />}
                        </View>
                        <View style={styles.docTypeTextBox}>
                          <Text style={[styles.docTypeLabel, isSelected && { color: theme.primary, fontWeight: '700' }]}>
                            {item.label}
                          </Text>
                          <Text style={styles.docTypeDesc}>{item.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Organization & License Inputs */}
                <Text style={styles.sectionLabel}>
                  {targetRole === 'nurse' ? '3. 소속 병원명' : '3. 소속 대학교 및 학과'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={targetRole === 'nurse' ? '예: 서울아산병원, 신촌세브란스병원' : '예: 서울대학교 간호대학 3학년'}
                  placeholderTextColor="#9CA3AF"
                  value={organizationName}
                  onChangeText={setOrganizationName}
                />

                {targetRole === 'nurse' && (
                  <>
                    <Text style={styles.sectionLabel}>4. 간호사 면허번호 (선택)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="면허번호 입력 (서류와 일치해야 합니다)"
                      placeholderTextColor="#9CA3AF"
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      keyboardType="number-pad"
                    />
                  </>
                )}

                {/* Document Attachment */}
                <Text style={styles.sectionLabel}>
                  {targetRole === 'nurse' ? '5. 증빙 서류 첨부' : '4. 증빙 서류 첨부'}
                </Text>
                <View style={styles.fileBox}>
                  {documentUrl ? (
                    <View style={styles.fileSelectedContainer}>
                      <View style={styles.fileSelectedRow}>
                        {documentUrl.startsWith('file:') || documentUrl.startsWith('http') || documentUrl.startsWith('content:') ? (
                          <Image source={{ uri: documentUrl }} style={styles.docThumbnail} />
                        ) : (
                          <Text style={styles.fileSelectedIcon}>📄</Text>
                        )}
                        <View style={styles.fileSelectedInfo}>
                          <Text style={styles.fileSelectedName} numberOfLines={1}>
                            {documentName || '첨부서류'}
                          </Text>
                          <Text style={styles.fileSelectedStatus}>✓ 파일 첨부 완료</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.fileRemoveBtn}
                          onPress={() => {
                            setDocumentName('');
                            setDocumentUrl('');
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.fileRemoveText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.repickButton}
                        onPress={() => setPickerSheetVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.repickButtonText}>서류 다시 선택하기</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.fileEmptyBox}>
                      <Text style={styles.fileEmptyIcon}>📂</Text>
                      <Text style={styles.fileEmptyTitle}>
                        면허증 / 학생증 증빙 서류를 업로드해 주세요
                      </Text>
                      <Text style={styles.fileEmptyDesc}>
                        주민등록번호 뒷자리는 마스킹(가림) 처리 후 첨부해 주세요.{'\n'}
                        사진 보관함, 카메라 촬영, PDF 전자문서를 지원합니다.
                      </Text>
                      <TouchableOpacity
                        style={[styles.uploadButton, { backgroundColor: theme.primary }]}
                        onPress={() => setPickerSheetVisible(true)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.uploadButtonText}>+ 서류 사진 / 파일 첨부하기</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Notice */}
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeTitle}>📌 인증 심사 안내</Text>
                  <Text style={styles.noticeText}>
                    • 제출된 서류는 자격 확인 용도로만 사용되며 심사 완료 후 안전하게 암호화 보관됩니다.{'\n'}
                    • 허위 서류 제출 시 이용이 영구 정지될 수 있습니다.{'\n'}
                    • 간호사는 전 게시판을 이용할 수 있으며, 간호대생은 간호대생 라운지 및 채용 정보를 전용으로 이용할 수 있습니다.
                  </Text>
                </View>

                {/* Privacy Consent Checkbox */}
                <TouchableOpacity
                  style={styles.consentRow}
                  onPress={() => setAgreedPrivacy(!agreedPrivacy)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreedPrivacy && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                    {agreedPrivacy && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>
                    [필수] 전문직/학생 자격 인증을 위한 개인정보(신분·소속 증빙 서류) 수집 및 이용에 동의합니다.
                  </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>인증 서류 제출하기</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
      </View>
      <DocumentPickerActionSheet
        useModal={false}
        visible={pickerSheetVisible}
        onClose={() => setPickerSheetVisible(false)}
        onSelect={handleSelectDoc}
        title={targetRole === 'nurse' ? '간호사 자격 증빙 서류 첨부' : '간호대학생 증빙 서류 첨부'}
      />
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  verifiedCard: {
    backgroundColor: '#F3FAF7',
    borderColor: '#31C48D',
  },
  rejectedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusDateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  statusDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  infoBoxItem: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rejectReasonBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectReasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  rejectReasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  reapplyTextBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  reapplyText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 16,
  },
  cancelReapplyBtn: {
    marginBottom: 12,
  },
  cancelReapplyText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 18,
    marginBottom: 8,
  },
  roleTabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleTab: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
  },
  roleTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  roleTabTextActive: {},
  roleTabSub: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  docTypeContainer: {
    gap: 8,
  },
  docTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  docTypeItemActive: {
    backgroundColor: '#FFFFFF',
  },
  docTypeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docTypeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  docTypeTextBox: {
    flex: 1,
  },
  docTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  docTypeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  fileBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 14,
    padding: 14,
  },
  fileSelectedContainer: {
    gap: 10,
  },
  fileSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  fileSelectedIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  fileSelectedInfo: {
    flex: 1,
  },
  fileSelectedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileSelectedStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  fileRemoveBtn: {
    padding: 8,
  },
  fileRemoveText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  repickButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 4,
  },
  repickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  fileEmptyBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  fileEmptyIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  fileEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  fileEmptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  uploadButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noticeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
