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
  return "127.0.0.1"; // Fallback to localhost
}

const localIP = getLocalIPAddress();

const config: CapacitorConfig = {
  appId: "jp.cheeringrocket",
  appName: "cheering-rocket",
  webDir: "dist",
  server: {
    url: `http://${localIP}:8000`,
    cleartext: true,
  },
};

export default config;
