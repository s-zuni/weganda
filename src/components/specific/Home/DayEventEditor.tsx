import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { COLORS, TINT_COLORS, useAppTheme } from '../../../constants/theme';
import { PersonalEventInput } from '../../../services/nativeCalendarService';

interface DayEventEditorProps {
  dateKey: string;
  initial?: PersonalEventInput;
  onSubmit: (input: PersonalEventInput) => void;
  onCancel: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toHHMM = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const parseHHMM = (text: string): { h: number; m: number } | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h < 24 && m < 60 ? { h, m } : null;
};

export const DayEventEditor: React.FC<DayEventEditorProps> = ({
  dateKey,
  initial,
  onSubmit,
  onCancel,
}) => {
  const theme = useAppTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [start, setStart] = useState(initial ? toHHMM(initial.startDate) : '09:00');
  const [end, setEnd] = useState(initial ? toHHMM(initial.endDate) : '10:00');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('일정 제목을 입력해주세요.');
      return;
    }
    const [y, m, d] = dateKey.split('-').map(Number);
    if (allDay) {
      onSubmit({
        title: title.trim(),
        allDay: true,
        startDate: new Date(y, m - 1, d, 0, 0, 0),
        endDate: new Date(y, m - 1, d, 23, 59, 59),
      });
      return;
    }
    const s = parseHHMM(start);
    const e = parseHHMM(end);
    if (!s || !e) {
      setError('시간은 09:30 형식으로 입력해주세요.');
      return;
    }
    const startDate = new Date(y, m - 1, d, s.h, s.m, 0);
    const endDate = new Date(y, m - 1, d, e.h, e.m, 0);
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1); // 야간 일정은 다음 날 종료
    onSubmit({ title: title.trim(), allDay: false, startDate, endDate });
  };

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="일정 제목"
        placeholderTextColor={COLORS.textMuted}
      />
      <View style={styles.row}>
        <Text style={styles.label}>종일</Text>
        <Switch
          value={allDay}
          onValueChange={setAllDay}
          trackColor={{ true: theme.primary, false: COLORS.border }}
        />
      </View>
      {!allDay && (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={start}
            onChangeText={setStart}
            placeholder="09:00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
          <Text style={styles.label}>~</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={end}
            onChangeText={setEnd}
            placeholder="10:00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
          <Text style={[styles.btnText, { color: theme.onPrimaryText }]}>
            {initial ? '수정 저장' : '일정 추가'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  timeInput: { flex: 1, textAlign: 'center' },
  error: { fontSize: 12, color: TINT_COLORS.statusRejectedText },
  btn: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '700' },
  cancelBtn: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
});
