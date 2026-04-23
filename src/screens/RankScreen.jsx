import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { CheckCircle, Circle, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../tokens';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Btn from '../components/Btn';
import LucideIconByName from '../components/LucideIconByName';

const RANKS = [
  { id: 'iron',     name: 'Iron',     tier: 1, color: '#A0A0C0', desc: 'Beginning the climb.',          req: 'Complete 10 tasks', current: true },
  { id: 'bronze',   name: 'Bronze',   tier: 2, color: '#C0845A', desc: 'Building consistency.',         req: '7-day streak'       },
  { id: 'silver',   name: 'Silver',   tier: 3, color: '#C0C8DC', desc: 'Developing real habits.',       req: '30-day streak'      },
  { id: 'gold',     name: 'Gold',     tier: 4, color: '#F5C842', desc: 'Operating at high output.',     req: '100 tasks done'     },
  { id: 'obsidian', name: 'Obsidian', tier: 5, color: '#4F6EF7', desc: 'Elite — top performers only.', req: '365-day streak'     },
];

const BADGES = [
  { id: 'streak7',   label: '7-day streak',  icon: 'Zap',          color: T.teal, earned: false },
  { id: 'streak30',  label: '30-day streak',  icon: 'Zap',          color: T.teal, earned: false },
  { id: 'tasks100',  label: '100 tasks',      icon: 'CheckSquare',  color: T.blue, earned: false },
  { id: 'perfectwk', label: 'Perfect week',   icon: 'Calendar',     color: T.blue, earned: false },
  { id: 'goldrank',  label: 'Gold rank',      icon: 'Award',        color: T.gold, earned: false },
  { id: 'obsidian',  label: 'Obsidian rank',  icon: 'Star',         color: T.blue, earned: false },
  { id: 'streak100', label: '100-day streak', icon: 'Zap',          color: T.gold, earned: false },
  { id: 'tasks500',  label: '500 tasks',      icon: 'Layers',       color: T.gold, earned: false },
];

const MILESTONES = [
  ['7-day streak',   T.teal,    false],
  ['30-day streak',  T.teal,    false],
  ['100 tasks done', T.blue,    false],
  ['Perfect week',   T.blue,    false],
  ['Gold rank',      T.gold,    false],
  ['Obsidian rank',  T.blue,    false],
];

function RankUpOverlay({ visible, onClose }) {
  const insets = useSafeAreaInsets();
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

export default function RankScreen() {
  const [selected, setSelected] = useState('iron');
  const sel = RANKS.find(r => r.id === selected);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Rank</Text>
      <Text style={s.screenSub}>5 tiers · climb through consistency</Text>

      {/* Spotlight */}
      <View style={[s.spotlight, { borderColor: sel.color + '33', shadowColor: sel.current ? sel.color : undefined, shadowOpacity: sel.current ? 0.15 : 0, shadowRadius: 30 }]}>
        <View style={[s.spotGlow, { backgroundColor: sel.color + '22' }]} />
        <View style={[s.spotCircle, { borderColor: sel.color + '77', backgroundColor: sel.color + '16', shadowColor: sel.current ? sel.color : undefined, shadowOpacity: sel.current ? 0.3 : 0, shadowRadius: 20 }]}>
          <Text style={[s.spotLetter, { color: sel.color }]}>{sel.name[0]}</Text>
          {sel.current && (
            <View style={s.currentBadge}>
              <Check size={10} color={T.bg} />
            </View>
          )}
        </View>
        <Text style={[s.spotName, { color: sel.color }]}>{sel.name} Tier</Text>
        <Text style={s.spotTier}>Tier {sel.tier} of 5</Text>
        <Text style={s.spotDesc}>{sel.desc}</Text>
        {sel.current && <Badge color={sel.color} style={{ marginTop: 8 }}>Current rank</Badge>}
      </View>

      {/* Tier selector */}
      <View style={s.tierRow}>
        {RANKS.map(r => (
          <Pressable key={r.id} onPress={() => setSelected(r.id)}
            style={[s.tierBtn, { borderColor: selected === r.id ? r.color + '66' : 'rgba(255,255,255,0.05)', backgroundColor: selected === r.id ? r.color + '14' : T.s1 }]}>
            <View style={[s.tierCircle, { borderColor: r.color + (selected === r.id ? 'AA' : '44'), backgroundColor: r.color + '10' }]}>
              <Text style={[s.tierLetter, { color: r.color }]}>{r.name[0]}</Text>
            </View>
            <Text style={[s.tierName, { color: selected === r.id ? r.color : T.fg4 }]}>{r.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* Progress to next */}
      <View style={s.progressCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={s.cardLabel}>Progress to Bronze</Text>
          <Text style={[s.progressPct, { color: '#C0845A' }]}>0%</Text>
        </View>
        <ProgressBar value={0} color="#C0845A" height={8} />
        <Text style={[s.cardLabel, { marginTop: 8, color: T.fg3 }]}>Complete tasks daily to climb ranks</Text>
      </View>

      {/* Milestones */}
      <Text style={s.sectionLabel}>Milestones</Text>
      {MILESTONES.map(([label, color, earned]) => (
        <View key={label} style={[s.milestoneRow, { opacity: earned ? 1 : 0.4, borderColor: earned ? color + '22' : 'rgba(255,255,255,0.04)' }]}>
          {earned ? <CheckCircle size={15} color={color} /> : <Circle size={15} color={T.fg4} />}
          <Text style={[s.milestoneText, { color: earned ? T.fg1 : T.fg3 }]}>{label}</Text>
          {earned && <Badge color={color} style={{ marginLeft: 'auto' }}>Earned</Badge>}
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

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1, marginBottom: 4 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 20 },

  spotlight:  { backgroundColor: T.s1, borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  spotGlow:   { position: 'absolute', top: -30, width: 160, height: 80, borderRadius: 80 },
  spotCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
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

  progressCard: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(192,132,90,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardLabel:    { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2 },
  progressPct:  { fontFamily: 'Syne_800ExtraBold', fontSize: 14 },

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
  overlayCircle:  { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#A0A0C0', backgroundColor: '#A0A0C018', alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#A0A0C0', shadowOpacity: 0.35, shadowRadius: 30 },
  overlayLetter:  { fontFamily: 'Syne_800ExtraBold', fontSize: 44, color: '#A0A0C0' },
  overlayBadge:   { fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 1.5, color: '#A0A0C088', marginBottom: 6 },
  overlayTitle:   { fontFamily: 'Syne_800ExtraBold', fontSize: 40, color: '#A0A0C0', lineHeight: 44, marginBottom: 10 },
  overlayDesc:    { fontFamily: 'DMSans_400Regular', fontSize: 15, color: T.fg2, marginBottom: 8 },
  overlaySub:     { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg3, lineHeight: 20, textAlign: 'center' },
});
