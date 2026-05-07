import { create } from "zustand";
import { AppUser } from "@/types/user";
import { getCurrentAppUser, logoutUser } from "@/lib/authService";

interface AuthState {
  user: AppUser | null;
  hydrated: boolean;
  setUser: (user: AppUser | null) => void;
  restoreSession: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  restoreSession: () => {
    const user = getCurrentAppUser();
    set({ user, hydrated: true });
  },
  logout: () => {
    void logoutUser();
    set({ user: null });
  },
}));
