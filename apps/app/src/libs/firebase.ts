import { initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(firestore).catch((error) => {
    const errorCode =
      typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "unknown";

    if (errorCode !== "failed-precondition") {
      console.warn("Failed to enable Firestore persistence", error);
    }
  });
}

export const initWebAuth = () =>
  initializeAuth(firebaseApp, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
