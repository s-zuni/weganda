import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { MOCK_DRUG_PRESETS, DrugPreset } from '../../../mocks/studyData';
import { CalculatorIcon } from '../../common/Icon';

interface DrugCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DrugCalculatorModal: React.FC<DrugCalculatorModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DrugPreset>(MOCK_DRUG_PRESETS[0]);
  const [weight, setWeight] = useState('60'); // kg
  const [dose, setDose] = useState('5'); // mcg/kg/min
  const [drugMg, setDrugMg] = useState('400'); // mg
  const [fluidMl, setFluidMl] = useState('200'); // mL
  const [dropFactor, setDropFactor] = useState<20 | 60>(20); // 20gtt or 60gtt

  const handleSelectPreset = (preset: DrugPreset) => {
    setSelectedPreset(preset);
    setDose(String(preset.defaultDose));
    setDrugMg(String(preset.drugTotalMg));
    setFluidMl(String(preset.fluidTotalMl));
  };

  // 실시간 계산 로직
  const numWeight = parseFloat(weight) || 0;
  const numDose = parseFloat(dose) || 0;
  const numDrugMg = parseFloat(drugMg) || 0;
  const numFluidMl = parseFloat(fluidMl) || 1;

  // 농도 (mcg/mL) = (약물 mg * 1000) / 수액 mL
  const concentrationMcgPerMl = numFluidMl > 0 ? (numDrugMg * 1000) / numFluidMl : 0;

  // 시간당 주입량 (cc/hr) = (처방mcg * 체중kg * 60분) / 농도(mcg/mL)
  const ccPerHour =
    concentrationMcgPerMl > 0
      ? (numDose * numWeight * 60) / concentrationMcgPerMl
      : 0;

  // 분당 방울수 (gtt/min) = (cc/hr * dropFactor) / 60
  const gttPerMin = (ccPerHour * dropFactor) / 60;

  // 방울 주기 (초당 1방울) = 60 / gttPerMin
  const secPerDrop = gttPerMin > 0 ? 60 / gttPerMin : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ 닫기</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <CalculatorIcon size={18} color={COLORS.primary} />
            <Text style={styles.headerTitle}>임상 약물 gtt/cc 계산기</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* 프리셋 선택 칩 */}
          <Text style={styles.sectionLabel}>주요 승압제 / 혈관작용제 퀵 프리셋</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {MOCK_DRUG_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 프리셋 설명 */}
          <View style={styles.presetDescBox}>
            <Text style={styles.presetDescText}>{selectedPreset.description}</Text>
          </View>

          {/* 실시간 계산 결과 카드 (Primary Highlight) */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardLabel}>인퓨전 펌프 설정 주입 속도</Text>
            <View style={styles.mainRateRow}>
              <Text style={styles.mainRateValue}>{ccPerHour.toFixed(1)}</Text>
              <Text style={styles.mainRateUnit}>cc / hr (mL/h)</Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.subResultGrid}>
              <View style={styles.subResultItem}>
                <Text style={styles.subResultLabel}>분당 방울수</Text>
                <Text style={styles.subResultValue}>{gttPerMin.toFixed(1)} gtt/min</Text>
              </View>
              <View style={styles.subResultItem}>
                <Text style={styles.subResultLabel}>점적 간격</Text>
                <Text style={styles.subResultValue}>
                  {secPerDrop > 0 ? `${secPerDrop.toFixed(1)}초마다 1방울` : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 환자 및 처방 인풋 그리드 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>처방 및 조제 정보 입력</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>환자 체중 (kg)</Text>
                <TextInput
                  style={styles.numericInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>처방 용량 ({selectedPreset.unit})</Text>
                <TextInput
                  style={styles.numericInput}
                  value={dose}
                  onChangeText={setDose}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>믹스 약물 총량 (mg)</Text>
                <TextInput
                  style={styles.numericInput}
                  value={drugMg}
                  onChangeText={setDrugMg}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>총 수액량 (mL)</Text>
                <TextInput
                  style={styles.numericInput}
                  value={fluidMl}
                  onChangeText={setFluidMl}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 점적기 선택 (20gtt vs 60gtt) */}
            <Text style={styles.inputFieldLabel}>수액 세트 점적계수 (Drop Factor)</Text>
            <View style={styles.factorToggleRow}>
              <TouchableOpacity
                style={[styles.factorBtn, dropFactor === 20 && styles.factorBtnActive]}
                onPress={() => setDropFactor(20)}
                activeOpacity={0.8}
              >
                <Text style={[styles.factorBtnText, dropFactor === 20 && styles.factorBtnTextActive]}>
                  일반 수액세트 (20 gtt/mL)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.factorBtn, dropFactor === 60 && styles.factorBtnActive]}
                onPress={() => setDropFactor(60)}
                activeOpacity={0.8}
              >
                <Text style={[styles.factorBtnText, dropFactor === 60 && styles.factorBtnTextActive]}>
                  정밀 마이크로세트 (60 gtt/mL)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 주의사항 배너 */}
          <View style={styles.cautionBanner}>
            <Text style={styles.cautionTitle}>임상 투약 안전 수칙 (Double Check)</Text>
            <Text style={styles.cautionText}>
              • 계산된 주입 속도는 참고용이며, 반드시 동료 간호사 2인 교차 확인 후 주입하세요.{'\n'}
              • 고위험 혈관수축제는 말초 유출 시 피부 괴사 위험이 있으므로 C-line 투여를 권장합니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  presetDescBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  presetDescText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resultCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  resultCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  mainRateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainRateValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  mainRateUnit: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  subResultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subResultItem: {
    flex: 1,
  },
  subResultLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  subResultValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  factorToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  factorBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  factorBtnActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  factorBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  factorBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cautionBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cautionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  cautionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});

export default DrugCalculatorModal;

