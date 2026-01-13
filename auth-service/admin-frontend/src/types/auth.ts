export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  roles: string[];
  avatar?: string;
  department?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string; // Can be username or email
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DecodedToken {
  sub?: string;
  username?: string;
  roles?: string[];
  exp: number;
  iat: number;
}
