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

// Login function - connects to backend
export const login = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    // Backend expects username, but frontend uses email
    // We'll accept both email and username in the login form
    // entityCode is used for multi-application support (defaults to APP001)
    const response = await authAPI.login({
      username: credentials.email, // Can be either email or username
      password: credentials.password,
      entityCode: 'BUSINESS_APP', // Replaced by create-project.js during generation
    });

    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }

    const loginData = response.data;

    // Map backend user to frontend user format
    const user: User = {
      id: loginData.username, // Use username as ID since backend doesn't return numeric ID
      username: loginData.username,
      email: loginData.email || '',
      name: `${loginData.firstName || ''} ${loginData.lastName || ''}`.trim() || loginData.username,
      role: loginData.roles.includes('ADMIN') ? 'admin' :
            loginData.roles.includes('MANAGER') ? 'manager' : 'user',
      roles: loginData.roles || [],
      avatar: loginData.image || '',
      department: loginData.company || '',
      createdAt: new Date().toISOString(), // Backend doesn't provide creation date
      authenticationMethod: loginData.authenticationMethod,
    };

    const tokens: AuthTokens = {
      accessToken: loginData.token,
      refreshToken: loginData.refreshToken,
    };

    // Store tokens in localStorage
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('refreshToken', loginData.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Invalid email or password');
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

    const loginData = response.data;

    // Update tokens in localStorage
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('refreshToken', loginData.refreshToken);

    return {
      accessToken: loginData.token,
      refreshToken: loginData.refreshToken,
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
  const roles = decoded.roles || [];
  return {
    id: decoded.sub || decoded.username || '',
    username: decoded.username || decoded.sub || '',
    email: '',
    name: decoded.sub || decoded.username || 'User',
    role: roles.includes('ADMIN') ? 'admin' :
          roles.includes('MANAGER') ? 'manager' : 'user',
    roles: roles,
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

// Get available mock users (for demo/testing purposes)
export const getMockCredentials = () => {
  return [
    { email: 'admin', password: 'admin123', role: 'admin' },
    { email: 'user', password: 'user123', role: 'user' },
    { email: 'john.doe', password: 'password123', role: 'user' },
    { email: 'jane.smith', password: 'password123', role: 'manager' },
  ];
};
