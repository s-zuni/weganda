import React, { useRef, useEffect } from 'react';
import {
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISMISS_DX_THRESHOLD = SCREEN_WIDTH * 0.35;
const DISMISS_VELOCITY_THRESHOLD = 0.3;
const DEFAULT_EDGE_WIDTH = 60;

export interface SwipeDismissContainerProps {
  onDismiss: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  edgeWidth?: number;
  visible?: boolean;
}

export const SwipeDismissContainer: React.FC<SwipeDismissContainerProps> = ({
  onDismiss,
  children,
  style,
  enabled = true,
  edgeWidth = DEFAULT_EDGE_WIDTH,
  visible = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(0);
    }
  }, [visible, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (!enabled) return false;
        const isLeftEdge = gestureState.x0 <= edgeWidth;
        const isHorizontalRight =
          gestureState.dx > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isLeftEdge && isHorizontalRight;
      },
      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
        if (!enabled) return false;
        const isLeftEdge = gestureState.x0 <= edgeWidth;
        const isHorizontalRight =
          gestureState.dx > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isLeftEdge && isHorizontalRight;
      },
      onPanResponderGrant: () => {},
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (
          gestureState.dx > DISMISS_DX_THRESHOLD ||
          (gestureState.dx > 40 && gestureState.vx > DISMISS_VELOCITY_THRESHOLD)
        ) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDismiss();
            // Reset position after dismiss
            setTimeout(() => {
              translateX.setValue(0);
            }, 100);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateX }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

export interface SwipeDismissModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  containerStyle?: StyleProp<ViewStyle>;
  edgeWidth?: number;
  enabled?: boolean;
}

export const SwipeDismissModal: React.FC<SwipeDismissModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  containerStyle,
  edgeWidth = DEFAULT_EDGE_WIDTH,
  enabled = true,
}) => {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={true}
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <SwipeDismissContainer
          onDismiss={onClose}
          style={[styles.modalSheet, containerStyle]}
          edgeWidth={edgeWidth}
          enabled={enabled}
          visible={visible}
        >
          {children}
        </SwipeDismissContainer>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  modalSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
});
