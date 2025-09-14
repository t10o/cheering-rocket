import { type Timestamp } from "firebase/firestore";

export type Run = {
  id: string;
  userId: string;
  eventId: string; // イベントとの紐付け
  status: RunStatus;
  distance: number; // km
  duration: number; // minutes
  pace: number; // minutes per km
  date: Timestamp;
  startedAt?: Timestamp; // ラン開始時刻
  endedAt?: Timestamp; // ラン終了時刻
  notes?: string;
  weather?: string;
  temperature?: number;
  heartRate?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type RunStatus = "planned" | "active" | "completed" | "cancelled";

export type LocationPoint = {
  id: string;
  runId: string;
  latitude: number;
  longitude: number;
  accuracy: number; // 精度（メートル）
  altitude?: number; // 標高（メートル）
  speed?: number; // 速度（m/s）
  heading?: number; // 方向（度）
  timestamp: Timestamp;
};

export type CheerMessage = {
  id: string;
  runId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
};

export type RunFormData = {
  distance: number;
  duration: number;
  date: Date;
  notes: string;
  weather: string;
  temperature: number | null;
  heartRate: number | null;
};

export type RunStats = {
  totalDistance: number;
  totalRuns: number;
  averagePace: number;
  bestPace: number;
  totalTime: number;
};
