import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T, CATEGORIES } from '../../tokens';
import Btn from '../../components/Btn';
import Badge from '../../components/Badge';

const { width } = Dimensions.get('window');
const RANKS = [['Iron', '#A0A0C0'], ['Bronze', '#C0845A'], ['Silver', '#C0C8DC'], ['Gold', T.gold], ['Diamond', '#B088F8']];

const NAME_MAX = 50;
const sanitizeName = str => str.replace(/[<>&"']/g, '').trimStart();

// ── Step 0: Splash ────────────────────────────────────────────
function SplashStep({ onNext }) {
  return (
    <View style={styles.stepCenter}>
      <View style={styles.glow} />
      <View style={styles.logoBox}>
        <TrendingUp size={32} color={T.blue} />
      </View>
      <Text style={styles.heroTitle}>Ascend</Text>
      <Text style={styles.heroSub}>Don't just plan your day.{'\n'}Build your discipline.</Text>
      <Btn variant="primary" size="lg" full onPress={onNext}>Get started</Btn>
      <Text style={styles.signIn}>Already have an account? <Text style={{ color: T.blue }}>Sign in</Text></Text>
    </View>
  );
}

// ── Step 1: Name ─────────────────────────────────────────────
function NameStep({ name, setName, onNext }) {
  const handleChange = text => setName(sanitizeName(text).slice(0, NAME_MAX));
  const isValid = name.trim().length >= 1 && name.trim().length <= NAME_MAX;
  return (
    <View style={styles.stepPad}>
      <Badge color={T.blue}>Step 1 of 3</Badge>
      <Text style={styles.stepTitle}>What should we{'\n'}call you?</Text>
      <Text style={styles.stepSub}>Your rank is yours. Own it.</Text>
      <Text style={styles.fieldLabel}>Your name</Text>
      <TextInput
        value={name}
        onChangeText={handleChange}
        placeholder="e.g. Jordan"
        placeholderTextColor={T.fg4}
        autoFocus
        maxLength={NAME_MAX}
        autoComplete="off"
        autoCorrect={false}
        style={[styles.input, name && { borderColor: T.blue, shadowColor: T.blue, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }]}
      />
      {name.length > 0 && <Text style={styles.charCount}>{name.length}/{NAME_MAX}</Text>}
      <Btn variant="primary" size="lg" full onPress={onNext} disabled={!isValid}>Continue</Btn>
    </View>
  );
}

// ── Step 2: Categories ───────────────────────────────────────
function CatsStep({ cats, setCats, onNext }) {
  return (
    <View style={styles.stepPad}>
      <Badge color={T.teal}>Step 2 of 3</Badge>
      <Text style={styles.stepTitle}>What do you want{'\n'}to improve?</Text>
      <Text style={styles.stepSub}>Select all that apply.</Text>
      <View style={styles.catGrid}>
        {CATEGORIES.map(c => {
          const active = cats.includes(c);
          return (
            <Pressable key={c}
              onPress={() => setCats(p => active ? p.filter(x => x !== c) : [...p, c])}
              style={[styles.catBtn, active && { backgroundColor: T.blue + '22', borderColor: T.blue + '55' }]}>
              <Text style={[styles.catLabel, { color: active ? T.blue : T.fg2 }]}>{c}</Text>
            </Pressable>
          );
        })}
      </View>
      <Btn variant="primary" size="lg" full onPress={onNext} disabled={cats.length === 0}>Continue</Btn>
    </View>
  );
}

// ── Step 3: Rank intro ────────────────────────────────────────
function RankStep({ onFinish }) {
  return (
    <View style={[styles.stepPad, { alignItems: 'center' }]}>
      <View style={styles.goldGlow} />
      <Badge color={T.gold}>Step 3 of 3</Badge>
      <Text style={[styles.stepTitle, { textAlign: 'center' }]}>Earn your rank</Text>
      <Text style={[styles.stepSub, { textAlign: 'center', maxWidth: 260 }]}>
        Stay consistent. Complete tasks. Build streaks.{'\n'}Your rank reflects your discipline.
      </Text>
      <View style={styles.rankRow}>
        {RANKS.map(([n, c]) => (
          <View key={n} style={styles.rankItem}>
            <View style={[styles.rankCircle, { borderColor: c + '66', backgroundColor: c + '18' }]}>
              <Text style={[styles.rankInitial, { color: c }]}>{n[0]}</Text>
            </View>
            <Text style={styles.rankName}>{n}</Text>
          </View>
        ))}
      </View>
      <View style={styles.ironBox}>
        <Text style={styles.ironTitle}>You start at Iron Tier</Text>
        <Text style={styles.ironSub}>Complete tasks consistently to climb the ranks.</Text>
      </View>
      <Btn variant="gold" size="lg" full onPress={onFinish}>Start ascending</Btn>
    </View>
  );
}

// ── Onboarding Root ───────────────────────────────────────────
export default function OnboardingNavigator({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cats, setCats] = useState(['Fitness']);

  const next = () => setStep(s => s + 1);

  const finish = async () => {
    const safeName = name.trim() || 'You';
    await AsyncStorage.setItem('ascend-name', safeName);
    await AsyncStorage.setItem('ascend-onboarded', '1');
    onComplete(safeName);
  };

  const steps = [
    <SplashStep onNext={next} />,
    <NameStep name={name} setName={setName} onNext={next} />,
    <CatsStep cats={cats} setCats={setCats} onNext={next} />,
    <RankStep onFinish={finish} />,
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {steps[step]}
      </ScrollView>
      {step > 0 && (
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === step - 1 && { width: 20, backgroundColor: T.blue }]} />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  stepCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stepPad:    { flex: 1, padding: 28, paddingTop: 36 },

  glow: { position: 'absolute', top: '18%', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(79,110,247,0.12)', alignSelf: 'center' },
  goldGlow: { position: 'absolute', top: '22%', width: 160, height: 100, borderRadius: 80, backgroundColor: 'rgba(245,200,66,0.12)', alignSelf: 'center' },

  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#4F6EF733', borderWidth: 1, borderColor: '#4F6EF744', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  heroTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 40, color: T.fg1, letterSpacing: -1, marginBottom: 12 },
  heroSub:   { fontFamily: 'DMSans_400Regular', fontSize: 16, color: T.fg2, lineHeight: 26, textAlign: 'center', marginBottom: 40 },
  signIn:    { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg4, marginTop: 14 },

  stepTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: T.fg1, lineHeight: 34, marginTop: 12, marginBottom: 8 },
  stepSub:   { fontFamily: 'DMSans_400Regular', fontSize: 14, color: T.fg3, marginBottom: 28 },
  fieldLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: T.fg3, marginBottom: 8 },
  input: {
    backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10, padding: 14, color: T.fg1, fontSize: 16,
    fontFamily: 'DMSans_400Regular', marginBottom: 32,
  },

  charCount: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: T.fg4, textAlign: 'right', marginTop: -24, marginBottom: 24 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, flex: 1, paddingBottom: 32 },
  catBtn:  { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  catLabel: { fontFamily: 'DMSans_500Medium', fontSize: 13 },

  rankRow:     { flexDirection: 'row', gap: 8, marginBottom: 28, width: '100%' },
  rankItem:    { flex: 1, alignItems: 'center', gap: 6 },
  rankCircle:  { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  rankInitial: { fontFamily: 'Syne_800ExtraBold', fontSize: 14 },
  rankName:    { fontFamily: 'DMSans_600SemiBold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.6, color: T.fg4 },

  ironBox:  { backgroundColor: T.s1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 28 },
  ironTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: T.fg1, marginBottom: 4 },
  ironSub:   { fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.fg3 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 32 },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#252540' },
});
