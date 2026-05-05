import { useCallback, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const HOLD_DURATION_MS = 3000;
const THRESHOLD_HAPTIC_MS = 2500;

type LongPressGateProps = {
  onUnlock: () => void;
  children?: ReactNode;
};

export function LongPressGate({ onUnlock, children }: LongPressGateProps) {
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thresholdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (completeTimer.current) {
      clearTimeout(completeTimer.current);
      completeTimer.current = null;
    }
    if (thresholdTimer.current) {
      clearTimeout(thresholdTimer.current);
      thresholdTimer.current = null;
    }
  }, []);

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});

    thresholdTimer.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }, THRESHOLD_HAPTIC_MS);

    completeTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      onUnlock();
    }, HOLD_DURATION_MS);
  }, [onUnlock]);

  const handleRelease = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return (
    <Pressable
      style={styles.fill}
      onPressIn={handlePressIn}
      onPressOut={handleRelease}
      onResponderTerminate={handleRelease}
      accessibilityRole="button"
      accessibilityLabel="Hold three seconds to exit sleep mode"
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
