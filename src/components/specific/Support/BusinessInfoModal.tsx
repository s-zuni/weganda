import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { BUSINESS_INFO } from '../../../types/support';

interface BusinessInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({ visible, onClose }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${BUSINESS_INFO.tel}`).catch(() => {});
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${BUSINESS_INFO.email}?subject=[우간다 문의]`).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>사업자 정보</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subNotice}>
            우간다는 전자상거래 등에서의 소비자보호에 관한 법률에 의거하여 아래와 같이 사업자 정보를 투명하게 공개합니다.
          </Text>

          {/* Business Info Rows */}
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>사업자명(상호)</Text>
              <Text style={styles.value}>{BUSINESS_INFO.companyName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>대표자</Text>
              <Text style={styles.value}>{BUSINESS_INFO.representative}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>사업자등록번호</Text>
              <Text style={styles.value}>{BUSINESS_INFO.businessNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>연락처</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.value, styles.linkText]}>{BUSINESS_INFO.tel}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>이메일</Text>
              <TouchableOpacity onPress={handleEmail}>
                <Text style={[styles.value, styles.linkText]}>{BUSINESS_INFO.email}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>공식 서비스 문의</Text>
              <Text style={styles.value}>{BUSINESS_INFO.officialServiceEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>통신판매업 신고</Text>
              <Text style={styles.value}>심사 대기 중</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>고객센터 운영시간</Text>
              <Text style={styles.value}>{BUSINESS_INFO.hours}</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  subNotice: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
  },
  infoList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  linkText: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

