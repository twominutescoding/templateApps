import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  tokenAtom,
  refreshTokenAtom,
  userAtom,
  isAuthenticatedAtom,
  isLoadingAtom,
} from '../atoms';
import type { User, LoginCredentials } from '../types/auth';
import * as authService from '../services/authService';
import { logError } from '../utils/logger';

// Global flag to prevent multiple initializations across components
let globalInitStarted = false;

/**
 * Auth hook using Jotai atoms
 * Replaces the old AuthContext
 */
export const useAuth = () => {
  const [token, setToken] = useAtom(tokenAtom);
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const localInitRef = useRef(false);

  // Initialize auth state on mount - only once globally
  useEffect(() => {
    if (globalInitStarted || localInitRef.current) {
      return;
    }
    localInitRef.current = true;
    globalInitStarted = true;

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedToken && storedRefreshToken) {
          if (authService.isTokenExpired(storedToken)) {
            // Token expired, try to refresh
            try {
              const newTokens = await authService.refreshToken(storedRefreshToken);
              const userData = await authService.getCurrentUser(newTokens.accessToken);

              setToken(newTokens.accessToken);
              setRefreshToken(newTokens.refreshToken);
              setUser(userData);
            } catch {
              // Refresh failed, clear everything
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setToken(null);
              setRefreshToken(null);
              setUser(null);
            }
          } else {
            // Token valid, load user if needed
            if (!user) {
              try {
                const userData = await authService.getCurrentUser(storedToken);
                setUser(userData);
              } catch {
                // Keep existing localStorage state
              }
            }
          }
        }
      } catch (error) {
        logError('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Empty deps - runs once on mount

  const login = useCallback(async (credentials: LoginCredentials) => {
    // authService.login handles localStorage
    const { user: userData, tokens } = await authService.login(credentials);

    // Update atoms to trigger re-renders
    setToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userData);
    setIsLoading(false);
  }, [setToken, setRefreshToken, setUser, setIsLoading]);

  const logout = useCallback(async () => {
    try {
      // authService.logout handles localStorage
      await authService.logout();
    } catch (error) {
      logError('Logout error:', error);
    }

    // Clear atoms
    setToken(null);
    setRefreshToken(null);
    setUser(null);

    // Reset for next login
    globalInitStarted = false;
  }, [setToken, setRefreshToken, setUser]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [setUser]);

  return {
    user,
    tokens: token && refreshToken ? { accessToken: token, refreshToken } : null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };
};
