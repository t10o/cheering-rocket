import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cheering.rocket",
  appName: "CheeringRocket",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: {
    useLegacyBridge: true,
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com", "apple.com"],
      skipNativeAuth: false,
    },
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: "#00000000",
      statusBarContent: "light",
      navigationBarColor: "#00000000",
      navigationBarContent: "light",
      offset: 0,
    },
    Geolocation: {
      permissions: ["location"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
