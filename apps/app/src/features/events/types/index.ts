export type Event = {
  id: string;
  name: string;
  plannedAt?: any; // Firestore Timestamp
  note?: string;
  ownerUid: string;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
};

export type EventMember = {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt: any; // Firestore Timestamp
};

export type EventFormData = {
  name: string;
  plannedAt: Date | null;
  note: string;
};
