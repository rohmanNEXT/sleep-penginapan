"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { setCookie, getCookie } from "@/lib/cookies";
import { toast } from "sonner";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getCookie("cookie_consent_accepted");
    if (consent === null) {
      // Show consent banner after a short delay for beautiful animation entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cookie_consent_accepted", "true", 365);
    setIsVisible(false);
    toast.success("Cookie diterima! Preferensi pencarian Anda akan disimpan dengan aman.", {
      description: "Terima kasih telah menyetujui kebijakan cookie kami.",
    });
  };

  const handleDecline = () => {
    setCookie("cookie_consent_accepted", "false", 30);
    setIsVisible(false);
    toast.info("Cookie ditolak.", {
      description: "Preferensi pencarian Anda tidak akan disimpan setelah sesi berakhir.",
    });
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 max-w-115 w-[calc(100%-32px)] animate-in fade-in slide-in-from-bottom-5 duration-300 font-['Space_Grotesk']">
      <div className="bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] p-5 relative overflow-hidden flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-black transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4 stroke-[3px]" />
        </button>

        {/* SVG Cookie Illustration (Premium Neobrutalist design matching references perfectly) */}
        <div className="shrink-0 flex items-center justify-center bg-amber-50 border-[3px] border-black rounded-2xl p-2.5 shadow-[3px_3px_0px_0px_black]">
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">
            {/* Cookie Base */}
            <circle cx="50" cy="50" r="42" fill="#d4a373" stroke="#1a1a1a" stroke-width="4"/>
            {/* Chocolate Chips */}
            <circle cx="35" cy="35" r="7.5" fill="#603813" stroke="#1a1a1a" stroke-width="3"/>
            <circle cx="65" cy="42" r="8" fill="#603813" stroke="#1a1a1a" stroke-width="3"/>
            <circle cx="48" cy="65" r="6.5" fill="#603813" stroke="#1a1a1a" stroke-width="3"/>
            <circle cx="32" cy="60" r="5" fill="#603813" stroke="#1a1a1a" stroke-width="3"/>
            <circle cx="67" cy="65" r="5.5" fill="#603813" stroke="#1a1a1a" stroke-width="3"/>
            {/* Tiny crumbs/details */}
            <circle cx="52" cy="22" r="2.5" fill="#603813"/>
            <circle cx="78" cy="53" r="2" fill="#603813"/>
            <circle cx="23" cy="46" r="2" fill="#603813"/>
          </svg>
        </div>

        {/* Content & Actions */}
        <div className="flex-1 flex flex-col text-center sm:text-left pr-4">
          <h4 className="text-base font-black text-black uppercase tracking-tight mb-1">
            We use Cookies! 🍪
          </h4>
          <p className="text-[11px] font-bold text-stone-500 leading-relaxed mb-3.5">
            Kami menggunakan cookie untuk menyimpan preferensi pencarian dan memaksimalkan pengalaman liburan Anda.
          </p>
          <div className="flex gap-2.5 w-full">
            <button
              onClick={handleDecline}
              className="flex-1 px-3 py-2 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-widest bg-white hover:bg-stone-50 active:translate-y-0.5 shadow-[2px_2px_0px_0px_black] active:shadow-[0px_0px_0px_0px_black] transition-all cursor-pointer text-center text-black"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-[1.5] px-3 py-2 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#ffcc00] hover:bg-[#ffdd33] active:translate-y-0.5 shadow-[2px_2px_0px_0px_black] active:shadow-[0px_0px_0px_0px_black] transition-all cursor-pointer text-center text-black"
            >
              Accept cookies
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
