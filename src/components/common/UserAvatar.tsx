import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { COLORS, useAppTheme } from '../../constants/theme';
import { UserIcon, CameraIcon } from './Icon';

export interface AvatarPreset {
  id: string;
  name: string;
  bg: string;
  emoji: string;
  borderColor: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset:coral', name: '비바 코랄', bg: '#FFE4EA', emoji: '🌸', borderColor: '#FF507C' },
  { id: 'preset:blue', name: '세레니티 블루', bg: '#EFF6FF', emoji: '💙', borderColor: '#3B82F6' },
  { id: 'preset:green', name: '포레스트 그린', bg: '#ECFDF5', emoji: '🌿', borderColor: '#10B981' },
  { id: 'preset:purple', name: '소프트 라벤더', bg: '#F5F3FF', emoji: '💜', borderColor: '#8B5CF6' },
  { id: 'preset:yellow', name: '써니 옐로우', bg: '#FEF3C7', emoji: '💛', borderColor: '#F59E0B' },
  { id: 'preset:teal', name: '메디컬 틸', bg: '#CCFBF1', emoji: '🩺', borderColor: '#0D9488' },
  { id: 'preset:night', name: '나이트 듀티', bg: '#EEF2FF', emoji: '🌙', borderColor: '#4F46E5' },
  { id: 'preset:off', name: '오프 힐링', bg: '#FDF2F8', emoji: '☕', borderColor: '#DB2777' },
];

export interface UserAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  showCameraBadge?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  name,
  size = 40,
  style,
  showCameraBadge = false,
  onPress,
  accessibilityLabel,
}) => {
  const theme = useAppTheme();
  const radius = size / 2;
  const isPreset = uri && uri.startsWith('preset:');
  const preset = isPreset ? AVATAR_PRESETS.find((p) => p.id === uri) : null;

  const renderContent = () => {
    // 1. 프리셋 아바타 (이모지 캐릭터)
    if (preset) {
      return (
        <View
          style={[
            styles.presetContainer,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: preset.bg,
              borderColor: preset.borderColor,
            },
          ]}
        >
          <Text style={{ fontSize: Math.max(12, size * 0.45) }}>{preset.emoji}</Text>
        </View>
      );
    }

    // 2. 갤러리 / 원격 사진 (이미지 URI)
    if (uri && (uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('ph://') || uri.startsWith('content://') || uri.startsWith('data:'))) {
      return (
        <Image
          source={{ uri }}
          style={[
            styles.avatarImage,
            {
              width: size,
              height: size,
              borderRadius: radius,
            },
          ]}
          resizeMode="cover"
        />
      );
    }

    // 3. 이름 이니셜 (텍스트)
    if (name && name.trim()) {
      const initial = name.trim().charAt(0);
      return (
        <View
          style={[
            styles.initialContainer,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: theme.primaryTint,
            },
          ]}
        >
          <Text
            style={[
              styles.initialText,
              {
                fontSize: Math.max(10, size * 0.42),
                color: theme.primary,
              },
            ]}
          >
            {initial}
          </Text>
        </View>
      );
    }

    // 4. 기본 아이콘 폴백
    return (
      <View
        style={[
          styles.defaultContainer,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: theme.primaryTint,
          },
        ]}
      >
        <UserIcon size={Math.max(14, size * 0.52)} color={theme.primary} />
      </View>
    );
  };

  const badgeSize = Math.max(18, Math.round(size * 0.38));
  const badgeRadius = badgeSize / 2;

  const content = (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {renderContent()}

      {/* 카메라 수정 배지 (마이페이지 등에서 활성화) */}
      {showCameraBadge && (
        <View
          style={[
            styles.cameraBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeRadius,
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
            },
          ]}
        >
          <CameraIcon size={Math.round(badgeSize * 0.62)} color={theme.primary} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || '프로필 사진 변경'}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarImage: {
    backgroundColor: '#F3F4F6',
  },
  initialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontWeight: '800',
  },
  defaultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
});
