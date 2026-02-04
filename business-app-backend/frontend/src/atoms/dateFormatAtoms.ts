import { atom } from 'jotai';

export type DateFormatType = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimestampFormatType = 'DD.MM.YYYY HH:mm:ss' | 'MM/DD/YYYY HH:mm:ss' | 'YYYY-MM-DD HH:mm:ss';

// Get initial values from localStorage
const getInitialDateFormat = (): DateFormatType => {
  if (typeof window === 'undefined') return 'DD.MM.YYYY';
  const saved = localStorage.getItem('dateFormat');
  if (saved === 'DD.MM.YYYY' || saved === 'MM/DD/YYYY' || saved === 'YYYY-MM-DD') {
    return saved;
  }
  return 'DD.MM.YYYY';
};

const getInitialTimestampFormat = (): TimestampFormatType => {
  if (typeof window === 'undefined') return 'DD.MM.YYYY HH:mm:ss';
  const saved = localStorage.getItem('timestampFormat');
  if (saved === 'DD.MM.YYYY HH:mm:ss' || saved === 'MM/DD/YYYY HH:mm:ss' || saved === 'YYYY-MM-DD HH:mm:ss') {
    return saved;
  }
  return 'DD.MM.YYYY HH:mm:ss';
};

// Base atoms
export const dateFormatAtom = atom<DateFormatType>(getInitialDateFormat());
export const timestampFormatAtom = atom<TimestampFormatType>(getInitialTimestampFormat());
