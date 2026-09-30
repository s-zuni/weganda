import React from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LegalScreen } from '../../../screens/Legal/LegalScreen';
import { LegalTabKey } from '../../../constants/legal';
import { COLORS } from '../../../constants/theme';

interface LegalDocumentModalProps {
  // null이면 닫힘, 값이 있으면 해당 약관 탭으로 열림
  tab: LegalTabKey | null;
  onClose: () => void;
}

// 약관·개인정보 처리방침 등을 외부 웹사이트가 아닌 앱 내부(코드 상수 = 항상 최신 개정본)에서 보여주는 모달
export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({ tab, onClose }) => (
  <Modal visible={tab !== null} animationType="slide" onRequestClose={onClose}>
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tab && (
          <LegalScreen initialTab={tab} embedded homeLabel="닫기 ✕" onNavigateHome={onClose} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>
);
