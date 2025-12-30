import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthTokens, LoginCredentials, AuthState } from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedTokens = localStorage.getItem('authTokens');
        if (savedTokens) {
          const tokens: AuthTokens = JSON.parse(savedTokens);

          // Check if token is expired
          if (authService.isTokenExpired(tokens.accessToken)) {
            // Try to refresh
            try {
              const newTokens = await authService.refreshToken(tokens.refreshToken);
              localStorage.setItem('authTokens', JSON.stringify(newTokens));

              const user = await authService.getCurrentUser(newTokens.accessToken);
              setState({
                user,
                tokens: newTokens,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch {
              // Refresh failed, clear auth
              localStorage.removeItem('authTokens');
              setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            // Token still valid
            const user = await authService.getCurrentUser(tokens.accessToken);
            setState({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, tokens } = await authService.login(credentials);

      // Save tokens to localStorage
      localStorage.setItem('authTokens', JSON.stringify(tokens));

      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();

      // Clear tokens from localStorage
      localStorage.removeItem('authTokens');

      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
