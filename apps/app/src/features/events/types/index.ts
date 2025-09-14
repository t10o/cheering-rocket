import { type Timestamp } from "firebase/firestore";

export type Event = {
  id: string;
  name: string;
  plannedAt?: Timestamp;
  note?: string;
  ownerUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type EventMember = {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt: Timestamp;
};

export type EventFormData = {
  name: string;
  plannedAt: Date | null;
  note: string;
};
