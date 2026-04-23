import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { T } from '../tokens';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';

export default function StatsScreen({ tasks }) {
  const done          = tasks.filter(t => t.done).length;
  const completionPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const weekDays      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekBars      = [0, 0, 0, 0, 0, 0, completionPct];
  const peakDay       = weekBars.indexOf(Math.max(...weekBars));
  const [activeBar, setActiveBar] = useState(null);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Analytics</Text>
      <Text style={s.screenSub}>Your progress over time</Text>

      <View style={s.grid}>
        <StatCard value={`${completionPct}%`} label="Today"      color={completionPct >= 70 ? T.teal : T.blue} />
        <StatCard value="0"                   label="Day streak"  color={T.teal} delta="Keep going!" deltaUp />
        <StatCard value="0%"                  label="This week"   color={T.blue} />
        <StatCard value="0"                   label="All time"    color={T.fg2}  />
      </View>

      {/* Weekly chart */}
      <View style={s.chartCard}>
        <View style={s.chartHeader}>
          <Text style={s.chartTitle}>Completion this week</Text>
          <Badge color={T.teal}>{completionPct}% today</Badge>
        </View>
        <View style={s.bars}>
          {weekBars.map((h, i) => {
            const isPeak   = i === peakDay && h > 0;
            const barColor = isPeak ? T.teal : T.blue;
            const opacity  = activeBar !== null && activeBar !== i ? 0.3 : 1;
            return (
              <Pressable key={i} onPress={() => setActiveBar(activeBar === i ? null : i)} style={s.barWrap}>
                {activeBar === i && <Text style={[s.barPct, { color: barColor }]}>{h}%</Text>}
                <View style={[s.bar, { height: Math.max((h / 100) * 72, 4), backgroundColor: barColor, opacity, shadowColor: isPeak ? T.teal : undefined, shadowOpacity: isPeak ? 0.5 : 0, shadowRadius: 6 }]} />
              </Pressable>
            );
          })}
        </View>
        <View style={s.dayLabels}>
          {weekDays.map((d, i) => (
            <Text key={d} style={[s.dayLabel, i === peakDay && weekBars[i] > 0 && { color: T.teal, fontFamily: 'DMSans_700Bold' }]}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Rank progress */}
      <View style={s.rankCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={s.chartTitle}>Rank progress</Text>
          <Badge color="#A0A0C0">Iron Tier</Badge>
        </View>
        <ProgressBar value={0} color="#A0A0C0" height={8} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={s.rankSub}>Complete tasks to rank up</Text>
          <Text style={[s.rankSub, { color: '#A0A0C0' }]}>0% to Bronze</Text>
        </View>
      </View>

      {/* Category breakdown */}
      <View style={s.catCard}>
        <Text style={[s.chartTitle, { marginBottom: 14 }]}>By category</Text>
        {['Fitness','Learning','Mindset','Work','Health'].map((cat, i) => {
          const colors = [T.teal, T.blue, '#A87EF7', T.blue + '88', T.teal + '88'];
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

      {/* Insight */}
      <View style={s.insightCard}>
        <View style={s.insightIcon}>
          <Zap size={16} color={T.blue} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.insightTitle}>Start building your streak</Text>
          <Text style={s.insightBody}>Complete tasks daily to unlock analytics and insights here.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1, marginBottom: 4 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },

  chartCard:   { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle:  { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2 },
  bars:      { flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 90, marginBottom: 8 },
  barWrap:   { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  bar:       { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barPct:    { fontFamily: 'DMSans_700Bold', fontSize: 9 },
  dayLabels: { flexDirection: 'row', gap: 5 },
  dayLabel:  { flex: 1, textAlign: 'center', fontSize: 9, color: T.fg4, fontFamily: 'DMSans_400Regular' },

  rankCard: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(160,160,192,0.2)', borderRadius: 14, padding: 16, marginBottom: 16 },
  rankSub:  { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg3 },

  catCard:  { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 16 },
  catName:  { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg2 },
  catPct:   { fontFamily: 'DMSans_700Bold', fontSize: 13, color: T.fg1 },

  insightCard: { backgroundColor: T.s2, borderWidth: 1, borderColor: T.blue + '22', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 12 },
  insightIcon: { backgroundColor: T.blue + '1A', borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  insightTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg1, marginBottom: 4 },
  insightBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, lineHeight: 18 },
});
