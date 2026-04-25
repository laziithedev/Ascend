import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Zap, Lock, BarChart2 } from 'lucide-react-native';
import { T } from '../tokens';
import { usePremium } from '../context/PremiumContext';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';

// ── Free tier: curiosity-gap teaser ──────────────────────────
function StatTeaser({ completionPct }) {
  const { showUpgrade } = usePremium();
  return (
    <View style={s.teaserCard}>
      <View style={s.teaserTop}>
        <View>
          <Text style={s.teaserPct}>{completionPct}%</Text>
          <Text style={s.teaserLabel}>tasks completed today</Text>
        </View>
        <Badge color={completionPct >= 70 ? T.teal : T.blue}>
          {completionPct >= 70 ? 'On track' : 'Keep going'}
        </Badge>
      </View>

      <Pressable onPress={() => showUpgrade('stats')} style={s.blurOverlay}>
        {/* Ghost chart bars — visible but unreadable, creates curiosity */}
        <View style={s.ghostChart}>
          {[40, 70, 55, 90, 30, 75, completionPct].map((h, i) => (
            <View key={i} style={[s.ghostBar, { height: (h / 100) * 56 }]} />
          ))}
        </View>
        <View style={s.blurLock}>
          <View style={s.lockPill}>
            <Lock size={13} color={T.gold} />
            <Text style={s.lockText}>See full breakdown</Text>
          </View>
          <Text style={s.lockSub}>Patterns, trends & what to improve — Premium</Text>
        </View>
      </Pressable>
    </View>
  );
}

// ── Free tier: simple stat cards ─────────────────────────────
function FreeStats({ tasks, streak, totalCompleted }) {
  const done          = tasks.filter(t => t.done).length;
  const completionPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const { showUpgrade } = usePremium();

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Stats</Text>
      <Text style={s.screenSub}>Your progress at a glance</Text>

      {/* The hook: show the number, gate the insight */}
      <StatTeaser completionPct={completionPct} />

      {/* Basic numbers — free */}
      <View style={s.freeGrid}>
        <View style={s.freeCard}>
          <Text style={s.freeNum}>{completionPct}%</Text>
          <Text style={s.freeCardLabel}>Today</Text>
        </View>
        <View style={s.freeCard}>
          <Text style={[s.freeNum, { color: T.teal }]}>{streak}</Text>
          <Text style={s.freeCardLabel}>Day streak</Text>
        </View>
        <View style={s.freeCard}>
          <Text style={[s.freeNum, { color: T.blue }]}>{tasks.length}</Text>
          <Text style={s.freeCardLabel}>Total tasks</Text>
        </View>
        <View style={s.freeCard}>
          <Text style={[s.freeNum, { color: T.gold }]}>{totalCompleted}</Text>
          <Text style={s.freeCardLabel}>All-time done</Text>
        </View>
      </View>

      {/* 7-day streak tracker — free */}
      <View style={s.sectionCard}>
        <Text style={s.sectionTitle}>Last 7 days</Text>
        <View style={s.weekDots}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <View key={i} style={s.dayCol}>
              <View style={[s.dayDot, i === 6 && completionPct > 0 && { backgroundColor: T.teal }]} />
              <Text style={s.dayLetter}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upsell card */}
      <Pressable onPress={() => showUpgrade('stats')} style={s.upsellCard}>
        <View style={s.upsellIcon}>
          <BarChart2 size={18} color={T.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.upsellTitle}>Unlock full analytics</Text>
          <Text style={s.upsellBody}>See trends, habit breakdowns & predictions. <Text style={{ color: T.gold }}>Upgrade →</Text></Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

// ── Premium tier: full dashboard ─────────────────────────────
function PremiumStats({ tasks, streak, totalCompleted }) {
  const done          = tasks.filter(t => t.done).length;
  const completionPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const weekDays      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekBars      = [0, 0, 0, 0, 0, 0, completionPct];
  const peakDay       = weekBars.indexOf(Math.max(...weekBars));
  const [activeBar, setActiveBar] = React.useState(null);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Analytics</Text>
      <Text style={s.screenSub}>Your progress over time</Text>

      <View style={s.premiumGrid}>
        {[
          { v: `${completionPct}%`,    l: 'Today',      c: completionPct >= 70 ? T.teal : T.blue },
          { v: `${streak}`,           l: 'Day streak',  c: T.teal  },
          { v: '0%',                  l: 'This week',   c: T.blue  },
          { v: `${totalCompleted}`,   l: 'All time',    c: T.fg2   },
        ].map(({ v, l, c }) => (
          <View key={l} style={s.premiumCard}>
            <Text style={[s.premiumNum, { color: c }]}>{v}</Text>
            <Text style={s.premiumCardLabel}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={s.sectionCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={s.sectionTitle}>Completion this week</Text>
          <Badge color={T.teal}>{completionPct}% today</Badge>
        </View>
        <View style={s.bars}>
          {weekBars.map((h, i) => {
            const isPeak  = i === peakDay && h > 0;
            const color   = isPeak ? T.teal : T.blue;
            const opacity = activeBar !== null && activeBar !== i ? 0.3 : 1;
            return (
              <Pressable key={i} onPress={() => setActiveBar(activeBar === i ? null : i)} style={s.barCol}>
                {activeBar === i && <Text style={[s.barPct, { color }]}>{h}%</Text>}
                <View style={[s.bar, { height: Math.max((h / 100) * 64, 4), backgroundColor: color, opacity }]} />
              </Pressable>
            );
          })}
        </View>
        <View style={s.dayRow}>
          {weekDays.map((d, i) => (
            <Text key={d} style={[s.dayLabel, i === peakDay && weekBars[i] > 0 && { color: T.teal }]}>{d}</Text>
          ))}
        </View>
      </View>

      <View style={s.sectionCard}>
        <Text style={[s.sectionTitle, { marginBottom: 14 }]}>By category</Text>
        {['Fitness','Learning','Mindset','Work','Health'].map((cat, i) => {
          const colors = [T.teal, T.blue, '#A87EF7', T.blue, T.teal];
          return (
            <View key={cat} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={s.catName}>{cat}</Text>
                <Text style={s.catPct}>0%</Text>
              </View>
              <ProgressBar value={0} color={colors[i]} height={5} />
            </View>
          );
        })}
      </View>

      <View style={s.insightCard}>
        <View style={s.insightIcon}><Zap size={16} color={T.blue} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.insightTitle}>Start building your streak</Text>
          <Text style={s.insightBody}>Complete tasks daily to unlock trend predictions and insights.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Export: auto-switch on premium status ────────────────────
export default function StatsScreen({ tasks, streak = 0, totalCompleted = 0 }) {
  const { isPremium } = usePremium();
  return isPremium
    ? <PremiumStats tasks={tasks} streak={streak} totalCompleted={totalCompleted} />
    : <FreeStats    tasks={tasks} streak={streak} totalCompleted={totalCompleted} />;
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1, marginBottom: 4 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 20 },

  // Teaser
  teaserCard: { backgroundColor: T.s1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18, marginBottom: 16, overflow: 'hidden' },
  teaserTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  teaserPct:  { fontFamily: 'Syne_800ExtraBold', fontSize: 40, color: T.fg1, lineHeight: 44 },
  teaserLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginTop: 2 },
  blurOverlay: { position: 'relative', borderRadius: 10, overflow: 'hidden', backgroundColor: T.s2, padding: 12 },
  ghostChart:  { flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 60, marginBottom: 10, opacity: 0.18 },
  ghostBar:    { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: T.blue },
  blurLock:    { alignItems: 'center', gap: 4 },
  lockPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.gold + '22', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  lockText:    { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.gold },
  lockSub:     { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg3, textAlign: 'center' },

  // Free grid
  freeGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  freeCard:      { width: '47%', backgroundColor: T.s1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14 },
  freeNum:       { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: T.blue, lineHeight: 32, marginBottom: 4 },
  freeCardLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: T.fg3 },

  // 7-day dots
  sectionCard:  { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 16 },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2 },
  weekDots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol:   { alignItems: 'center', gap: 6 },
  dayDot:   { width: 28, height: 28, borderRadius: 14, backgroundColor: T.s3 },
  dayLetter: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg4 },

  // Upsell
  upsellCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.s2, borderWidth: 1, borderColor: T.gold + '33', borderRadius: 14, padding: 16 },
  upsellIcon:  { width: 40, height: 40, borderRadius: 11, backgroundColor: T.gold + '1A', alignItems: 'center', justifyContent: 'center' },
  upsellTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1, marginBottom: 3 },
  upsellBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, lineHeight: 18 },

  // Premium grid
  premiumGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  premiumCard:     { width: '47%', backgroundColor: T.s1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14 },
  premiumNum:      { fontFamily: 'Syne_800ExtraBold', fontSize: 28, lineHeight: 32, marginBottom: 4 },
  premiumCardLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: T.fg3 },

  bars:    { flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 80, marginBottom: 8 },
  barCol:  { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar:     { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barPct:  { fontFamily: 'DMSans_700Bold', fontSize: 9 },
  dayRow:  { flexDirection: 'row' },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 9, color: T.fg4, fontFamily: 'DMSans_400Regular' },

  catName: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg2 },
  catPct:  { fontFamily: 'DMSans_700Bold', fontSize: 13, color: T.fg1 },

  insightCard:  { backgroundColor: T.s2, borderWidth: 1, borderColor: T.blue + '22', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 12 },
  insightIcon:  { backgroundColor: T.blue + '1A', borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  insightTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg1, marginBottom: 4 },
  insightBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, lineHeight: 18 },
});
