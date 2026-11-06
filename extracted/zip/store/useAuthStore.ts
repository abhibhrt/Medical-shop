// store/useAuthStore.ts
import { create } from "zustand";

export interface UserAddress {
  area?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mob_no: string;
  role?: string;
  status?: string;
  is_profile_complete?: boolean;
  address?: UserAddress;
}

interface AuthState {
  isAdmin: boolean;
  user: UserProfile | null;
  loading: boolean;
  setAuth: (user: UserProfile | null) => void;
  clearAuth: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  user: null,
  loading: true,
  setAuth: (user) =>
    set({
      user,
      isAdmin: user?.role === "ADMIN" || user?.role === "SUPERADMIN",
      loading: false,
    }),
  clearAuth: () => set({ user: null, isAdmin: false, loading: false }),
  logout: () => {
    set({ user: null, isAdmin: false, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));