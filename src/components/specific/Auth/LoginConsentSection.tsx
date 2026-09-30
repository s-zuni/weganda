import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';
import type { LegalTabKey } from '../../../constants/legal';
import { LegalDocumentModal } from '../Legal/LegalDocumentModal';

export interface LoginConsentState {
  age: boolean;
  terms: boolean;
  privacy: boolean;
}

export const isAllConsented = (c: LoginConsentState): boolean => c.age && c.terms && c.privacy;

interface LoginConsentSectionProps {
  value: LoginConsentState;
  onChange: (next: LoginConsentState) => void;
}

interface ConsentRowProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
  onView?: () => void;
  bold?: boolean;
}

const ConsentRow: React.FC<ConsentRowProps> = ({ checked, label, onToggle, onView, bold }) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={styles.rowMain}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.label, bold && styles.labelBold]}>{label}</Text>
    </TouchableOpacity>
    {onView && (
      <TouchableOpacity
        onPress={onView}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="link"
        accessibilityLabel={`${label} 보기`}
      >
        <Text style={styles.viewLink}>보기</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const LoginConsentSection: React.FC<LoginConsentSectionProps> = ({ value, onChange }) => {
  const allChecked = isAllConsented(value);
  const [legalTab, setLegalTab] = useState<LegalTabKey | null>(null);

  return (
    <View style={styles.container}>
      <ConsentRow
        bold
        checked={allChecked}
        label="필수 약관에 모두 동의합니다"
        onToggle={() => onChange({ age: !allChecked, terms: !allChecked, privacy: !allChecked })}
      />
      <View style={styles.divider} />
      <ConsentRow
        checked={value.age}
        label="[필수] 만 14세 이상입니다"
        onToggle={() => onChange({ ...value, age: !value.age })}
      />
      <ConsentRow
        checked={value.terms}
        label="[필수] 서비스 이용약관 동의"
        onView={() => setLegalTab('terms')}
        onToggle={() => onChange({ ...value, terms: !value.terms })}
      />
      <ConsentRow
        checked={value.privacy}
        label="[필수] 개인정보 수집·이용 및 국외 이전(AI 처리 등) 동의"
        onView={() => setLegalTab('privacy')}
        onToggle={() => onChange({ ...value, privacy: !value.privacy })}
      />
      <LegalDocumentModal tab={legalTab} onClose={() => setLegalTab(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkMark: {
    color: COLORS.onPrimaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  labelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  viewLink: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
    paddingLeft: 8,
  },
});
