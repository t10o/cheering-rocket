import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
} from "firebase/auth";

import { firebaseApp, initWebAuth } from "@/libs/firebase";

const auth = getAuth(firebaseApp) ?? initWebAuth();

const ensureWebSessionFromGoogle = async (idToken?: string | null) => {
  if (!idToken) return;

  const cred = GoogleAuthProvider.credential(idToken);

  await signInWithCredential(auth, cred);
};

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

export const signInWithGoogle = async () => {
  const { user, credential } = await FirebaseAuthentication.signInWithGoogle();

  if (Capacitor.getPlatform() !== "web") {
    await ensureWebSessionFromGoogle(credential?.idToken ?? null);
  }

  return user;
};

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
