export type Run = {
  id: string;
  userId: string;
  distance: number; // km
  duration: number; // minutes
  pace: number; // minutes per km
  date: any; // Firestore Timestamp
  notes?: string;
  weather?: string;
  temperature?: number;
  heartRate?: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
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
