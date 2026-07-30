'use client';

import Link from 'next/link';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-['Inter'] px-6 py-24 pb-60">
      <div className="bg-[#ff6b00] border-4 border-black p-8 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#000] max-w-md w-full relative overflow-hidden animate-in zoom-in duration-300">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size:[16px_16px]"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#000]">
            <FaExclamationTriangle className="text-4xl text-black font-black" />
          </div>
          
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-2 italic" style={{ textShadow: '3px 3px 0px #000' }}>
            404
          </h1>
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">
            Page Not Found
          </h2>
          <p className="text-white font-bold text-sm mb-8 leading-relaxed">
           Form follows function, but this page has wandered off grid. Let&apos;s get you back on track!          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-[#ffcc00] text-black font-black uppercase text-xs tracking-wider px-6 py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <FaHome className="text-sm font-black" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
