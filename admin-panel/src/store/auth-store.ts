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
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user, token) => {
        localStorage.setItem('admin_token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        localStorage.removeItem('admin_token');
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
        const token = localStorage.getItem('admin_token');
        const storedState = localStorage.getItem('admin-auth-storage');
        
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
        set({ isLoading: false });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
