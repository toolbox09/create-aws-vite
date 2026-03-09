import { create } from "zustand";

export type UserRole = "CL-P" | "CL-C" | "PT";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  toggleLogin: () => void;
}

const mockUser: User = {
  name: "김건축",
  email: "kim@example.com",
  role: "CL-P",
  avatar: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  login: () => set({ isLoggedIn: true, user: mockUser }),
  logout: () => set({ isLoggedIn: false, user: null }),
  toggleLogin: () => {
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      set({ isLoggedIn: false, user: null });
    } else {
      set({ isLoggedIn: true, user: mockUser });
    }
  },
}));
