import { registerPlugin } from "@capacitor/core";

type ListenerOptions = { runId: string };

type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  clientTimestamp: number;
};

type RunnerLocationStartOptions = {
  runId: string;
  notificationTitle?: string;
  notificationBody?: string;
  minimumDistanceMeters?: number;
};

type RunnerLocationStartResult = {
  started: boolean;
};

type RunnerLocationStatus = {
  isTracking: boolean;
  hasBackgroundPermission: boolean;
};

export interface RunnerLocationPlugin {
  start(options: RunnerLocationStartOptions): Promise<RunnerLocationStartResult>;
  stop(): Promise<void>;
  getStatus(): Promise<RunnerLocationStatus>;
  addListener(
    eventName: "locationUpdate",
    listenerFunc: (state: LocationPayload) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    eventName: "status",
    listenerFunc: (status: RunnerLocationStatus) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

const RunnerLocationWeb = () =>
  class implements RunnerLocationPlugin {
    private running = false;
    async start(): Promise<RunnerLocationStartResult> {
      this.running = true;
      return { started: true };
    }

    async stop(): Promise<void> {
      this.running = false;
    }

    async getStatus(): Promise<RunnerLocationStatus> {
      return {
        isTracking: this.running,
        hasBackgroundPermission: true,
      };
    }

    async addListener() {
      return {
        remove: async () => undefined,
      };
    }
  };

export const RunnerLocation = registerPlugin<RunnerLocationPlugin>(
  "RunnerLocation",
  {
    web: RunnerLocationWeb,
  },
);

export type { RunnerLocationStartOptions, RunnerLocationStatus, LocationPayload };
