import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useMembershipEventStore } from '../../../store/useMembershipEventStore';
import { IAP_SKUS, STANDARD_PRICING, EARLYBIRD_PRICING } from '../../../constants/membership';
import { adminApi } from '../../../services/adminApi';

export const AdminPaymentsTab: React.FC = () => {
  const {
    config,
    updateFreeTrialEvent,
    updateMonthlyDiscountEvent,
    updateYearlyDiscountEvent,
    resetToDefaultEvents,
    isFreeTrialActive,
    isMonthlyDiscountActive,
    isYearlyDiscountActive,
  } = useMembershipEventStore();

  // Local form states
  const [trialStart, setTrialStart] = useState(config.freeTrialEvent.startDate);
  const [trialEnd, setTrialEnd] = useState(config.freeTrialEvent.endDate);
  const [trialDays, setTrialDays] = useState(String(config.freeTrialEvent.trialDays || 30));
  const [promoTitle, setPromoTitle] = useState(config.freeTrialEvent.promoTitle || '첫 30일은 우간다가 쏩니다! 🎁');
  const [heroTitle, setHeroTitle] = useState(config.freeTrialEvent.heroTitle || '첫 30일 100% 무료 체험');
  const [ctaButtonText, setCtaButtonText] = useState(config.freeTrialEvent.ctaButtonText || '30일 무료 체험으로 시작하기');

  // Direct user grant states
  const [grantEmail, setGrantEmail] = useState('');
  const [grantDuration, setGrantDuration] = useState('1개월');
  const [isGranting, setIsGranting] = useState(false);

  const [monthlyPrice, setMonthlyPrice] = useState(String(config.monthlyDiscountEvent.discountedPrice));
  const [monthlyStart, setMonthlyStart] = useState(config.monthlyDiscountEvent.startDate);
  const [monthlyEnd, setMonthlyEnd] = useState(config.monthlyDiscountEvent.endDate);

  const [yearlyPrice, setYearlyPrice] = useState(String(config.yearlyDiscountEvent.discountedPrice));
  const [yearlyStart, setYearlyStart] = useState(config.yearlyDiscountEvent.startDate);
  const [yearlyEnd, setYearlyEnd] = useState(config.yearlyDiscountEvent.endDate);

  const handleSaveFreeTrial = async () => {
    const days = parseInt(trialDays, 10);
    if (isNaN(days) || days < 1) {
      Alert.alert('입력 확인', '무료 체험 기간은 1 이상의 숫자를 입력해주세요.');
      return;
    }
    const ok = await updateFreeTrialEvent({
      startDate: trialStart,
      endDate: trialEnd,
      trialDays: days,
      promoTitle,
      heroTitle,
      ctaButtonText,
    });
    if (ok) {
      Alert.alert('저장 완료', '무료 체험 기간 및 온보딩/프로모션 문구가 전체 사용자에게 적용되었습니다.');
    } else {
      Alert.alert('저장 실패', '서버에 반영하지 못했습니다. 관리자 권한 및 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    }
  };

  const handleGrantMembership = async () => {
    if (!grantEmail.trim()) {
      Alert.alert('확인', '지급할 회원의 이메일 또는 유저 ID를 입력해 주세요.');
      return;
    }
    setIsGranting(true);
    try {
      const usersRes = await adminApi.getUsers({ search: grantEmail.trim(), pageSize: 1 });
      const targetUser = usersRes.users[0];
      if (!targetUser) {
        Alert.alert('회원 조회 실패', '해당 이메일이나 ID의 회원을 찾을 수 없습니다.');
        return;
      }
      const ok = await adminApi.updateUserRole(targetUser.id, 'plus', true);
      if (ok) {
        Alert.alert(
          '멤버십 지급 완료',
          `${targetUser.name} (${targetUser.email}) 회원님에게 weganda+ 멤버십 (${grantDuration})이 성공적으로 부여되었습니다.`
        );
        setGrantEmail('');
      } else {
        Alert.alert('지급 실패', '권한 부여에 실패했습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '멤버십 지급 처리 중 오류가 발생했습니다.');
    } finally {
      setIsGranting(false);
    }
  };

  const handleSaveMonthlyDiscount = async () => {
    const p = parseInt(monthlyPrice, 10);
    if (isNaN(p) || p <= 0) {
      Alert.alert('확인', '올바른 금액을 입력해 주세요.');
      return;
    }
    const ok = await updateMonthlyDiscountEvent({
      discountedPrice: p,
      startDate: monthlyStart,
      endDate: monthlyEnd,
    });
    if (ok) {
      Alert.alert('저장 완료', '월간 얼리버드 할인 설정이 전체 사용자에게 적용되었습니다.');
    } else {
      Alert.alert('저장 실패', '서버에 반영하지 못했습니다. 관리자 권한 및 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    }
  };

  const handleSaveYearlyDiscount = async () => {
    const p = parseInt(yearlyPrice, 10);
    if (isNaN(p) || p <= 0) {
      Alert.alert('확인', '올바른 금액을 입력해 주세요.');
      return;
    }
    const ok = await updateYearlyDiscountEvent({
      discountedPrice: p,
      startDate: yearlyStart,
      endDate: yearlyEnd,
    });
    if (ok) {
      Alert.alert('저장 완료', '연간 얼리버드 할인 설정이 전체 사용자에게 적용되었습니다.');
    } else {
      Alert.alert('저장 실패', '서버에 반영하지 못했습니다. 관리자 권한 및 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '설정 초기화',
      '런칭 이벤트 초기 설정(출시 3개월간 무료체험, 1개월간 월 5,900원/연 59,000원)으로 복원하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원하기',
          style: 'destructive',
          onPress: async () => {
            const ok = await resetToDefaultEvents();
            const def = useMembershipEventStore.getState().config;
            setTrialStart(def.freeTrialEvent.startDate);
            setTrialEnd(def.freeTrialEvent.endDate);
            setTrialDays(String(def.freeTrialEvent.trialDays || 30));
            setPromoTitle(def.freeTrialEvent.promoTitle || '첫 30일은 우간다가 쏩니다! 🎁');
            setHeroTitle(def.freeTrialEvent.heroTitle || '첫 30일 100% 무료 체험');
            setCtaButtonText(def.freeTrialEvent.ctaButtonText || '30일 무료 체험으로 시작하기');
            setMonthlyPrice(String(def.monthlyDiscountEvent.discountedPrice));
            setMonthlyStart(def.monthlyDiscountEvent.startDate);
            setMonthlyEnd(def.monthlyDiscountEvent.endDate);
            setYearlyPrice(String(def.yearlyDiscountEvent.discountedPrice));
            setYearlyStart(def.yearlyDiscountEvent.startDate);
            setYearlyEnd(def.yearlyDiscountEvent.endDate);
            if (ok) {
              Alert.alert('초기화 완료', '모든 이벤트 설정이 출시 기본값으로 복원되어 전체 사용자에게 적용되었습니다.');
            } else {
              Alert.alert('초기화 실패', '서버에 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }
          },
        },
      ]
    );
  };

  const trialActive = isFreeTrialActive();
  const monthlyActive = isMonthlyDiscountActive();
  const yearlyActive = isYearlyDiscountActive();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── 상단 앱스토어/구글플레이 정책 및 안내 배너 ── */}
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeIcon}>ℹ️</Text>
        <Text style={styles.noticeText}>
          ※ 스토어(App Store Connect / Google Play Console) 콘솔에 설정된 실제 인앱 상품 정책이 최종 적용되며, 본 설정은 앱 내 안내 문구 및 모의 환경 동기화에 사용됩니다.
        </Text>
      </View>

      {/* ── 상단 현황 카드 ── */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>1개월 무료 체험</Text>
          <Text style={[styles.summaryVal, { color: trialActive ? '#059669' : '#9CA3AF' }]}>
            {trialActive ? '진행 중' : '종료됨'}
          </Text>
          <Text style={styles.summarySub}>{config.freeTrialEvent.endDate}까지</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>월간 멤버십 적용가</Text>
          <Text style={[styles.summaryVal, { color: monthlyActive ? '#FF507C' : '#111827' }]}>
            {monthlyActive
              ? `₩${config.monthlyDiscountEvent.discountedPrice.toLocaleString()}`
              : `₩${STANDARD_PRICING.monthly.toLocaleString()}`}
          </Text>
          <Text style={styles.summarySub}>
            {monthlyActive ? '평생 얼리버드 특가' : '정규 가격'}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>연간 멤버십 적용가</Text>
          <Text style={[styles.summaryVal, { color: yearlyActive ? '#FF507C' : '#111827' }]}>
            {yearlyActive
              ? `₩${config.yearlyDiscountEvent.discountedPrice.toLocaleString()}`
              : `₩${STANDARD_PRICING.yearly.toLocaleString()}`}
          </Text>
          <Text style={styles.summarySub}>
            {yearlyActive ? '평생 얼리버드 특가' : '정규 가격'}
          </Text>
        </View>
      </View>

      {/* ── 이벤트 1: 1개월 무료 체험 이벤트 관리 ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionIcon}>🎁</Text>
            <View>
              <Text style={styles.sectionTitle}>이벤트 1: 1개월 무료 우간다+ 멤버십 제공</Text>
              <Text style={styles.sectionDesc}>
                출시 후 3개월간 가입 고객 대상 1개월 무료 체험 (결제 수단 등록 필수, 종료 후 자동 정기 결제)
              </Text>
            </View>
          </View>
          <Switch
            value={config.freeTrialEvent.isEnabled}
            onValueChange={async (val) => {
              const ok = await updateFreeTrialEvent({ isEnabled: val });
              if (!ok) Alert.alert('변경 실패', '서버에 반영하지 못해 이전 상태로 되돌렸습니다.');
            }}
            trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
            thumbColor={config.freeTrialEvent.isEnabled ? '#EA580C' : '#94A3B8'}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 시작일 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={trialStart}
              onChangeText={setTrialStart}
              placeholder="2026-09-11"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 종료일 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={trialEnd}
              onChangeText={setTrialEnd}
              placeholder="2026-12-11"
            />
          </View>
          <View style={[styles.formCol, { flex: 0.8 }]}>
            <Text style={styles.inputLabel}>무료체험 기간 (일)</Text>
            <TextInput
              style={styles.input}
              value={trialDays}
              onChangeText={setTrialDays}
              keyboardType="number-pad"
              placeholder="30"
            />
          </View>
        </View>

        <Text style={styles.trialWarningCaption}>
          ※ 이 값은 앱 내 안내 문구에만 적용되며, 실제 청구 시점은 App Store Connect / Google Play Console에 등록된 구독 오퍼 기간이 우선 적용됩니다. 두 값을 반드시 동일하게 유지하세요.
          {'\n'}※ 멤버십 이용약관(src/constants/legal/membershipTerms.ts)의 "30일 무료 체험" 문구는 자동으로 연동되지 않습니다. 체험 기간을 변경할 경우 법무 검토 후 약관 문구도 함께 수동으로 수정해 주세요.
        </Text>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>온보딩 메인 문구 (promoTitle)</Text>
            <TextInput
              style={styles.input}
              value={promoTitle}
              onChangeText={setPromoTitle}
              placeholder="첫 30일은 우간다가 쏩니다! 🎁"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>혜택 카드 강조 문구 (heroTitle)</Text>
            <TextInput
              style={styles.input}
              value={heroTitle}
              onChangeText={setHeroTitle}
              placeholder="첫 30일 100% 무료 체험"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>CTA 시작 버튼 문구 (ctaButtonText)</Text>
            <TextInput
              style={styles.input}
              value={ctaButtonText}
              onChangeText={setCtaButtonText}
              placeholder="30일 무료 체험으로 시작하기"
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.statusText}>
            상태: {trialActive ? '🟢 현재 사용자 앱에 무료체험 적용 중' : '⚪ 비활성 또는 기간 만료'}
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFreeTrial}>
            <Text style={styles.saveBtnText}>기간 설정 저장</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 이벤트 2: 월간 멤버십 얼리버드 평생할인 관리 ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionIcon}>🏷️</Text>
            <View>
              <Text style={styles.sectionTitle}>이벤트 2: 월간 멤버십 평생 5,900원 특가 (정상가 7,900원)</Text>
              <Text style={styles.sectionDesc}>
                출시 후 1개월간 가입하는 고객에게 월 7,900원을 평생 5,900원에 제공 (해지 시까지 영구 유지)
              </Text>
            </View>
          </View>
          <Switch
            value={config.monthlyDiscountEvent.isEnabled}
            onValueChange={async (val) => {
              const ok = await updateMonthlyDiscountEvent({ isEnabled: val });
              if (!ok) Alert.alert('변경 실패', '서버에 반영하지 못해 이전 상태로 되돌렸습니다.');
            }}
            trackColor={{ false: '#E2E8F0', true: '#FCE7F3' }}
            thumbColor={config.monthlyDiscountEvent.isEnabled ? '#FF507C' : '#94A3B8'}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>평생 할인가 (원)</Text>
            <TextInput
              style={styles.input}
              value={monthlyPrice}
              onChangeText={setMonthlyPrice}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 시작일</Text>
            <TextInput style={styles.input} value={monthlyStart} onChangeText={setMonthlyStart} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 종료일</Text>
            <TextInput style={styles.input} value={monthlyEnd} onChangeText={setMonthlyEnd} />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.statusText}>
            연동 SKU: <Text style={styles.skuHighlight}>{IAP_SKUS.MONTHLY_EARLYBIRD}</Text>
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMonthlyDiscount}>
            <Text style={styles.saveBtnText}>월간 할인 저장</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 이벤트 3: 연간 멤버십 얼리버드 평생할인 관리 ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionIcon}>⭐</Text>
            <View>
              <Text style={styles.sectionTitle}>이벤트 3: 연간 멤버십 평생 59,000원 특가 (정상가 70,000원)</Text>
              <Text style={styles.sectionDesc}>
                출시 1개월간 연간 결제 시 기존 70,000원을 평생 59,000원(월 4,916원 꼴)에 제공
              </Text>
            </View>
          </View>
          <Switch
            value={config.yearlyDiscountEvent.isEnabled}
            onValueChange={async (val) => {
              const ok = await updateYearlyDiscountEvent({ isEnabled: val });
              if (!ok) Alert.alert('변경 실패', '서버에 반영하지 못해 이전 상태로 되돌렸습니다.');
            }}
            trackColor={{ false: '#E2E8F0', true: '#FCE7F3' }}
            thumbColor={config.yearlyDiscountEvent.isEnabled ? '#FF507C' : '#94A3B8'}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>연간 평생 할인가 (원)</Text>
            <TextInput
              style={styles.input}
              value={yearlyPrice}
              onChangeText={setYearlyPrice}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 시작일</Text>
            <TextInput style={styles.input} value={yearlyStart} onChangeText={setYearlyStart} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>이벤트 종료일</Text>
            <TextInput style={styles.input} value={yearlyEnd} onChangeText={setYearlyEnd} />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.statusText}>
            연동 SKU: <Text style={styles.skuHighlight}>{IAP_SKUS.YEARLY_EARLYBIRD}</Text>
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveYearlyDiscount}>
            <Text style={styles.saveBtnText}>연간 할인 저장</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 이벤트 4: 특정 회원 멤버십 직접 지급 (Admin Grant) ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionIcon}>👑</Text>
            <View>
              <Text style={styles.sectionTitle}>특정 회원 weganda+ 멤버십 직접 지급 (관리자 권한)</Text>
              <Text style={styles.sectionDesc}>
                특정 회원의 이메일 또는 유저 ID로 조회하여 지정 기간 동안 프리미엄 멤버십 권한을 즉시 부여합니다.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formCol, { flex: 2 }]}>
            <Text style={styles.inputLabel}>회원 이메일 또는 유저 ID</Text>
            <TextInput
              style={styles.input}
              value={grantEmail}
              onChangeText={setGrantEmail}
              placeholder="예: nurse@hospital.com 또는 UUID"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>지급 기간</Text>
            <View style={styles.durationRow}>
              {['1개월', '3개월', '6개월', '1년', '평생'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationPill,
                    grantDuration === dur && styles.durationPillActive,
                  ]}
                  onPress={() => setGrantDuration(dur)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationPillText,
                      grantDuration === dur && styles.durationPillTextActive,
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.statusText}>
            지급 즉시 회원의 role이 'plus'로 갱신되며 유료 기능이 활성화됩니다.
          </Text>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#1B4332' }, isGranting && { opacity: 0.6 }]}
            onPress={handleGrantMembership}
            disabled={isGranting}
          >
            <Text style={[styles.saveBtnText, { color: '#D4A853' }]}>
              {isGranting ? '지급 처리 중...' : '멤버십 즉시 지급'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── IAP 스토어 연동 매핑 명세서 ── */}
      <View style={styles.skuSpecCard}>
        <Text style={styles.skuSpecTitle}>📱 App Store & Google Play 콘솔 등록 명세서 (IAP SKU)</Text>
        <Text style={styles.skuSpecSubtitle}>
          스토어 콘솔(App Store Connect 및 Google Play Console)에 아래 4개 구독 상품을 동일 ID로 등록해 주세요.
        </Text>

        <View style={styles.skuTable}>
          <View style={styles.skuTableHeader}>
            <Text style={[styles.skuTh, { flex: 2 }]}>상품명 및 구분</Text>
            <Text style={[styles.skuTh, { flex: 3 }]}>스토어 Product ID (SKU)</Text>
            <Text style={[styles.skuTh, { flex: 1.5 }]}>기준 가격</Text>
            <Text style={[styles.skuTh, { flex: 2 }]}>스토어 혜택 설정</Text>
          </View>

          <View style={styles.skuTableRow}>
            <Text style={[styles.skuTd, { flex: 2, fontWeight: '700' }]}>월간 얼리버드 (이벤트)</Text>
            <Text style={[styles.skuTd, { flex: 3, color: '#2563EB' }]}>{IAP_SKUS.MONTHLY_EARLYBIRD}</Text>
            <Text style={[styles.skuTd, { flex: 1.5, color: '#FF507C', fontWeight: '700' }]}>5,900원 / 월</Text>
            <Text style={[styles.skuTd, { flex: 2, fontSize: 11 }]}>1개월 무료체험 + 평생유지</Text>
          </View>

          <View style={styles.skuTableRow}>
            <Text style={[styles.skuTd, { flex: 2, fontWeight: '700' }]}>연간 얼리버드 (이벤트)</Text>
            <Text style={[styles.skuTd, { flex: 3, color: '#2563EB' }]}>{IAP_SKUS.YEARLY_EARLYBIRD}</Text>
            <Text style={[styles.skuTd, { flex: 1.5, color: '#FF507C', fontWeight: '700' }]}>59,000원 / 년</Text>
            <Text style={[styles.skuTd, { flex: 2, fontSize: 11 }]}>1개월 무료체험 + 평생유지</Text>
          </View>

          <View style={styles.skuTableRow}>
            <Text style={[styles.skuTd, { flex: 2 }]}>월간 정규 구독 (평시)</Text>
            <Text style={[styles.skuTd, { flex: 3, color: '#475569' }]}>{IAP_SKUS.MONTHLY_STANDARD}</Text>
            <Text style={[styles.skuTd, { flex: 1.5 }]}>7,900원 / 월</Text>
            <Text style={[styles.skuTd, { flex: 2, fontSize: 11 }]}>기본 정기구독</Text>
          </View>

          <View style={[styles.skuTableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.skuTd, { flex: 2 }]}>연간 정규 구독 (평시)</Text>
            <Text style={[styles.skuTd, { flex: 3, color: '#475569' }]}>{IAP_SKUS.YEARLY_STANDARD}</Text>
            <Text style={[styles.skuTd, { flex: 1.5 }]}>70,000원 / 년</Text>
            <Text style={[styles.skuTd, { flex: 2, fontSize: 11 }]}>기본 정기구독</Text>
          </View>
        </View>
      </View>

      {/* ── 하단 복원 버튼 ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>↺ 런칭 이벤트 기본값으로 초기화</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  summarySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  formCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  skuHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  skuSpecCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skuSpecTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  skuSpecSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  skuTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skuTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  skuTh: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  skuTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  skuTd: {
    fontSize: 12,
    color: '#1E293B',
  },
  bottomBar: {
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  noticeBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  durationPillActive: {
    backgroundColor: '#1B4332',
    borderColor: '#1B4332',
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  durationPillTextActive: {
    color: '#D4A853',
    fontWeight: '700',
  },
  trialWarningCaption: {
    fontSize: 11,
    color: '#D97706',
    lineHeight: 16,
    marginBottom: 12,
  },
});
