'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import api from '@/lib/api';
import { toast } from 'sonner';

import { FaCheck, FaCopy, FaExternalLinkAlt, FaTags } from 'react-icons/fa';
import NeoPagination from '@/components/byMe/NeoPagination';

const ITEMS_PER_PAGE = 9;

interface CouponData {
  id: string;
  code: string;
  discount: string | number;
  hotelTitle?: string;
  endDate?: string;
  penginapanId?: string | null;
}

const cardColors = [
  {
    bg: 'bg-yellow-800',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: 'rotate-12',
  },
  {
    bg: 'bg-green-800',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: '-rotate-12',
  },
  {
    bg: 'bg-brown-400',
    text: 'text-black',
    badge: 'bg-[#e63b2e]',
    badgeText: 'text-white',
    rotate: 'rotate-6',
  },
  {
    bg: 'bg-orange-400',
    text: 'text-black',
    badge: 'bg-white',
    badgeText: 'text-black',
    rotate: '-rotate-6',
  },
  {
    bg: 'bg-purple-400',
    text: 'text-white',
    badge: 'bg-[#ffcc00]',
    badgeText: 'text-black',
    rotate: 'rotate-3',
  },
  {
    bg: 'bg-blue-800',
    text: 'text-white',
    badge: 'bg-white',
    badgeText: 'text-black',
    rotate: '-rotate-3',
  },
];

const PromoPage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/cupons');

        const mapped = (data || []).map((cp: any) => ({
          id: cp.id,
          code: cp.code,
          discount: `${cp.discountPercent}%`,
          hotelTitle: cp.penginapan?.title || 'Semua Penginapan',
          endDate: cp.expiredAt,
          penginapanId: cp.penginapanId,
        }));

        setCoupons(mapped);
      } catch (error) {
        console.error('Gagal mengambil kupon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [coupons.length]);

  const totalPages = Math.max(1, Math.ceil(coupons.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSalin = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      toast.success('Kode kupon disalin!', {
        description: `Kode ${code} siap digunakan saat checkout.`,
      });

      setTimeout(() => {
        setCopiedCode(null);
      }, 3000);
    } catch {
      toast.error('Gagal menyalin kode kupon');
    }
  };

  const formattedCoupons = coupons.map((promo, index) => {
    const style = cardColors[index % cardColors.length];

    const title = promo.hotelTitle || 'Exclusive Stays';

    const discountLabel =
      typeof promo.discount === 'number'
        ? `Rp ${promo.discount.toLocaleString()}`
        : promo.discount;

    const validityText = promo.endDate
      ? `Berlaku s/d ${new Date(promo.endDate).toLocaleDateString('id-ID')}`
      : 'Berlaku Selamanya';

    const isCopied = copiedCode === promo.code;

    const isGlobal = !promo.penginapanId;

    const exploreHref = promo.penginapanId
      ? `/explore/${promo.penginapanId}`
      : null;

    return {
      ...promo,
      style,
      title,
      discountLabel,
      validityText,
      isCopied,
      isGlobal,
      exploreHref,
    };
  });

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = formattedCoupons.slice(
    pageStart,
    pageStart + ITEMS_PER_PAGE,
  );

  const gridSlots = Array.from(
    { length: ITEMS_PER_PAGE },
    (_, i) => pageItems[i] ?? null,
  );

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-['Space_Grotesk'] antialiased">
      <main className="max-w-300 mx-auto pt-12 py-12 px-4 sm:px-0">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black mb-20 uppercase">
            Exclusive Coupon
          </h1>
        </div>

        {/* PROMO */}
        <section className="w-full text-center pb-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 min-h-100">
              <div className="w-12 h-12 border-4 border-black border-t-[#ffcc00] rounded-full animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-100">
              <div className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] max-w-100 text-center">
                <FaTags className="mx-auto text-5xl text-stone-400 mb-3" />
                <h3 className="text-lg font-black uppercase mb-1">
                  Belum Ada Kupon
                </h3>
                <p className="text-[10px] font-bold opacity-60 uppercase">
                  Saat ini belum ada kupon promo yang aktif dari server.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-250 mx-auto px-4 sm:px-6 flex flex-col">
              {/* Grid 3×3 — tinggi tetap agar pagination tidak naik di halaman terakhir */}
              <div className="grid grid-cols-1 md:grid-cols-3 content-start gap-6 gap-y-10 min-h-205">
                {gridSlots.map((promo, slotIndex) =>
                  promo ? (
                    <div
                      key={promo.id}
                      className="flex flex-col w-full min-w-0"
                    >
                      <div
                        className={`${promo.style.bg} ${promo.style.text} border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] p-6 relative overflow-hidden rounded-3xl flex flex-col justify-between min-h-55 w-full text-left`}
                      >
                        <div className="absolute -left-3.5 bottom-16 w-7 h-7 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />
                        <div className="absolute -right-3.5 bottom-16 w-7 h-7 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />

                        <div
                          className={`absolute -right-4 -top-4 w-20 h-20 ${promo.style.badge} rounded-full border-[3px] border-[#1a1a1a] flex flex-col items-center justify-center ${promo.style.rotate} shadow-[2px_2px_0px_0px_black] z-10`}
                        >
                          <span className="text-[7px] font-black uppercase text-black/60 leading-none">
                            POTONGAN
                          </span>
                          <span
                            className={`font-black text-[11px] ${promo.style.badgeText} leading-tight text-center px-1 truncate max-w-full`}
                          >
                            {promo.discountLabel}
                          </span>
                        </div>

                        <div className="relative z-10 pr-10">
                          <span className="text-[9px] font-black uppercase bg-black/10 px-2 py-0.5 rounded border border-black/10 tracking-wider">
                            {promo.isGlobal
                              ? 'Global Coupon'
                              : 'Specific Coupon'}
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
                            <span className="text-[8px] font-black uppercase bg-[#e63b2e] text-white border border-black px-1 py-0.5 rounded shadow-[0.5px_0.5px_0px_0px_black]">
                              Sekali Pakai
                            </span>
                            <span className="text-[8px] font-black uppercase bg-black/20 border border-black/20 px-1 py-0.5 rounded">
                              Khusus User
                            </span>
                          </div>
                        </div>

                        <div className="border-t-[3px] border-dashed border-black/30 my-4 relative z-10 w-full" />

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-black/45 uppercase leading-none">
                              KODE PROMO
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider font-mono mt-0.5">
                              {promo.code}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSalin(promo.code)}
                            className={`cursor-pointer font-black text-xs uppercase px-4 py-2 border-[3px] border-[#1a1a1a] rounded-xl transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] hover:translate-x-px hover:translate-y-px flex items-center gap-1.5 ${
                              promo.isCopied
                                ? 'bg-green-500 text-white border-green-700'
                                : 'bg-white text-black hover:bg-[#ffcc00]'
                            }`}
                          >
                            {promo.isCopied ? (
                              <FaCheck className="text-[13px]" />
                            ) : (
                              <FaCopy className="text-[13px]" />
                            )}
                            {promo.isCopied ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      </div>

                      {promo.exploreHref ? (
                        <Link
                          href={promo.exploreHref}
                          className="mt-4 inline-flex items-center gap-1 font-black text-[10px] text-blue-600 hover:underline uppercase tracking-wider"
                        >
                          <FaExternalLinkAlt className="text-[11px]" />
                          Lihat Penginapan
                        </Link>
                      ) : (
                        <div className="mt-4 h-5" />
                      )}
                    </div>
                  ) : (
                    <div
                      key={`empty-${safePage}-${slotIndex}`}
                      className="flex flex-col w-full min-w-0 invisible pointer-events-none"
                      aria-hidden
                    >
                      <div className="min-h-55 w-full" />
                      <div className="mt-4 h-5" />
                    </div>
                  ),
                )}
              </div>

              <NeoPagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="max-w-150 mx-auto bg-black text-white p-6 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_#ffcc00] text-center mb-10 mt-40">
          <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter">
            Jangan Lewatkan!
          </h2>

          <p className="text-[10px] font-bold opacity-80 mb-4 max-w-md mx-auto uppercase">
            Berlangganan newsletter kami untuk info kupon stays terbaru.
          </p>

          <div className="flex gap-3 justify-center">
            <button className="bg-[#ffcc00] text-black px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0px_0px_black] transition-all">
              Subscribe
            </button>

            <button className="bg-white text-black px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0px_0px_black] transition-all">
              Follow
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PromoPage;
