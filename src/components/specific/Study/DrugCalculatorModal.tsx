import React, { useState, useMemo } from 'react';
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
import { useDrugStore, CustomDrugPreset } from '../../../store/useDrugStore';
import { CalculatorIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';

interface DrugCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DrugCalculatorModal: React.FC<DrugCalculatorModalProps> = ({
  visible,
  onClose,
}) => {
  const { presets, addPreset, deletePreset, togglePinPreset } = useDrugStore();

  // 핀 고정된 프리셋을 앞으로 정렬
  const sortedPresets = useMemo(() => {
    return [...presets].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  }, [presets]);

  const [selectedPreset, setSelectedPreset] = useState<CustomDrugPreset>(sortedPresets[0] || {
    id: 'default',
    name: '커스텀 약물',
    drugTotalMg: 400,
    fluidTotalMl: 200,
    defaultDose: 5,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: '수동 입력 모드',
    isPinned: false,
  });

  const [weight, setWeight] = useState('60'); // kg
  const [dose, setDose] = useState(String(selectedPreset.defaultDose)); // mcg/kg/min
  const [drugMg, setDrugMg] = useState(String(selectedPreset.drugTotalMg)); // mg
  const [fluidMl, setFluidMl] = useState(String(selectedPreset.fluidTotalMl)); // mL
  const [dropFactor, setDropFactor] = useState<20 | 60>(selectedPreset.dropFactor || 20);

  // 병동 커스텀 약물 추가 모드
  const [isAddingDrug, setIsAddingDrug] = useState(false);
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugMg, setNewDrugMg] = useState('');
  const [newFluidMl, setNewFluidMl] = useState('');
  const [newDefaultDose, setNewDefaultDose] = useState('');
  const [newUnit, setNewUnit] = useState('mcg/kg/min');
  const [newDescription, setNewDescription] = useState('');
  const [newDrugPinned, setNewDrugPinned] = useState(true);

  const handleSelectPreset = (preset: CustomDrugPreset) => {
    setSelectedPreset(preset);
    setDose(String(preset.defaultDose));
    setDrugMg(String(preset.drugTotalMg));
    setFluidMl(String(preset.fluidTotalMl));
    setDropFactor(preset.dropFactor);
  };

  const handleSaveCustomDrug = () => {
    const mg = parseFloat(newDrugMg);
    const ml = parseFloat(newFluidMl);
    const d = parseFloat(newDefaultDose);

    if (!newDrugName.trim() || isNaN(mg) || isNaN(ml) || ml <= 0) {
      Alert.alert('알림', '약물명과 올바른 희석 용량(mg 및 mL)을 입력해주세요.');
      return;
    }

    addPreset({
      name: newDrugName.trim(),
      drugTotalMg: mg,
      fluidTotalMl: ml,
      defaultDose: isNaN(d) ? 5 : d,
      unit: newUnit.trim() || 'mcg/kg/min',
      dropFactor: 20,
      description: newDescription.trim() || '내 병동 커스텀 지침 희석법',
      isPinned: newDrugPinned,
    });

    setIsAddingDrug(false);
    setNewDrugName('');
    setNewDrugMg('');
    setNewFluidMl('');
    setNewDefaultDose('');
    setNewDescription('');
    Alert.alert('등록 완료', '내 병동 맞춤 약물 프로토콜이 저장되었습니다.');
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
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CalculatorIcon size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>💊 🧮 임상 약물 gtt/cc 계산기</Text>
        </View>

        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* 병동 맞춤 약물 프로토콜 헤더 */}
        <View style={styles.presetHeaderRow}>
          <Text style={styles.sectionLabel}>🏥 내 병동 맞춤 약물 프로토콜 📌</Text>
          <TouchableOpacity
            style={styles.addDrugToggleBtn}
            onPress={() => setIsAddingDrug((p) => !p)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addDrugToggleText}>
              {isAddingDrug ? '닫기' : '+ 병원 약물 추가'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 직접 약물 등록 폼 */}
        {isAddingDrug && (
          <View style={styles.addDrugCard}>
            <Text style={styles.addDrugCardTitle}>새 병원 희석 프로토콜 등록</Text>
            <TextInput
              style={styles.addDrugInput}
              placeholder="약물명 (예: 노르에피네프린 8mg/50mL D5W)"
              placeholderTextColor={COLORS.textMuted}
              value={newDrugName}
              onChangeText={setNewDrugName}
            />
            <View style={styles.addDrugRow}>
              <TextInput
                style={[styles.addDrugInput, { flex: 1 }]}
                placeholder="약물 총량 (mg)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={newDrugMg}
                onChangeText={setNewDrugMg}
              />
              <TextInput
                style={[styles.addDrugInput, { flex: 1 }]}
                placeholder="수액량 (mL)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={newFluidMl}
                onChangeText={setNewFluidMl}
              />
              <TextInput
                style={[styles.addDrugInput, { flex: 1 }]}
                placeholder="기준 처방량"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={newDefaultDose}
                onChangeText={setNewDefaultDose}
              />
            </View>
            <TextInput
              style={[styles.addDrugInput, { marginTop: 8 }]}
              placeholder="병원별 희석 지침 메모 (예: D5W 50mL 믹스, C-line 전용)"
              placeholderTextColor={COLORS.textMuted}
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View style={styles.pinToggleRow}>
              <TouchableOpacity
                style={styles.pinCheckBtn}
                onPress={() => setNewDrugPinned((p) => !p)}
              >
                <Text style={styles.pinCheckIcon}>{newDrugPinned ? '📌' : '▫️'}</Text>
                <Text style={styles.pinCheckLabel}>상단에 고정하기 (Pin)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveDrugBtn}
                onPress={handleSaveCustomDrug}
                activeOpacity={0.85}
              >
                <Text style={styles.saveDrugBtnText}>약물 저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 프리셋 선택 칩 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {sortedPresets.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => handleSelectPreset(p)}
                onLongPress={() => {
                  Alert.alert(
                    `${p.name}`,
                    '이 약물 프로토콜을 관리하시겠습니까?',
                    [
                      {
                        text: p.isPinned ? '📌 고정 해제' : '📌 상단 고정',
                        onPress: () => togglePinPreset(p.id),
                      },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => deletePreset(p.id),
                      },
                      { text: '취소', style: 'cancel' },
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <View style={styles.presetChipHeader}>
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {p.name}
                  </Text>
                  {p.isPinned && <Text style={styles.pinBadge}>📌</Text>}
                </View>
                <Text style={[styles.presetChipDose, isSelected && styles.presetChipDoseActive]}>
                  {p.drugTotalMg}mg / {p.fluidTotalMl}mL
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 프리셋 설명 */}
        <View style={styles.presetDescBox}>
          <Text style={styles.presetDescText}>
            💡 {selectedPreset.description || '병원 지침에 맞춰 용량과 수액량을 조정하세요.'}
          </Text>
        </View>

        {/* 실시간 계산 결과 카드 (Primary Highlight) */}
        <View style={styles.resultCard}>
          <Text style={styles.resultCardLabel}>⚡ 인퓨전 펌프 설정 주입 속도</Text>
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
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addDrugToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addDrugToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addDrugCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  addDrugCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  addDrugRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addDrugInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: COLORS.textPrimary,
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pinCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinCheckIcon: {
    fontSize: 14,
  },
  pinCheckLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveDrugBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveDrugBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  presetChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  pinBadge: {
    fontSize: 11,
  },
  presetChipDose: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  presetChipDoseActive: {
    color: COLORS.primary,
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

