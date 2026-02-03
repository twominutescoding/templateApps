import { atom } from 'jotai';
import type { User, AuthTokens } from '../types/auth';

// Helper to safely parse JSON
const safeParseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

// Get initial values from localStorage (compatible with authService format)
const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getInitialRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return safeParseJSON<User | null>(userStr, null);
};

// Base atoms with initial values from localStorage
export const tokenAtom = atom<string | null>(getInitialToken());
export const refreshTokenAtom = atom<string | null>(getInitialRefreshToken());
export const userAtom = atom<User | null>(getInitialUser());

// Derived atom for tokens object
export const tokensAtom = atom<AuthTokens | null>(
  (get) => {
    const accessToken = get(tokenAtom);
    const refreshToken = get(refreshTokenAtom);
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  }
);

// Derived atom for authentication status
export const isAuthenticatedAtom = atom<boolean>(
  (get) => {
    const token = get(tokenAtom);
    const user = get(userAtom);
    return !!token && !!user;
  }
);

// Loading state atom
export const isLoadingAtom = atom<boolean>(true);

// Combined auth state atom (for compatibility)
export const authStateAtom = atom(
  (get) => ({
    user: get(userAtom),
    tokens: get(tokensAtom),
    isAuthenticated: get(isAuthenticatedAtom),
    isLoading: get(isLoadingAtom),
  })
);
