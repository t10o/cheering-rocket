import type { CapacitorConfig } from "@capacitor/cli";
import { networkInterfaces } from "os";

function getLocalIPAddress() {
  const interfaces = networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
  appId: "jp.cheeringrocket",
  appName: "cheering-rocket",
  webDir: "dist",
};

if (process.env.NODE_ENV === "development") {
  const localIP = getLocalIPAddress();

  config = {
    ...baseConfig,
    server: {
      url: `http://${localIP}:8000`,
      cleartext: true,
    },
  };
} else {
  config = { ...baseConfig };
}

export default config;
