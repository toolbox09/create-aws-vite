import { create } from "zustand";
import type { MeRes } from "@conmarket/apis";

export type UserRole = "CL-P" | "CL-C" | "PT" | "ADMIN";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (me: MeRes) => void;
  login: () => void;
  logout: () => void;
  toggleLogin: () => void;
}

function hasToken() {
  return !!localStorage.getItem("access_token");
}

function storedUser(): User | null {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: hasToken(),
  user: storedUser(),

  setUser: (me: MeRes) => {
    const user: User = {
      name: me.name,
      email: me.email,
      role: me.role as UserRole,
      avatar: me.avatar_url,
    };
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ isLoggedIn: true, user });
  },

  login: () => {
    set({ isLoggedIn: true, user: storedUser() });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    set({ isLoggedIn: false, user: null });
  },

  toggleLogin: () => {
    const { isLoggedIn, logout, login } = get();
    if (isLoggedIn) {
      logout();
    } else {
      login();
    }
  },
}));
