import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user.types';
import { EnhancedStorage, storageValidators, CrossTabSync } from '@/lib/persistence';

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
  syncFromOtherTab: (state: Partial<AuthState>) => void;
}

// Cross-tab sync instance
const crossTabSync = typeof window !== 'undefined' ? new CrossTabSync() : null;

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
          // Set cookie for middleware
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Remove cookie
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
          const storedState = localStorage.getItem('gk-store-auth-storage');
          
          if (token && storedState) {
            try {
              const parsed = JSON.parse(storedState);
              if (parsed.state?.user && storageValidators.auth(parsed.state)) {
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

      syncFromOtherTab: (newState) => {
        const currentState = get();
        if (storageValidators.auth(newState)) {
          set({
            ...currentState,
            ...newState,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => new EnhancedStorage()),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
          
          // Set up cross-tab sync
          if (crossTabSync) {
            crossTabSync.subscribe('auth-storage', (syncedState) => {
              state.syncFromOtherTab(syncedState);
            });
          }
        }
      },
    }
  )
);
