import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { T } from '../tokens';
import { usePremium } from '../context/PremiumContext';

/**
 * Wraps any content. If user is not premium, renders a lock overlay instead.
 * source: string passed to UpgradeModal to personalise the pitch.
 */
export default function PremiumGate({ children, source = '', label = 'Premium feature' }) {
  const { isPremium, showUpgrade } = usePremium();
  if (isPremium) return children;

  return (
    <Pressable onPress={() => showUpgrade(source)} style={s.wrap}>
      <View style={s.locked}>
        <View style={s.lockIcon}>
          <Lock size={18} color={T.gold} />
        </View>
        <Text style={s.label}>{label}</Text>
        <Text style={s.cta}>Upgrade to Premium</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap:     { flex: 1 },
  locked:   { flex: 1, backgroundColor: T.s1, borderRadius: 14, borderWidth: 1, borderColor: T.gold + '33', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, minHeight: 140 },
  lockIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: T.gold + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  label:    { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1 },
  cta:      { fontFamily: 'DMSans_500Medium', fontSize: 12, color: T.gold },
});
