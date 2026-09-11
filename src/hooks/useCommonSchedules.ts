import { useMemo, useState } from 'react';
import { GroupChat, GroupChatMember } from '../types/friends';
import { COLORS } from '../constants/theme';

export interface CommonScheduleItem {
  id: string;
  day: number;
  dayOfWeek: string;
  isSunday: boolean;
  isSaturday: boolean;
  type: 'golden_off' | 'off' | 'work';
  title: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  memberNames: string[];
  desc: string;
}

export type CommonScheduleFilterType = 'all' | 'off' | 'work';

export function useCommonSchedules(
  groupChat: GroupChat | null,
  currentYear: number,
  currentMonth: number
) {
  const [filter, setFilter] = useState<CommonScheduleFilterType>('all');

  const commonSchedules = useMemo(() => {
    if (!groupChat || !groupChat.members || groupChat.members.length === 0) return [];
    const list: CommonScheduleItem[] = [];
    const totalMembers = groupChat.members.length;

    for (let d = 1; d <= 31; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeekIdx = dateObj.getDay();
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIdx];
      const isSunday = dayOfWeekIdx === 0;
      const isSaturday = dayOfWeekIdx === 6;

      const memberShifts = groupChat.members.map((m: GroupChatMember) => {
        const s = m.monthlyShifts.find((x) => x.day === d);
        return { name: m.name, shift: s ? s.shift : 'O' };
      });

      const offMembers = memberShifts.filter((m) => m.shift === 'O');
      const dayMembers = memberShifts.filter((m) => m.shift === 'D');
      const eveMembers = memberShifts.filter((m) => m.shift === 'E');
      const nightMembers = memberShifts.filter((m) => m.shift === 'N');

      // 1. 전원 오프 (골든 오프)
      if (offMembers.length === totalMembers) {
        list.push({
          id: `common_${d}_golden`,
          day: d,
          dayOfWeek,
          isSunday,
          isSaturday,
          type: 'golden_off',
          title: '전원 OFF (골든오프) 🎉',
          badgeText: '전원 휴무',
          badgeBg: '#FFF1F4',
          badgeColor: COLORS.primary,
          memberNames: offMembers.map((m) => m.name),
          desc: '전원 동시 휴무! 단체 회식 및 모임 최적일',
        });
      } else if (offMembers.length >= 2) {
        // 2. 다수 오프
        list.push({
          id: `common_${d}_off`,
          day: d,
          dayOfWeek,
          isSunday,
          isSaturday,
          type: 'off',
          title: `함께 쉬는 날 (${offMembers.length}명) 🌿`,
          badgeText: `${offMembers.length}명 OFF`,
          badgeBg: '#FEF2F2',
          badgeColor: '#EF4444',
          memberNames: offMembers.map((m) => m.name),
          desc: `${offMembers.map((m) => m.name).join(', ')} 선생님 함께 쉬는 날`,
        });
      }

      // 3. 함께 일하는 날 (Day)
      if (dayMembers.length >= 2) {
        list.push({
          id: `common_${d}_day`,
          day: d,
          dayOfWeek,
          isSunday,
          isSaturday,
          type: 'work',
          title: `Day 함께 근무 (${dayMembers.length}명) ☀️`,
          badgeText: `Day ${dayMembers.length}명`,
          badgeBg: '#EFF6FF',
          badgeColor: '#3B82F6',
          memberNames: dayMembers.map((m) => m.name),
          desc: `${dayMembers.map((m) => m.name).join(', ')} 선생님 주간 호흡`,
        });
      }

      // 4. 함께 일하는 날 (Evening)
      if (eveMembers.length >= 2) {
        list.push({
          id: `common_${d}_eve`,
          day: d,
          dayOfWeek,
          isSunday,
          isSaturday,
          type: 'work',
          title: `Eve 함께 근무 (${eveMembers.length}명) 🌆`,
          badgeText: `Eve ${eveMembers.length}명`,
          badgeBg: '#FFF7ED',
          badgeColor: '#F97316',
          memberNames: eveMembers.map((m) => m.name),
          desc: `${eveMembers.map((m) => m.name).join(', ')} 선생님 이브닝 호흡`,
        });
      }

      // 5. 함께 일하는 날 (Night)
      if (nightMembers.length >= 2) {
        list.push({
          id: `common_${d}_night`,
          day: d,
          dayOfWeek,
          isSunday,
          isSaturday,
          type: 'work',
          title: `Night 함께 근무 (${nightMembers.length}명) 🌙`,
          badgeText: `Night ${nightMembers.length}명`,
          badgeBg: '#F3F4F6',
          badgeColor: '#1F2937',
          memberNames: nightMembers.map((m) => m.name),
          desc: `${nightMembers.map((m) => m.name).join(', ')} 선생님 야간 호흡`,
        });
      }
    }

    return list;
  }, [groupChat, currentYear, currentMonth]);

  const filteredCommonSchedules = useMemo(() => {
    if (filter === 'off') {
      return commonSchedules.filter((s) => s.type === 'golden_off' || s.type === 'off');
    }
    if (filter === 'work') {
      return commonSchedules.filter((s) => s.type === 'work');
    }
    return commonSchedules;
  }, [commonSchedules, filter]);

  return {
    commonSchedules,
    filteredCommonSchedules,
    filter,
    setFilter,
  };
}
