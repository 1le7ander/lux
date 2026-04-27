/**
 * Firebase Firestore service (optional — graceful fallback if not configured).
 */

import config from '../config.js';

let db = null;
let _initialized = false;

/** Initialize Firebase (lazy, only when credentials available) */
export async function initFirebase() {
  if (_initialized) return db;
  if (!config.firebaseApiKey || !config.firebaseProjectId) {
    _initialized = true;
    return null;
  }

  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const app = initializeApp({
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
    });

    db = getFirestore(app);
    _initialized = true;
    return db;
  } catch {
    _initialized = true;
    return null;
  }
}

/** Save order to Firestore */
export async function saveOrderToFirestore(order) {
  if (!db) return null;
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch {
    return null;
  }
}

/** Get all orders from Firestore */
export async function getOrdersFromFirestore() {
  if (!db) return [];
  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

/** Check if Firebase is available */
export function isFirebaseAvailable() {
  return db != null;
}
