import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
