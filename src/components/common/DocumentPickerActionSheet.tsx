import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/theme';

export interface PickedDocument {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

interface DocumentPickerActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (doc: PickedDocument) => void;
  title?: string;
  useModal?: boolean;
}

export const DocumentPickerActionSheet: React.FC<DocumentPickerActionSheetProps> = ({
  visible,
  onClose,
  onSelect,
  title = '증빙 서류 첨부',
  useModal = true,
}) => {
  // 📷 1. 카메라 직접 촬영
  const handleTakePhoto = async () => {
    onClose();
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          '카메라 접근 권한 필요',
          '증빙 서류를 직접 촬영하려면 기기의 카메라 접근 권한을 허용해 주세요.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName =
          asset.fileName || `camera_doc_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`;
        onSelect({
          uri: asset.uri,
          name: fileName,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('촬영 오류', '카메라 촬영 중 오류가 발생했습니다.');
    }
  };

  // 🖼️ 2. 사진 앨범/갤러리에서 선택
  const handlePickFromGallery = async () => {
    onClose();
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          '사진 보관함 권한 필요',
          '서류 사진을 선택하려면 기기의 사진 보관함 접근 권한을 허용해 주세요.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName =
          asset.fileName || `gallery_doc_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`;
        onSelect({
          uri: asset.uri,
          name: fileName,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('선택 오류', '사진을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 📁 3. 파일/문서(PDF 등) 선택
  const handlePickDocument = async () => {
    onClose();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onSelect({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        });
      }
    } catch (err: any) {
      console.warn('Document pick error:', err);
      Alert.alert('문서 선택 오류', '문서를 불러오는 중 오류가 발생했습니다.');
    }
  };

  if (!visible) return null;

  const content = (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={[styles.overlay, !useModal && [StyleSheet.absoluteFill, { zIndex: 9999 }]]}>
        <TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            <View style={styles.handleBar} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              제출할 증빙 서류의 첨부 방식을 선택해 주세요.
            </Text>

            <View style={styles.optionsList}>
              {/* 사진 보관함에서 선택 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Text style={styles.iconText}>🖼️</Text>
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>사진 보관함에서 선택</Text>
                  <Text style={styles.optionDesc}>갤러리에 저장된 면허증/학생증 사진 첨부</Text>
                </View>
              </TouchableOpacity>

              {/* 카메라로 직접 촬영 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                  <Text style={styles.iconText}>📷</Text>
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>카메라로 직접 촬영</Text>
                  <Text style={styles.optionDesc}>실물 서류나 사원증/학생증 즉시 촬영</Text>
                </View>
              </TouchableOpacity>

              {/* 파일 / PDF 문서 선택 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={styles.iconText}>📄</Text>
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>파일 및 문서 (PDF) 선택</Text>
                  <Text style={styles.optionDesc}>발급받은 재직증명서, 재학증명서 전자문서</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
});

