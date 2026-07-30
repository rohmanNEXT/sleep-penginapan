'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaInstagram,
  FaTwitter,
  FaDiscord,
  FaShareAlt,
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mb-4 px-4 sm:px-6 font-['Inter']">
      <div className="bg-white text-[#1a1a1a] border-[4px] border-black rounded-[2.5rem] shadow-[8px_8px_0px_0px_#1a1a1a] overflow-hidden p-8 md:p-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT */}
          <div className="flex flex-col">
            <Link
              href="/"
              className="text-4xl font-black text-black uppercase tracking-tighter font-['Space_Grotesk'] mb-2"
            >
              Sleep.
            </Link>

            <p className="text-sm text-stone-700 leading-relaxed font-semibold max-w-md mb-6">
              Empowering your wanderlust with Bauhaus-inspired design and
              unforgettable travel experiences.
            </p>

            <div className="flex items-center gap-4">
              <button className="cursor-pointer w-10 h-10 border-2 border-black rounded-full flex items-center justify-center bg-white text-black shadow-[3px_3px_0px_0px_#1a1a1a] hover:bg-black hover:text-white transition-all duration-200">
                <FaShareAlt size={14} />
              </button>

              <button className="cursor-pointer w-10 h-10 border-2 border-black rounded-full flex items-center justify-center bg-white text-black shadow-[3px_3px_0px_0px_#1a1a1a] hover:bg-black hover:text-white transition-all duration-200">
                <MdEmail size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 font-['Space_Grotesk']">
            
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black">
                Platform
              </h4>

              <ul className="space-y-2 text-xs uppercase font-black text-stone-600">
                <li>
                  <Link
                    href="/explore?type=penginapan"
                    className="hover:text-black transition-colors"
                  >
                    Penginapan
                  </Link>
                </li>

                <li>
                  <Link
                    href="/promo"
                    className="hover:text-black transition-colors"
                  >
                    Promo
                  </Link>
                </li>

                <li>
                  <Link
                    href="/report"
                    className="hover:text-black transition-colors"
                  >
                    Report
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black">
                Company
              </h4>

              <ul className="space-y-2 text-xs uppercase font-black text-stone-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    About
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Press
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Career
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black">
                Legal
              </h4>

              <ul className="space-y-2 text-xs uppercase font-black text-stone-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Privacy
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-8 pt-4 border-t-2 border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-600 font-['Space_Grotesk'] text-center md:text-left">
            BAUHAUS SELLEPY © 2026. FORM FOLLOWS FUNCTION.
          </p>

          <div className="flex items-center gap-5 text-stone-600">
            
            <a
              href="#"
              className="cursor-pointer hover:text-black transition-colors"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="#"
              className="cursor-pointer hover:text-black transition-colors"
            >
              <FaTwitter size={18} />
            </a>

            <a
              href="#"
              className="cursor-pointer hover:text-black transition-colors"
            >
              <FaDiscord size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
