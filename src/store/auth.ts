import { create } from "zustand";
import { persist } from "zustand/middleware";

const syncSessionAuth = (user: User | null, token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    sessionStorage.setItem("token", token);
  } else {
    sessionStorage.removeItem("token");
  }

  if (user) {
    sessionStorage.setItem("username", user.name || user.login || "");
    sessionStorage.setItem("user_data", JSON.stringify(user));
  } else {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_data");
  }
};

type User = {
  id: number;
  name: string;
  email: string;
  login: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        syncSessionAuth(user, token);
        set({ user, token });
      },
      logout: () => {
        syncSessionAuth(null, null);
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // Nome da chave no localStorage
    }
  )
);
