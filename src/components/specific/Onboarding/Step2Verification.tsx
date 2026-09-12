import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { Button } from '../../common';
import { OnboardingRole } from './Step1ProfileSetup';
import {
  VerificationType,
  VerificationSubmissionData,
} from '../../../types/verification';
import { DocumentPickerActionSheet, PickedDocument } from '../../common/DocumentPickerActionSheet';

interface Step2VerificationProps {
  role: OnboardingRole;
  organizationName: string;
  onSubmitVerification: (data: VerificationSubmissionData) => Promise<void>;
  onSkip: () => void;
  onNext: () => void;
}

const NURSE_DOCS = [
  { type: 'license' as VerificationType, label: '간호사 면허증', desc: '보건복지부 발급 면허증' },
  { type: 'employee_id' as VerificationType, label: '병원 사원증', desc: '성명/병원명 표기 사원증' },
  { type: 'employment_cert' as VerificationType, label: '재직증명서', desc: '3개월 이내 발급 서류' },
];

const STUDENT_DOCS = [
  { type: 'student_id' as VerificationType, label: '학생증', desc: '간호학과 표기 학생증' },
  { type: 'enrollment_cert' as VerificationType, label: '재학증명서', desc: '최근 발급 재학증명서' },
  { type: 'tuition_bill' as VerificationType, label: '등록금 납부서', desc: '당해 학기 납부 영수증' },
];

export const Step2Verification: React.FC<Step2VerificationProps> = ({
  role,
  organizationName,
  onSubmitVerification,
  onSkip,
  onNext,
}) => {
  const [track, setTrack] = useState<'email' | 'doc'>('doc');
  const [emailInput, setEmailInput] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<VerificationType>(
    role === 'nurse' ? 'license' : 'student_id'
  );
  const [attachedDocName, setAttachedDocName] = useState('');
  const [attachedDocUrl, setAttachedDocUrl] = useState('');
  const [pickerSheetVisible, setPickerSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docOptions = role === 'nurse' ? NURSE_DOCS : STUDENT_DOCS;

  const handleSelectDoc = (doc: PickedDocument) => {
    setAttachedDocName(doc.name);
    setAttachedDocUrl(doc.uri);
  };

  const handleCompleteVerification = async () => {
    if (track === 'email') {
      if (!emailInput.trim() || !emailInput.includes('@')) {
        Alert.alert('확인', '올바른 공식 이메일 주소를 입력해 주세요.');
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmitVerification({
          targetRole: role,
          verificationType: role === 'nurse' ? 'work_email' : 'nurse_email',
          organizationName,
          documentName: `${emailInput} (이메일 인증 요청)`,
          documentUrl: emailInput,
        });
        onNext();
      } catch {
        Alert.alert('오류', '인증 요청 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!attachedDocName || !attachedDocUrl) {
        Alert.alert('확인', '증빙 서류 사진 또는 파일을 첨부해 주세요.');
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmitVerification({
          targetRole: role,
          verificationType: selectedDocType,
          organizationName,
          documentName: attachedDocName,
          documentUrl: attachedDocUrl,
        });
        onNext();
      } catch {
        Alert.alert('오류', '인증 요청 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 헤딩 영역 */}
      <View style={styles.headingSection}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>2단계 · 신원 인증</Text>
        </View>
        <Text style={styles.mainTitle}>
          {role === 'nurse'
            ? '간호사 면허를 인증해 주세요 🛡️'
            : '간호대학생 학생증을 인증해 주세요 🎓'}
        </Text>
        <Text style={styles.subtitle}>
          철저한 비밀 유지와 신뢰도 높은 임상 커뮤니티를 위해 필요해요.
        </Text>
      </View>

      {/* 인증 혜택 안내 카드 (Toss style Soft UI) */}
      <View style={styles.benefitCard}>
        <View style={styles.benefitHeader}>
          <View style={styles.benefitBadge}>
            <Text style={styles.benefitBadgeText}>인증 회원 독점 혜택</Text>
          </View>
        </View>
        <View style={styles.benefitList}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>
              {role === 'nurse' ? '소속 병원' : '소속 대학교'} 전용 익명 커뮤니티 글쓰기 권한
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👥</Text>
            <Text style={styles.benefitText}>
              동기·선후배 실시간 듀티 연동 및 맞교환 요청
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🧪</Text>
            <Text style={styles.benefitText}>
              현직 간호사 임상 족보 & EKG/약물 매뉴얼 열람
            </Text>
          </View>
        </View>
      </View>

      {/* 인증 방식 탭 (서류 업로드 vs 웹메일 인증) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, track === 'doc' && styles.tabButtonActive]}
          onPress={() => setTrack('doc')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, track === 'doc' && styles.tabButtonTextActive]}>
            📄 증빙 서류 첨부
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, track === 'email' && styles.tabButtonActive]}
          onPress={() => setTrack('email')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, track === 'email' && styles.tabButtonTextActive]}>
            ⚡ 공식 웹메일 인증
          </Text>
        </TouchableOpacity>
      </View>

      {/* 서류 첨부 모드 */}
      {track === 'doc' ? (
        <View style={styles.formArea}>
          <Text style={styles.sectionLabel}>제출할 서류 종류</Text>
          <View style={styles.docTypeList}>
            {docOptions.map((doc) => {
              const isSelected = selectedDocType === doc.type;
              return (
                <TouchableOpacity
                  key={doc.type}
                  style={[styles.docTypeCard, isSelected && styles.docTypeCardActive]}
                  onPress={() => setSelectedDocType(doc.type)}
                  activeOpacity={0.8}
                >
                  <View style={styles.docTypeRow}>
                    <Text
                      style={[
                        styles.docTypeTitle,
                        isSelected && styles.docTypeTitleActive,
                      ]}
                    >
                      {doc.label}
                    </Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                  <Text style={styles.docTypeDesc}>{doc.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 서류 첨부 박스 */}
          <Text style={styles.sectionLabel}>서류 사진 첨부</Text>
          <View style={styles.uploadBox}>
            {attachedDocName ? (
              <View style={styles.uploadedState}>
                <Text style={styles.uploadedIcon}>📎</Text>
                <View style={styles.uploadedInfo}>
                  <Text style={styles.uploadedName} numberOfLines={1}>
                    {attachedDocName}
                  </Text>
                  <Text style={styles.uploadedSuccess}>첨부 완료 (심사 준비 완료)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setAttachedDocName('');
                    setAttachedDocUrl('');
                  }}
                  style={styles.removeDocButton}
                >
                  <Text style={styles.removeDocText}>변경</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyUpload}>
                <Text style={styles.emptyUploadTitle}>
                  면허증 또는 증빙 서류를 등록해 주세요
                </Text>
                <Text style={styles.emptyUploadNotice}>
                  주민등록번호 뒷자리는 가려서 첨부해 주세요
                </Text>
                <TouchableOpacity
                  style={styles.uploadActionBtn}
                  onPress={() => setPickerSheetVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.uploadActionBtnText}>+ 서류 사진 / 파일 첨부하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        /* 이메일 인증 모드 */
        <View style={styles.formArea}>
          <Text style={styles.sectionLabel}>
            {role === 'nurse' ? '병원 공식 이메일 주소' : '대학교 웹메일 주소 (.ac.kr)'}
          </Text>
          <View style={styles.emailInputWrapper}>
            <TextInput
              style={styles.emailInput}
              placeholder={
                role === 'nurse'
                  ? 'nurse@amc.seoul.kr'
                  : 'student@snu.ac.kr'
              }
              placeholderTextColor="#9CA3AF"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.helperText}>
            입력하신 공식 이메일 정보를 바탕으로 심사팀이 재직/재학 여부 확인 후 승인을 진행합니다. (최대 24시간 소요)
          </Text>
        </View>
      )}

      {/* 하단 액션 버튼 그룹 */}
      <View style={styles.footerSection}>
        <Button
          title={
            isSubmitting
              ? '인증 신청 중...'
              : track === 'email'
              ? '공식 이메일 인증 신청하기'
              : '인증 서류 제출하고 다음으로'
          }
          onPress={handleCompleteVerification}
          loading={isSubmitting}
          style={styles.submitBtn}
        />

        {/* 이탈 방지 Skip 버튼 */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="나중에 인증하기"
        >
          <Text style={styles.skipBtnText}>나중에 마이페이지에서 인증할게요 ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    <DocumentPickerActionSheet
      visible={pickerSheetVisible}
      onClose={() => setPickerSheetVisible(false)}
      onSelect={handleSelectDoc}
      title={role === 'nurse' ? '간호사 자격 증빙 서류 첨부' : '간호대학생 증빙 서류 첨부'}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headingSection: {
    marginBottom: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  benefitCard: {
    backgroundColor: '#FFF8F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE8EE',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  benefitBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  benefitList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitIcon: {
    fontSize: 15,
  },
  benefitText: {
    fontSize: 13,
    color: '#4E5968',
    fontWeight: '600',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B95A1',
  },
  tabButtonTextActive: {
    color: '#191F28',
    fontWeight: '700',
  },
  formArea: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D4B',
    marginBottom: 10,
  },
  docTypeList: {
    gap: 8,
    marginBottom: 20,
  },
  docTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E8EB',
  },
  docTypeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F7',
  },
  docTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  docTypeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333D4B',
  },
  docTypeTitleActive: {
    color: COLORS.primary,
  },
  checkIcon: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  docTypeDesc: {
    fontSize: 12,
    color: '#8B95A1',
    fontWeight: '500',
  },
  uploadBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E8EB',
  },
  emptyUpload: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyUploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D4B',
    marginBottom: 4,
  },
  emptyUploadNotice: {
    fontSize: 12,
    color: '#8B95A1',
    marginBottom: 16,
  },
  uploadActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  uploadActionBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  uploadedState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadedIcon: {
    fontSize: 24,
  },
  uploadedInfo: {
    flex: 1,
  },
  uploadedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 2,
  },
  uploadedSuccess: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  removeDocButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E8EB',
    borderRadius: 8,
  },
  removeDocText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E5968',
  },
  emailInputWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 8,
  },
  emailInput: {
    fontSize: 15,
    color: '#191F28',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#8B95A1',
    lineHeight: 18,
  },
  footerSection: {
    gap: 12,
  },
  submitBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    color: '#8B95A1',
    fontWeight: '600',
  },
});

