import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { dateFormatAtom, timestampFormatAtom } from '../atoms';
import type { DateFormatType, TimestampFormatType } from '../atoms';

/**
 * Date format hook using Jotai atoms
 */
export const useDateFormat = () => {
  const [dateFormat, setDateFormatAtom] = useAtom(dateFormatAtom);
  const [timestampFormat, setTimestampFormatAtom] = useAtom(timestampFormatAtom);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('timestampFormat', timestampFormat);
  }, [timestampFormat]);

  const setDateFormat = useCallback((format: DateFormatType) => {
    setDateFormatAtom(format);
  }, [setDateFormatAtom]);

  const setTimestampFormat = useCallback((format: TimestampFormatType) => {
    setTimestampFormatAtom(format);
  }, [setTimestampFormatAtom]);

  const formatDate = useCallback((date: Date): string => {
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
  }, [dateFormat]);

  const formatTimestamp = useCallback((date: Date | string): string => {
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
  }, [timestampFormat]);

  const parseDate = useCallback((dateString: string): Date | null => {
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

    if (
      date.getFullYear() !== parseInt(year) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)
    ) {
      return null;
    }

    return date;
  }, [dateFormat]);

  const getDatePattern = useCallback((): RegExp => {
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
  }, [dateFormat]);

  const getPlaceholder = useCallback((): string => {
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
  }, [dateFormat]);

  const getTimestampPlaceholder = useCallback((): string => {
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
  }, [timestampFormat]);

  return {
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
  };
};

export type { DateFormatType, TimestampFormatType };
