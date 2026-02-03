/**
 * Date format context - now powered by Jotai atoms
 * This file re-exports the useDateFormat hook for backward compatibility
 */
export { useDateFormat } from '../hooks/useDateFormat';
export type { DateFormatType, TimestampFormatType } from '../hooks/useDateFormat';

// Legacy provider component - no longer needed with Jotai
// Kept for backward compatibility, but does nothing
import type { ReactNode } from 'react';

interface DateFormatProviderProps {
  children: ReactNode;
}

/**
 * @deprecated DateFormatProvider is no longer needed with Jotai.
 * Date format state is now managed via atoms and can be used anywhere without a provider.
 * This component is kept for backward compatibility but simply renders children.
 */
export const DateFormatProvider = ({ children }: DateFormatProviderProps) => {
  return <>{children}</>;
};
