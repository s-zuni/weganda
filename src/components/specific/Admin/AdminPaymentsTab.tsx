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

  const [monthlyPrice, setMonthlyPrice] = useState(String(config.monthlyDiscountEvent.discountedPrice));
  const [monthlyStart, setMonthlyStart] = useState(config.monthlyDiscountEvent.startDate);
  const [monthlyEnd, setMonthlyEnd] = useState(config.monthlyDiscountEvent.endDate);

  const [yearlyPrice, setYearlyPrice] = useState(String(config.yearlyDiscountEvent.discountedPrice));
  const [yearlyStart, setYearlyStart] = useState(config.yearlyDiscountEvent.startDate);
  const [yearlyEnd, setYearlyEnd] = useState(config.yearlyDiscountEvent.endDate);

  const handleSaveFreeTrial = () => {
    updateFreeTrialEvent({
      startDate: trialStart,
      endDate: trialEnd,
    });
    Alert.alert('저장 완료', '1개월 무료 체험 이벤트 기간이 성공적으로 저장되었습니다.');
  };

  const handleSaveMonthlyDiscount = () => {
    const p = parseInt(monthlyPrice, 10);
    if (isNaN(p) || p <= 0) {
      Alert.alert('확인', '올바른 금액을 입력해 주세요.');
      return;
    }
    updateMonthlyDiscountEvent({
      discountedPrice: p,
      startDate: monthlyStart,
      endDate: monthlyEnd,
    });
    Alert.alert('저장 완료', '월간 얼리버드 할인 설정이 저장되었습니다.');
  };

  const handleSaveYearlyDiscount = () => {
    const p = parseInt(yearlyPrice, 10);
    if (isNaN(p) || p <= 0) {
      Alert.alert('확인', '올바른 금액을 입력해 주세요.');
      return;
    }
    updateYearlyDiscountEvent({
      discountedPrice: p,
      startDate: yearlyStart,
      endDate: yearlyEnd,
    });
    Alert.alert('저장 완료', '연간 얼리버드 할인 설정이 저장되었습니다.');
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
          onPress: () => {
            resetToDefaultEvents();
            const def = useMembershipEventStore.getState().config;
            setTrialStart(def.freeTrialEvent.startDate);
            setTrialEnd(def.freeTrialEvent.endDate);
            setMonthlyPrice(String(def.monthlyDiscountEvent.discountedPrice));
            setMonthlyStart(def.monthlyDiscountEvent.startDate);
            setMonthlyEnd(def.monthlyDiscountEvent.endDate);
            setYearlyPrice(String(def.yearlyDiscountEvent.discountedPrice));
            setYearlyStart(def.yearlyDiscountEvent.startDate);
            setYearlyEnd(def.yearlyDiscountEvent.endDate);
            Alert.alert('초기화 완료', '모든 이벤트 설정이 출시 기본값으로 복원되었습니다.');
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
            onValueChange={(val) => updateFreeTrialEvent({ isEnabled: val })}
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
            onValueChange={(val) => updateMonthlyDiscountEvent({ isEnabled: val })}
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
            onValueChange={(val) => updateYearlyDiscountEvent({ isEnabled: val })}
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
});
