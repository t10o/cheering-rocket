export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
