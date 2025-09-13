export type UserProfile = {
  uid: string;
  name: string;
  photoURL: string;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
};

export type ProfileFormData = {
  name: string;
  photoURL: string | null;
  pendingAvatarFile?: File | null;
  pendingPreviewURL?: string | null;
};
