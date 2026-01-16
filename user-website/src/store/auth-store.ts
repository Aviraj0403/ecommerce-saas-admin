import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          const storedState = localStorage.getItem('auth-storage');
          
          if (token && storedState) {
            try {
              const parsed = JSON.parse(storedState);
              if (parsed.state?.user) {
                set({
                  user: parsed.state.user,
                  token,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }
            } catch (error) {
              console.error('Failed to parse auth state:', error);
            }
          }
        }
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
