import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { checkPremiumStatus, initPurchases, restorePurchases } from '../services/purchases';

const SECURE_KEY = 'ascend_premium_v1';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const [isPremium,       setIsPremium]       = useState(false);
  const [upgradeVisible,  setUpgradeVisible]  = useState(false);
  const [upgradeSource,   setUpgradeSource]   = useState('');
  const [isVerifying,     setIsVerifying]     = useState(true);

  // On mount: init RevenueCat then verify premium status from server.
  // SecureStore cache is used as the optimistic initial value.
  useEffect(() => {
    (async () => {
      // Load cached value instantly so UI doesn't flicker
      try {
        const cached = await SecureStore.getItemAsync(SECURE_KEY);
        if (cached === '1') setIsPremium(true);
      } catch {}

      // Then verify against RevenueCat (authoritative source)
      await initPurchases();
      try {
        const verified = await checkPremiumStatus();
        setIsPremium(verified);
        await SecureStore.setItemAsync(SECURE_KEY, verified ? '1' : '0');
      } catch {}

      setIsVerifying(false);
    })();
  }, []);

  const showUpgrade = useCallback((source = '') => {
    setUpgradeSource(source);
    setUpgradeVisible(true);
  }, []);

  const hideUpgrade = useCallback(() => setUpgradeVisible(false), []);

  // Called by UpgradeModal after a successful RevenueCat purchase
  const onPurchaseSuccess = useCallback(async () => {
    setIsPremium(true);
    try { await SecureStore.setItemAsync(SECURE_KEY, '1'); } catch {}
    setUpgradeVisible(false);
  }, []);

  // Restore purchases (required by App Store review guidelines)
  const restore = useCallback(async () => {
    const ok = await restorePurchases();
    if (ok) {
      setIsPremium(true);
      try { await SecureStore.setItemAsync(SECURE_KEY, '1'); } catch {}
    }
    return ok;
  }, []);

  // Re-verify on app foreground (catches subscription lapses / renewals)
  const revalidate = useCallback(async () => {
    try {
      const verified = await checkPremiumStatus();
      setIsPremium(verified);
      await SecureStore.setItemAsync(SECURE_KEY, verified ? '1' : '0');
    } catch {}
  }, []);

  const value = {
    isPremium,
    isVerifying,
    showUpgrade,
    hideUpgrade,
    upgradeVisible,
    upgradeSource,
    onPurchaseSuccess,
    restore,
    revalidate,
    // debugUnlock only available in dev builds — never ships to production
    ...(__DEV__ && {
      debugUnlock: async () => {
        setIsPremium(true);
        try { await SecureStore.setItemAsync(SECURE_KEY, '1'); } catch {}
      },
    }),
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  return useContext(PremiumContext);
}
