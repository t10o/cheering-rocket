import { initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import * as firestoreModule from "firebase/firestore";

type FirestoreInternalModule = typeof import("firebase/firestore");

const getFirestoreFn = (firestoreModule as FirestoreInternalModule).getFirestore;
const initializeFirestoreFn = (firestoreModule as Partial<FirestoreInternalModule>)
  .initializeFirestore;
const persistentLocalCacheFn = (firestoreModule as Partial<FirestoreInternalModule>)
  .persistentLocalCache;
const persistentMultipleTabManagerFn = (
  firestoreModule as Partial<FirestoreInternalModule>
).persistentMultipleTabManager;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const firebaseApp = initializeApp(firebaseConfig);

let firestore: Firestore;

const supportsPersistentCache =
  typeof persistentLocalCacheFn === "function" &&
  typeof initializeFirestoreFn === "function";

if (typeof window !== "undefined" && supportsPersistentCache) {
  try {
    const localCache =
      typeof persistentMultipleTabManagerFn === "function"
        ? persistentLocalCacheFn!({
            tabManager: persistentMultipleTabManagerFn(),
          })
        : persistentLocalCacheFn!();
    firestore = initializeFirestoreFn!(firebaseApp, {
      localCache,
    });
  } catch (error) {
    const errorCode =
      typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "unknown";

    if (errorCode !== "already-exists") {
      console.warn("Failed to initialize Firestore persistence", error);
    }
    firestore = getFirestoreFn(firebaseApp);
  }
} else {
  firestore = getFirestoreFn(firebaseApp);
}

export const initWebAuth = () =>
  initializeAuth(firebaseApp, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
