import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Home, CheckSquare, Target, BarChart2, Award } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import { T } from './src/tokens';
import ErrorBoundary from './src/components/ErrorBoundary';
import { PremiumProvider, usePremium } from './src/context/PremiumContext';
import UpgradeModal from './src/components/UpgradeModal';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import HomeScreen  from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import StatsScreen from './src/screens/StatsScreen';
import RankScreen  from './src/screens/RankScreen';
import { loadTasks, saveTasks, loadGoals, saveGoals, getStreak, getTotalCompleted, recordDayComplete, incrementTotalCompleted } from './src/services/db';
import { computeRank } from './src/utils/rank';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:  Home,
  Tasks: CheckSquare,
  Goals: Target,
  Stats: BarChart2,
  Rank:  Award,
};

function GlobalUpgradeModal() {
  const { upgradeVisible, upgradeSource, hideUpgrade } = usePremium();
  return <UpgradeModal visible={upgradeVisible} onClose={hideUpgrade} source={upgradeSource} />;
}

function MainTabs({ userName, tasks, setTasks, goals, setGoals, streak, totalCompleted }) {
  const insets     = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const currentRank  = computeRank(streak, totalCompleted, isPremium);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.s1,
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor:   T.blue,
        tabBarInactiveTintColor: T.fg4,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 9,
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          const Icon = TAB_ICONS[route.name];
          return Icon ? <Icon size={20} color={color} strokeWidth={focused ? 2 : 1.5} /> : null;
        },
      })}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen
            userName={userName}
            tasks={tasks}
            goals={goals}
            streak={streak}
            rank={currentRank}
            navigation={navigation}
            onAddTask={() => navigation.navigate('Tasks')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Tasks">
        {() => <TasksScreen tasks={tasks} setTasks={setTasks} />}
      </Tab.Screen>
      <Tab.Screen name="Goals">
        {() => <GoalsScreen goals={goals} setGoals={setGoals} />}
      </Tab.Screen>
      <Tab.Screen name="Stats">
        {() => <StatsScreen tasks={tasks} streak={streak} totalCompleted={totalCompleted} />}
      </Tab.Screen>
      <Tab.Screen name="Rank">
        {() => <RankScreen streak={streak} totalCompleted={totalCompleted} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [onboarded,       setOnboarded]       = useState(null);
  const [userName,        setUserName]         = useState('');
  const [tasks,           setTasksRaw]         = useState([]);
  const [goals,           setGoalsRaw]         = useState([]);
  const [streak,          setStreak]           = useState(0);
  const [totalCompleted,  setTotalCompleted]   = useState(0);

  const prevDoneCount = useRef(0);

  // Persist tasks remotely whenever they change; track completions
  const setTasks = useCallback((updater) => {
    setTasksRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveTasks(next).catch(() => {});

      // Detect newly completed tasks to update server-side total
      const prevDone = prev.filter(t => t.done).length;
      const nextDone = next.filter(t => t.done).length;
      const delta    = nextDone - prevDone;
      if (delta > 0) {
        incrementTotalCompleted(delta)
          .then(() => getTotalCompleted().then(setTotalCompleted))
          .catch(() => {});
      }

      // If all tasks done for today, record a day completion server-side
      if (next.length > 0 && next.every(t => t.done)) {
        recordDayComplete()
          .then(() => getStreak().then(setStreak))
          .catch(() => {});
      }

      return next;
    });
  }, []);

  const setGoals = useCallback((updater) => {
    setGoalsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveGoals(next).catch(() => {});
      return next;
    });
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const [done, name] = await Promise.all([
        AsyncStorage.getItem('ascend-onboarded'),
        AsyncStorage.getItem('ascend-name'),
      ]);
      setOnboarded(!!done);
      if (name) setUserName(name);

      // Load data (Firestore → AsyncStorage fallback)
      const [loadedTasks, loadedGoals, currentStreak, totalDone] = await Promise.all([
        loadTasks(),
        loadGoals(),
        getStreak(),
        getTotalCompleted(),
      ]);
      setTasksRaw(loadedTasks);
      setGoalsRaw(loadedGoals);
      setStreak(currentStreak);
      setTotalCompleted(totalDone);
    })();
  }, []);

  // Re-verify premium + refresh streak whenever app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const [s, t] = await Promise.all([getStreak(), getTotalCompleted()]);
        setStreak(s);
        setTotalCompleted(t);
      }
    });
    return () => sub.remove();
  }, []);

  const completeOnboarding = useCallback((name) => {
    setUserName(name);
    setOnboarded(true);
  }, []);

  if (!fontsLoaded || onboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={T.blue} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PremiumProvider>
          <StatusBar style="light" />
          {!onboarded ? (
            <OnboardingNavigator onComplete={completeOnboarding} />
          ) : (
            <NavigationContainer theme={{ colors: { background: T.bg }, dark: true }}>
              <MainTabs
                userName={userName}
                tasks={tasks}         setTasks={setTasks}
                goals={goals}         setGoals={setGoals}
                streak={streak}
                totalCompleted={totalCompleted}
              />
              <GlobalUpgradeModal />
            </NavigationContainer>
          )}
        </PremiumProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
