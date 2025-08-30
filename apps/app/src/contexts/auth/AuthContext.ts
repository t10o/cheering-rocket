import { createContext } from "react";
import type { User } from "firebase/auth";

type AuthContext = { user: User | null; loading: boolean };

export const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
});
