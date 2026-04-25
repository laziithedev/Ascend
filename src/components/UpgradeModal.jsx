import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { X, Zap, BarChart2, Award, Target, Bell, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../tokens';
import Btn from './Btn';
import { getOfferings, purchasePackage } from '../services/purchases';
import { usePremium } from '../context/PremiumContext';

const PERKS = [
  { Icon: BarChart2,  text: 'Full analytics — graphs, trends & breakdowns' },
  { Icon: Award,      text: 'All ranks: Gold, Platinum & Diamond tiers'    },
  { Icon: Zap,        text: 'Full streak history (beyond 7 days)'          },
  { Icon: Target,     text: 'Unlimited goals + goal templates'             },
  { Icon: TrendingUp, text: 'Trend predictions ("Gold in ~11 days")'       },
  { Icon: Bell,       text: 'Smart reminders — AI-suggested timing'        },
];

export default function UpgradeModal({ visible, onClose, source = '' }) {
  const insets = useSafeAreaInsets();
  const { onPurchaseSuccess, restore } = usePremium();
  const [billing,    setBilling]    = useState('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring,  setRestoring]  = useState(false);

  const ctaLabel = billing === 'annual'
    ? 'Start free trial — $34.99/yr'
    : 'Start free trial — $4.99/mo';

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const offerings = await getOfferings();
      if (offerings) {
        const pkg = billing === 'annual' ? offerings.annual : offerings.monthly;
        if (pkg) {
          const success = await purchasePackage(pkg);
          if (success) { await onPurchaseSuccess(); return; }
        }
      }
      // RevenueCat not configured — close gracefully (dev/staging)
      onClose();
    } catch (e) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restore();
      if (!ok) Alert.alert('Nothing to restore', 'No previous purchase found for this account.');
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={s.handle} />

          <Pressable style={s.closeBtn} onPress={onClose} hitSlop={12}>
            <X size={18} color={T.fg3} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={s.header}>
              <View style={s.glowBlue} />
              <View style={s.iconWrap}>
                <Zap size={28} color={T.gold} />
              </View>
              <Text style={s.title}>Ascend Premium</Text>
              <Text style={s.subtitle}>
                {source === 'rank'
                  ? "You've hit the rank ceiling. Unlock Gold, Platinum & Diamond."
                  : source === 'goals'
                  ? "You've reached your 3-goal limit. Unlock unlimited goals."
                  : source === 'stats'
                  ? "You see the number. Premium shows you why — and what to do."
                  : 'Unlock everything. No limits on your discipline.'}
              </Text>
            </View>

            <View style={s.perks}>
              {PERKS.map(({ Icon, text }) => (
                <View key={text} style={s.perk}>
                  <View style={s.perkIcon}><Icon size={15} color={T.gold} /></View>
                  <Text style={s.perkText}>{text}</Text>
                </View>
              ))}
            </View>

            <View style={s.billingRow}>
              <Pressable onPress={() => setBilling('monthly')}
                style={[s.billingBtn, billing === 'monthly' && s.billingActive]}>
                <Text style={[s.billingLabel, billing === 'monthly' && { color: T.fg1 }]}>Monthly</Text>
                <Text style={[s.billingPrice, billing === 'monthly' && { color: T.blue }]}>$4.99</Text>
              </Pressable>

              <Pressable onPress={() => setBilling('annual')}
                style={[s.billingBtn, billing === 'annual' && s.billingActive]}>
                <View style={s.saveBadge}><Text style={s.saveText}>SAVE 42%</Text></View>
                <Text style={[s.billingLabel, billing === 'annual' && { color: T.fg1 }]}>Annual</Text>
                <Text style={[s.billingPrice, billing === 'annual' && { color: T.blue }]}>$34.99</Text>
                <Text style={[s.billingPer, billing === 'annual' && { color: T.fg3 }]}>≈ $2.92/mo</Text>
              </Pressable>
            </View>

            <Btn variant="gold" size="lg" full onPress={handlePurchase}
              style={{ marginTop: 4 }} disabled={purchasing || restoring}>
              {purchasing
                ? <ActivityIndicator size="small" color={T.bg} />
                : ctaLabel}
            </Btn>

            <Text style={s.fine}>7-day free trial · cancel anytime · no hidden fees</Text>

            {/* Required by App Store review guidelines */}
            <Pressable onPress={handleRestore} disabled={restoring || purchasing} style={s.restoreBtn}>
              {restoring
                ? <ActivityIndicator size="small" color={T.fg3} />
                : <Text style={s.restoreText}>Restore purchases</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: T.s2, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 0 },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: T.s4, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  closeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10 },

  header:   { alignItems: 'center', paddingTop: 20, paddingBottom: 24, overflow: 'hidden' },
  glowBlue: { position: 'absolute', top: -20, width: 220, height: 120, borderRadius: 110, backgroundColor: 'rgba(245,200,66,0.1)' },
  iconWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: T.gold + '1A', borderWidth: 1, borderColor: T.gold + '44', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:    { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1, marginBottom: 8 },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: T.fg2, textAlign: 'center', lineHeight: 22, maxWidth: 280 },

  perks:    { backgroundColor: T.s1, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  perk:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  perkIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: T.gold + '18', alignItems: 'center', justifyContent: 'center' },
  perkText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg1, flex: 1 },

  billingRow:    { flexDirection: 'row', gap: 10, marginBottom: 16 },
  billingBtn:    { flex: 1, backgroundColor: T.s1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14, alignItems: 'center', gap: 3 },
  billingActive: { borderColor: T.blue, backgroundColor: T.blue + '10' },
  billingLabel:  { fontFamily: 'DMSans_500Medium', fontSize: 12, color: T.fg3 },
  billingPrice:  { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: T.fg3 },
  billingPer:    { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg4 },
  saveBadge:     { backgroundColor: T.teal + '22', borderRadius: 100, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 2 },
  saveText:      { fontFamily: 'DMSans_700Bold', fontSize: 8, color: T.teal, letterSpacing: 0.8 },

  fine:        { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg4, textAlign: 'center', marginTop: 12 },
  restoreBtn:  { alignItems: 'center', paddingVertical: 14 },
  restoreText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3 },
});
