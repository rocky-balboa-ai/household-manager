import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
  language: string;
  altLanguage: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (data: { userId?: string; email?: string; pin: string }) => Promise<void>;
  logout: () => void;
  setLanguage: (language: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const { access_token, user } = await api.login(email, password);
        api.setToken(access_token);
        socketClient.connect(user.id, user.name);
        set({ user, token: access_token, isAuthenticated: true });
      },

      loginWithPin: async (data) => {
        const { access_token, user } = await api.verifyPin(data);
        api.setToken(access_token);
        socketClient.connect(user.id, user.name);
        set({ user, token: access_token, isAuthenticated: true });
      },

      logout: () => {
        api.setToken(null);
        socketClient.disconnect();
        set({ user: null, token: null, isAuthenticated: false });
      },

      setLanguage: (language: string) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, language } });
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.setToken(state.token);
          if (state.user) {
            socketClient.connect(state.user.id, state.user.name);
          }
        }
      },
    }
  )
);
