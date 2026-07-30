'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';

interface CouponData {
  id: string;
  code: string;
  discount: number | string;
  hotelTitle?: string;
  isForNewUser?: boolean;
  isSpecial?: boolean;
  endDate?: string;
  penginapanId?: string | null;
}

const cardColors = [
  {
    bg: 'bg-[#e63b2e]',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: 'rotate-12',
  },
  {
    bg: 'bg-[#0055ff]',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: '-rotate-12',
  },
  {
    bg: 'bg-[#eee9e0]',
    text: 'text-black',
    badge: 'bg-[#e63b2e]',
    badgeText: 'text-white',
    rotate: 'rotate-6',
  },
  {
    bg: 'bg-[#ffcc00]',
    text: 'text-black',
    badge: 'bg-white',
    badgeText: 'text-black',
    rotate: '-rotate-6',
  },
  {
    bg: 'bg-black',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: 'rotate-3',
  },
  {
    bg: 'bg-[#0194f3]',
    text: 'text-white',
    badge: 'bg-white',
    badgeText: 'text-black',
    rotate: '-rotate-3',
  },
];

const Promos: React.FC = () => {
  const { user } = useAuthStore();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/cupons');
        const globalOnly = (data || []).filter((cp: any) => !cp.penginapanId);
        const mapped = globalOnly.map((cp: any) => ({
          id: cp.id,
          code: cp.code,
          discount: `${cp.discountPercent}%`,
          hotelTitle: 'Special Deal',
          isForNewUser: false,
          isSpecial: false,
          endDate: cp.expiredAt,
          penginapanId: cp.penginapanId ?? null,
        }));
        setCoupons(mapped);
      } catch (err) {
        console.error('Gagal memuat kupon landing page:', err);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    const key = user ? `claimed_coupons_${user.id}` : 'claimed_coupons_guest';
    const saved = localStorage.getItem(key);
    setClaimedCodes(saved ? JSON.parse(saved) : []);
  }, [user]);

  const handleClaim = async (code: string) => {
    if (!user) {
      toast.error('Masuk Terlebih Dahulu', {
        description: 'Silakan login untuk mengklaim kupon stay khusus Anda!',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      const key = `claimed_coupons_${user.id}`;
      const currentClaimed = JSON.parse(localStorage.getItem(key) || '[]');
      if (!currentClaimed.includes(code)) {
        const updated = [...currentClaimed, code];
        localStorage.setItem(key, JSON.stringify(updated));
        setClaimedCodes(updated);
      }
      toast.success('Kupon Berhasil Diklaim!', {
        description: `Kode ${code} disalin ke clipboard dan siap digunakan.`,
      });
    } catch {
      toast.error('Gagal menyalin kupon');
    }
  };

  const activeCoupons = coupons.slice(0, 3).map((promo, index) => {
    const style = cardColors[index % cardColors.length];
    const title = promo.hotelTitle || 'Special Deal';
    const discountLabel =
      typeof promo.discount === 'number'
        ? `Rp ${promo.discount.toLocaleString()}`
        : promo.discount;
    const validityText = promo.endDate
      ? `Berlaku s/d ${new Date(promo.endDate).toLocaleDateString('id-ID')}`
      : 'Flash Sale Terbatas';
    const isClaimed = claimedCodes.includes(promo.code);
    const isNewUser = !!promo.isForNewUser;
    const exploreHref = promo.penginapanId
      ? `/explore/${promo.penginapanId}`
      : null;

    return {
      ...promo,
      style,
      title,
      discountLabel,
      validityText,
      isClaimed,
      isNewUser,
      exploreHref,
    };
  });

  const listClass =
    'grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1000px] mx-auto px-4 sm:px-6';

  return (
    <section className="w-full mb-24 text-center font-['Space_Grotesk']">
      <h2 className="text-lg lg:text-xl font-black mb-8 text-center uppercase tracking-tight px-4">
        Stay Coupon
      </h2>

      {activeCoupons.length === 0 ? (
        <div className={listClass}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col w-full min-w-0">
              <div className="border-[3px] border-black/10 border-dashed rounded-3xl min-h-55 w-full flex items-center justify-center bg-stone-50/50">
                {i === 1 && (
                  <p className="font-black uppercase text-[10px] text-stone-300 tracking-wider">
                    Belum ada promo
                  </p>
                )}
              </div>
              <div className="mt-2 h-5" />
            </div>
          ))}
        </div>
      ) : (
        <div className={listClass}>
          {activeCoupons.map((promo) => (
            <div key={promo.id} className="flex flex-col w-full min-w-0">
              {/* Coupon Card */}
              <div
                className={`${promo.style.bg} ${promo.style.text} border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] p-6 relative overflow-hidden rounded-3xl flex flex-col justify-between min-h-55 w-full text-left`}
              >
                {/* Notch Cutouts */}
                <div className="absolute -left-3.5 bottom-16 w-7 h-7 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />
                <div className="absolute -right-3.5 bottom-16 w-7 h-7 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />

                {/* Discount Badge */}
                <div
                  className={`absolute -right-4 -top-4 w-20 h-20 ${promo.style.badge} rounded-full border-[3px] border-[#1a1a1a] flex flex-col items-center justify-center ${promo.style.rotate} shadow-[2px_2px_0px_0px_black] z-10`}
                >
                  <span className="text-[7px] font-black uppercase text-black/60 leading-none">
                    Potongan
                  </span>
                  <span
                    className={`font-black text-[11px] ${promo.style.badgeText} leading-tight text-center px-1 truncate max-w-full`}
                  >
                    {promo.discountLabel}
                  </span>
                </div>

                {/* Upper Content */}
                <div className="relative z-10 pr-10">
                  <span className="text-[9px] font-black uppercase bg-black/10 px-2 py-0.5 rounded border border-black/10 tracking-wider">
                    {promo.isNewUser ? 'New User' : 'Global Coupon'}
                  </span>
                  <h3
                    className="text-base font-black uppercase mt-3 mb-1 leading-tight tracking-tight truncate max-w-42.5"
                    title={promo.title}
                  >
                    {promo.title}
                  </h3>
                  <p className="font-bold text-[9px] opacity-75 uppercase tracking-wider">
                    {promo.validityText}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[8px] font-black uppercase bg-[#e63b2e] text-white border border-black px-1.5 py-0.5 rounded shadow-[0.5px_0.5px_0px_0px_black]">
                      Sekali Pakai
                    </span>
                    <span className="text-[8px] font-black uppercase bg-black/20 border border-black/20 px-1.5 py-0.5 rounded">
                      Khusus User
                    </span>
                  </div>
                </div>

                {/* Dashed Divider */}
                <div className="border-t-[3px] border-dashed border-black/30 my-4 relative z-10 w-full" />

                {/* Bottom: Code + Claim */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-black/45 uppercase leading-none">
                      Kode Promo
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider font-mono mt-0.5">
                      {promo.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClaim(promo.code)}
                    className={`cursor-pointer font-black text-xs uppercase px-4 py-2 border-[3px] border-[#1a1a1a] rounded-xl transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] hover:translate-x-px hover:translate-y-px ${promo.isClaimed ? 'bg-[#fff9e6] text-[#b38f00] hover:bg-[#ffcc00]' : 'bg-white text-black hover:bg-[#ffcc00]'}`}
                  >
                    {promo.isClaimed ? 'Claimed ✓' : 'Claim'}
                  </button>
                </div>
              </div>

              {/* Link penginapan di bawah card — hanya untuk kupon non-global */}
              {promo.exploreHref ? (
                <Link
                  href={promo.exploreHref}
                  className="mt-2 inline-flex items-center gap-1 font-black text-[10px] text-blue-600 hover:underline uppercase tracking-wider self-center"
                >
                  <FaExternalLinkAlt className="text-[13px]" />
                  Lihat Penginapan
                </Link>
              ) : (
                <div className="mt-2 h-5" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* See More Button */}
      <div className="mt-12 text-center">
        <Link
          href="/cupon"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#ffcc00] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_black] transition-all group cursor-pointer"
        >
          Lihat Promo Lainnya
          <FaArrowRight className="text-sm font-black group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default Promos;
