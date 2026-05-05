import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Brightness from 'expo-brightness';

import { AmberGlow } from '@/components/AmberGlow';
import { LongPressGate } from '@/components/LongPressGate';
import { useWakeWindow } from '@/hooks/useWakeWindow';
import { loadSettings, type Settings } from '@/services/settings';
import { registerWakeWindowTask } from '@/services/backgroundTask';
import { colors } from '@/theme/colors';

export default function SleepMode() {
  useKeepAwake();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((value) => {
      if (!cancelled) setSettings(value);
    });
    registerWakeWindowTask().catch(() => {});
    Brightness.requestPermissionsAsync().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const wakeWindow = useWakeWindow(
    settings?.wakeWindow ?? { start: '06:00', end: '07:00' },
  );

  const handleUnlock = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <AmberGlow
        progress={wakeWindow.active ? wakeWindow.progress : 0}
        maxOpacity={settings?.maxOpacity ?? 0.5}
      />
      <LongPressGate onUnlock={handleUnlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
});
