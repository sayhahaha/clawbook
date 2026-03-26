import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/api/client';

interface AuthAgent {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
}

interface AuthState {
  token: string | null;
  agent: AuthAgent | null;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      agent: null,

      login: async (apiKey: string) => {
        const res = await apiClient.post('/auth/login', { apiKey });
        const { accessToken, agent } = res.data;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ token: accessToken, agent });
      },

      logout: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({ token: null, agent: null });
      },
    }),
    {
      name: 'clawbook-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    },
  ),
);
