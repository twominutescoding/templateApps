/**
 * Auth context - now powered by Jotai atoms
 * This file re-exports the useAuth hook for backward compatibility
 */
export { useAuth } from '../hooks/useAuth';

// Legacy provider component - no longer needed with Jotai
// Kept for backward compatibility, but does nothing
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * @deprecated AuthProvider is no longer needed with Jotai.
 * Auth state is now managed via atoms and can be used anywhere without a provider.
 * This component is kept for backward compatibility but simply renders children.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <>{children}</>;
};
