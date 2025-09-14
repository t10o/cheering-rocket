import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { firebaseApp } from "../../../libs/firebase";

const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
};
