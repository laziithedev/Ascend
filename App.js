import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import { PremiumProvider, usePremium } from './src/context/PremiumContext';
import UpgradeModal from './src/components/UpgradeModal';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import HomeScreen  from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import StatsScreen from './src/screens/StatsScreen';
import RankScreen  from './src/screens/RankScreen';

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

function MainTabs({ userName, tasks, setTasks, goals, setGoals }) {
  const insets = useSafeAreaInsets();

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
        {() => <StatsScreen tasks={tasks} />}
      </Tab.Screen>
      <Tab.Screen name="Rank">
        {() => <RankScreen />}
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

  const [onboarded, setOnboarded] = useState(null);
  const [userName,  setUserName]  = useState('');
  const [tasks,     setTasks]     = useState([]);
  const [goals,     setGoals]     = useState([]);

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem('ascend-onboarded');
      const name = await AsyncStorage.getItem('ascend-name');
      setOnboarded(!!done);
      if (name) setUserName(name);
    })();
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
    <SafeAreaProvider>
      <PremiumProvider>
        <StatusBar style="light" />
        {!onboarded ? (
          <OnboardingNavigator onComplete={completeOnboarding} />
        ) : (
          <NavigationContainer theme={{ colors: { background: T.bg }, dark: true }}>
            <MainTabs
              userName={userName}
              tasks={tasks}   setTasks={setTasks}
              goals={goals}   setGoals={setGoals}
            />
            <GlobalUpgradeModal />
          </NavigationContainer>
        )}
      </PremiumProvider>
    </SafeAreaProvider>
  );
}
