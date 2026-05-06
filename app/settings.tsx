import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TimeWindowPicker } from '@/components/TimeWindowPicker';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  WAKE_BRIGHTNESS_OPTIONS,
  loadSettings,
  saveSettings,
  type Settings,
} from '@/services/settings';
import { restorePurchases } from '@/services/purchase';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((value) => {
      if (!cancelled) setSettings(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings) return;
    saveSettings(settings).catch(() => {});
  }, [settings]);

  if (!settings) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.accentAmber} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>설정</Text>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <Section
          title="기상 윈도우"
          caption="이 시간 동안 화면 중앙에 앰버 글로우가 천천히 차오릅니다."
        >
          <TimeWindowPicker
            value={settings.wakeWindow}
            onChange={(wakeWindow) =>
              setSettings((prev) => (prev ? { ...prev, wakeWindow } : prev))
            }
          />
        </Section>

        <Section
          title="자동 진입"
          caption="끄면 앱을 켰을 때 잠들기 버튼이 먼저 보입니다."
        >
          <View style={styles.row}>
            <Text style={styles.rowLabel}>켜짐</Text>
            <Switch
              value={settings.autoEnter}
              onValueChange={(autoEnter) =>
                setSettings((prev) => (prev ? { ...prev, autoEnter } : prev))
              }
              trackColor={{ false: '#2A201A', true: colors.accentAmber }}
              thumbColor={colors.textWarmGray}
            />
          </View>
        </Section>

        <Section
          title="기상 시 밝기"
          caption="기상 윈도우 끝에 도달했을 때 화면과 글로우의 최대 강도."
        >
          <View style={styles.chipRow}>
            {WAKE_BRIGHTNESS_OPTIONS.map((value) => {
              const selected = settings.wakeBrightness === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() =>
                    setSettings((prev) =>
                      prev ? { ...prev, wakeBrightness: value } : prev,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {Math.round(value * 100)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="색상" caption="v1은 앰버만 제공합니다.">
          <View style={styles.row}>
            <View style={styles.swatch} />
            <Text style={styles.rowLabel}>앰버</Text>
          </View>
        </Section>

        <Section title="구매">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              {settings.isPurchased ? '구매 완료' : '미구매'}
            </Text>
            <Pressable
              onPress={async () => {
                const result = await restorePurchases();
                if (result.ok) {
                  setSettings((prev) =>
                    prev ? { ...prev, isPurchased: true } : prev,
                  );
                }
              }}
              hitSlop={12}
            >
              <Text style={styles.linkText}>복원</Text>
            </Pressable>
          </View>
        </Section>

        <Pressable
          style={styles.aboutLink}
          onPress={() => router.push('/about')}
        >
          <Text style={styles.aboutLinkText}>About</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 64,
    gap: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.headline,
    color: colors.textWarmGray,
  },
  close: {
    ...typography.body,
    color: colors.accentAmber,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.95,
  },
  sectionCaption: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.55,
  },
  sectionBody: {
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textWarmGray,
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#15110E',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accentAmber,
  },
  chipText: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.7,
  },
  chipTextSelected: {
    color: colors.backgroundBase,
    opacity: 1,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lightAmberEnd,
  },
  aboutLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  aboutLinkText: {
    ...typography.body,
    color: colors.accentAmber,
  },
  linkText: {
    ...typography.caption,
    color: colors.accentAmber,
  },
});
