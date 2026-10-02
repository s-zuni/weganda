import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, TINT_COLORS, useAppTheme } from '../../../constants/theme';
import { SwipeableBottomSheet, BottomSheetScrollView } from '../../common/SwipeableBottomSheet';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { useUserStore } from '../../../store/useUserStore';
import {
  nativeCalendarService,
  PersonalCalendarEvent,
  PersonalEventInput,
} from '../../../services/nativeCalendarService';
import { DATE_KIND_LABEL, formatDateKeyKorean, getDateKind } from '../../../utils/dateKind';
import { DayEventEditor } from './DayEventEditor';

interface DayScheduleModalProps {
  visible: boolean;
  dateKey: string | null;
  onClose: () => void;
  /** 개인 일정이 추가/수정/삭제되어 월간 캘린더 카운트를 갱신해야 할 때 */
  onEventsChanged: () => void;
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

export const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  visible,
  dateKey,
  onClose,
  onEventsChanged,
}) => {
  const theme = useAppTheme();
  const userId = useUserStore((s) => s.id);
  const schedules = useShiftScheduleStore((s) => s.schedules);
  const customCodes = useShiftScheduleStore((s) => s.customCodes);
  const setShiftForDate = useShiftScheduleStore((s) => s.setShiftForDate);

  const [events, setEvents] = useState<PersonalCalendarEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' = 신규 추가

  const loadEvents = useCallback(async () => {
    if (!dateKey) return;
    setEvents(await nativeCalendarService.getPersonalEventsForDate(dateKey));
  }, [dateKey]);

  useEffect(() => {
    if (visible) {
      setEditingId(null);
      loadEvents();
    }
  }, [visible, loadEvents]);

  if (!dateKey) return null;

  const currentCode = schedules[dateKey];
  const kind = getDateKind(dateKey);

  const afterMutation = async (ok: boolean, failMessage: string) => {
    if (!ok) {
      Alert.alert('알림', failMessage);
      return;
    }
    setEditingId(null);
    await loadEvents();
    onEventsChanged();
  };

  const handleSubmitEvent = async (input: PersonalEventInput) => {
    if (editingId && editingId !== 'new') {
      await afterMutation(
        await nativeCalendarService.updatePersonalEvent(editingId, input),
        '일정을 수정하지 못했어요. 캘린더 권한을 확인해주세요.'
      );
    } else {
      await afterMutation(
        await nativeCalendarService.createPersonalEvent(input),
        '일정을 추가하지 못했어요. 캘린더 권한을 확인해주세요.'
      );
    }
  };

  const handleDeleteEvent = (ev: PersonalCalendarEvent) => {
    Alert.alert('일정 삭제', `${ev.title} 일정을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () =>
          afterMutation(await nativeCalendarService.deletePersonalEvent(ev.id), '일정을 삭제하지 못했어요.'),
      },
    ]);
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} maxHeight="85%">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{formatDateKeyKorean(dateKey)}</Text>
          <Text style={styles.subtitle}>{DATE_KIND_LABEL[kind]}</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* 근무 스케줄 */}
        <Text style={styles.sectionTitle}>근무 스케줄</Text>
        <View style={styles.chipWrap}>
          {Object.values(customCodes).map((c) => {
            const active = currentCode === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.shiftChip,
                  { borderColor: c.color, backgroundColor: active ? c.color : COLORS.background },
                ]}
                onPress={() => setShiftForDate(dateKey, c.code, userId || undefined)}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.shiftChipText, { color: active ? c.textColor : c.color }]}>
                  {c.code} · {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!currentCode && <Text style={styles.hint}>등록된 근무가 없어요. 위에서 선택하면 바로 등록돼요.</Text>}

        {/* 캘린더 일정 */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitleInline}>캘린더 일정 ({events.length})</Text>
          {Platform.OS !== 'web' && editingId === null && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setEditingId('new')}>
              <Text style={[styles.addBtnText, { color: theme.primary }]}>+ 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingId === 'new' && (
          <DayEventEditor dateKey={dateKey} onSubmit={handleSubmitEvent} onCancel={() => setEditingId(null)} />
        )}

        {events.length === 0 && editingId !== 'new' && (
          <Text style={styles.hint}>
            {Platform.OS === 'web'
              ? '모바일 앱에서 캘린더 일정을 확인할 수 있어요.'
              : '이 날 저장된 캘린더 일정이 없어요.'}
          </Text>
        )}

        {events.map((ev) =>
          editingId === ev.id ? (
            <DayEventEditor
              key={ev.id}
              dateKey={dateKey}
              initial={{ title: ev.title, startDate: ev.startDate, endDate: ev.endDate, allDay: ev.allDay }}
              onSubmit={handleSubmitEvent}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <View key={ev.id} style={[styles.eventCard, { borderLeftColor: theme.primary }]}>
              <View style={styles.eventBody}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventTime}>
                  {ev.allDay ? '종일' : `${formatTime(ev.startDate)} ~ ${formatTime(ev.endDate)}`}
                </Text>
              </View>
              {ev.editable ? (
                <View style={styles.eventActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setEditingId(ev.id)}>
                    <Text style={[styles.actionText, { color: theme.primary }]}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteEvent(ev)}>
                    <Text style={[styles.actionText, { color: TINT_COLORS.statusRejectedText }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.readOnly}>읽기 전용</Text>
              )}
            </View>
          )
        )}
      </BottomSheetScrollView>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  closeText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  sectionTitleInline: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 6,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shiftChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  shiftChipText: { fontSize: 13, fontWeight: '700' },
  hint: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  addBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  addBtnText: { fontSize: 14, fontWeight: '700' },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  eventBody: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  eventTime: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  eventActions: { flexDirection: 'row' },
  actionBtn: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '700' },
  readOnly: { fontSize: 11, color: COLORS.textMuted },
});
