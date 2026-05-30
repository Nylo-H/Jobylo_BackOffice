import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MeResponse } from '../types/user';

interface AuthState {
  user: MeResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAuth: (user: MeResponse, accessToken: string) => void;
  setUser: (user: MeResponse) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,

      setAuth: (user: MeResponse, accessToken: string) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isLoading: false,
        });
      },

      setUser: (user: MeResponse) => {
        set({ user, isAdmin: user.role === 'ADMIN' });
      },

      setAccessToken: (accessToken: string) => {
        set({ accessToken });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'jobylo-auth',
      partialize: (state: AuthState) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);