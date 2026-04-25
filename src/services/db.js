/**
 * Data persistence — Firestore primary, AsyncStorage fallback.
 *
 * Every function works even when Firebase isn't configured.
 * If Firestore is available, data is synced to the cloud (survives
 * device loss, uninstall, etc.). AsyncStorage acts as the offline cache.
 */

import {
  doc, collection, getDoc, setDoc, getDocs,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, ensureAuth, isConfigured } from './firebase';

// ── Tasks ────────────────────────────────────────────────────────

export async function saveTasks(tasks) {
  await AsyncStorage.setItem('ascend-tasks', JSON.stringify(tasks));
  if (!isConfigured) return;
  try {
    const user = await ensureAuth();
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'data', 'tasks'), {
      tasks,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    if (__DEV__) console.warn('[DB] saveTasks remote failed:', e.message);
  }
}

export async function loadTasks() {
  // Try Firestore first; fall back to AsyncStorage
  if (isConfigured) {
    try {
      const user = await ensureAuth();
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid, 'data', 'tasks'));
        if (snap.exists()) {
          const tasks = snap.data().tasks ?? [];
          await AsyncStorage.setItem('ascend-tasks', JSON.stringify(tasks));
          return tasks;
        }
      }
    } catch (e) {
      if (__DEV__) console.warn('[DB] loadTasks remote failed:', e.message);
    }
  }
  const local = await AsyncStorage.getItem('ascend-tasks');
  return local ? JSON.parse(local) : [];
}

// ── Goals ────────────────────────────────────────────────────────

export async function saveGoals(goals) {
  await AsyncStorage.setItem('ascend-goals', JSON.stringify(goals));
  if (!isConfigured) return;
  try {
    const user = await ensureAuth();
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'data', 'goals'), {
      goals,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    if (__DEV__) console.warn('[DB] saveGoals remote failed:', e.message);
  }
}

export async function loadGoals() {
  if (isConfigured) {
    try {
      const user = await ensureAuth();
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid, 'data', 'goals'));
        if (snap.exists()) {
          const goals = snap.data().goals ?? [];
          await AsyncStorage.setItem('ascend-goals', JSON.stringify(goals));
          return goals;
        }
      }
    } catch (e) {
      if (__DEV__) console.warn('[DB] loadGoals remote failed:', e.message);
    }
  }
  const local = await AsyncStorage.getItem('ascend-goals');
  return local ? JSON.parse(local) : [];
}

// ── Streak (server-authoritative) ───────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

/**
 * Call this when all of today's tasks are completed.
 * Idempotent — safe to call multiple times for the same day.
 */
export async function recordDayComplete() {
  const today = todayStr();
  // Guard: only write once per calendar day per session
  const lastRecorded = await AsyncStorage.getItem('ascend-last-completion');
  if (lastRecorded === today) return;
  await AsyncStorage.setItem('ascend-last-completion', today);

  if (!isConfigured) return;
  try {
    const user = await ensureAuth();
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'completions', today), {
      completedAt: serverTimestamp(),
    });
  } catch (e) {
    if (__DEV__) console.warn('[DB] recordDayComplete failed:', e.message);
  }
}

/**
 * Returns the current streak count from the server.
 * Falls back to 0 if Firestore is unavailable.
 */
export async function getStreak() {
  if (!isConfigured) return 0;
  try {
    const user = await ensureAuth();
    if (!user) return 0;

    const snaps = await getDocs(
      query(
        collection(db, 'users', user.uid, 'completions'),
        orderBy('completedAt', 'desc'),
        limit(400),
      ),
    );
    if (snaps.empty) return 0;

    const dates = snaps.docs.map(d => d.id).sort().reverse();
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const expected = cursor.toISOString().split('T')[0];
      if (dateStr === expected) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch (e) {
    if (__DEV__) console.warn('[DB] getStreak failed:', e.message);
    return 0;
  }
}

/**
 * Returns total number of tasks ever completed.
 * Used for Gold rank threshold (100 tasks).
 */
export async function getTotalCompleted() {
  if (!isConfigured) return 0;
  try {
    const user = await ensureAuth();
    if (!user) return 0;
    const snap = await getDoc(doc(db, 'users', user.uid, 'data', 'stats'));
    return snap.exists() ? (snap.data().totalCompleted ?? 0) : 0;
  } catch {
    return 0;
  }
}

export async function incrementTotalCompleted(delta = 1) {
  if (!isConfigured) return;
  try {
    const user = await ensureAuth();
    if (!user) return;
    const ref  = doc(db, 'users', user.uid, 'data', 'stats');
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data().totalCompleted ?? 0) : 0;
    await setDoc(ref, { totalCompleted: prev + delta, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    if (__DEV__) console.warn('[DB] incrementTotalCompleted failed:', e.message);
  }
}
