import { create } from 'zustand';
import type { AuthFormData, AuthMode, AuthStatus, User, CachedUser } from '../types';

const AUTH_USER_KEY = 'gametopup.auth.user';

const defaultAuthForm: AuthFormData = {
  displayName: '',
  email: 'customer01@gametopup.com',
  password: 'Password123!',
};

const readStoredUser = (): CachedUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveStoredUser = (user: CachedUser | null): void => {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // Bỏ qua lỗi localStorage để không ảnh hưởng luồng đăng nhập.
  }
};

/**
 * State xác thực dùng chung cho toàn bộ ứng dụng.
 */
type AuthStore = {
  authForm: AuthFormData;
  authMode: AuthMode;
  authStatus: AuthStatus;

  user: User | null;

  // Thông tin user tối thiểu lưu tạm để giảm nháy giao diện khi F5.
  cachedUser: CachedUser | null;

  setAuthForm: (authForm: AuthFormData) => void;
  setAuthMode: (authMode: AuthMode) => void;
  setAuthStatus: (authStatus: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setCachedUser: (cachedUser: CachedUser | null) => void;
  setGuest: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authForm: defaultAuthForm,
  authMode: 'login',
  authStatus: 'unknown',
  user: null,
  cachedUser: readStoredUser(),

  setAuthForm: (authForm) => set({ authForm }),
  setAuthMode: (authMode) => set({ authMode }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setUser: (user) => set({ user }),

  setCachedUser: (cachedUser) => {
    saveStoredUser(cachedUser);
    set({ cachedUser });
  },

  setGuest: () => {
    saveStoredUser(null);

    set({
      authStatus: 'guest',
      user: null,
      cachedUser: null,
    });
  },
}));