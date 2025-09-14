import { type Timestamp } from "firebase/firestore";

export type Run = {
  id: string;
  userId: string;
  distance: number; // km
  duration: number; // minutes
  pace: number; // minutes per km
  date: Timestamp;
  notes?: string;
  weather?: string;
  temperature?: number;
  heartRate?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
