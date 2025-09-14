import { type Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  name: string;
  photoURL: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ProfileFormData = {
  name: string;
  photoURL: string | null;
  pendingAvatarFile?: File | null;
  pendingPreviewURL?: string | null;
};
