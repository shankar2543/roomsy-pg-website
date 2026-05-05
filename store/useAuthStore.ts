import { create } from "zustand";
import { AppUser } from "@/types/user";
import { getSessionUser, logoutDummy } from "@/lib/dummyAuth";

const SESSION_KEY = "roomsy_session";

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
  setUser: (user) => {
    set({ user });
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  },
  restoreSession: () => {
    const user = getSessionUser();
    set({ user: user ?? null, hydrated: true });
  },
  logout: () => {
    logoutDummy();
    set({ user: null });
  },
}));
