import React, { useState, useMemo } from 'react';
import React, { useState, useMemo, useEffect } from 'react';
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
import {
  useDrugStore,
  CustomDrugPreset,
  RECOMMENDED_DRUG_TEMPLATES,
} from '../../../store/useDrugStore';
import { useUserStore } from '../../../store/useUserStore';
import { FREE_LIMITS } from '../../../constants/membership';
import { PaywallBottomSheet } from '../../common/PaywallBottomSheet';
import { MembershipScreen } from '../../../screens/MyPage/MembershipScreen';
import { CalculatorIcon } from '../../common/Icon';
import { SwipeableBottomSheet, BottomSheetScrollView } from '../../common/SwipeableBottomSheet';

interface DrugCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUPPORTED_UNITS = [
  'mcg/kg/min',
  'mcg/min',
  'mg/hr',
  'unit/hr',
  'cc/hr',
];

export const DrugCalculatorModal: React.FC<DrugCalculatorModalProps> = ({
  visible,
  onClose,
}) => {
  const { presets, addPreset, deletePreset, togglePinPreset } = useDrugStore();
  const { presets, addPreset, updatePreset, deletePreset, togglePinPreset } = useDrugStore();
  const { isPremium, dailyDrugCalcCount, incrementDailyDrugCalcCount } = useUserStore();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  // 핀 고정된 프리셋을 앞으로 정렬
  // 핀 고정된 약물을 우선 정렬
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
  // 선택된 약물 ID
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 현재 선택된 약물 객체
  const selectedPreset: CustomDrugPreset | null = useMemo(() => {
    if (!sortedPresets.length) return null;
    const found = sortedPresets.find((p) => p.id === selectedId);
    return found || sortedPresets[0];
  }, [sortedPresets, selectedId]);

  // 환자 체중 및 실시간 입력값
  const [weight, setWeight] = useState('60'); // kg
  const [dose, setDose] = useState(String(selectedPreset.defaultDose)); // mcg/kg/min
  const [drugMg, setDrugMg] = useState(String(selectedPreset.drugTotalMg)); // mg
  const [fluidMl, setFluidMl] = useState(String(selectedPreset.fluidTotalMl)); // mL
  const [dropFactor, setDropFactor] = useState<20 | 60>(selectedPreset.dropFactor || 20);
  const [dose, setDose] = useState('5');
  const [drugMg, setDrugMg] = useState('400');
  const [fluidMl, setFluidMl] = useState('200');
  const [dropFactor, setDropFactor] = useState<20 | 60>(20);

  // 병동 커스텀 약물 추가 모드
  const [isAddingDrug, setIsAddingDrug] = useState(false);
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugMg, setNewDrugMg] = useState('');
  const [newFluidMl, setNewFluidMl] = useState('');
  const [newDefaultDose, setNewDefaultDose] = useState('');
  const [newUnit, setNewUnit] = useState('mcg/kg/min');
  const [newDescription, setNewDescription] = useState('');
  const [newDrugPinned, setNewDrugPinned] = useState(true);
  // 약물 등록 / 수정 폼 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDrugMg, setFormDrugMg] = useState('');
  const [formFluidMl, setFormFluidMl] = useState('');
  const [formDefaultDose, setFormDefaultDose] = useState('');
  const [formUnit, setFormUnit] = useState('mcg/kg/min');
  const [formDropFactor, setFormDropFactor] = useState<20 | 60>(20);
  const [formDescription, setFormDescription] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(true);

  const handleSelectPreset = (preset: CustomDrugPreset) => {
    if (!isPremium && dailyDrugCalcCount >= FREE_LIMITS.maxDailyDrugCalculations) {
      setPaywallVisible(true);
      return;
  // 선택된 약물이 변경되면 입력 필드 동기화
  useEffect(() => {
    if (selectedPreset) {
      setDose(String(selectedPreset.defaultDose));
      setDrugMg(String(selectedPreset.drugTotalMg));
      setFluidMl(String(selectedPreset.fluidTotalMl));
      setDropFactor(selectedPreset.dropFactor);
    }
    setSelectedPreset(preset);
    setDose(String(preset.defaultDose));
    setDrugMg(String(preset.drugTotalMg));
    setFluidMl(String(preset.fluidTotalMl));
    setDropFactor(preset.dropFactor);
    if (!isPremium) {
      incrementDailyDrugCalcCount();
  }, [selectedPreset]);

  // 새 약물 등록 폼 열기
  const handleOpenAddForm = (template?: Omit<CustomDrugPreset, 'id'>) => {
    setEditingId(null);
    if (template) {
      setFormName(template.name);
      setFormDrugMg(String(template.drugTotalMg));
      setFormFluidMl(String(template.fluidTotalMl));
      setFormDefaultDose(String(template.defaultDose));
      setFormUnit(template.unit);
      setFormDropFactor(template.dropFactor);
      setFormDescription(template.description);
      setFormIsPinned(template.isPinned);
    } else {
      setFormName('');
      setFormDrugMg('');
      setFormFluidMl('');
      setFormDefaultDose('');
      setFormUnit('mcg/kg/min');
      setFormDropFactor(20);
      setFormDescription('');
      setFormIsPinned(true);
    }
    setIsFormOpen(true);
  };

  const handleSaveCustomDrug = () => {
    const mg = parseFloat(newDrugMg);
    const ml = parseFloat(newFluidMl);
    const d = parseFloat(newDefaultDose);
  // 기존 약물 수정 폼 열기
  const handleOpenEditForm = (preset: CustomDrugPreset) => {
    setEditingId(preset.id);
    setFormName(preset.name);
    setFormDrugMg(String(preset.drugTotalMg));
    setFormFluidMl(String(preset.fluidTotalMl));
    setFormDefaultDose(String(preset.defaultDose));
    setFormUnit(preset.unit);
    setFormDropFactor(preset.dropFactor);
    setFormDescription(preset.description);
    setFormIsPinned(preset.isPinned);
    setIsFormOpen(true);
  };

    if (!newDrugName.trim() || isNaN(mg) || isNaN(ml) || ml <= 0) {
      Alert.alert('알림', '약물명과 올바른 희석 용량(mg 및 mL)을 입력해주세요.');
  // 약물 저장 (추가 또는 수정)
  const handleSaveDrugForm = () => {
    const mg = parseFloat(formDrugMg);
    const ml = parseFloat(formFluidMl);
    const d = parseFloat(formDefaultDose);

    if (!formName.trim()) {
      Alert.alert('알림', '약물 명칭을 입력해주세요. (예: 도파민 400mg/200mL)');
      return;
    }
    if (isNaN(mg) || mg <= 0 || isNaN(ml) || ml <= 0) {
      Alert.alert('알림', '올바른 믹스 약물 용량(mg)과 총 수액량(mL)을 입력해주세요.');
      return;
    }

    addPreset({
      name: newDrugName.trim(),
      drugTotalMg: mg,
      fluidTotalMl: ml,
      defaultDose: isNaN(d) ? 5 : d,
      unit: newUnit as any,
      dropFactor: 20,
      description: newDescription.trim() || '사용자 등록 프로토콜',
      isPinned: newDrugPinned,
    });
    if (editingId) {
      // 수정 모드
      updatePreset(editingId, {
        name: formName.trim(),
        drugTotalMg: mg,
        fluidTotalMl: ml,
        defaultDose: isNaN(d) ? 5 : d,
        unit: formUnit,
        dropFactor: formDropFactor,
        description: formDescription.trim(),
        isPinned: formIsPinned,
      });
      setIsFormOpen(false);
      Alert.alert('수정 완료', '약물 프로토콜이 수정되었습니다.');
    } else {
      // 신규 등록 모드
      const newId = addPreset({
        name: formName.trim(),
        drugTotalMg: mg,
        fluidTotalMl: ml,
        defaultDose: isNaN(d) ? 5 : d,
        unit: formUnit,
        dropFactor: formDropFactor,
        description: formDescription.trim(),
        isPinned: formIsPinned,
      });
      setSelectedId(newId);
      setIsFormOpen(false);
      Alert.alert('등록 완료', '나만의 맞춤 약물 계산기가 등록되었습니다.');
    }
  };

    setIsAddingDrug(false);
    setNewDrugName('');
    setNewDrugMg('');
    setNewFluidMl('');
    setNewDefaultDose('');
    setNewDescription('');
    Alert.alert('등록 완료', '내 병동 맞춤 약물 프로토콜이 저장되었습니다.');
  // 약물 삭제 확인
  const handleDeleteDrug = (preset: CustomDrugPreset) => {
    Alert.alert(
      '약물 계산기 삭제',
      `'${preset.name}' 계산기를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deletePreset(preset.id);
            if (selectedId === preset.id) {
              setSelectedId(null);
            }
          },
        },
      ]
    );
  };

  // 실시간 계산 로직
  // 프리셋 선택
  const handleSelectPreset = (preset: CustomDrugPreset) => {
    if (!isPremium && dailyDrugCalcCount >= FREE_LIMITS.maxDailyDrugCalculations) {
      setPaywallVisible(true);
      return;
    }
    setSelectedId(preset.id);
    if (!isPremium) {
      incrementDailyDrugCalcCount();
    }
  };

  // 실시간 주입량 계산 로직
  const numWeight = parseFloat(weight) || 0;
  const numDose = parseFloat(dose) || 0;
  const numDrugMg = parseFloat(drugMg) || 0;
  const numFluidMl = parseFloat(fluidMl) || 1;
  const unit = selectedPreset?.unit || 'mcg/kg/min';

  // 농도 (mcg/mL) = (약물 mg * 1000) / 수액 mL
  // 농도 (mcg/mL)
  const concentrationMcgPerMl = numFluidMl > 0 ? (numDrugMg * 1000) / numFluidMl : 0;
  // 농도 (mg/mL)
  const concentrationMgPerMl = numFluidMl > 0 ? numDrugMg / numFluidMl : 0;

  // 시간당 주입량 (cc/hr) = (처방mcg * 체중kg * 60분) / 농도(mcg/mL)
  const ccPerHour =
    concentrationMcgPerMl > 0
      ? (numDose * numWeight * 60) / concentrationMcgPerMl
      : 0;
  let ccPerHour = 0;
  if (unit === 'mcg/kg/min') {
    ccPerHour = concentrationMcgPerMl > 0 ? (numDose * numWeight * 60) / concentrationMcgPerMl : 0;
  } else if (unit === 'mcg/min') {
    ccPerHour = concentrationMcgPerMl > 0 ? (numDose * 60) / concentrationMcgPerMl : 0;
  } else if (unit === 'mg/hr') {
    ccPerHour = concentrationMgPerMl > 0 ? numDose / concentrationMgPerMl : 0;
  } else if (unit === 'unit/hr') {
    // 헤파린 등: drugMg(unit) / fluidMl
    ccPerHour = numDrugMg > 0 ? (numDose * numFluidMl) / numDrugMg : 0;
  } else if (unit === 'cc/hr') {
    ccPerHour = numDose;
  }

  // 분당 방울수 (gtt/min) = (cc/hr * dropFactor) / 60
  const gttPerMin = (ccPerHour * dropFactor) / 60;

  // 방울 주기 (초당 1방울) = 60 / gttPerMin
  // 방울 주기 (초당 1방울)
  const secPerDrop = gttPerMin > 0 ? 60 / gttPerMin : 0;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="92%">
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CalculatorIcon size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>🧮 임상 약물 gtt/cc 계산기</Text>
          <Text style={styles.headerTitle}>🧮 맞춤 약물 gtt/cc 계산기</Text>
          {!isPremium && (
            <View style={styles.limitBadge}>
              <Text style={styles.limitBadgeText}>{dailyDrugCalcCount}/3회</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* 병동 맞춤 약물 프로토콜 헤더 */}
        <View style={styles.presetHeaderRow}>
          <Text style={styles.sectionLabel}>🏥 내 병동 맞춤 약물 프로토콜</Text>
          <TouchableOpacity
            style={styles.addDrugToggleBtn}
            onPress={() => setIsAddingDrug((p) => !p)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addDrugToggleText}>
              {isAddingDrug ? '닫기' : '+ 병원 약물 추가'}
        {/* 등록된 약물이 0개일 때: 빈 상태(Empty State) 안내 */}
        {!isFormOpen && sortedPresets.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIconEmoji}>💊</Text>
            </View>
            <Text style={styles.emptyTitle}>나만의 맞춤 약물 계산기를 등록해보세요</Text>
            <Text style={styles.emptyDesc}>
              기본 계산기 대신, 내가 일하는 병동에서 자주 쓰는 약물과 희석 규격을 직접 등록하여 1초 만에 안전하게 투약 속도를 계산할 수 있습니다.
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
              style={styles.emptyCtaButton}
              onPress={() => handleOpenAddForm()}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>+ 첫 약물 계산기 만들기</Text>
            </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveDrugBtn}
                onPress={handleSaveCustomDrug}
                activeOpacity={0.85}
              >
                <Text style={styles.saveDrugBtnText}>약물 저장</Text>
              </TouchableOpacity>
            {/* 빠른 추천 템플릿 선택기 */}
            <View style={styles.templateSection}>
              <Text style={styles.templateSectionTitle}>자주 쓰는 임상 규격으로 빠르게 시작</Text>
              <View style={styles.templateGrid}>
                {RECOMMENDED_DRUG_TEMPLATES.map((tpl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.templateItem}
                    onPress={() => handleOpenAddForm(tpl)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateName}>{tpl.name}</Text>
                    <Text style={styles.templateDose}>
                      {tpl.drugTotalMg}mg / {tpl.fluidTotalMl}mL
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 프리셋 선택 칩 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {sortedPresets.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
        {/* 약물 등록 / 수정 폼 */}
        {isFormOpen && (
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>
                {editingId ? '✏️ 약물 프로토콜 수정' : '✨ 새 맞춤 약물 계산기 등록'}
              </Text>
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
                onPress={() => setIsFormOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                <Text style={styles.formCloseText}>취소</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
            </View>

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
            {/* 신규 등록 시 추천 템플릿 원터치 채우기 */}
            {!editingId && (
              <View style={styles.quickTemplateRow}>
                <Text style={styles.quickTemplateLabel}>추천 불러오기:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTemplateList}>
                  {RECOMMENDED_DRUG_TEMPLATES.map((tpl, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.quickTemplateChip}
                      onPress={() => {
                        setFormName(tpl.name);
                        setFormDrugMg(String(tpl.drugTotalMg));
                        setFormFluidMl(String(tpl.fluidTotalMl));
                        setFormDefaultDose(String(tpl.defaultDose));
                        setFormUnit(tpl.unit);
                        setFormDropFactor(tpl.dropFactor);
                        setFormDescription(tpl.description);
                      }}
                    >
                      <Text style={styles.quickTemplateText}>{tpl.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.subResultItem}>
                <Text style={styles.subResultLabel}>점적 간격</Text>
                <Text style={styles.subResultValue}>
                  {secPerDrop > 0 ? `${secPerDrop.toFixed(1)}초마다 1방울` : '-'}
                </Text>
              </View>
            </View>
          </View>
            )}

          {/* 환자 및 처방 인풋 그리드 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>처방 및 조제 정보 입력</Text>
            {/* 약물명 입력 */}
            <Text style={styles.fieldLabel}>약물 이름 및 규격 *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="예: 도파민 400mg/200mL D5W"
              placeholderTextColor={COLORS.textMuted}
              value={formName}
              onChangeText={setFormName}
            />

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>환자 체중 (kg)</Text>
            {/* 희석 용량 및 수액량 */}
            <View style={styles.formTwoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>믹스 약물 총량 (mg) *</Text>
                <TextInput
                  style={styles.numericInput}
                  value={weight}
                  onChangeText={setWeight}
                  style={styles.textInput}
                  placeholder="예: 400"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={formDrugMg}
                  onChangeText={setFormDrugMg}
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>처방 용량 ({selectedPreset.unit})</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>총 수액량 (mL) *</Text>
                <TextInput
                  style={styles.numericInput}
                  value={dose}
                  onChangeText={setDose}
                  style={styles.textInput}
                  placeholder="예: 200"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={formFluidMl}
                  onChangeText={setFormFluidMl}
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
            {/* 처방 단위 선택 */}
            <Text style={styles.fieldLabel}>처방 투약 단위 *</Text>
            <View style={styles.unitSelector}>
              {SUPPORTED_UNITS.map((u) => {
                const isActive = formUnit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, isActive && styles.unitChipActive]}
                    onPress={() => setFormUnit(u)}
                  >
                    <Text style={[styles.unitChipText, isActive && styles.unitChipTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputFieldLabel}>총 수액량 (mL)</Text>
            {/* 기본 처방량 & 점적계수 */}
            <View style={styles.formTwoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>기본 시작 처방량</Text>
                <TextInput
                  style={styles.numericInput}
                  value={fluidMl}
                  onChangeText={setFluidMl}
                  style={styles.textInput}
                  placeholder="예: 5"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={formDefaultDose}
                  onChangeText={setFormDefaultDose}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>기본 점적계수</Text>
                <View style={styles.dropToggle}>
                  <TouchableOpacity
                    style={[styles.dropToggleBtn, formDropFactor === 20 && styles.dropToggleBtnActive]}
                    onPress={() => setFormDropFactor(20)}
                  >
                    <Text style={[styles.dropToggleText, formDropFactor === 20 && styles.dropToggleTextActive]}>
                      20 gtt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dropToggleBtn, formDropFactor === 60 && styles.dropToggleBtnActive]}
                    onPress={() => setFormDropFactor(60)}
                  >
                    <Text style={[styles.dropToggleText, formDropFactor === 60 && styles.dropToggleTextActive]}>
                      60 gtt
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 점적기 선택 (20gtt vs 60gtt) */}
            <Text style={styles.inputFieldLabel}>수액 세트 점적계수 (Drop Factor)</Text>
            <View style={styles.factorToggleRow}>
            {/* 병동별 메모 */}
            <Text style={styles.fieldLabel}>병동별 주의사항 / 메모 (선택)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="예: C-line 전용, 중심정맥관 투여 권장"
              placeholderTextColor={COLORS.textMuted}
              value={formDescription}
              onChangeText={setFormDescription}
            />

            {/* 핀 고정 토글 및 저장 버튼 */}
            <View style={styles.formActionRow}>
              <TouchableOpacity
                style={[styles.factorBtn, dropFactor === 20 && styles.factorBtnActive]}
                onPress={() => setDropFactor(20)}
                style={styles.pinToggleBtn}
                onPress={() => setFormIsPinned((p) => !p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.factorBtnText, dropFactor === 20 && styles.factorBtnTextActive]}>
                  일반 수액세트 (20 gtt/mL)
                </Text>
                <Text style={styles.pinToggleIcon}>{formIsPinned ? '📌' : '▫️'}</Text>
                <Text style={styles.pinToggleText}>상단 고정 (Pin)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.factorBtn, dropFactor === 60 && styles.factorBtnActive]}
                onPress={() => setDropFactor(60)}
                activeOpacity={0.8}
                style={styles.submitBtn}
                onPress={handleSaveDrugForm}
                activeOpacity={0.85}
              >
                <Text style={[styles.factorBtnText, dropFactor === 60 && styles.factorBtnTextActive]}>
                  정밀 마이크로세트 (60 gtt/mL)
                </Text>
                <Text style={styles.submitBtnText}>{editingId ? '수정 완료' : '계산기 저장'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

          {/* 주의사항 배너 */}
          <View style={styles.cautionBanner}>
            <Text style={styles.cautionTitle}>임상 투약 안전 수칙 (Double Check)</Text>
            <Text style={styles.cautionText}>
              • 계산된 주입 속도는 참고용이며, 반드시 동료 간호사 2인 교차 확인 후 주입하세요.{'\n'}
              • 고위험 혈관수축제는 말초 유출 시 피부 괴사 위험이 있으므로 C-line 투여를 권장합니다.
            </Text>
        {/* 등록된 약물이 있고 폼이 닫혀있을 때: 메인 계산기 뷰 */}
        {!isFormOpen && sortedPresets.length > 0 && selectedPreset && (
          <View>
            {/* 상단 내 약물 가로 칩 목록 + [+ 추가] 버튼 */}
            <View style={styles.chipsSection}>
              <View style={styles.chipsHeader}>
                <Text style={styles.chipsHeaderTitle}>내 약물 계산기 ({sortedPresets.length})</Text>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() => handleOpenAddForm()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addSmallBtnText}>+ 새 약물</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsList}
              >
                {sortedPresets.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.presetCardChip, isSelected && styles.presetCardChipActive]}
                      onPress={() => handleSelectPreset(p)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.presetChipTitleRow}>
                        <Text
                          style={[styles.presetCardChipName, isSelected && styles.presetCardChipNameActive]}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        {p.isPinned && <Text style={styles.pinEmoji}>📌</Text>}
                      </View>
                      <Text
                        style={[styles.presetCardChipSub, isSelected && styles.presetCardChipSubActive]}
                        numberOfLines={1}
                      >
                        {p.drugTotalMg}mg / {p.fluidTotalMl}mL
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 현재 선택된 약물 정보 요약 카드 & 관리 액션 */}
            <View style={styles.selectedDrugCard}>
              <View style={styles.selectedDrugLeft}>
                <View style={styles.drugBadgeRow}>
                  <Text style={styles.selectedDrugTitle}>{selectedPreset.name}</Text>
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>{selectedPreset.unit}</Text>
                  </View>
                </View>
                <Text style={styles.selectedDrugConcentration}>
                  희석비: {selectedPreset.drugTotalMg}mg / {selectedPreset.fluidTotalMl}mL (농도: {concentrationMcgPerMl.toLocaleString()} mcg/mL)
                </Text>
                {selectedPreset.description ? (
                  <Text style={styles.selectedDrugDesc}>💡 {selectedPreset.description}</Text>
                ) : null}
              </View>

              <View style={styles.selectedDrugActions}>
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => togglePinPreset(selectedPreset.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.iconActionText}>{selectedPreset.isPinned ? '📌' : '📍'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => handleOpenEditForm(selectedPreset)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.iconActionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => handleDeleteDrug(selectedPreset)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.iconActionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 실시간 계산 결과 카드 (Toss Style Highlight) */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>⚡ 인퓨전 펌프 설정 주입 속도</Text>
              <View style={styles.mainRateRow}>
                <Text style={styles.mainRateValue}>{ccPerHour.toFixed(1)}</Text>
                <Text style={styles.mainRateUnit}>cc / hr (mL/h)</Text>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.subResultGrid}>
                <View style={styles.subResultItem}>
                  <Text style={styles.subResultLabel}>수액 분당 방울수</Text>
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

            {/* 환자 및 처방 인풋 섹션 */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>처방 및 환자 정보</Text>

              <View style={styles.inputRow}>
                {unit.includes('/kg') && (
                  <View style={styles.inputCol}>
                    <Text style={styles.inputFieldLabel}>환자 체중 (kg)</Text>
                    <TextInput
                      style={styles.numericInput}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      placeholder="60"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                )}

                <View style={styles.inputCol}>
                  <Text style={styles.inputFieldLabel}>처방 용량 ({unit})</Text>
                  <TextInput
                    style={styles.numericInput}
                    value={dose}
                    onChangeText={setDose}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={COLORS.textMuted}
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
                    placeholder="400"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.inputFieldLabel}>총 수액량 (mL)</Text>
                  <TextInput
                    style={styles.numericInput}
                    value={fluidMl}
                    onChangeText={setFluidMl}
                    keyboardType="numeric"
                    placeholder="200"
                    placeholderTextColor={COLORS.textMuted}
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
                • 계산된 주입 속도는 참고용이며, 반드시 동료 간호사 2인 교차 확인(Cross Check) 후 주입하세요.{'\n'}
                • 고위험 혈관수축제는 말초 유출 시 피부 괴사 위험이 있으므로 중심정맥관(C-line) 투여를 권장합니다.
              </Text>
            </View>
          </View>
        </BottomSheetScrollView>
        )}
      </BottomSheetScrollView>

        <PaywallBottomSheet
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
          onSubscribe={() => {
            setPaywallVisible(false);
            setMembershipVisible(true);
          }}
          onLearnMore={() => {
            setPaywallVisible(false);
            setMembershipVisible(true);
          }}
          featureTitle="약물 계산기 무제한 이용"
          featureDescription="무료 일일 3회 초과 시 weganda+로 무제한 임상 약물 계산기를 이용하세요"
        />
      {/* Paywall 모달 */}
      <PaywallBottomSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        onLearnMore={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        featureTitle="약물 계산기 무제한 이용"
        featureDescription="무료 일일 3회 초과 시 weganda+로 무제한 임상 약물 계산기를 이용하세요"
      />

        <MembershipScreen
          visible={membershipVisible}
          onClose={() => setMembershipVisible(false)}
        />
      <MembershipScreen
        visible={membershipVisible}
        onClose={() => setMembershipVisible(false)}
      />
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
    paddingVertical: 14,
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
  limitBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  limitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  presetHeaderRow: {
    flexDirection: 'row',
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconEmoji: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  addDrugToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  addDrugToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  emptyCtaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 32,
  },
  addDrugCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  templateSection: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4EA',
    borderColor: '#E9ECEF',
  },
  addDrugCardTitle: {
    fontSize: 12,
  templateSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  addDrugRow: {
    flexDirection: 'row',
  templateGrid: {
    gap: 8,
    marginTop: 8,
  },
  addDrugInput: {
  templateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pinToggleRow: {
  templateDose: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Form */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
  },
  pinCheckBtn: {
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  formCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  quickTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 8,
    marginBottom: 16,
  },
  quickTemplateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 6,
  },
  quickTemplateList: {
    gap: 6,
  },
  pinCheckIcon: {
    fontSize: 14,
  quickTemplateChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pinCheckLabel: {
  quickTemplateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveDrugBtn: {
    backgroundColor: COLORS.primary,
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  formTwoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  unitChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveDrugBtnText: {
    color: '#FFFFFF',
  unitChipActive: {
    backgroundColor: COLORS.primary,
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetChipHeader: {
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  dropToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    height: 42,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  pinBadge: {
    fontSize: 11,
  dropToggleBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  presetChipDose: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  dropToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  presetChipDoseActive: {
  dropToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dropToggleTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  formActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  pinToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700',
  pinToggleIcon: {
    fontSize: 16,
  },
  pinToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  presetScroll: {
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Chips Section */
  chipsSection: {
    marginBottom: 16,
  },
  chipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  presetChip: {
  chipsHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addSmallBtn: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chipsList: {
    gap: 8,
    paddingRight: 10,
  },
  presetCardChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  presetChipActive: {
  presetCardChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 14,
  presetChipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  presetCardChipName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  presetCardChipNameActive: {
    color: COLORS.primary,
  },
  pinEmoji: {
    fontSize: 11,
  },
  presetCardChipSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    color: COLORS.textMuted,
  },
  presetChipTextActive: {
  presetCardChipSubActive: {
    color: COLORS.primary,
    fontWeight: '700',
    opacity: 0.85,
  },
  presetDescBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,

  /* Selected Drug Card */
  selectedDrugCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  presetDescText: {
    fontSize: 14,
  selectedDrugLeft: {
    flex: 1,
    marginRight: 12,
  },
  drugBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  selectedDrugTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  unitBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  selectedDrugConcentration: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  selectedDrugDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  selectedDrugActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionText: {
    fontSize: 14,
  },

  /* Result Card */
  resultCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    elevation: 4,
  },
  resultCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  mainRateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainRateValue: {
    fontSize: 40,
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    color: '#38BDF8',
    letterSpacing: -1,
  },
  mainRateUnit: {
    fontSize: 16,
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    color: '#E2E8F0',
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  subResultValue: {
    fontSize: 16,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Input Section */
  inputSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
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
    fontSize: 14,
    fontWeight: '700',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: '#F9FAFB',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
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
    gap: 8,
    marginTop: 4,
  },
  factorBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  factorBtnActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  factorBtnText: {
    fontSize: 13,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  factorBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
    color: '#1D4ED8',
    fontWeight: '800',
  },

  /* Caution Banner */
  cautionBanner: {
    backgroundColor: '#FFF1F4',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cautionTitle: {
    fontSize: 14,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    color: '#B45309',
    marginBottom: 4,
  },
  cautionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default DrugCalculatorModal;

