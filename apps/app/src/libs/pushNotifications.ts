import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

import { captureException } from "./sentry";

let cachedToken: string | null | undefined;

const isNative = Capacitor.isNativePlatform();

const requestPermission = async () => {
  const status = await PushNotifications.checkPermissions();
  if (status.receive === "granted") return true;
  if (status.receive === "prompt") {
    const result = await PushNotifications.requestPermissions();
    return result.receive === "granted";
  }
  return false;
};

export const getDevicePushToken = async (): Promise<string | null> => {
  if (!isNative) return null;
  if (cachedToken !== undefined) {
    return cachedToken ?? null;
  }

  try {
    const granted = await requestPermission();
    if (!granted) {
      cachedToken = null;
      return null;
    }

    cachedToken = await new Promise<string | null>((resolve, reject) => {
      let resolved = false;

      const cleanup = async () => {
        await Promise.all([
          registrationListener.then((listener) => listener.remove()),
          errorListener.then((listener) => listener.remove()),
        ]);
      };

      const registrationListener = PushNotifications.addListener(
        "registration",
        async (token) => {
          if (resolved) return;
          resolved = true;
          await cleanup();
          resolve(token.value);
        },
      );

      const errorListener = PushNotifications.addListener(
        "registrationError",
        async (error) => {
          if (resolved) return;
          resolved = true;
          await cleanup();
          reject(error);
        },
      );

      PushNotifications.register().catch(async (error) => {
        if (resolved) return;
        resolved = true;
        await cleanup();
        reject(error);
      });
    });

    return cachedToken ?? null;
  } catch (error) {
    captureException(error, "Push token registration error");
    cachedToken = null;
    return null;
  }
};

export const resetCachedPushToken = () => {
  cachedToken = undefined;
};
