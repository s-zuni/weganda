import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { waitlistApi, WaitlistEntry } from '../../../services/waitlistApi';

export const AdminWaitlistTab: React.FC = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    const data = await waitlistApi.getWaitlist();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filtered = entries.filter((e) =>
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyAllEmails = () => {
    const emailList = entries.map((e) => e.email).join(', ');
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(emailList);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } else {
      alert(`총 ${entries.length}개의 이메일이 복사되었습니다.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topCard}>
        <View style={styles.topCardContent}>
          <View style={styles.topIconBox}>
            <Text style={styles.topIcon}>📬</Text>
          </View>
          <View>
            <Text style={styles.topCardTitle}>사전예약 신청자 명단 (Waitlist)</Text>
            <Text style={styles.topCardSubtitle}>
              랜딩페이지에서 출시 알림과 weganda+ 2개월 무료 혜택을 신청한 간호사 고객 리스트입니다.
            </Text>
          </View>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={handleCopyAllEmails}
            disabled={entries.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.copyBtnText}>
              {copyFeedback ? '✓ 클립보드 복사 완료!' : '📋 전체 이메일 복사'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={fetchEntries}
            activeOpacity={0.8}
          >
            <Text style={styles.refreshBtnText}>🔄 새로고침</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Stats Row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>총 사전예약자</Text>
          <Text style={styles.kpiValue}>{entries.length}명</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>오늘 신규 신청</Text>
          <Text style={styles.kpiValue}>
            {
              entries.filter((e) => {
                const today = new Date().toISOString().slice(0, 10);
                return e.created_at && e.created_at.slice(0, 10) === today;
              }).length
            }
            명
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>유입 채널</Text>
          <Text style={styles.kpiValue}>공식 랜딩페이지 100%</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="이메일 검색..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#94A3B8"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={styles.clearText}>지우기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Waitlist Table */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.loadingText}>대기자 목록을 불러오는 중...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>
            {searchTerm ? '검색된 이메일이 없습니다.' : '아직 등록된 사전예약자가 없습니다.'}
          </Text>
          <Text style={styles.emptyDesc}>
            랜딩페이지(weganda.kr)에서 사용자가 이메일을 등록하면 이곳에 실시간으로 표시됩니다.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: 60 }]}>No.</Text>
              <Text style={[styles.th, { flex: 2 }]}>이메일 주소</Text>
              <Text style={[styles.th, { width: 120 }]}>유입 경로</Text>
              <Text style={[styles.th, { width: 100 }]}>상태</Text>
              <Text style={[styles.th, { width: 180 }]}>신청 일시 (KST)</Text>
            </View>

            {/* Table Body */}
            {filtered.map((item, index) => {
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                  })
                : '-';

              return (
                <View key={item.id || index} style={styles.tableBodyRow}>
                  <Text style={[styles.td, { width: 60, color: '#94A3B8' }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.td, { flex: 2, fontWeight: '700', color: '#0F172A' }]}>
                    {item.email}
                  </Text>
                  <View style={{ width: 120 }}>
                    <View style={styles.sourceBadge}>
                      <Text style={styles.sourceBadgeText}>{item.source || 'landing'}</Text>
                    </View>
                  </View>
                  <View style={{ width: 100 }}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>접수 완료</Text>
                    </View>
                  </View>
                  <Text style={[styles.td, { width: 180, color: '#64748B', fontSize: 13 }]}>
                    {dateStr}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  topCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topIcon: {
    fontSize: 24,
  },
  topCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  topCardSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    gap: 10,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  clearText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  tableScroll: {
    flex: 1,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  td: {
    fontSize: 14,
  },
  sourceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
});

