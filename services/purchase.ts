import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';

import { loadSettings, updateSettings } from './settings';

export const ENTITLEMENT_ID = 'unlock';

export type OfferingInfo = {
  productId: string;
  priceString: string;
  title: string;
  stub: boolean;
};

const STUB_OFFERING: OfferingInfo = {
  productId: 'dim_unlock_stub',
  priceString: '₩4,400',
  title: 'Dim 잠금 해제',
  stub: true,
};

function getApiKey(): string | null {
  const extra = Constants.expoConfig?.extra as
    | { revenueCat?: { iosApiKey?: string; androidApiKey?: string } }
    | undefined;
  const keys = extra?.revenueCat;
  if (!keys) return null;
  const key = Platform.OS === 'ios' ? keys.iosApiKey : keys.androidApiKey;
  return key && key !== 'REPLACE_ME' ? key : null;
}

function isNativeAvailable(): boolean {
  const native = (NativeModules as Record<string, unknown> | undefined)
    ?.RNPurchases;
  return native != null;
}

export function isLiveMode(): boolean {
  return getApiKey() != null && isNativeAvailable();
}

let initialized = false;

export async function initPurchases(): Promise<void> {
  if (initialized) return;
  initialized = true;
  if (!isLiveMode()) return;
  try {
    Purchases.configure({ apiKey: getApiKey()! });
  } catch (err) {
    console.warn('[purchase] configure failed', err);
  }
}

async function fetchOfferingPackage() {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages?.[0];
  if (!pkg) throw new Error('NO_OFFERING');
  return pkg;
}

export async function getOffering(): Promise<OfferingInfo | null> {
  if (!isLiveMode()) return STUB_OFFERING;
  try {
    const pkg = await fetchOfferingPackage();
    return {
      productId: pkg.product.identifier,
      priceString: pkg.product.priceString,
      title: pkg.product.title || 'Dim 잠금 해제',
      stub: false,
    };
  } catch (err) {
    console.warn('[purchase] getOfferings failed', err);
    return null;
  }
}

export type PurchaseResult =
  | { ok: true }
  | { ok: false; cancelled: boolean; message?: string };

export async function purchaseUnlock(): Promise<PurchaseResult> {
  if (!isLiveMode()) {
    await updateSettings({ isPurchased: true });
    return { ok: true };
  }
  try {
    const pkg = await fetchOfferingPackage();
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const granted =
      customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    if (granted) await updateSettings({ isPurchased: true });
    return granted
      ? { ok: true }
      : { ok: false, cancelled: false, message: '구매가 완료되지 않았습니다.' };
  } catch (err) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return {
      ok: false,
      cancelled: false,
      message: e?.message ?? '알 수 없는 오류',
    };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isLiveMode()) {
    const settings = await loadSettings();
    return settings.isPurchased
      ? { ok: true }
      : { ok: false, cancelled: false, message: '복원할 구매 내역이 없습니다.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    const granted =
      customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    await updateSettings({ isPurchased: granted });
    return granted
      ? { ok: true }
      : { ok: false, cancelled: false, message: '복원할 구매 내역이 없습니다.' };
  } catch (err) {
    const e = err as { message?: string };
    return {
      ok: false,
      cancelled: false,
      message: e?.message ?? '복원에 실패했습니다.',
    };
  }
}

export async function checkEntitlement(): Promise<boolean> {
  const settings = await loadSettings();
  if (settings.isPurchased) return true;
  if (!isLiveMode()) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const granted =
      customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    if (granted) await updateSettings({ isPurchased: true });
    return granted;
  } catch {
    return false;
  }
}
