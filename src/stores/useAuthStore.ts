'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthCredentials {
  token: string;
  refreshToken?: string;
  agentCode?: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  agentCode: string | null;
  phone: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setCredentials: (creds: AuthCredentials) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  agentCode: null,
  phone: null,
  isAuthenticated: false,
};

/**
 * Auth store — persisted to **sessionStorage**.
 * Token được clear khi đóng tab/trình duyệt để tăng an toàn.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCredentials: ({ token, refreshToken, agentCode, phone }) =>
        set({
          token,
          refreshToken: refreshToken ?? null,
          agentCode: agentCode ?? null,
          phone: phone ?? null,
          isAuthenticated: true,
        }),

      setToken: (token) => set({ token, isAuthenticated: true }),

      logout: () => set({ ...initialState }),
    }),
    {
      name: 'mkk-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Chỉ persist payload — bỏ qua các action reference
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        agentCode: state.agentCode,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
