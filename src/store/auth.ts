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
  createdAt?: string | null;
  avatar?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialTwitch?: string | null;
  socialDiscord?: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isPlayer: boolean;
  syncing: boolean;
  login: (user: User, token: string, playerExists?: boolean) => void;
  logout: () => void;
  setSyncing: (v: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      isPlayer: false,
      syncing: true,
      login: (user, _token, playerExists = false) => {
        set({
          user,
          token: null,
          isAdmin: user.role === "Administrador",
          isPlayer: user.role === "Jogador" && playerExists,
          syncing: false,
        });
      },
      logout: () => {
        set({ user: null, token: null, isAdmin: false, isPlayer: false, syncing: false });
      },
      setSyncing: (v) => set({ syncing: v }),
      updateUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : s.user })),
    }),
    {
      name: "sga-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const role = state.user?.role ?? "";
        state.isAdmin = role === "Administrador";
        state.isPlayer = false;
        state.syncing = true;
      },
    }
  )
);

export function mapRole(role: number | undefined): string {
  if (role === 1) return "Administrador";
  return "Jogador";
}
