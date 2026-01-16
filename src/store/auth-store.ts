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
const crossTabSync = new CrossTabSync();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        const storedState = localStorage.getItem('gk-admin-admin-auth-storage');
        
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
      name: 'admin-auth-storage',
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
          crossTabSync.subscribe('admin-auth-storage', (syncedState) => {
            state.syncFromOtherTab(syncedState);
          });
        }
      },
    }
  )
);
