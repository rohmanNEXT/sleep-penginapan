"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore, Language, Currency } from "@/store/settingsStore";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  FaBars,
  FaTimes,
  FaGlobe,
  FaMoneyBillWave,
  FaBookmark,
  FaArrowRight,
  FaUser,
  FaSignOutAlt,
  FaThLarge,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout, setAuthModal } = useAuthStore();
  const { language, currency, setLanguage, setCurrency } =
    useSettingsStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const langRef = useRef<HTMLButtonElement>(null);
  const currRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastY && currentY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Penginapan", href: "/explore?type=penginapan" },
    { name: "Cupon", href: "/cupon" },
    { name: "Report", href: "/report" },
  ];

  return (
    <header
      className={`sticky top-4 z-50 w-full mb-6 px-4 md:px-8 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <nav className="relative flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-['Space_Grotesk'] font-bold uppercase tracking-tight">
        
        {/* LOGO */}
        <Link
          href="/home"
          className="cursor-pointer text-2xl font-black text-black hover:opacity-80 transition-opacity"
        >
          Sleep.
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden xl:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/home"
                ? pathname === "/home" || pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`cursor-pointer px-5 py-1.5 rounded-full border-[3px] text-xs font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-[#ffcc00] border-black text-black shadow-[2px_2px_0px_0px_black]"
                    : "border-transparent text-black/60 hover:text-black hover:bg-stone-100 hover:border-stone-200"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* RIGHT ACTION */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* LANGUAGE + CURRENCY */}
          <div className="hidden lg:flex items-center gap-1 pr-4 border-r-2 border-black/10">
            
            {/* LANGUAGE */}
            <div className="relative">
              <button
                ref={langRef}
                onClick={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowCurrencyDropdown(false);
                }}
                className="cursor-pointer flex items-center justify-center gap-1 w-15 h-8 px-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-stone-100 transition-all"
              >
                <FaGlobe className="text-sm" />
                <span className="text-[10px] font-black">{language}</span>
              </button>

              {mounted &&
                showLanguageDropdown &&
                createPortal(
                  <div
                    className="fixed z-999 w-32"
                    style={{
                      top: `${
                        langRef.current?.getBoundingClientRect().bottom! + 8
                      }px`,
                      left: `${
                        langRef.current?.getBoundingClientRect().left! - 20
                      }px`,
                    }}
                  >
                    <div className="overflow-hidden bg-white/95 backdrop-blur-xl border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black]">
                      {(["ID", "EN", "JP", "KR"] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setShowLanguageDropdown(false);
                          }}
                          className={`cursor-pointer w-full px-4 py-2 text-left text-[10px] font-black hover:bg-[#ffcc00] border-b-2 border-black/5 last:border-0 ${
                            language === lang ? "bg-[#ffcc00]" : ""
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
            </div>

            {/* CURRENCY */}
            <div className="relative">
              <button
                ref={currRef}
                onClick={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown);
                  setShowLanguageDropdown(false);
                }}
                className="cursor-pointer flex items-center justify-center gap-1 w-17.5 h-8 px-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-stone-100 transition-all"
              >
                <FaMoneyBillWave className="text-sm" />
                <span className="text-[10px] font-black">{currency}</span>
              </button>

              {mounted &&
                showCurrencyDropdown &&
                createPortal(
                  <div
                    className="fixed z-999 w-32"
                    style={{
                      top: `${
                        currRef.current?.getBoundingClientRect().bottom! + 8
                      }px`,
                      left: `${
                        currRef.current?.getBoundingClientRect().left! - 20
                      }px`,
                    }}
                  >
                    <div className="overflow-hidden bg-white/95 backdrop-blur-xl border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black]">
                      {(
                        ["IDR", "USD", "SGD", "JPY", "KRW"] as Currency[]
                      ).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            setCurrency(curr);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`cursor-pointer w-full px-4 py-2 text-left text-[10px] font-black hover:bg-[#ffcc00] border-b-2 border-black/5 last:border-0 ${
                            currency === curr ? "bg-[#ffcc00]" : ""
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>

          {/* SAVE HOTEL */}
          {user &&
            user.role !== "admin" &&
            user.role !== "superadmin" && (
              <Link
                href="/dashboard?tab=saved"
                className="cursor-pointer hidden xl:flex items-center gap-2 text-xs font-black uppercase hover:text-[#0055ff] transition-all"
              >
                <FaBookmark />
                <span>Save Hotel</span>
              </Link>
            )}

          {/* USER */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setIsMobileMenuOpen(false);
                  }}
                  className="cursor-pointer w-9 h-9 rounded-full overflow-hidden border-[2.5px] border-black"
                >
                  <Image
                    src={user.avatar || "/images/avatar.svg"}
                    alt="avatar"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover grayscale"
                  />
                </button>

                {mounted && showDropdown && (
                  <div className="absolute right-0 top-full mt-8 w-56 z-50 overflow-hidden bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black]">
                    
                    <div className="px-6 py-4 bg-[#ffcc00] border-b-[3px] border-black">
                      <p className="text-[8px] uppercase font-black text-black/50">
                        Username
                      </p>

                      <p className="mt-1 text-sm font-black truncate">
                        {user.name || user.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">

                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-stone-50 hover:border-black border border-transparent"
                      >
                        <FaThLarge />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=profile"
                        onClick={() => setShowDropdown(false)}
                        className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-stone-50 hover:border-black border border-transparent"
                      >
                        <FaUser />
                        <span>Profil Saya</span>
                      </Link>

                      {user.role !== "admin" &&
                        user.role !== "superadmin" && (
                          <Link
                            href="/dashboard?tab=saved"
                            onClick={() => setShowDropdown(false)}
                            className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-stone-50 hover:border-black border border-transparent"
                          >
                            <FaBookmark />
                            <span>Save Hotel</span>
                          </Link>
                        )}

                      <div className="border-t-2 border-black/5 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase text-[#e63b2e] hover:bg-[#e63b2e]/10 border border-transparent hover:border-[#e63b2e]"
                      >
                        <FaSignOutAlt />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModal(true, "login", pathname);
                }}
                className="cursor-pointer bg-black text-white text-xs px-4 py-2 border-[2.5px] border-black rounded-xl hover:bg-[#ffcc00] hover:text-black transition-all font-black"
              >
                LOGIN
              </button>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setShowDropdown(false);
            }}
            className="xl:hidden cursor-pointer flex items-center justify-center w-9 h-9 border-[2.5px] border-black rounded-xl bg-white"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mounted && isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 z-40 p-4 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] xl:hidden">
            
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/home"
                    ? pathname === "/home" || pathname === "/"
                    : pathname.startsWith(link.href.split("?")[0]);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`cursor-pointer flex items-center justify-between px-5 py-2.5 rounded-full border-[3px] text-xs font-black uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#ffcc00] border-black text-black shadow-[3px_3px_0px_0px_black]"
                        : "bg-white text-black/60 border-transparent hover:border-black hover:bg-stone-50"
                    }`}
                  >
                    <span>{link.name}</span>
                    <FaArrowRight />
                  </Link>
                );
              })}

              <div className="flex items-center justify-between border-t-2 border-black/5 pt-3 mt-2 px-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  Settings
                </span>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 px-3 h-7 bg-stone-100 rounded-lg border-2 border-black text-[9px] font-black">
                    <FaGlobe />
                    {language}
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 h-7 bg-stone-100 rounded-lg border-2 border-black text-[9px] font-black">
                    <FaMoneyBillWave />
                    {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )};

export default Navbar;

