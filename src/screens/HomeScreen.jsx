import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Bell, Zap, Award, Calendar, Plus } from 'lucide-react-native';
import { T } from '../tokens';
import RingProgress from '../components/RingProgress';
import ProgressBar from '../components/ProgressBar';
import Btn from '../components/Btn';

export default function HomeScreen({ userName, tasks, goals, navigation, onAddTask }) {
  const done = tasks.filter(t => t.done).length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const todayTasks = tasks.slice(0, 3);
  const activeGoals = goals.slice(0, 2);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <View style={styles.bellWrap}>
          <Bell size={18} color={T.fg2} />
          <View style={styles.bellDot} />
        </View>
      </View>

      {/* Hero ring */}
      <View style={styles.hero}>
        <RingProgress size={88} stroke={9} value={pct} color={pct === 100 ? T.teal : T.blue}>
          <Text style={[styles.pctText, { color: pct === 100 ? T.teal : T.fg1 }]}>{pct}%</Text>
        </RingProgress>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Today's progress</Text>
          <Text style={styles.heroSub}>{done} of {tasks.length} tasks done</Text>
          <Btn variant="subtle" size="sm" onPress={() => navigation.navigate('Tasks')}>View tasks</Btn>
        </View>
      </View>

      {/* Streak + Rank */}
      <View style={styles.row2}>
        <View style={[styles.miniCard, { borderColor: 'rgba(45,218,181,0.2)' }]}>
          <View style={styles.miniGlowTeal} />
          <View style={styles.miniHeader}>
            <Zap size={14} color={T.teal} />
            <Text style={styles.miniLabel}>Streak</Text>
          </View>
          <Text style={[styles.miniValue, { color: T.teal }]}>0</Text>
          <Text style={styles.miniSub}>days in a row</Text>
        </View>

        <Pressable style={[styles.miniCard, { borderColor: 'rgba(160,160,192,0.2)' }]} onPress={() => navigation.navigate('Rank')}>
          <View style={styles.miniGlowIron} />
          <View style={styles.miniHeader}>
            <Award size={14} color="#A0A0C0" />
            <Text style={styles.miniLabel}>Rank</Text>
          </View>
          <Text style={[styles.miniValue, { color: '#A0A0C0', fontSize: 20 }]}>Iron</Text>
          <Text style={styles.miniSub}>Tier 1 of 5</Text>
        </Pressable>
      </View>

      {/* Today's tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's tasks</Text>
          <Pressable onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tasks yet — add your first one</Text>
          </View>
        ) : (
          todayTasks.map(t => (
            <View key={t.id} style={[styles.taskRow, { opacity: t.done ? 0.55 : 1 }]}>
              <View style={[styles.taskCheck, { borderColor: t.done ? T.blue : 'rgba(255,255,255,0.18)', backgroundColor: t.done ? T.blue : 'transparent' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, t.done && { textDecorationLine: 'line-through', color: T.fg3 }]}>{t.title}</Text>
                <Text style={styles.taskCat}>{t.category}</Text>
              </View>
            </View>
          ))
        )}
        <Pressable style={styles.addDashed} onPress={onAddTask}>
          <Plus size={14} color={T.fg4} />
          <Text style={styles.addDashedText}>Add task</Text>
        </Pressable>
      </View>

      {/* Active goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active goals</Text>
          <Pressable onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {activeGoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No goals yet — set one to get started</Text>
          </View>
        ) : (
          activeGoals.map(g => (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={[styles.goalPct, { color: T.teal }]}>{g.pct}%</Text>
              </View>
              <ProgressBar value={g.pct} color={T.teal} height={5} />
            </View>
          ))
        )}
      </View>

      {/* Cal sync */}
      <View style={styles.calCard}>
        <View style={styles.calIcon}>
          <Calendar size={17} color={T.blue} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.calTitle}>Connect your calendar</Text>
          <Text style={styles.calSub}>Sync events to stay on track</Text>
        </View>
        <View style={styles.calDot} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  header:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 8, marginBottom: 20 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginBottom: 2 },
  name:     { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: T.fg1, lineHeight: 32 },
  bellWrap: { backgroundColor: T.s2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  bellDot:  { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: T.blue, borderWidth: 2, borderColor: T.s2 },

  hero:      { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  pctText:   { fontFamily: 'Syne_800ExtraBold', fontSize: 20, lineHeight: 24 },
  heroTitle: { fontFamily: 'Syne_700Bold', fontSize: 18, color: T.fg1, marginBottom: 4 },
  heroSub:   { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg3, marginBottom: 12 },

  row2:     { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniCard: { flex: 1, backgroundColor: T.s1, borderWidth: 1, borderRadius: 12, padding: 14, overflow: 'hidden' },
  miniGlowTeal: { position: 'absolute', top: -10, right: -10, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(45,218,181,0.1)' },
  miniGlowIron: { position: 'absolute', top: -10, right: -10, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(160,160,192,0.1)' },
  miniHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  miniLabel:  { fontFamily: 'DMSans_600SemiBold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: T.fg3 },
  miniValue:  { fontFamily: 'Syne_800ExtraBold', fontSize: 26, lineHeight: 30 },
  miniSub:    { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg3, marginTop: 3 },

  section:       { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg2 },
  seeAll:        { fontFamily: 'DMSans_500Medium', fontSize: 12, color: T.blue },

  emptyCard: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 18, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg4 },

  taskRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 8 },
  taskCheck: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5 },
  taskTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: T.fg1 },
  taskCat:   { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg4, marginTop: 1 },
  addDashed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 11, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(79,110,247,0.3)' },
  addDashedText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: T.fg4 },

  goalCard:   { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  goalTitle:  { fontFamily: 'DMSans_500Medium', fontSize: 13, color: T.fg1 },
  goalPct:    { fontFamily: 'DMSans_700Bold', fontSize: 12 },

  calCard: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(79,110,247,0.2)', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  calIcon: { backgroundColor: T.blue + '1A', borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  calTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: T.fg1 },
  calSub:   { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg3 },
  calDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: T.teal, shadowColor: T.teal, shadowOpacity: 0.8, shadowRadius: 4 },
});
