import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ShieldCheckIcon, LockIcon } from './Icon';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import { PaymentMethodInfo } from '../../types/membershipEvent';

export interface InAppPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  sku?: string;
  options?: {
    planType?: 'monthly' | 'yearly';
    price?: number;
    isTrial?: boolean;
    isEarlybird?: boolean;
  };
}

type PaymentMethodType = 'card' | 'kakaopay' | 'tosspay' | 'naverpay';

export const InAppPurchaseModal: React.FC<InAppPurchaseModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  sku,
  options,
}) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 폼 입력 상태
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cardPassword2Digit, setCardPassword2Digit] = useState('');

  // 약관 동의 상태
  const [agreeAutoBilling, setAgreeAutoBilling] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // 등록 완료된 결제 수단 정보
  const [registeredMethod, setRegisteredMethod] = useState<PaymentMethodInfo | null>(null);

  // 초기화
  useEffect(() => {
    if (visible) {
      setStep('form');
      setErrorMessage('');
      setCardNumber('');
      setCardExpiry('');
      setBirthDate('');
      setCardPassword2Digit('');
      setRegisteredMethod(null);
    }
  }, [visible]);

  // 날짜 계산 (무료 체험 30일 또는 정규 결제 주기)
  const isTrial = options?.isTrial !== false;
  const today = new Date();
  const nextBillingDateObj = new Date(today);
  if (isTrial) {
    nextBillingDateObj.setDate(nextBillingDateObj.getDate() + 30);
  } else {
    if (options?.planType === 'yearly') {
      nextBillingDateObj.setFullYear(nextBillingDateObj.getFullYear() + 1);
    } else {
      nextBillingDateObj.setMonth(nextBillingDateObj.getMonth() + 1);
    }
  }
  const formattedNextBilling = `${nextBillingDateObj.getFullYear()}. ${String(nextBillingDateObj.getMonth() + 1).padStart(2, '0')}. ${String(nextBillingDateObj.getDate()).padStart(2, '0')}`;

  const planLabel = options?.planType === 'yearly' ? '연간' : '월간';
  const priceLabel = options?.price ? `₩${options.price.toLocaleString()}` : (options?.planType === 'yearly' ? '₩59,000' : '₩5,900');

  // 카드 번호 자동 포맷터 (4자리마다 띄어쓰기)
  const handleCardNumberChange = (text: string) => {
    const rawDigits = text.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' - ') || rawDigits;
    setCardNumber(formatted);
  };

  // 유효기간 포맷터 (MM / YY)
  const handleExpiryChange = (text: string) => {
    const rawDigits = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (rawDigits.length >= 3) {
      setCardExpiry(`${rawDigits.slice(0, 2)} / ${rawDigits.slice(2, 4)}`);
    } else {
      setCardExpiry(rawDigits);
    }
  };

  // 생년월일 포맷터 (6자리 YYMMDD)
  const handleBirthChange = (text: string) => {
    const rawDigits = text.replace(/[^0-9]/g, '').slice(0, 6);
    setBirthDate(rawDigits);
  };

  // 비밀번호 앞 2자리 포맷터
  const handlePasswordChange = (text: string) => {
    const rawDigits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setCardPassword2Digit(rawDigits);
  };

  // 카드사 판별
  const getCardIssuer = (rawDigits: string): string => {
    if (rawDigits.startsWith('4')) return '신한/비자카드';
    if (rawDigits.startsWith('5')) return '국민/마스터카드';
    if (rawDigits.startsWith('3')) return '현대카드';
    if (rawDigits.startsWith('9')) return 'KB국민카드';
    if (rawDigits.startsWith('6')) return 'BC/우리카드';
    return '신용/체크카드';
  };

  // 전체 약관 동의 토글
  const handleToggleAllTerms = () => {
    const nextVal = !(agreeAutoBilling && agreeTerms);
    setAgreeAutoBilling(nextVal);
    setAgreeTerms(nextVal);
  };

  // 폼 검증
  const rawCardDigits = cardNumber.replace(/[^0-9]/g, '');
  const rawExpiryDigits = cardExpiry.replace(/[^0-9]/g, '');

  const isFormValid =
    paymentType !== 'card' ||
    (rawCardDigits.length === 16 &&
      rawExpiryDigits.length === 4 &&
      birthDate.length === 6 &&
      cardPassword2Digit.length === 2 &&
      agreeAutoBilling &&
      agreeTerms);

  // 0원 정기 결제 수단 등록 제출
  const handleSubmitPaymentMethod = async () => {
    if (paymentType === 'card') {
      if (rawCardDigits.length < 16) {
        Alert.alert('확인', '카드 번호 16자리를 모두 입력해 주세요.');
        return;
      }
      const expMonth = parseInt(rawExpiryDigits.slice(0, 2), 10);
      if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
        Alert.alert('확인', '유효기간 월(01~12)을 올바르게 입력해 주세요.');
        return;
      }
      if (birthDate.length < 6) {
        Alert.alert('확인', '생년월일 6자리를 입력해 주세요.');
        return;
      }
      if (cardPassword2Digit.length < 2) {
        Alert.alert('확인', '비밀번호 앞 2자리를 입력해 주세요.');
        return;
      }
    }

    if (!agreeAutoBilling || !agreeTerms) {
      Alert.alert('약관 동의 필요', '정기 자동결제 및 필수 이용약관에 동의해 주세요.');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    // 결제 수단 정보 객체 생성
    const cardIssuer = paymentType === 'card' ? getCardIssuer(rawCardDigits) : (
      paymentType === 'kakaopay' ? '카카오페이' :
      paymentType === 'tosspay' ? '토스페이' : '네이버페이'
    );

    const maskedNum = paymentType === 'card'
      ? `****-****-****-${rawCardDigits.slice(-4)}`
      : `${cardIssuer} 간편결제 연동`;

    const paymentMethodObj: PaymentMethodInfo = {
      type: paymentType,
      name: cardIssuer,
      maskedNumber: maskedNum,
      registeredAt: new Date().toISOString(),
    };

    try {
      const result = await inAppPurchaseService.requestSubscription(sku, {
        ...options,
        paymentMethod: paymentMethodObj,
      });

      if (result.success) {
        setRegisteredMethod(paymentMethodObj);
        setStep('success');
      } else {
        setStep('error');
        setErrorMessage(result.errorMessage || '결제 수단 등록에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (err: any) {
      setStep('error');
      setErrorMessage(err?.message || '결제 시스템 연결 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmSuccess = () => {
    onPaymentSuccess();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrapper}
        >
          <View style={styles.dialogCard}>
            {/* 상단 헤더 */}
            <View style={styles.dialogHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="lock-closed" size={16} color="#FF507C" />
                <Text style={styles.headerTitle}>
                  {step === 'success' ? '결제 등록 완료' : '자동 결제 정보 등록'}
                </Text>
              </View>
              {step !== 'processing' && (
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={22} color="#191F28" />
                </TouchableOpacity>
              )}
            </View>

            {/* 1단계: 결제 수단 입력 폼 */}
            {step === 'form' && (
              <ScrollView
                style={styles.formScrollView}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 0원 무료 체험 및 결제 혜택 박스 */}
                <View style={styles.summaryNoticeBox}>
                  <View style={styles.noticeBadgeRow}>
                    <View style={styles.noticeBadge}>
                      <Text style={styles.noticeBadgeText}>
                        {isTrial ? '🎁 첫 1개월 100% 무료' : '정기 구독'}
                      </Text>
                    </View>
                    <Text style={styles.todayPriceZero}>
                      {isTrial ? '오늘 결제 금액 0원' : `오늘 결제: ${priceLabel}`}
                    </Text>
                  </View>
                  <Text style={styles.noticeTitle}>
                    {isTrial ? '결제 정보 등록 즉시 30일 무료 체험 시작' : `${planLabel} 정기 결제 수단 등록`}
                  </Text>
                  <Text style={styles.noticeDesc}>
                    {isTrial
                      ? `• 30일간 비용 0원으로 모든 weganda+ 혜택을 이용하세요.\n• 무료 체험 종료일인 `
                      : `• 등록하신 결제 수단으로 ${priceLabel}이 결제되며, `}
                    <Text style={styles.noticeBold}>{formattedNextBilling}</Text>
                    {isTrial
                      ? `부터 등록하신 결제 정보로 ${priceLabel} (${planLabel}) 자동 결제됩니다.\n• 종료 전 언제든 마이페이지에서 위약금 0원으로 해지 가능합니다.`
                      : `에 매 ${options?.planType === 'yearly' ? '년' : '월'} 자동 갱신됩니다.\n• 언제든 마이페이지에서 간편하게 해지 예약하실 수 있습니다.`}
                  </Text>
                </View>

                {/* 결제 수단 탭 선택 */}
                <Text style={styles.inputSectionTitle}>결제 수단 선택</Text>
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, paymentType === 'card' && styles.tabButtonActive]}
                    onPress={() => setPaymentType('card')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={paymentType === 'card' ? '#FF507C' : '#6B7280'}
                    />
                    <Text style={[styles.tabText, paymentType === 'card' && styles.tabTextActive]}>
                      신용/체크카드
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabButton, paymentType !== 'card' && styles.tabButtonActive]}
                    onPress={() => setPaymentType('kakaopay')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color={paymentType !== 'card' ? '#FF507C' : '#6B7280'}
                    />
                    <Text style={[styles.tabText, paymentType !== 'card' && styles.tabTextActive]}>
                      간편결제
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 신용/체크카드 입력 양식 */}
                {paymentType === 'card' ? (
                  <View style={styles.cardInputGroup}>
                    {/* 카드 번호 */}
                    <View style={styles.inputFieldBox}>
                      <View style={styles.labelRow}>
                        <Text style={styles.fieldLabel}>카드 번호</Text>
                        {rawCardDigits.length >= 4 && (
                          <Text style={styles.cardIssuerHint}>
                            {getCardIssuer(rawCardDigits)}
                          </Text>
                        )}
                      </View>
                      <TextInput
                        style={styles.textInput}
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                        placeholder="0000 - 0000 - 0000 - 0000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={25}
                      />
                    </View>

                    {/* 유효기간 & 생년월일 */}
                    <View style={styles.twoColumnRow}>
                      <View style={[styles.inputFieldBox, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>유효기간</Text>
                        <TextInput
                          style={styles.textInput}
                          value={cardExpiry}
                          onChangeText={handleExpiryChange}
                          placeholder="MM / YY"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          maxLength={7}
                        />
                      </View>

                      <View style={[styles.inputFieldBox, { flex: 1.2 }]}>
                        <Text style={styles.fieldLabel}>생년월일 (6자리)</Text>
                        <TextInput
                          style={styles.textInput}
                          value={birthDate}
                          onChangeText={handleBirthChange}
                          placeholder="YYMMDD (예: 960514)"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          maxLength={6}
                        />
                      </View>
                    </View>

                    {/* 비밀번호 앞 2자리 */}
                    <View style={styles.inputFieldBox}>
                      <Text style={styles.fieldLabel}>비밀번호 앞 2자리</Text>
                      <View style={styles.passwordRow}>
                        <TextInput
                          style={[styles.textInput, styles.passwordInput]}
                          value={cardPassword2Digit}
                          onChangeText={handlePasswordChange}
                          placeholder="● ●"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          secureTextEntry={true}
                          maxLength={2}
                        />
                        <Text style={styles.passwordMaskedDots}>* *</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* 간편결제 선택 */
                  <View style={styles.easyPayGroup}>
                    <TouchableOpacity
                      style={[styles.easyPayOption, paymentType === 'kakaopay' && styles.easyPayOptionActive]}
                      onPress={() => setPaymentType('kakaopay')}
                    >
                      <View style={styles.easyPayLeft}>
                        <View style={[styles.payBadge, { backgroundColor: '#FEE500' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#191F28' }}>카카오</Text>
                        </View>
                        <Text style={styles.easyPayName}>카카오페이 자동결제</Text>
                      </View>
                      <Ionicons
                        name={paymentType === 'kakaopay' ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={paymentType === 'kakaopay' ? '#FF507C' : '#9CA3AF'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.easyPayOption, paymentType === 'tosspay' && styles.easyPayOptionActive]}
                      onPress={() => setPaymentType('tosspay')}
                    >
                      <View style={styles.easyPayLeft}>
                        <View style={[styles.payBadge, { backgroundColor: '#0064FF' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>토스</Text>
                        </View>
                        <Text style={styles.easyPayName}>토스페이 자동결제</Text>
                      </View>
                      <Ionicons
                        name={paymentType === 'tosspay' ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={paymentType === 'tosspay' ? '#FF507C' : '#9CA3AF'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.easyPayOption, paymentType === 'naverpay' && styles.easyPayOptionActive]}
                      onPress={() => setPaymentType('naverpay')}
                    >
                      <View style={styles.easyPayLeft}>
                        <View style={[styles.payBadge, { backgroundColor: '#03C75A' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>N페이</Text>
                        </View>
                        <Text style={styles.easyPayName}>네이버페이 자동결제</Text>
                      </View>
                      <Ionicons
                        name={paymentType === 'naverpay' ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={paymentType === 'naverpay' ? '#FF507C' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* 약관 동의 체크박스 */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.allTermsRow}
                    onPress={handleToggleAllTerms}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={agreeAutoBilling && agreeTerms ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={agreeAutoBilling && agreeTerms ? '#FF507C' : '#9CA3AF'}
                    />
                    <Text style={styles.allTermsText}>전체 약관에 동의합니다</Text>
                  </TouchableOpacity>

                  <View style={styles.subTermsList}>
                    <TouchableOpacity
                      style={styles.subTermRow}
                      onPress={() => setAgreeAutoBilling(!agreeAutoBilling)}
                    >
                      <Ionicons
                        name={agreeAutoBilling ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={agreeAutoBilling ? '#FF507C' : '#9CA3AF'}
                      />
                      <Text style={styles.subTermText}>
                        [필수] 정기 과금 및 매월 자동결제 이용 동의
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.subTermRow}
                      onPress={() => setAgreeTerms(!agreeTerms)}
                    >
                      <Ionicons
                        name={agreeTerms ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={agreeTerms ? '#FF507C' : '#9CA3AF'}
                      />
                      <Text style={styles.subTermText}>
                        [필수] 전자금융거래 및 개인정보 제공 동의
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 제출 CTA 버튼 */}
                <TouchableOpacity
                  style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                  onPress={handleSubmitPaymentMethod}
                  activeOpacity={0.88}
                >
                  <Text style={styles.submitButtonText}>
                    {isTrial ? '0원으로 1개월 무료 체험 시작하기' : `${priceLabel} 결제 및 구독 시작하기`}
                  </Text>
                </TouchableOpacity>

                <View style={styles.secureFooter}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                  <Text style={styles.secureFooterText}>
                    256-bit SSL 암호화 금융 보안 프로토콜 적용
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* 2단계: 승인 처리 중 */}
            {step === 'processing' && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF507C" style={{ marginBottom: 20 }} />
                <Text style={styles.processingTitle}>
                  {isTrial ? '0원 인증 및 결제 수단 등록 중' : '결제 승인 및 정기 결제 등록 중'}
                </Text>
                <Text style={styles.processingSub}>
                  카드사 본인 확인 및 정기 자동결제 빌링키를 안전하게 생성하고 있습니다.
                </Text>
              </View>
            )}

            {/* 3단계: 등록 완료 */}
            {step === 'success' && (
              <View style={styles.centerContainer}>
                <View style={styles.successIconCircle}>
                  <ShieldCheckIcon color="#10B981" size={48} />
                </View>
                <Text style={styles.successTitle}>
                  {isTrial ? '🎉 첫 1개월 무료 체험 시작!' : '🎉 정기 구독이 완료되었습니다!'}
                </Text>
                <Text style={styles.successDesc}>
                  {isTrial
                    ? `결제 수단이 정상 등록되었습니다.\n오늘부터 30일 동안 weganda+의 모든 혜택을 0원에 누려보세요.`
                    : `결제가 성공적으로 처리되었습니다.\nweganda+의 모든 프리미엄 혜택이 즉시 적용되었습니다.`}
                </Text>

                <View style={styles.successCardBox}>
                  <View style={styles.successCardRow}>
                    <Text style={styles.cardLabel}>등록된 결제 수단</Text>
                    <Text style={styles.cardVal}>{registeredMethod?.name} ({registeredMethod?.maskedNumber?.slice(-4) || '간편결제'})</Text>
                  </View>
                  <View style={styles.successCardRow}>
                    <Text style={styles.cardLabel}>첫 자동 결제일</Text>
                    <Text style={styles.cardValBold}>{formattedNextBilling}</Text>
                  </View>
                  <View style={styles.successCardRow}>
                    <Text style={styles.cardLabel}>결제 예정 금액</Text>
                    <Text style={[styles.cardValBold, { color: '#FF507C' }]}>{priceLabel} / {planLabel}</Text>
                  </View>
                </View>

                <Text style={styles.cancelNoteText}>
                  * 무료 체험 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
                </Text>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleConfirmSuccess}
                  activeOpacity={0.88}
                >
                  <Text style={styles.submitButtonText}>혜택 시작하기</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4단계: 오류 발생 */}
            {step === 'error' && (
              <View style={styles.centerContainer}>
                <View style={styles.errorIconCircle}>
                  <LockIcon color="#EF4444" size={40} />
                </View>
                <Text style={styles.errorTitle}>결제 수단 등록 실패</Text>
                <Text style={styles.errorDescription}>
                  {errorMessage || '카드 정보가 올바르지 않거나 카드사 응답이 지연되고 있습니다.'}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setStep('form')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.retryButtonText}>다시 입력하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.closeButtonText}>닫기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191F28',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 2,
  },
  formScrollView: {
    flexGrow: 0,
  },
  formScrollContent: {
    paddingBottom: 10,
  },
  summaryNoticeBox: {
    backgroundColor: '#FFF5F7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD1DC',
    marginBottom: 16,
  },
  noticeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noticeBadge: {
    backgroundColor: '#FF507C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noticeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  todayPriceZero: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF507C',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: '#4E5968',
    lineHeight: 18,
  },
  noticeBold: {
    fontWeight: '700',
    color: '#191F28',
  },
  inputSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF507C',
    fontWeight: '700',
  },
  cardInputGroup: {
    gap: 10,
    marginBottom: 16,
  },
  inputFieldBox: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E5968',
  },
  cardIssuerHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF507C',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#191F28',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passwordInput: {
    width: 90,
    textAlign: 'center',
    letterSpacing: 4,
  },
  passwordMaskedDots: {
    fontSize: 18,
    color: '#9CA3AF',
    letterSpacing: 4,
    fontWeight: '700',
  },
  easyPayGroup: {
    gap: 8,
    marginBottom: 16,
  },
  easyPayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  easyPayOptionActive: {
    borderColor: '#FF507C',
    backgroundColor: '#FFF9FA',
  },
  easyPayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  easyPayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191F28',
  },
  termsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  allTermsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
    marginBottom: 8,
  },
  allTermsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#191F28',
  },
  subTermsList: {
    gap: 6,
  },
  subTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subTermText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF507C',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  secureFooterText: {
    fontSize: 11,
    color: '#8B95A1',
    fontWeight: '500',
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  processingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 8,
  },
  processingSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  successDesc: {
    fontSize: 14,
    color: '#4E5968',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  successCardBox: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    gap: 8,
    marginBottom: 14,
  },
  successCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardVal: {
    fontSize: 13,
    color: '#191F28',
    fontWeight: '600',
  },
  cardValBold: {
    fontSize: 14,
    color: '#191F28',
    fontWeight: '700',
  },
  cancelNoteText: {
    fontSize: 12,
    color: '#8B95A1',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#FF507C',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#4E5968',
    fontSize: 14,
    fontWeight: '600',
  },
});
