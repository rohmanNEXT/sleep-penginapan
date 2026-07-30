import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ID' | 'EN' | 'JP' | 'KR';
export type Currency = 'IDR' | 'USD' | 'SGD' | 'EUR' | 'JPY' | 'KRW';
export type Theme = 'light' | 'dark';

interface SettingsState {
  language: Language;
  currency: Currency;
  theme: Theme;
  country: string;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  setTheme: (theme: Theme) => void;
  setCountry: (country: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ID',
      currency: 'IDR',
      theme: 'light',
      country: 'Indonesia',
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setCountry: (country) => set({ country }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
