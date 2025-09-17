import { registerPlugin } from "@capacitor/core";

export type BackgroundPermissionStatus = {
  hasBackgroundPermission: boolean;
};

export interface BackgroundPermissionPlugin {
  check(): Promise<BackgroundPermissionStatus>;
}

class BackgroundPermissionWeb implements BackgroundPermissionPlugin {
  async check(): Promise<BackgroundPermissionStatus> {
    return { hasBackgroundPermission: true };
  }
}

export const BackgroundPermission = registerPlugin<BackgroundPermissionPlugin>(
  "BackgroundPermission",
  {
    web: new BackgroundPermissionWeb(),
  },
);
