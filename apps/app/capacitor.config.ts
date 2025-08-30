import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cheering.rocket",
  appName: "CheeringRocket",
  webDir: "dist",
  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com", "apple.com"],
      skipNativeAuth: false,
    },
  },
};

export default config;
