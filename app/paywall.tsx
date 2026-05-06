import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  getOffering,
  isLiveMode,
  purchaseUnlock,
  restorePurchases,
  type OfferingInfo,
} from '@/services/purchase';

type Status =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'error'; message: string };

export default function Paywall() {
  const [offering, setOffering] = useState<OfferingInfo | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => {
    let cancelled = false;
    getOffering().then((value) => {
      if (cancelled) return;
      setOffering(value);
      setLoadingOffering(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePurchase = async () => {
    setStatus({ kind: 'busy' });
    const result = await purchaseUnlock();
    if (result.ok) {
      router.replace('/');
    } else if (result.cancelled) {
      setStatus({ kind: 'idle' });
    } else {
      setStatus({
        kind: 'error',
        message: result.message ?? '구매에 실패했습니다.',
      });
    }
  };

  const handleRestore = async () => {
    setStatus({ kind: 'busy' });
    const result = await restorePurchases();
    if (result.ok) {
      router.replace('/');
    } else {
      setStatus({
        kind: 'error',
        message: result.message ?? '복원에 실패했습니다.',
      });
    }
  };

  const busy = status.kind === 'busy';
  const price = offering?.priceString ?? '₩4,400';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.brandText}>Dim</Text>
          <Text style={styles.tagline}>
            밤에 깨도, 시간이 궁금하지 않은 시계.
          </Text>
        </View>

        <View style={styles.priceBlock}>
          {loadingOffering ? (
            <ActivityIndicator color={colors.accentAmber} />
          ) : (
            <>
              <Text style={styles.priceLabel}>일회 결제 · 평생 사용</Text>
              <Text style={styles.priceValue}>{price}</Text>
            </>
          )}
          {!isLiveMode() ? (
            <Text style={styles.devNote}>
              개발 모드: 실제 결제 없이 잠금이 해제됩니다.
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.cta, busy && styles.ctaDisabled]}
            onPress={handlePurchase}
            disabled={busy || loadingOffering}
          >
            {busy ? (
              <ActivityIndicator color={colors.backgroundBase} />
            ) : (
              <Text style={styles.ctaText}>잠금 해제</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.restore}
            onPress={handleRestore}
            disabled={busy}
            hitSlop={12}
          >
            <Text style={styles.restoreText}>이미 구입했어요 · 복원</Text>
          </Pressable>

          {status.kind === 'error' ? (
            <Text style={styles.errorText}>{status.message}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'space-between',
  },
  brand: {
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  brandText: {
    ...typography.headline,
    color: colors.textWarmGray,
    fontSize: 44,
    letterSpacing: 4,
  },
  tagline: {
    ...typography.body,
    color: colors.textWarmGray,
    opacity: 0.7,
    textAlign: 'center',
  },
  priceBlock: {
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.6,
    letterSpacing: 1,
  },
  priceValue: {
    ...typography.headline,
    color: colors.accentAmber,
    fontSize: 36,
  },
  devNote: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.4,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: colors.accentAmber,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    ...typography.body,
    color: colors.backgroundBase,
    letterSpacing: 1,
  },
  restore: {
    paddingVertical: 8,
  },
  restoreText: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.7,
  },
  errorText: {
    ...typography.caption,
    color: '#E8A37A',
    textAlign: 'center',
    marginTop: 4,
  },
});
