'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { setCookie, getCookie, eraseCookie } from '@/lib/cookies';

interface User {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  address?: string;
  tanggalLahir?: string;
  balance?: {
    id: string;
    saldo: number;
  };
  // FE-compat aliases
  name?: string;
  avatar?: string;
  phone?: string;
  wallet?: number;
  age?: number;
  referral?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  redirectPath: string | null;
  setUser: (user: User | null) => void;
  setAuthModal: (
    open: boolean,
    mode?: 'login' | 'register' | 'forgot',
    redirectPath?: string | null,
  ) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: 'superadmin' | 'admin' | 'user',
    referral?: string,
  ) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  keepLogin: () => Promise<void>;
}

const mapUser = (u: any): User => ({
  ...u,
  name: u.nama,
  wallet: u.balance ? Number(u.balance.saldo) : 0,
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9aJdfomksLSUzsOIqf80Q7RnOoWR4IdTmqLKgBIy3NhEoaZVBBfmWouirf-woG3Vrq-PhjlhxTpqXWaWOpz57twV4k-oxGpl5DrY6Kd_IBmEBKNESuB03Y_1WkwMoG4xPNaJr0EI_DXCwbztXVU1kKvlrxBI3ej40FvJ-H1PKON-8ER7-IxPM8Pn5UnONN5rq9k5yct2XdcD4g-htatZ8igZemQg8Dk-_xDTlGclNl9C-s5ajUTjW0ZgDaYb493IUWwI1VoE8weE',
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthModalOpen: false,
      authModalMode: 'login',
      redirectPath: null,
      setUser: (user) => set({ user }),
      setAuthModal: (open, mode = 'login', redirectPath = null) =>
        set({ isAuthModalOpen: open, authModalMode: mode, redirectPath }),

      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const mappedUser = mapUser(data.user);
          setCookie('auth_token', data.token, 1);
          set({ user: mappedUser, token: data.token });
          return true;
        } catch (error: any) {
          console.error(
            'Login error:',
            error?.response?.data?.message || error.message,
          );
          return false;
        }
      },

      register: async (email, password, name, role = 'user') => {
        try {
          await api.post('/auth/register', {
            nama: name,
            username:
              name.toLowerCase().replace(/\s+/g, '_') +
              '_' +
              Date.now().toString(36),
            email,
            password,
            role,
          });
          return true;
        } catch (error: any) {
          console.error(
            'Register error:',
            error?.response?.data?.message || error.message,
          );
          return false;
        }
      },

      forgotPassword: async (email) => {
        try {
          await api.post('/auth/forgot-password', { email });
          return true;
        } catch (error: any) {
          console.error(
            'Forgot password error:',
            error?.response?.data?.message || error.message,
          );
          return false;
        }
      },

      logout: () => {
        eraseCookie('auth_token');
        set({ user: null, token: null });
      },

      keepLogin: async () => {
        try {
          const token = get().token || getCookie('auth_token');
          if (!token) return;

          const { data } = await api.get('/auth/keep-login', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const mappedUser = mapUser(data.user);
          setCookie('auth_token', data.token, 1);
          set({ user: mappedUser, token: data.token });
        } catch {
          // Token invalid/expired — clear session
          eraseCookie('auth_token');
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
