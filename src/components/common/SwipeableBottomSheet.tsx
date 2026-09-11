import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SwipeableBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | `${number}%`;
  maxHeight?: number | `${number}%`;
  containerStyle?: StyleProp<ViewStyle>;
  enableBackdropDismiss?: boolean;
}

export const SwipeableBottomSheet: React.FC<SwipeableBottomSheetProps> = ({
  visible,
  onClose,
  children,
  height,
  maxHeight = '92%',
  containerStyle,
  enableBackdropDismiss = true,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Open animation
  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 25,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture downward gestures that are primarily vertical
        return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Intercept downward drag before children if clearly pulling down
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.35) {
          handleDismiss();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 280,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        >
          {enableBackdropDismiss && (
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleDismiss}
            />
          )}
        </Animated.View>

        {/* Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              ...(height ? { height: height as any } : {}),
              maxHeight: maxHeight as any,
              transform: [{ translateY }],
            },
            containerStyle,
          ]}
        >
          {/* Pan drag grab bar zone */}
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handleBar} />
          </View>

          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  dragZone: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
});

