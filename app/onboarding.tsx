import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { updateSettings } from '@/services/settings';
import { checkEntitlement, initPurchases } from '@/services/purchase';

type Page = {
  eyebrow: string;
  title: string;
  body: string;
};

const PAGES: Page[] = [
  {
    eyebrow: '왜?',
    title: '시간이 보이면\n잠은 달아난다.',
    body: '밤에 깨면 우리는 시간을 본다. 시간을 보면 계산이 시작된다. 계산이 시작되면 잠은 멀어진다.',
  },
  {
    eyebrow: '어떻게?',
    title: '정보를 더하지\n않는다. 빼낸다.',
    body: '풀스크린 검정. 시간 표시 없음. 알림 없음. 종료하려면 화면을 3초간 길게 눌러야 한다.',
  },
  {
    eyebrow: 'Sleep Box',
    title: '2019년의\n작은 나무 상자.',
    body: 'Mark Zuckerberg가 아내의 잠을 위해 만든 상자에서 영감을 얻었다. 빛만 보여주고, 시간은 감춘다.',
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goNext = () => {
    if (index < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await updateSettings({ onboardingComplete: true }).catch(() => {});
    await initPurchases().catch(() => {});
    const purchased = await checkEntitlement().catch(() => false);
    router.replace(purchased ? '/' : '/paywall');
  };

  const isLast = index === PAGES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {PAGES.map((page) => (
          <View key={page.eyebrow} style={[styles.page, { width }]}>
            <Text style={styles.eyebrow}>{page.eyebrow}</Text>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.body}>{page.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((page, i) => (
            <View
              key={page.eyebrow}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={goNext}>
          <Text style={styles.ctaText}>{isLast ? '시작하기' : '다음'}</Text>
        </Pressable>
        {!isLast ? (
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>건너뛰기</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  scroll: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 16,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.accentAmber,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.headline,
    color: colors.textWarmGray,
    fontSize: 32,
    lineHeight: 42,
  },
  body: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 16,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textWarmGray,
    opacity: 0.25,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: colors.accentAmber,
  },
  cta: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.accentAmber,
    alignItems: 'center',
  },
  ctaText: {
    ...typography.body,
    color: colors.backgroundBase,
  },
  skip: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.6,
  },
  skipPlaceholder: {
    height: 20,
  },
});
