'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { keepLogin, isAuthModalOpen } = useAuthStore();

  useEffect(() => {
    keepLogin();
  }, [keepLogin]);

  return (
    <>
      {children}
      {isAuthModalOpen && <AuthModal />}
    </>
  );
};

export default AuthProvider;
