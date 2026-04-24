import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  // In production this would verify a receipt / subscription status.
  // For now: read from AsyncStorage so testers can unlock via a debug flag.
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState('');

  const showUpgrade = useCallback((source = '') => {
    setUpgradeSource(source);
    setUpgradeVisible(true);
  }, []);

  const hideUpgrade = useCallback(() => setUpgradeVisible(false), []);

  // Debug unlock — remove before shipping to store
  const debugUnlock = useCallback(async () => {
    setIsPremium(true);
    await AsyncStorage.setItem('ascend-premium', '1');
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, showUpgrade, hideUpgrade, upgradeVisible, upgradeSource, debugUnlock }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
