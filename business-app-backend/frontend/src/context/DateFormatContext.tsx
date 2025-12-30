import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type DateFormatType = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimestampFormatType = 'DD.MM.YYYY HH:mm:ss' | 'MM/DD/YYYY HH:mm:ss' | 'YYYY-MM-DD HH:mm:ss';

interface DateFormatContextType {
  dateFormat: DateFormatType;
  setDateFormat: (format: DateFormatType) => void;
  timestampFormat: TimestampFormatType;
  setTimestampFormat: (format: TimestampFormatType) => void;
  formatDate: (date: Date) => string;
  formatTimestamp: (date: Date | string) => string;
  parseDate: (dateString: string) => Date | null;
  getDatePattern: () => RegExp;
  getPlaceholder: () => string;
  getTimestampPlaceholder: () => string;
}

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

export const useDateFormat = () => {
  const context = useContext(DateFormatContext);
  if (!context) {
    throw new Error('useDateFormat must be used within DateFormatProvider');
  }
  return context;
};

interface DateFormatProviderProps {
  children: ReactNode;
}

export const DateFormatProvider = ({ children }: DateFormatProviderProps) => {
  const [dateFormat, setDateFormat] = useState<DateFormatType>('DD.MM.YYYY');
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormatType>('DD.MM.YYYY HH:mm:ss');

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${day}.${month}.${year}`;
    }
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    let day: string, month: string, year: string;

    switch (dateFormat) {
      case 'DD.MM.YYYY': {
        const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (!match) return null;
        [, day, month, year] = match;
        break;
      }
      case 'MM/DD/YYYY': {
        const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return null;
        [, month, day, year] = match;
        break;
      }
      case 'YYYY-MM-DD': {
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;
        [, year, month, day] = match;
        break;
      }
      default:
        return null;
    }

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Validate the date is valid
    if (
      date.getFullYear() !== parseInt(year) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)
    ) {
      return null;
    }

    return date;
  };

  const getDatePattern = (): RegExp => {
    switch (dateFormat) {
      case 'DD.MM.YYYY':
        return /^\d{2}\.\d{2}\.\d{4}$/;
      case 'MM/DD/YYYY':
        return /^\d{2}\/\d{2}\/\d{4}$/;
      case 'YYYY-MM-DD':
        return /^\d{4}-\d{2}-\d{2}$/;
      default:
        return /^\d{2}\.\d{2}\.\d{4}$/;
    }
  };

  const getPlaceholder = (): string => {
    switch (dateFormat) {
      case 'DD.MM.YYYY':
        return '20.02.2024';
      case 'MM/DD/YYYY':
        return '02/20/2024';
      case 'YYYY-MM-DD':
        return '2024-02-20';
      default:
        return '20.02.2024';
    }
  };

  const formatTimestamp = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!dateObj || isNaN(dateObj.getTime())) {
      return '';
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;

    switch (timestampFormat) {
      case 'DD.MM.YYYY HH:mm:ss':
        return `${day}.${month}.${year} ${time}`;
      case 'MM/DD/YYYY HH:mm:ss':
        return `${month}/${day}/${year} ${time}`;
      case 'YYYY-MM-DD HH:mm:ss':
        return `${year}-${month}-${day} ${time}`;
      default:
        return `${day}.${month}.${year} ${time}`;
    }
  };

  const getTimestampPlaceholder = (): string => {
    switch (timestampFormat) {
      case 'DD.MM.YYYY HH:mm:ss':
        return '20.02.2024 14:30:45';
      case 'MM/DD/YYYY HH:mm:ss':
        return '02/20/2024 14:30:45';
      case 'YYYY-MM-DD HH:mm:ss':
        return '2024-02-20 14:30:45';
      default:
        return '20.02.2024 14:30:45';
    }
  };

  return (
    <DateFormatContext.Provider
      value={{
        dateFormat,
        setDateFormat,
        timestampFormat,
        setTimestampFormat,
        formatDate,
        formatTimestamp,
        parseDate,
        getDatePattern,
        getPlaceholder,
        getTimestampPlaceholder,
      }}
    >
      {children}
    </DateFormatContext.Provider>
  );
};
