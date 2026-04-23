import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Plus, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { T } from '../tokens';
import ProgressBar from '../components/ProgressBar';
import Chip from '../components/Chip';
import Toggle from '../components/Toggle';
import Sheet from '../components/Sheet';
import Btn from '../components/Btn';

function AddTaskSheet({ visible, onClose, onAdd }) {
  const [title,    setTitle]    = useState('');
  const [cat,      setCat]      = useState('Fitness');
  const [priority, setPriority] = useState('medium');
  const [streak,   setStreak]   = useState(false);
  const [due,      setDue]      = useState('today');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title, category: cat, priority, streak, dueLabel: due });
    setTitle(''); setCat('Fitness'); setPriority('medium'); setStreak(false); setDue('today');
    onClose();
  };

  return (
    <Sheet visible={visible} title="New task" onClose={onClose}>
      <View style={{ paddingBottom: 8 }}>
        <Text style={s.label}>Task name</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="What will you do?" placeholderTextColor={T.fg4}
          style={[s.input, title && { borderColor: T.blue }]} autoFocus />

        <Text style={s.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 7 }}>
          {['Fitness','Learning','Mindset','Routine','Work','Health'].map(c => (
            <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>

        <Text style={s.label}>Priority</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 20 }}>
          {[['low','Low',T.fg3],['medium','Medium',T.blue],['high','High',T.error]].map(([v,l,c]) => (
            <Chip key={v} label={l} active={priority === v} color={c} onPress={() => setPriority(v)} />
          ))}
        </View>

        <Text style={s.label}>Due</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 20 }}>
          {['today','tomorrow','this week'].map(d => (
            <Chip key={d} label={d} active={due === d} onPress={() => setDue(d)} />
          ))}
        </View>

        <View style={s.streakRow}>
          <View>
            <Text style={s.streakTitle}>Track as streak</Text>
            <Text style={s.streakSub}>Must complete daily to maintain</Text>
          </View>
          <Toggle value={streak} onChange={setStreak} />
        </View>

        <Btn variant="primary" size="lg" full onPress={submit} disabled={!title.trim()}>Add task</Btn>
      </View>
    </Sheet>
  );
}

function TaskItem({ task, onToggle }) {
  const border = task.overdue ? 'rgba(247,111,111,0.2)' : task.streak ? 'rgba(45,218,181,0.18)' : 'rgba(255,255,255,0.05)';
  return (
    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(task.id); }}
      style={({ pressed }) => [s.taskCard, { borderColor: border, opacity: task.done ? 0.55 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <View style={[s.check, {
        borderColor: task.done ? T.blue : task.streak ? T.teal : 'rgba(255,255,255,0.2)',
        backgroundColor: task.done ? T.blue : 'transparent',
      }]} />
      <View style={{ flex: 1 }}>
        <Text style={[s.taskTitle, { color: task.overdue ? T.error : T.fg1 }, task.done && { textDecorationLine: 'line-through', color: T.fg3 }]}>{task.title}</Text>
        <Text style={[s.taskSub, { color: task.overdue ? T.error + '88' : T.fg4 }]}>
          {task.done ? 'Completed' : task.overdue ? 'Overdue · 2 days' : task.streak ? `Streak · ${task.category}` : `Due today · ${task.category}`}
        </Text>
      </View>
      {task.streak && !task.done && <Zap size={13} color={T.teal} />}
      {task.priority === 'high'   && !task.done && <View style={[s.dot, { backgroundColor: T.error }]} />}
      {task.priority === 'medium' && !task.done && <View style={[s.dot, { backgroundColor: T.blue  }]} />}
    </Pressable>
  );
}

export default function TasksScreen({ tasks, setTasks }) {
  const [filter,  setFilter]  = useState('all');
  const [sheetOn, setSheetOn] = useState(false);

  const done = tasks.filter(t => t.done).length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const filtered = filter === 'done'    ? tasks.filter(t => t.done)
                 : filter === 'pending' ? tasks.filter(t => !t.done)
                 : filter === 'streak'  ? tasks.filter(t => t.streak)
                 : tasks;

  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = task => setTasks(ts => [...ts, { ...task, id: Date.now(), done: false, overdue: false }]);

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.screenTitle}>Tasks</Text>
            <Text style={s.screenSub}>{done} of {tasks.length} complete today</Text>
          </View>
          <Pressable style={s.addBtn} onPress={() => setSheetOn(true)}>
            <Plus size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Daily progress</Text>
            <Text style={[s.progressPct, { color: pct === 100 ? T.teal : T.fg1 }]}>{pct}%</Text>
          </View>
          <ProgressBar value={pct} color={pct === 100 ? T.teal : T.blue} glow={pct === 100} height={7} />
          {pct === 100 && <Text style={s.streakMsg}>All tasks complete — streak maintained</Text>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters} contentContainerStyle={{ gap: 7 }}>
          {[['all','All'],['pending','Pending'],['done','Done'],['streak','Streak']].map(([v,l]) => (
            <Chip key={v} label={l} active={filter === v} onPress={() => setFilter(v)} />
          ))}
        </ScrollView>

        {filtered.length === 0
          ? <Text style={s.empty}>No tasks here.</Text>
          : filtered.map(t => <TaskItem key={t.id} task={t} onToggle={toggle} />)
        }
      </ScrollView>

      <AddTaskSheet visible={sheetOn} onClose={() => setSheetOn(false)} onAdd={addTask} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 24, paddingBottom: 100 },

  header:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  screenTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: T.fg1 },
  screenSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3, marginTop: 3 },
  addBtn:      { backgroundColor: T.blue, borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  progressCard:  { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 20 },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: T.fg2 },
  progressPct:   { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  streakMsg:     { fontFamily: 'DMSans_500Medium', fontSize: 11, color: T.teal, marginTop: 6 },

  filters: { marginBottom: 18 },
  empty:   { textAlign: 'center', paddingVertical: 40, color: T.fg4, fontSize: 13, fontFamily: 'DMSans_400Regular' },

  taskCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: T.s1, borderWidth: 1, borderRadius: 11, marginBottom: 8 },
  check:     { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5 },
  taskTitle: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: T.fg1 },
  taskSub:   { fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 2 },
  dot:       { width: 6, height: 6, borderRadius: 3 },

  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: T.fg3, marginBottom: 8 },
  input: { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 10, padding: 12, color: T.fg1, fontSize: 15, fontFamily: 'DMSans_400Regular', marginBottom: 20 },
  streakRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 24 },
  streakTitle: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: T.fg1 },
  streakSub:   { fontFamily: 'DMSans_400Regular', fontSize: 11, color: T.fg3 },
});
