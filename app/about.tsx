import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function About() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dim</Text>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>

        <Text style={styles.tagline}>밤에 깨도, 시간이 궁금하지 않은 시계.</Text>

        <Section title="철학">
          <Text style={styles.body}>
            Dim은 정보를 더하지 않는다. 빼낸다. 시간 표시, 푸시, 배지, 카운트다운—
            모두 잠을 깨우는 트리거다. 우리는 그 전부를 제거했다.
          </Text>
        </Section>

        <Section title="만든 사람">
          <Text style={styles.body}>
            한 명의 잠 못 이루는 사람이, 다른 잠 못 이루는 사람들을 위해 만들었다.
          </Text>
        </Section>

        <Section title="문의">
          <Text style={styles.body}>support@dim.app</Text>
        </Section>

        <Text style={styles.version}>버전 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  content: {
    padding: 24,
    paddingBottom: 64,
    gap: 24,
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
  tagline: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.85,
    fontStyle: 'italic',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.accentAmber,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.85,
  },
  version: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.4,
    marginTop: 16,
  },
});
