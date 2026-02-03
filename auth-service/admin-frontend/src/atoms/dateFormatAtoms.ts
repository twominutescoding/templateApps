import { atomWithStorage } from 'jotai/utils';

export type DateFormatType = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimestampFormatType = 'DD.MM.YYYY HH:mm:ss' | 'MM/DD/YYYY HH:mm:ss' | 'YYYY-MM-DD HH:mm:ss';

// Date format atoms with localStorage persistence
export const dateFormatAtom = atomWithStorage<DateFormatType>('dateFormat', 'DD.MM.YYYY');
export const timestampFormatAtom = atomWithStorage<TimestampFormatType>('timestampFormat', 'DD.MM.YYYY HH:mm:ss');
