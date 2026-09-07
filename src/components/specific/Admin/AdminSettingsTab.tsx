import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const AdminSettingsTab: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>⚙️ 시스템 및 인프라 상태</Text>
        <Text style={styles.sub}>우간다 서비스 백엔드 및 클라우드 연결 정보</Text>

        <View style={styles.grid}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Supabase 데이터베이스</Text>
            <Text style={styles.itemValue}>https://vegtlnhgfjxdntnxbztb.supabase.co</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>정상 연결됨 (ACTIVE_HEALTHY)</Text>
            </View>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>웹 호스팅 & CDN</Text>
            <Text style={styles.itemValue}>Vercel Edge Network + Cloudflare DNS</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>SSL 인증서 정상 발급 (weganda.kr)</Text>
            </View>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>관리자 권한 정책</Text>
            <Text style={styles.itemValue}>Row Level Security (RLS) + SECURITY DEFINER RPC</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>admin_update_user_role & admin_handle_report</Text>
            </View>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>모바일 앱 & 웹 버전</Text>
            <Text style={styles.itemValue}>v1.0.0 (Production Release)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 20,
  },
  grid: {
    gap: 16,
  },
  item: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
});
