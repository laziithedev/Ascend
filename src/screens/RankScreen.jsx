import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { CheckCircle, Circle, Check, Lock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../tokens';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Btn from '../components/Btn';
import LucideIconByName from '../components/LucideIconByName';
import { usePremium } from '../context/PremiumContext';
import { computeRank, nextRank } from '../utils/rank';

const RANKS = [
  { id: 'iron',     name: 'Iron',     tier: 1, color: '#A0A0C0', desc: 'Beginning the climb.',           req: 'Complete 10 tasks',  premium: false, current: true },
  { id: 'bronze',   name: 'Bronze',   tier: 2, color: '#C0845A', desc: 'Building consistency.',          req: '7-day streak',        premium: false },
  { id: 'silver',   name: 'Silver',   tier: 3, color: '#C0C8DC', desc: 'Developing real habits.',        req: '30-day streak',       premium: false },
  { id: 'gold',     name: 'Gold',     tier: 4, color: '#F5C842', desc: 'Operating at high output.',      req: '100 tasks done',      premium: true  },
  { id: 'platinum', name: 'Platinum', tier: 5, color: '#A0C8F0', desc: 'Relentless execution.',          req: '200-day streak',      premium: true  },
  { id: 'diamond',  name: 'Diamond',  tier: 6, color: '#B088F8', desc: 'Elite — top performers only.',  req: '365-day streak',      premium: true  },
];

const BADGES = [
  { id: 'streak7',   label: '7-day streak',   icon: 'Zap',         color: T.teal, earned: false },
  { id: 'streak30',  label: '30-day streak',   icon: 'Zap',         color: T.teal, earned: false },
  { id: 'tasks100',  label: '100 tasks',       icon: 'CheckSquare', color: T.blue, earned: false },
  { id: 'perfectwk', label: 'Perfect week',    icon: 'Calendar',    color: T.blue, earned: false },
  { id: 'goldrank',  label: 'Gold rank',       icon: 'Award',       color: T.gold, earned: false },
  { id: 'platinum',  label: 'Platinum rank',   icon: 'Star',        color: '#A0C8F0', earned: false },
  { id: 'streak100', label: '100-day streak',  icon: 'Zap',         color: T.gold, earned: false },
  { id: 'diamond',   label: 'Diamond rank',    icon: 'Layers',      color: '#B088F8', earned: false },
];

function getMilestones(streak, totalCompleted, isPremium) {
  return [
    ['7-day streak',   T.teal,    streak >= 7],
    ['30-day streak',  T.teal,    streak >= 30],
    ['100 tasks done', T.blue,    totalCompleted >= 100],
    ['Perfect week',   T.blue,    streak >= 7],
    ['Gold rank',      T.gold,    isPremium && totalCompleted >= 100],
    ['Diamond rank',   '#B088F8', isPremium && streak >= 365],
  ];
}

function RankUpOverlay({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <View style={s.overlayGlow} />
        <View style={s.overlayContent}>
          <View style={s.overlayCircle}>
            <Text style={s.overlayLetter}>I</Text>
          </View>
          <Text style={s.overlayBadge}>RANK ACHIEVED</Text>
          <Text style={s.overlayTitle}>Iron Tier</Text>
          <Text style={s.overlayDesc}>Beginning the climb.</Text>
          <Text style={s.overlaySub}>Complete tasks daily to rank up to Bronze.</Text>
          <Btn variant="ghost" size="lg" onPress={onClose} style={{ minWidth: 180, marginTop: 24 }}>Continue</Btn>
        </View>
      </Pressable>
    </Modal>
  );
}

function LockedRankCard({ rank, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.lockedCard, { borderColor: rank.color + '33' }]}>
      <View style={[s.lockedCircle, { borderColor: rank.color + '44', backgroundColor: rank.color + '0E' }]}>
        <Lock size={18} color={rank.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[s.lockedName, { color: rank.color }]}>{rank.name}</Text>
          <View style={s.premiumPill}>
            <Text style={s.premiumPillText}>PREMIUM</Text>
          </View>
        </View>
        <Text style={s.lockedDesc}>{rank.desc}</Text>
      </View>
    </Pressable>
  );
}

export default function RankScreen({ streak = 0, totalCompleted = 0 }) {
  const { isPremium, showUpgrade } = usePremium();
  const earned      = computeRank(streak, totalCompleted, isPremium);
  const [selected, setSelected] = useState(earned.id);

  const visibleRanks = isPremium ? RANKS : RANKS.filter(r => !r.premium);
  const lockedRanks  = isPremium ? [] : RANKS.filter(r => r.premium);
  const sel          = RANKS.find(r => r.id === selected) || RANKS[0];
  const totalTiers   = isPremium ? 6 : 3;
  const upcoming     = nextRank(earned.id, isPremium);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Rank</Text>
      <Text style={s.screenSub}>{isPremium ? '6 tiers · climb through consistency' : '3 free tiers · upgrade for Gold, Platinum & Diamond'}</Text>

      {/* Spotlight */}
      <View style={[s.spotlight, { borderColor: sel.color + '33' }]}>
        <View style={[s.spotGlow, { backgroundColor: sel.color + '22' }]} />
        <View style={[s.spotCircle, { borderColor: sel.color + '77', backgroundColor: sel.color + '16' }]}>
          <Text style={[s.spotLetter, { color: sel.color }]}>{sel.name[0]}</Text>
          {sel.current && (
            <View style={s.currentBadge}>
              <Check size={10} color={T.bg} />
            </View>
          )}
        </View>
        <Text style={[s.spotName, { color: sel.color }]}>{sel.name} Tier</Text>
        <Text style={s.spotTier}>Tier {sel.tier} of {totalTiers}</Text>
        <Text style={s.spotDesc}>{sel.desc}</Text>
        {sel.id === earned.id && <Badge color={sel.color} style={{ marginTop: 8 }}>Current rank</Badge>}
      </View>

      {/* Free tier selector */}
      <View style={s.tierRow}>
        {visibleRanks.map(r => {
          const isEarned = RANKS.findIndex(x => x.id === r.id) <= RANKS.findIndex(x => x.id === earned.id);
          return (
            <Pressable key={r.id} onPress={() => setSelected(r.id)}
              style={[s.tierBtn, { borderColor: selected === r.id ? r.color + '66' : 'rgba(255,255,255,0.05)', backgroundColor: selected === r.id ? r.color + '14' : T.s1, opacity: isEarned ? 1 : 0.5 }]}>
              <View style={[s.tierCircle, { borderColor: r.color + (selected === r.id ? 'AA' : '44'), backgroundColor: r.color + '10' }]}>
                <Text style={[s.tierLetter, { color: r.color }]}>{r.name[0]}</Text>
              </View>
              <Text style={[s.tierName, { color: selected === r.id ? r.color : T.fg4 }]}>{r.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Progress card — server-verified */}
      {upcoming ? (() => {
        // Streak-based progress toward next rank
        const streakNeeded = upcoming.minStreak > 0 ? upcoming.minStreak : 0;
        const taskNeeded   = upcoming.minTasks  > 0 ? upcoming.minTasks  : 0;
        const pct = streakNeeded > 0
          ? Math.min(Math.round((streak / streakNeeded) * 100), 100)
          : taskNeeded > 0
          ? Math.min(Math.round((totalCompleted / taskNeeded) * 100), 100)
          : 0;
        const label = streakNeeded > 0
          ? `${streak} / ${streakNeeded} day streak`
          : `${totalCompleted} / ${taskNeeded} tasks`;
        return (
          <View style={[s.progressCard, { borderColor: upcoming.color + '33' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={s.cardLabel}>Progress to {upcoming.name}</Text>
              <Text style={[s.progressPct, { color: upcoming.color }]}>{pct}%</Text>
            </View>
            <ProgressBar value={pct} color={upcoming.color} height={8} />
            <Text style={[s.cardLabel, { marginTop: 8, color: T.fg3 }]}>{label}</Text>
          </View>
        );
      })() : (
        <View style={s.progressCard}>
          <Text style={[s.cardLabel, { color: T.teal }]}>You've reached the top rank. Elite.</Text>
        </View>
      )}

      {/* Locked premium tiers */}
      {lockedRanks.length > 0 && (
        <>
          <View style={s.lockedSection}>
            <Lock size={12} color={T.gold} />
            <Text style={s.lockedSectionTitle}>Premium Ranks</Text>
          </View>
          {lockedRanks.map(r => (
            <LockedRankCard key={r.id} rank={r} onPress={() => showUpgrade('rank')} />
          ))}

          {/* Upsell */}
          <Pressable onPress={() => showUpgrade('rank')} style={s.upsellCard}>
            <View style={s.upsellIcon}>
              <LucideIconByName name="Award" size={18} color={T.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.upsellTitle}>Unlock Gold, Platinum & Diamond</Text>
              <Text style={s.upsellBody}>Push beyond Silver. The top 3 tiers are for elite performers. <Text style={{ color: T.gold }}>Upgrade →</Text></Text>
            </View>
          </Pressable>
        </>
      )}

      {/* Milestones — driven by server data */}
      <Text style={[s.sectionLabel, { marginTop: 8 }]}>Milestones</Text>
      {getMilestones(streak, totalCompleted, isPremium).map(([label, color, isEarned]) => (
        <View key={label} style={[s.milestoneRow, { opacity: isEarned ? 1 : 0.4, borderColor: isEarned ? color + '22' : 'rgba(255,255,255,0.04)' }]}>
          {isEarned ? <CheckCircle size={15} color={color} /> : <Circle size={15} color={T.fg4} />}
          <Text style={[s.milestoneText, { color: isEarned ? T.fg1 : T.fg3 }]}>{label}</Text>
          {isEarned && <Badge color={color} style={{ marginLeft: 'auto' }}>Earned</Badge>}
        </View>
      ))}

      {/* Badges */}
      <Text style={[s.sectionLabel, { marginTop: 20 }]}>Badges</Text>
      <View style={s.badgeGrid}>
        {BADGES.map(b => (
          <View key={b.id} style={[s.badgeCard, { opacity: b.earned ? 1 : 0.35, borderColor: b.earned ? b.color + '22' : 'rgba(255,255,255,0.04)' }]}>
            <View style={[s.badgeIcon, { backgroundColor: b.earned ? b.color + '18' : T.s2, borderColor: b.earned ? b.color + '44' : 'rgba(255,255,255,0.06)' }]}>
              <LucideIconByName name={b.icon} size={16} color={b.earned ? b.color : T.fg4} />
            </View>
            <Text style={[s.badgeLabel, { color: b.earned ? T.fg2 : T.fg4 }]}>{b.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export { RankUpOverlay };

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1, marginBottom: 4 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 20 },

  spotlight:  { backgroundColor: T.s1, borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  spotGlow:   { position: 'absolute', top: -30, width: 160, height: 80, borderRadius: 80 },
  spotCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  spotLetter: { fontFamily: 'Syne_800ExtraBold', fontSize: 30 },
  currentBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: T.teal, borderWidth: 2, borderColor: T.bg, alignItems: 'center', justifyContent: 'center' },
  spotName:   { fontFamily: 'Syne_800ExtraBold', fontSize: 26, marginBottom: 4 },
  spotTier:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 6 },
  spotDesc:   { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg2, lineHeight: 20 },

  tierRow:    { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tierBtn:    { flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', gap: 5 },
  tierCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tierLetter: { fontFamily: 'Syne_800ExtraBold', fontSize: 13 },
  tierName:   { fontFamily: 'DMSans_600SemiBold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.6 },

  progressCard: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(192,132,90,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 },
  cardLabel:    { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2 },
  progressPct:  { fontFamily: 'Syne_800ExtraBold', fontSize: 14 },

  lockedSection:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  lockedSectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  lockedCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.s1, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8, opacity: 0.7 },
  lockedCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  lockedName:   { fontFamily: 'DMSans_600SemiBold', fontSize: 14 },
  lockedDesc:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg4, marginTop: 2 },
  premiumPill:  { backgroundColor: T.gold + '22', borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 },
  premiumPillText: { fontFamily: 'DMSans_700Bold', fontSize: 8, color: T.gold, letterSpacing: 0.6 },

  upsellCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.s2, borderWidth: 1, borderColor: T.gold + '33', borderRadius: 14, padding: 16, marginBottom: 20 },
  upsellIcon:  { width: 40, height: 40, borderRadius: 11, backgroundColor: T.gold + '1A', alignItems: 'center', justifyContent: 'center' },
  upsellTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1, marginBottom: 3 },
  upsellBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, lineHeight: 18 },

  sectionLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2, marginBottom: 12 },
  milestoneRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, backgroundColor: T.s1, borderWidth: 1, borderRadius: 9, marginBottom: 6 },
  milestoneText: { fontFamily: 'DMSans_400Regular', fontSize: 13, flex: 1 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '22%', alignItems: 'center', gap: 6, padding: 10, backgroundColor: T.s1, borderWidth: 1, borderRadius: 10 },
  badgeIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', lineHeight: 12 },

  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  overlayGlow:    { position: 'absolute', top: '25%', width: 240, height: 180, borderRadius: 120, backgroundColor: 'rgba(160,160,192,0.12)' },
  overlayContent: { alignItems: 'center' },
  overlayCircle:  { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#A0A0C0', backgroundColor: '#A0A0C018', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  overlayLetter:  { fontFamily: 'Syne_800ExtraBold', fontSize: 44, color: '#A0A0C0' },
  overlayBadge:   { fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 1.5, color: '#A0A0C088', marginBottom: 6 },
  overlayTitle:   { fontFamily: 'Syne_800ExtraBold', fontSize: 40, color: '#A0A0C0', lineHeight: 44, marginBottom: 10 },
  overlayDesc:    { fontFamily: 'DMSans_400Regular', fontSize: 15, color: T.fg2, marginBottom: 8 },
  overlaySub:     { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg3, lineHeight: 20, textAlign: 'center' },
});
