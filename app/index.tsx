import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { AmberGlow } from '@/components/AmberGlow';
import { LongPressGate } from '@/components/LongPressGate';
import { useWakeWindow } from '@/hooks/useWakeWindow';
import { useSleepBrightness } from '@/hooks/useSleepBrightness';
import { loadSettings, type Settings } from '@/services/settings';
import { checkEntitlement } from '@/services/purchase';
import { registerWakeWindowTask } from '@/services/backgroundTask';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function Index() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((value) => {
      if (cancelled) return;
      setSettings(value);
      if (value.autoEnter) setEngaged(true);
    });
    registerWakeWindowTask().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const value = await loadSettings();
        if (cancelled) return;
        setSettings(value);
        const purchased = await checkEntitlement();
        if (!cancelled && !purchased) {
          router.replace('/paywall');
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (!settings) return null;

  if (!engaged) {
    return <PreSleepHome onStart={() => setEngaged(true)} />;
  }

  return <SleepView settings={settings} />;
}

function PreSleepHome({ onStart }: { onStart: () => void }) {
  return (
    <View style={preStyles.container}>
      <View style={preStyles.center}>
        <Text style={preStyles.brand}>Dim</Text>
        <Text style={preStyles.tagline}>밤에 깨도, 시간이 궁금하지 않은 시계.</Text>
      </View>
      <View style={preStyles.actions}>
        <Pressable style={preStyles.startButton} onPress={onStart}>
          <Text style={preStyles.startText}>잠들기</Text>
        </Pressable>
        <Pressable
          style={preStyles.settingsLink}
          onPress={() => router.push('/settings')}
          hitSlop={12}
        >
          <Text style={preStyles.settingsText}>설정</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SleepView({ settings }: { settings: Settings }) {
  useKeepAwake();
  const wakeWindow = useWakeWindow(settings.wakeWindow);
  const progress = wakeWindow.active ? wakeWindow.progress : 0;

  useSleepBrightness(progress, settings.wakeBrightness);

  return (
    <View style={styles.container}>
      <AmberGlow progress={progress} maxOpacity={settings.wakeBrightness} />
      <LongPressGate onUnlock={() => router.push('/settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
});

const preStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'space-between',
    paddingVertical: 96,
    paddingHorizontal: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  brand: {
    ...typography.headline,
    color: colors.textWarmGray,
    fontSize: 40,
    letterSpacing: 4,
  },
  tagline: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.7,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  startButton: {
    alignSelf: 'stretch',
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: colors.accentAmber,
    alignItems: 'center',
  },
  startText: {
    ...typography.body,
    color: colors.backgroundBase,
    letterSpacing: 1,
  },
  settingsLink: {
    paddingVertical: 8,
  },
  settingsText: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.6,
  },
});
