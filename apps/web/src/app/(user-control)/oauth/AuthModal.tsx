'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronDown } from "react-icons/io5"; 

const AuthModal: React.FC = () => {
  const router = useRouter();
  const {
    login,
    register,
    forgotPassword,
    redirectPath,
    user,
    isAuthModalOpen,
    authModalMode,
    setAuthModal,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (user && isAuthModalOpen) {
      setAuthModal(false);
      router.push(redirectPath || '/');
    }
  }, [user, isAuthModalOpen, redirectPath, router, setAuthModal]);

  const handleClose = () => {
    setAuthModal(false);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email tidak valid')
      .required('Email wajib diisi'),
    password:
      mode !== 'forgot'
        ? Yup.string()
            .min(6, 'Minimal 6 karakter')
            .required('Kata sandi wajib diisi')
        : Yup.string(),
    username:
      mode === 'register'
        ? Yup.string().required('Username wajib diisi')
        : Yup.string(),
    confirmPassword:
      mode === 'register'
        ? Yup.string()
            .oneOf([Yup.ref('password')], 'Sandi tidak cocok')
            .required('Konfirmasi sandi wajib diisi')
        : Yup.string(),
    role:
      mode === 'register'
        ? Yup.string().required('Role wajib diisi')
        : Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
      role: 'user',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (mode === 'login') {
          const success = await login(values.email, values.password);

          if (success) {
            toast.success('Login Berhasil', {
              description: 'Selamat datang kembali!',
            });
            setAuthModal(false);
            router.push(redirectPath || '/');
          } else {
            toast.error('Login Gagal', {
              description: 'Periksa kembali data Anda.',
            });
          }
        } else if (mode === 'register') {
          const success = await register(
            values.email,
            values.password,
            values.username,
            values.role as 'superadmin' | 'admin' | 'user'
          );

          if (success) {
            toast.success('Registrasi Berhasil', {
              description: 'Akun Anda telah siap! Silakan masuk.',
            });
            handleSwitchMode('login');
          } else {
            toast.error('Registrasi Gagal', {
              description: 'Email mungkin sudah terdaftar.',
            });
          }
        } else if (mode === 'forgot') {
          const success = await forgotPassword(values.email);
          if (success) {
            toast.info('Reset Link Sent', {
              description: `Link reset dikirim ke ${values.email}`,
            });
            handleSwitchMode('login');
          } else {
            toast.error('Gagal Mengirim Link Reset', {
              description: 'Terjadi kesalahan sistem.',
            });
          }
        }
      } catch {
        toast.error('Error', {
          description: 'Terjadi kesalahan sistem.',
        });
      }
    },
  });

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    formik.resetForm();
    setAuthModal(true, newMode, redirectPath);
  };

  if (!mounted || !isAuthModalOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
      onClick={handleClose}
    >
      <div
        className="min-h-full flex items-center justify-center p-4 sm:p-8 py-8 sm:py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-[480px] bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer absolute top-4 right-4 sm:top-6 sm:right-6 text-black hover:scale-110 transition-transform"
            aria-label="Tutup"
          >
            <FaTimes className="text-2xl sm:text-3xl" />
          </button>

          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tighter uppercase mb-1">
              Sleep. 
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-black opacity-40 uppercase tracking-[0.4em]">
              {mode === 'login'
                ? 'Authentication'
                : mode === 'register'
                  ? 'Registration'
                  : 'Recovery'}
            </p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4 sm:space-y-5"
          >
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest ml-1">
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                placeholder="Masukkan email"
                className={`w-full bg-stone-50 border-2 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 text-black placeholder:text-black/30 placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all font-bold text-sm sm:text-base ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : ''
                }`}
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-[10px] font-black ml-1 uppercase">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest ml-1">
                  USERNAME
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder="Masukkan username"
                  className={`w-full bg-stone-50 border-2 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 text-black placeholder:text-black/30 placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all font-bold text-sm sm:text-base ${
                    formik.touched.username && formik.errors.username
                      ? 'border-red-500'
                      : ''
                  }`}
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
                {formik.touched.username && formik.errors.username && (
                  <div className="text-red-500 text-[10px] font-black ml-1 uppercase">
                    {formik.errors.username}
                  </div>
                )}
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="space-y-1.5 sm:space-y-2 relative">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest">
                    KATA SANDI
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="cursor-pointer text-[10px] font-black text-blue-600 hover:underline uppercase"
                    >
                      Lupa Sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    className={`w-full bg-stone-50 border-2 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 pr-12 text-black placeholder:text-black/30 placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all font-bold text-sm sm:text-base ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-500'
                        : ''
                    }`}
                    onChange={formik.handleChange}
                    value={formik.values.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-black/60 hover:text-black focus:outline-none shrink-0"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-xl" />
                    ) : (
                      <FaEye className="text-xl" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-[10px] font-black ml-1 uppercase">
                    {formik.errors.password}
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="space-y-1.5 sm:space-y-2 relative">
                  <label className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest ml-1">
                    KONFIRMASI KATA SANDI
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Masukkan kembali kata sandi"
                      className={`w-full bg-stone-50 border-2 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 pr-12 text-black placeholder:text-black/30 placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all font-bold text-sm sm:text-base ${
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                      onChange={formik.handleChange}
                      value={formik.values.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-black/60 hover:text-black focus:outline-none shrink-0"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-xl" />
                      ) : (
                        <FaEye className="text-xl" />
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <div className="text-red-500 text-[10px] font-black ml-1 uppercase">
                        {formik.errors.confirmPassword}
                      </div>
                    )}
                </div>
<div className="space-y-2">
  <label className="block ml-1 text-[11px] font-black text-black uppercase tracking-[0.18em]">
    PILIH ROLE
  </label>

  <div className="relative">
    <select
      name="role"
      className="cursor-pointer appearance-none w-full h-[60px] bg-stone-50 border-2 border-black rounded-2xl px-5 pr-14 text-black font-black text-[15px] focus:outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all"
      onChange={formik.handleChange}
      value={formik.values.role}
    >
      <option value="user">USER</option>
      <option value="admin">ADMIN</option>
    </select>

    <IoChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-black text-lg" />
  </div>
</div>
              </>
            )}

            <div className="pt-2">
              <button
                disabled={formik.isSubmitting}
                type="submit"
                className="cursor-pointer w-full bg-[#ffcc00] hover:bg-black hover:text-white text-black font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em]"
              >
                {formik.isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  'Masuk'
                ) : mode === 'register' ? (
                  'Daftar'
                ) : (
                  'Send Link'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 text-center space-y-4 sm:space-y-6">
            {mode !== 'forgot' && (
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/40">
                {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                <button
                  type="button"
                  onClick={() =>
                    handleSwitchMode(mode === 'login' ? 'register' : 'login')
                  }
                  className="cursor-pointer text-black cursor-pointer font-black hover:underline ml-1"
                >
                  {mode === 'login' ? 'Daftar' : 'Login'}
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/40">
                Kembali ke{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="cursor-pointer text-black font-black hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
