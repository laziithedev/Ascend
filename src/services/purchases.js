/**
 * RevenueCat in-app purchase service.
 *
 * SETUP (one-time):
 *  1. Create a free account at app.revenuecat.com
 *  2. New Project → add iOS app + Android app
 *  3. Connect your App Store Connect / Google Play accounts
 *  4. Create products in App Store Connect / Google Play Console:
 *       - Monthly:  com.ascend.app.premium.monthly   ($4.99/mo)
 *       - Annual:   com.ascend.app.premium.annual    ($34.99/yr)
 *  5. In RevenueCat: Entitlements → "premium" → attach both products
 *  6. Project Settings → API keys → copy Public SDK keys below
 *  7. Replace REPLACE_WITH_* values below
 *
 * NOTE: react-native-purchases requires a native build.
 *       It does NOT work in Expo Go — use `eas build --profile preview`
 *       to get a testable APK/IPA.
 */

import { Platform } from 'react-native';

const RC_KEYS = {
  ios:     'REPLACE_WITH_IOS_REVENUECAT_API_KEY',     // appl_...
  android: 'REPLACE_WITH_ANDROID_REVENUECAT_API_KEY', // goog_...
};

const ENTITLEMENT_ID = 'premium';

const isConfigured = !RC_KEYS.ios.startsWith('REPLACE_');

let Purchases = null;

async function getPurchases() {
  if (Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default;
    return Purchases;
  } catch {
    return null;
  }
}

export async function initPurchases() {
  if (!isConfigured) return;
  const RC = await getPurchases();
  if (!RC) return;
  try {
    if (__DEV__) {
      const { LOG_LEVEL } = await import('react-native-purchases');
      RC.setLogLevel(LOG_LEVEL.DEBUG);
    }
    RC.configure({ apiKey: Platform.OS === 'ios' ? RC_KEYS.ios : RC_KEYS.android });
  } catch (e) {
    if (__DEV__) console.warn('[Purchases] init failed:', e.message);
  }
}

/**
 * Returns true if the user has an active premium entitlement.
 * Always returns false if RevenueCat isn't configured.
 */
export async function checkPremiumStatus() {
  if (!isConfigured) return false;
  const RC = await getPurchases();
  if (!RC) return false;
  try {
    const info = await RC.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch (e) {
    if (__DEV__) console.warn('[Purchases] checkPremiumStatus failed:', e.message);
    return false;
  }
}

/**
 * Returns available offerings from RevenueCat.
 * Shape: { monthly: Package, annual: Package } or null.
 */
export async function getOfferings() {
  if (!isConfigured) return null;
  const RC = await getPurchases();
  if (!RC) return null;
  try {
    const offerings = await RC.getOfferings();
    const current   = offerings.current;
    if (!current) return null;
    return {
      monthly: current.monthly,
      annual:  current.annual,
    };
  } catch {
    return null;
  }
}

/**
 * Purchase a package. Returns true if the user is now premium.
 */
export async function purchasePackage(pkg) {
  const RC = await getPurchases();
  if (!RC) throw new Error('RevenueCat not available');
  const { customerInfo } = await RC.purchasePackage(pkg);
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}

/**
 * Restore purchases (required by App Store guidelines).
 * Returns true if a premium entitlement was found.
 */
export async function restorePurchases() {
  if (!isConfigured) return false;
  const RC = await getPurchases();
  if (!RC) return false;
  try {
    const info = await RC.restorePurchases();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch (e) {
    if (__DEV__) console.warn('[Purchases] restore failed:', e.message);
    return false;
  }
}
