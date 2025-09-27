import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import * as Sentry from "@sentry/react";
import {
  type Auth,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";

import { ensureUserDocument } from "@/features/user/userDoc";
import { firebaseApp, initWebAuth } from "@/libs/firebase";

const auth = getAuth(firebaseApp) ?? initWebAuth();

let _auth: Auth | null = null;
export function getAuthInstance(): Auth {
  if (_auth) return _auth;

  try {
    _auth = initializeAuth(firebaseApp, {
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (e) {
    _auth = auth;
    const code =
      typeof e === "object" && e && "code" in e
        ? String((e as { code: unknown }).code)
        : null;
    const message =
      typeof e === "object" && e && "message" in e
        ? String((e as { message: unknown }).message)
        : null;

    if (code === "auth/already-initialized") {
      return _auth;
    }

    if (message?.includes("auth/already-initialized")) {
      return _auth;
    }

    Sentry.captureException(e);
  }

  return _auth;
}

const ensureWebSessionFromApple = async (
  idToken?: string | null,
  rawNonce?: string | null,
) => {
  if (!idToken) return;

  const provider = new OAuthProvider("apple.com");
  const cred = provider.credential({
    idToken,
    ...(rawNonce && { rawNonce }),
  });

  await signInWithCredential(auth, cred);
};

export async function signInWithGoogle() {
  const auth = getAuth();

  // Web（ブラウザ）ではそのままポップアップ
  if (!Capacitor.isNativePlatform()) {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return;
  }

  // ネイティブ（Android/iOS）
  // - skipNativeAuth: ネイティブ側での直接ログインをスキップ → credential を Web で使う
  // - useCredentialManager: エミュや未ログイン端末では false 推奨（"No credential available" 回避）
  const { credential } = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true,
    useCredentialManager: false, // ← エミュ/実機で資格情報が無い問題の回避
  });

  if (!credential?.idToken)
    throw new Error("No credential (idToken) from native sign-in");

  const googleCred = GoogleAuthProvider.credential(credential.idToken);
  await signInWithCredential(auth, googleCred);

  await ensureUserDocument();
}

export const signInWithApple = async () => {
  const { user, credential } = await FirebaseAuthentication.signInWithApple();
  if (Capacitor.getPlatform() !== "web") {
    await ensureWebSessionFromApple(
      credential?.idToken ?? null,
      credential?.nonce ?? null,
    );
  }

  return user;
};

export const signOut = async () => {
  await FirebaseAuthentication.signOut();
  await fbSignOut(auth);
};
