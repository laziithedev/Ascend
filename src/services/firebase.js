/**
 * Firebase initialisation.
 *
 * SETUP (one-time):
 *  1. Go to console.firebase.google.com → Create project
 *  2. Project Settings → Your apps → Add web app → copy the config below
 *  3. Firestore Database → Create database (start in production mode)
 *  4. Authentication → Sign-in method → Enable "Anonymous"
 *  5. Replace every REPLACE_WITH_* value below with your real values
 *
 * The module degrades gracefully — if config is still placeholder the app
 * continues to work using local AsyncStorage only.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const FIREBASE_CONFIG = {
  apiKey:            'REPLACE_WITH_YOUR_FIREBASE_API_KEY',
  authDomain:        'REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket:     'REPLACE_WITH_YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'REPLACE_WITH_YOUR_SENDER_ID',
  appId:             'REPLACE_WITH_YOUR_APP_ID',
};

const isConfigured = !FIREBASE_CONFIG.apiKey.startsWith('REPLACE_');

let db   = null;
let auth = null;

if (isConfigured) {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  db   = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth, isConfigured };

let _uid = null;

export async function ensureAuth() {
  if (!isConfigured || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  if (_uid) return { uid: _uid };
  try {
    const { user } = await signInAnonymously(auth);
    _uid = user.uid;
    return user;
  } catch (e) {
    if (__DEV__) console.warn('[Firebase] anonymous sign-in failed:', e.message);
    return null;
  }
}
