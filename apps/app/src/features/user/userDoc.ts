import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { firebaseApp } from "@/libs/firebase";

export type UserDoc = {
  uid: string;
  name: string;
  photoURL: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

export async function ensureUserDocument() {
  const auth = getAuth(firebaseApp);
  const u = auth.currentUser;
  if (!u) return;

  const db = getFirestore(firebaseApp);
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);

  // 表示名・アイコン（nullの場合は空文字で揃える）
  const name = u.displayName ?? "";
  const photoURL = u.photoURL ?? "";

  if (!snap.exists()) {
    const payload: UserDoc = {
      uid: u.uid,
      name,
      photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } else {
    // 既存ドキュメントがある場合は最小限の同期だけ
    await setDoc(
      ref,
      { name, photoURL, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}
