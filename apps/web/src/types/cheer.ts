export type GeoPoint = {
  latitude: number;
  longitude: number;
  timestamp?: string;
};

export type RunnerProfile = {
  runId: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
};

export type CheerMessage = {
  id: string;
  runId: string;
  senderName: string;
  senderType: "runner" | "supporter" | "system";
  message: string;
  timestamp: string;
};

export type RunnerSnapshot = {
  profile: RunnerProfile;
  lastKnownLocation?: GeoPoint;
  path: GeoPoint[];
  totalDistanceMeters?: number;
  isActive: boolean;
  updatedAt: string;
};

export type CheerSession = {
  eventId: string;
  eventName: string;
  runners: RunnerSnapshot[];
  messages: CheerMessage[];
  updatedAt: string;
};

export type PostCheerMessagePayload = {
  eventId: string;
  runId?: string;
  senderName: string;
  message: string;
};

export type PostCheerMessageResponse = {
  messageId: string;
  deliveredTo: string[];
};

export type CheerSessionRequest = {
  eventId: string;
  cursor?: string;
};

export type CheerSessionResponse = {
  session: CheerSession;
  cursor: string;
};
