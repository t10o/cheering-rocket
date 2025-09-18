const isTest = typeof process !== "undefined" && Boolean(process.env.VITEST);

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const required = (value: string | undefined, name: string) => {
  if (!value) {
    if (isTest) {
      return `test-${name.toLowerCase()}`;
    }
    throw new Error(`${name} is required. Set ${name} in your environment variables.`);
  }
  return value;
};

export const env = {
  firebase: {
    apiKey: required(import.meta.env.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
    authDomain: required(
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      "VITE_FIREBASE_AUTH_DOMAIN",
    ),
    projectId: required(
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
      "VITE_FIREBASE_PROJECT_ID",
    ),
    appId: required(import.meta.env.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID"),
    messagingSenderId: required(
      import.meta.env.VITE_FIREBASE_SENDER_ID,
      "VITE_FIREBASE_SENDER_ID",
    ),
  },
  googleMapsApiKey: required(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    "VITE_GOOGLE_MAPS_API_KEY",
  ),
  functionsRegion:
    import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? "asia-northeast1",
  functionsEmulatorOrigin: import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_ORIGIN,
  pollingIntervalMs: toNumber(import.meta.env.VITE_CHEER_POLLING_INTERVAL_MS, 15000),
  historicalPointsWindow:
    toNumber(import.meta.env.VITE_CHEER_HISTORICAL_POINTS_WINDOW, 50),
  webBaseUrl: import.meta.env.VITE_CHEER_WEB_BASE_URL,
};
