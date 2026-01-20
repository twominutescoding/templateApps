import type { LoginCredentials, AuthTokens, User, DecodedToken } from '../types/auth';
import { authAPI } from './api';

// Helper to decode JWT
export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

// Login function - connects to auth-service
export const login = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    const response = await authAPI.login({
      username: credentials.email, // Can be either email or username
      password: credentials.password,
      entityCode: 'AUTH_ADMIN', // Auth Service Admin Frontend entity
    });

    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }

    const loginData = response.data;

    // Check if user has ADMIN role
    if (!loginData.roles.includes('ADMIN')) {
      throw new Error('Access denied. ADMIN role required.');
    }

    // Map backend user to frontend user format
    const user: User = {
      id: loginData.username,
      username: loginData.username,
      email: loginData.email || '',
      name: `${loginData.firstName || ''} ${loginData.lastName || ''}`.trim() || loginData.username,
      role: 'admin', // Admin panel only for admins
      roles: loginData.roles,
      avatar: loginData.image || '',
      department: loginData.company || '',
      createdAt: new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: loginData.token,
      refreshToken: loginData.refreshToken,
    };

    // Store tokens in localStorage
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('refreshToken', loginData.refreshToken);

    // Store user with theme and paletteId merged in
    const userWithTheme = {
      ...user,
      theme: loginData.theme,
      paletteId: loginData.paletteId,
    };
    localStorage.setItem('user', JSON.stringify(userWithTheme));

    return { user, tokens };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Invalid username or password');
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Refresh token function
export const refreshToken = async (token: string): Promise<AuthTokens> => {
  try {
    const response = await authAPI.refresh(token);

    if (!response.success) {
      throw new Error(response.message || 'Token refresh failed');
    }

    const refreshData = response.data;

    // Update tokens in localStorage
    localStorage.setItem('token', refreshData.accessToken);
    localStorage.setItem('refreshToken', refreshData.refreshToken);

    return {
      accessToken: refreshData.accessToken,
      refreshToken: refreshData.refreshToken,
    };
  } catch (error: any) {
    console.error('Token refresh error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Token refresh failed');
  }
};

// Get current user from token
export const getCurrentUser = async (token: string): Promise<User> => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    return JSON.parse(savedUser);
  }

  // If no saved user, decode from token
  const decoded = decodeJWT(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }

  // Basic user from token
  return {
    id: decoded.username || decoded.sub || '',
    username: decoded.username || decoded.sub || '',
    email: '',
    name: decoded.username || decoded.sub || 'Admin',
    role: 'admin',
    roles: decoded.roles || ['ADMIN'],
    avatar: '',
    department: '',
    createdAt: new Date().toISOString(),
  };
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  return decoded.exp < Math.floor(Date.now() / 1000);
};
