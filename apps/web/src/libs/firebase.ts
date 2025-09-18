import { initializeApp } from "firebase/app";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";

import { env } from "@/config/env";

export const firebaseApp = initializeApp({
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  appId: env.firebase.appId,
  messagingSenderId: env.firebase.messagingSenderId,
});

export const functions = getFunctions(firebaseApp, env.functionsRegion);

if (import.meta.env.DEV && env.functionsEmulatorOrigin) {
  const emulatorUrl = new URL(env.functionsEmulatorOrigin);
  connectFunctionsEmulator(
    functions,
    emulatorUrl.hostname,
    Number.parseInt(emulatorUrl.port || "5001", 10),
  );
}

export const callFunction = async <TResult = unknown, TPayload = unknown>(
  name: string,
  payload: TPayload,
): Promise<TResult> => {
  const callable = httpsCallable<TPayload, TResult>(functions, name);
  const result = await callable(payload);
  return result.data;
};
