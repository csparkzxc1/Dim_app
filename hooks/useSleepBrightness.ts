import { useCallback, useEffect, useRef, useState } from 'react';
import * as Brightness from 'expo-brightness';
import { useFocusEffect } from 'expo-router';

const MIN_BRIGHTNESS = 0.02;

export function useSleepBrightness(progress: number, maxValue: number) {
  const savedRef = useRef<number | null>(null);
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    if (!focused) return;

    let cancelled = false;
    (async () => {
      try {
        const current = await Brightness.getBrightnessAsync();
        if (!cancelled && savedRef.current == null) {
          savedRef.current = current;
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
      const saved = savedRef.current;
      if (saved != null) {
        Brightness.setBrightnessAsync(saved).catch(() => {});
      }
    };
  }, [focused]);

  useEffect(() => {
    if (!focused) return;
    const target = Math.max(
      MIN_BRIGHTNESS,
      Math.min(1, progress * maxValue),
    );
    Brightness.setBrightnessAsync(target).catch(() => {});
  }, [focused, progress, maxValue]);
}
