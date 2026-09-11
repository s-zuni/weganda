import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { LegalHeader } from '../../components/specific/Legal/LegalHeader';
import { LegalTabs } from '../../components/specific/Legal/LegalTabs';
import { LegalSectionCard } from '../../components/specific/Legal/LegalSectionCard';
import { LEGAL_DOCUMENTS, LegalTabKey } from '../../constants/legal';
import { COLORS } from '../../constants/theme';
import { useResponsive } from '../../utils/useResponsive';
import { BUSINESS_INFO } from '../../types/support';

interface LegalScreenProps {
  initialTab?: LegalTabKey;
  onNavigateHome?: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({
  initialTab = 'terms',
  onNavigateHome,
}) => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<LegalTabKey>(initialTab);

  // 브라우저 주소창 경로 또는 쿼리 파라미터에서 탭 동기화
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as LegalTabKey;
      const pathname = window.location.pathname;

      if (tabParam && ['terms', 'privacy', 'membership', 'community'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (pathname.includes('/privacy')) {
        setActiveTab('privacy');
      } else if (pathname.includes('/membership') || pathname.includes('/paid')) {
        setActiveTab('membership');
      } else if (pathname.includes('/community')) {
        setActiveTab('community');
      } else if (pathname.includes('/terms')) {
        setActiveTab('terms');
      }
    }
  }, []);

  const handleTabChange = (newTab: LegalTabKey) => {
    setActiveTab(newTab);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const doc = LEGAL_DOCUMENTS[newTab];
      const targetUrl = doc ? doc.path : `/terms?tab=${newTab}`;
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.location.href = '/';
    }
  };

  const currentDoc = LEGAL_DOCUMENTS[activeTab] || LEGAL_DOCUMENTS.terms;

  return (
    <View style={styles.container}>
      {/* Top Fixed Header */}
      <LegalHeader onNavigateHome={handleGoHome} title={currentDoc.shortTitle} />

      {/* Tabs Navigation */}
      <LegalTabs activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentWrapper}>
          {/* Document Header Box */}
          <View style={styles.docHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.effectiveBadge}>
                <Text style={styles.effectiveBadgeText}>{currentDoc.effectiveDate}</Text>
              </View>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>{currentDoc.version}</Text>
              </View>
            </View>
            <Text style={styles.docTitle}>{currentDoc.title}</Text>
            <Text style={styles.docSummary}>{currentDoc.summary}</Text>
          </View>

          {/* Document Articles */}
          <View style={styles.articlesList}>
            {currentDoc.articles.map((article, index) => (
              <LegalSectionCard key={index} article={article} index={index} />
            ))}
          </View>

          {/* Bottom Info & Contact Box */}
          <View style={styles.bottomContactBox}>
            <Text style={styles.bottomContactTitle}>약관 및 권리 보호 문의</Text>
            <Text style={styles.bottomContactDesc}>
              우간다 서비스 약관, 개인정보 처리방침, 멤버십 결제/환불 및 커뮤니티 운영과 관련하여 문의사항이 있으실 경우 고객지원센터로 연락 주시면 신속하게 안내해 드리겠습니다.
            </Text>
            <View style={styles.contactItemRow}>
              <Text style={styles.contactItemLabel}>상호명 / 대표자</Text>
              <Text style={styles.contactItemValue}>{BUSINESS_INFO.companyName} / {BUSINESS_INFO.representative}</Text>
            </View>
            <View style={styles.contactItemRow}>
              <Text style={styles.contactItemLabel}>사업자등록번호</Text>
              <Text style={styles.contactItemValue}>{BUSINESS_INFO.businessNumber}</Text>
            </View>
            <View style={styles.contactItemRow}>
              <Text style={styles.contactItemLabel}>고객센터 전화</Text>
              <Text style={styles.contactItemValue}>{BUSINESS_INFO.tel}</Text>
            </View>
            <View style={styles.contactItemRow}>
              <Text style={styles.contactItemLabel}>문의 이메일</Text>
              <Text style={styles.contactItemValue}>{BUSINESS_INFO.email}</Text>
            </View>
            <View style={styles.contactItemRow}>
              <Text style={styles.contactItemLabel}>상담 운영시간</Text>
              <Text style={styles.contactItemValue}>{BUSINESS_INFO.hours}</Text>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            © 2026 {BUSINESS_INFO.companyName}. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  scrollContentMobile: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    maxWidth: 860,
    width: '100%',
  },
  docHeader: {
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  effectiveBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  effectiveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  versionBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary || '#FF507C',
  },
  docTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  docSummary: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary || '#FF507C',
  },
  articlesList: {
    marginBottom: 40,
  },
  bottomContactBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  bottomContactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  bottomContactDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactItemLabel: {
    width: 100,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  contactItemValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 24,
  },
});

