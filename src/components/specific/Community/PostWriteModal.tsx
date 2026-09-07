import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { PostItem } from '../../../mocks/communityData';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { useUserStore } from '../../../store/useUserStore';
import { ImageIcon, LockIcon } from '../../common/Icon';

interface PostWriteModalProps {
  visible: boolean;
  editPost?: PostItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: PostItem['category'][] = [
  '임상/질문',
  '교대근무 고민',
  '이직/커리어',
  '자유게시판',
];

// 예시 첨부 가능한 Mock 이미지 샘플들
const MOCK_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60',
];

export const PostWriteModal: React.FC<PostWriteModalProps> = ({
  visible,
  editPost,
  onClose,
  onSuccess,
}) => {
  const userId = useUserStore((s) => s.id);
  const { createPost, updatePost } = useCommunityStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostItem['category']>('자유게시판');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setContent(editPost.content);
      setCategory(editPost.category);
      setIsAnonymous(editPost.isAnonymous);
      setImages(editPost.images || []);
    } else {
      setTitle('');
      setContent('');
      setCategory('자유게시판');
      setIsAnonymous(true);
      setImages([]);
    }
  }, [editPost, visible]);

  const handleAddPhoto = () => {
    if (images.length >= 3) {
      Alert.alert('사진 첨부 제한', '사진은 최대 3장까지만 첨부할 수 있습니다.');
      return;
    }
    // Mock: 샘플 이미지 추가
    const nextImage = MOCK_SAMPLE_IMAGES[images.length % MOCK_SAMPLE_IMAGES.length];
    setImages((prev) => [...prev, nextImage]);
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('입력 확인', '글 제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('입력 확인', '글 내용을 입력해 주세요.');
      return;
    }

    if (editPost) {
      updatePost(editPost.id, title.trim(), content.trim(), category, isAnonymous, images);
      Alert.alert('수정 완료', '게시글이 성공적으로 수정되었습니다.');
    } else {
      createPost(title.trim(), content.trim(), category, isAnonymous, images, userId || undefined);
      Alert.alert('등록 완료', '새 글이 커뮤니티에 등록되었습니다.');
    }

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{editPost ? '게시글 수정' : '새 글 쓰기'}</Text>

          <TouchableOpacity style={styles.submitHeaderBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitHeaderText}>{editPost ? '수정' : '등록'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* 카테고리 선택 */}
          <Text style={styles.inputLabel}>게시판 선택</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 익명 설정 토글 */}
          <TouchableOpacity
            style={[styles.anonymousToggle, isAnonymous && styles.anonymousToggleActive]}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.85}
          >
            <View style={styles.anonymousLeft}>
              <LockIcon size={16} color={isAnonymous ? COLORS.primary : COLORS.textMuted} />
              <View>
                <Text style={[styles.anonymousTitle, isAnonymous && styles.anonymousTitleActive]}>
                  익명으로 안심 작성
                </Text>
                <Text style={styles.anonymousDesc}>
                  작성자 이름과 소속 병원명이 '익명 간호사'로 안전하게 숨겨집니다.
                </Text>
              </View>
            </View>
            <View style={[styles.switchCircle, isAnonymous && styles.switchCircleActive]}>
              <Text style={styles.switchCheckText}>{isAnonymous ? '✓' : ''}</Text>
            </View>
          </TouchableOpacity>

          {/* 제목 입력 */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor={COLORS.textMuted}
            maxLength={60}
          />

          {/* 본문 입력 */}
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="동료 간호사들과 나누고 싶은 고민이나 임상 팁을 자유롭게 작성해 주세요. (환자 개인정보 유출 시 제재될 수 있습니다.)"
            placeholderTextColor={COLORS.textMuted}
            multiline={true}
            textAlignVertical="top"
          />

          {/* 사진 첨부 섹션 (최대 3장) */}
          <View style={styles.photoSection}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoSectionTitle}>사진 첨부 ({images.length}/3)</Text>
              <Text style={styles.photoHint}>임상 족보, 공지 캡처 등 최대 3장</Text>
            </View>

            <View style={styles.photoList}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.thumbnailWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => handleRemovePhoto(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 3 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto} activeOpacity={0.8}>
                  <ImageIcon size={22} color={COLORS.primary} />
                  <Text style={styles.addPhotoText}>사진 추가</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  submitHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  submitHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  anonymousToggleActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primaryLight,
  },
  anonymousLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  anonymousTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  anonymousTitleActive: {
    color: COLORS.primary,
  },
  anonymousDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchCircleActive: {
    backgroundColor: COLORS.primary,
  },
  switchCheckText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titleInput: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    marginBottom: 14,
  },
  contentInput: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    minHeight: 180,
    marginBottom: 20,
  },
  photoSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  photoHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  photoList: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default PostWriteModal;

