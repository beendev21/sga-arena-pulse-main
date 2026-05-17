import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
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
  isAdmin: boolean;
  isPlayer: boolean;
  login: (user: User, token: string, playerExists?: boolean) => void;
  logout: () => void;
};

const syncSession = (user: User | null, token: string | null) => {
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

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      isPlayer: false,

      login: (user, token, playerExists = false) => {
        syncSession(user, token);
        set({
          user,
          token,
          isAdmin: user.role === "Administrador",
          isPlayer: user.role === "Jogador" && playerExists,
        });
      },

      logout: () => {
        syncSession(null, null);
        set({ user: null, token: null, isAdmin: false, isPlayer: false });
      },
    }),
    {
      name: "auth-storage",

      // Toda vez que o Zustand carrega do localStorage,
      // recalcula isAdmin e isPlayer a partir do user.role
      // (evita que cache antigo sem isAdmin quebre o acesso)
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const role = state.user?.role ?? "";
        state.isAdmin = role === "Administrador";
        state.isPlayer = role === "Jogador" && state.isPlayer;
      },
    }
  )
);