import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { CustomShiftCode } from '../../../../types/shift';

interface ScheduleCustomCodeTabProps {
  customCodes: Record<string, CustomShiftCode>;
  editCode: string;
  editName: string;
  editColor: string;
  editIsOff?: boolean;
  onChangeEditCode: (val: string) => void;
  onChangeEditName: (val: string) => void;
  onChangeEditColor: (val: string) => void;
  onChangeEditIsOff?: (val: boolean) => void;
  onSelectCodeToEdit: (item: CustomShiftCode) => void;
  onDeleteCustomCode?: (code: string) => void;
  onSaveCustomCode: () => void;
}

export const ScheduleCustomCodeTab: React.FC<ScheduleCustomCodeTabProps> = ({
  customCodes,
  editCode,
  editName,
  editColor,
  editIsOff,
  onChangeEditCode,
  onChangeEditName,
  onChangeEditColor,
  onChangeEditIsOff,
  onSelectCodeToEdit,
  onDeleteCustomCode,
  onSaveCustomCode,
}) => {
  const colorPalette = [
    '#4F98CA',
    '#E2703A',
    '#272727',
    '#E84A5F',
    '#9B51E0',
    '#10B981',
    '#F59E0B',
  ];

  return (
    <View>
      <Text style={styles.tabDesc}>
        병원마다 다른 오프(Off) 표시(예: F, O)나 특수 근무(미드, 슬립 등)를 내 병원 기준에 맞게 커스텀 지정합니다.
      </Text>

      {/* 현재 등록된 듀티 코드 목록 */}
      <Text style={styles.subSectionTitle}>현재 사용 중인 근무 코드</Text>
      <View style={styles.customCodeList}>
        {Object.values(customCodes).map((item) => (
          <View key={item.code} style={styles.customCodeRow}>
            <View style={[styles.codePreviewDot, { backgroundColor: item.color }]}>
              <Text style={styles.codePreviewChar}>{item.code}</Text>
            </View>
            <View style={styles.codeDetailText}>
              <Text style={styles.codeDetailName}>{item.name}</Text>
              <Text style={styles.codeDetailSub}>코드: {item.code}</Text>
            </View>
            <View style={styles.codeRowActions}>
              <TouchableOpacity
                style={styles.codeEditSmallBtn}
                onPress={() => onSelectCodeToEdit(item)}
              >
                <Text style={styles.codeEditSmallText}>불러오기</Text>
              </TouchableOpacity>
              {onDeleteCustomCode && (
                <TouchableOpacity
                  style={styles.codeDeleteSmallBtn}
                  onPress={() => onDeleteCustomCode(item.code)}
                >
                  <Text style={styles.codeDeleteSmallText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* 코드 수정 / 신규 추가 폼 */}
      <View style={styles.customFormCard}>
        <Text style={styles.customFormTitle}>코드 등록 및 수정</Text>

        <View style={styles.customInputGroup}>
          <Text style={styles.inputLabel}>약어 코드 (1~2글자)</Text>
          <TextInput
            style={styles.customInput}
            placeholder="예: F (Off), M (Mid)"
            placeholderTextColor={COLORS.textMuted}
            value={editCode}
            onChangeText={onChangeEditCode}
            maxLength={3}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.customInputGroup}>
          <Text style={styles.inputLabel}>근무 라벨명</Text>
          <TextInput
            style={styles.customInput}
            placeholder="예: 오프(휴무), 미드근무"
            placeholderTextColor={COLORS.textMuted}
            value={editName}
            onChangeText={onChangeEditName}
          />
        </View>

        <View style={styles.customInputGroup}>
          <Text style={styles.inputLabel}>표시 색상 선택</Text>
          <View style={styles.colorPickerRow}>
            {colorPalette.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  editColor === c && styles.colorDotSelected,
                ]}
                onPress={() => onChangeEditColor(c)}
              />
            ))}
          </View>
        </View>

        {onChangeEditIsOff && (
          <TouchableOpacity
            style={styles.isOffToggleRow}
            onPress={() => onChangeEditIsOff(!editIsOff)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, editIsOff && styles.checkboxChecked]}>
              {editIsOff && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.isOffTextContainer}>
              <Text style={styles.isOffLabel}>휴무(오프)로 분류</Text>
              <Text style={styles.isOffSub}>선택 시 통계에서 휴일/오프 일수에 합산됩니다</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.saveCodeBtn}
          onPress={onSaveCustomCode}
          activeOpacity={0.85}
        >
          <Text style={styles.saveCodeBtnText}>커스텀 코드 저장하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  customCodeList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  customCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codePreviewDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  codePreviewChar: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  codeDetailText: {
    flex: 1,
  },
  codeDetailName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  codeDetailSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  codeEditSmallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  codeEditSmallText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  customFormCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  customInputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#1A1A1A',
    transform: [{ scale: 1.15 }],
  },
  saveCodeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveCodeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  codeRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeDeleteSmallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  codeDeleteSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  isOffToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  isOffTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  isOffLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  isOffSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
