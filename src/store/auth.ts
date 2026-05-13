import { create } from "zustand";

type User = { name: string; nick: string; email: string; avatar: string };
type AuthState = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}));
