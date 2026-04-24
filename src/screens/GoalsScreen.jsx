import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Plus, CheckCircle, Circle, Lock } from 'lucide-react-native';
import { T, CAT_COLORS, CATEGORIES } from '../tokens';
import { generateId } from '../utils/id';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Chip from '../components/Chip';
import Sheet from '../components/Sheet';
import Btn from '../components/Btn';
import { usePremium } from '../context/PremiumContext';

const FREE_GOAL_LIMIT = 3;
const GOAL_TITLE_MAX  = 100;
const VALID_TYPES     = ['long', 'short'];
const RATE_LIMIT_MS   = 500;

function GoalCard({ goal, onPress }) {
  const color = CAT_COLORS[goal.category] || T.blue;
  return (
    <Pressable onPress={onPress} style={s.card}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{goal.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Badge color={color}>{goal.category}</Badge>
            <Text style={s.cardDue}>Due {goal.dueLabel}</Text>
          </View>
        </View>
        <Text style={[s.cardPct, { color }]}>{goal.pct}%</Text>
      </View>
      <ProgressBar value={goal.pct} color={color} height={5} />
      <Text style={s.cardMilestone}>{goal.tasksDone} of {goal.tasks} milestones complete</Text>
    </Pressable>
  );
}

function GoalDetailSheet({ goal, visible, onClose }) {
  if (!goal) return null;
  const color      = CAT_COLORS[goal.category] || T.blue;
  const milestones = Array.from({ length: Math.min(goal.tasks, 8) }, (_, i) => ({ id: i + 1, done: i < goal.tasksDone }));
  return (
    <Sheet visible={visible} title={goal.title} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Badge color={color}>{goal.category}</Badge>
        <Badge color={T.fg3}>{goal.type === 'long' ? 'Long-term' : 'Short-term'}</Badge>
        <Text style={[s.cardDue, { marginLeft: 'auto' }]}>Due {goal.dueLabel}</Text>
      </View>
      <View style={s.progressBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={s.boxLabel}>Overall progress</Text>
          <Text style={[s.cardPct, { fontSize: 16, color }]}>{goal.pct}%</Text>
        </View>
        <ProgressBar value={goal.pct} color={color} height={8} glow />
        <Text style={[s.cardMilestone, { marginTop: 8 }]}>{goal.tasksDone} of {goal.tasks} milestones</Text>
      </View>
      <Text style={s.milestoneHeader}>Milestones</Text>
      {milestones.map(m => (
        <View key={m.id} style={[s.milestoneRow, { opacity: m.done ? 1 : 0.5, borderColor: m.done ? color + '22' : 'rgba(255,255,255,0.04)', backgroundColor: m.done ? T.s1 : 'transparent' }]}>
          {m.done ? <CheckCircle size={14} color={color} /> : <Circle size={14} color={T.fg4} />}
          <Text style={[s.milestoneLabel, { color: m.done ? T.fg1 : T.fg3 }]}>Milestone {m.id}</Text>
        </View>
      ))}
    </Sheet>
  );
}

function AddGoalSheet({ visible, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [cat,   setCat]   = useState('Fitness');
  const [type,  setType]  = useState('long');

  const handleTitle = text => setTitle(text.slice(0, GOAL_TITLE_MAX));

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    const safeCategory = CATEGORIES.includes(cat) ? cat : 'Fitness';
    const safeType     = VALID_TYPES.includes(type) ? type : 'long';
    onAdd({ title: clean, category: safeCategory, type: safeType, pct: 0, tasks: 10, tasksDone: 0, dueLabel: 'TBD' });
    setTitle(''); setCat('Fitness'); setType('long');
    onClose();
  };

  return (
    <Sheet visible={visible} title="New goal" onClose={onClose}>
      <View style={{ paddingBottom: 8 }}>
        <Text style={s.label}>Goal</Text>
        <TextInput value={title} onChangeText={handleTitle} placeholder="What do you want to achieve?" placeholderTextColor={T.fg4}
          style={[s.input, title && { borderColor: T.blue }]} autoFocus maxLength={GOAL_TITLE_MAX} />
        {title.length > 80 && <Text style={s.charCount}>{title.length}/{GOAL_TITLE_MAX}</Text>}

        <Text style={s.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 7 }}>
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>

        <Text style={s.label}>Type</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 24 }}>
          <Chip label="Long-term"  active={type === 'long'}  onPress={() => setType('long')}  />
          <Chip label="Short-term" active={type === 'short'} onPress={() => setType('short')} />
        </View>

        <Btn variant="primary" size="lg" full onPress={submit} disabled={!title.trim()}>Create goal</Btn>
      </View>
    </Sheet>
  );
}

export default function GoalsScreen({ goals, setGoals }) {
  const { isPremium, showUpgrade } = usePremium();
  const [tab,        setTab]        = useState('all');
  const [addVisible, setAddVisible] = useState(false);
  const [detail,     setDetail]     = useState(null);
  const lastAdd = React.useRef(0);

  const atLimit = !isPremium && goals.length >= FREE_GOAL_LIMIT;

  const filtered = tab === 'long'  ? goals.filter(g => g.type === 'long')
                 : tab === 'short' ? goals.filter(g => g.type === 'short')
                 : goals;

  const addGoal = g => {
    const now = Date.now();
    if (now - lastAdd.current < RATE_LIMIT_MS) return;
    lastAdd.current = now;
    setGoals(gs => [...gs, { ...g, id: generateId() }]);
  };

  const handleAddPress = () => {
    if (atLimit) {
      showUpgrade('goals');
    } else {
      setAddVisible(true);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.screenTitle}>Goals</Text>
            <Text style={s.screenSub}>{goals.length} active goal{goals.length !== 1 ? 's' : ''}</Text>
          </View>
          <Pressable style={[s.addBtn, atLimit && s.addBtnLocked]} onPress={handleAddPress}>
            {atLimit ? <Lock size={18} color={T.gold} /> : <Plus size={20} color="#fff" />}
          </Pressable>
        </View>

        <View style={s.summaryRow}>
          {[
            { v: goals.length,                                l: 'Total',     c: T.blue },
            { v: goals.filter(g => g.pct >= 100).length,     l: 'Complete',  c: T.teal },
            { v: goals.filter(g => g.type === 'long').length, l: 'Long-term', c: T.gold },
          ].map(({ v, l, c }) => (
            <View key={l} style={s.summaryCard}>
              <Text style={[s.summaryNum, { color: c }]}>{v}</Text>
              <Text style={s.summaryLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Free tier limit indicator */}
        {!isPremium && (
          <View style={s.limitBar}>
            <View style={{ flex: 1 }}>
              <Text style={s.limitText}>{goals.length} / {FREE_GOAL_LIMIT} goals used</Text>
            </View>
            {atLimit && (
              <Pressable onPress={() => showUpgrade('goals')} style={s.limitUpgrade}>
                <Lock size={10} color={T.gold} />
                <Text style={s.limitUpgradeText}>Unlock unlimited</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 18 }}>
          {[['all','All'],['long','Long-term'],['short','Short-term']].map(([v,l]) => (
            <Chip key={v} label={l} active={tab === v} onPress={() => setTab(v)} />
          ))}
        </View>

        {filtered.length === 0
          ? <Text style={s.empty}>No goals here.</Text>
          : filtered.map(g => <GoalCard key={g.id} goal={g} onPress={() => setDetail(g)} />)
        }

        {/* Upsell after goals list when at limit */}
        {atLimit && (
          <Pressable onPress={() => showUpgrade('goals')} style={s.upsellCard}>
            <View style={s.upsellIcon}>
              <Lock size={18} color={T.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.upsellTitle}>Unlock unlimited goals</Text>
              <Text style={s.upsellBody}>You've hit the 3-goal limit. Upgrade for unlimited goals + templates. <Text style={{ color: T.gold }}>Upgrade →</Text></Text>
            </View>
          </Pressable>
        )}
      </ScrollView>

      <AddGoalSheet   visible={addVisible}  onClose={() => setAddVisible(false)} onAdd={addGoal} />
      <GoalDetailSheet visible={!!detail}   goal={detail} onClose={() => setDetail(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  header:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginTop: 3 },
  addBtn:       { backgroundColor: T.blue, borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtnLocked: { backgroundColor: T.gold + '1A', borderWidth: 1, borderColor: T.gold + '44' },

  summaryRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard:  { flex: 1, backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, alignItems: 'center' },
  summaryNum:   { fontFamily: 'Syne_800ExtraBold', fontSize: 24, lineHeight: 28, marginBottom: 3 },
  summaryLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.9, color: T.fg4 },

  limitBar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  limitText:        { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3 },
  limitUpgrade:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.gold + '18', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  limitUpgradeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: T.gold },

  empty: { textAlign: 'center', paddingVertical: 40, color: T.fg4, fontSize: 13, fontFamily: 'DMSans_400Regular' },

  upsellCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.s2, borderWidth: 1, borderColor: T.gold + '33', borderRadius: 14, padding: 16, marginTop: 4 },
  upsellIcon:  { width: 40, height: 40, borderRadius: 11, backgroundColor: T.gold + '1A', alignItems: 'center', justifyContent: 'center' },
  upsellTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1, marginBottom: 3 },
  upsellBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, lineHeight: 18 },

  card:          { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTop:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle:     { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1, lineHeight: 20 },
  cardDue:       { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg4 },
  cardPct:       { fontFamily: 'Syne_800ExtraBold', fontSize: 22, marginLeft: 12 },
  cardMilestone: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg4, marginTop: 7 },

  progressBox:  { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 16 },
  boxLabel:     { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: T.fg2 },
  milestoneHeader: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: T.fg2, marginBottom: 10 },
  milestoneRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, borderWidth: 1, borderRadius: 8, marginBottom: 6 },
  milestoneLabel:  { fontFamily: 'DMSans_400Regular', fontSize: 13 },

  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: T.fg3, marginBottom: 8 },
  input: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 10, padding: 12, color: T.fg1, fontSize: 15, fontFamily: 'DMSans_400Regular', marginBottom: 4 },
  charCount: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg4, textAlign: 'right', marginBottom: 12 },
});
