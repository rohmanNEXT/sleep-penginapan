'use client';

import React, { useState, useEffect } from 'react';

import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaExclamationTriangle,
} from 'react-icons/fa';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import api from '@/lib/api';
import { WithAll } from '@/hoc/WithAll';
import { useAuthStore } from '@/store/authStore';

import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { getCookie } from '@/lib/cookies';

import type { Content } from './type';

import { GalleryModal } from './components/GalleryModal';
import { ImageCarousel } from './components/ImageCarousel';
import { PropertyInfo } from './components/PropertyInfo';
import { ReviewsSection } from './components/ReviewsSection';
import { StickyBooking } from './components/StickyBooking';

const DetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const { user, setAuthModal } = useAuthStore();

  // CORE
  const [item, setItem] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // UI
  const [isSaved, setIsSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // BOOKING
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [hasSelectedGuests, setHasSelectedGuests] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  // REVIEWS
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [userHasBooked, setUserHasBooked] = useState(false);

  // MOUNT
  useEffect(() => {
    setMounted(true);
  }, []);

  // SAVED
  useEffect(() => {
    if (!mounted) return;

    if (user && id) {
      const savedList = JSON.parse(
        localStorage.getItem(`saved_hotels_${user.id}`) || '[]',
      );

      setIsSaved(savedList.some((s: any) => s.id === id));
    } else {
      setIsSaved(false);
    }
  }, [mounted, user, id]);

  // RESTORE COOKIE
  useEffect(() => {
    if (!mounted || !id) return;

    const savedDates = getCookie(`booking_dates_${id}`);

    if (savedDates) {
      try {
        const parsed = JSON.parse(savedDates);

        if (parsed.from) {
          setDateRange({
            from: new Date(parsed.from),
            to: parsed.to ? new Date(parsed.to) : undefined,
          });
        }
      } catch {}
    }

    const savedGuests = getCookie(`booking_guests_${id}`);

    if (savedGuests) {
      try {
        const parsed = JSON.parse(savedGuests);

        if (parsed.adults !== undefined) {
          setAdults(parsed.adults);
          setChildren(parsed.children ?? 0);
          setRooms(parsed.rooms ?? 1);
          setHasSelectedGuests(true);
        }
      } catch {}
    }
  }, [mounted, id]);

  // FETCH
  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);

      try {
        const { data: p } = await api.get(`/penginapan/${id}`);

        if (!p) {
          setItem(null);
          return;
        }

        const mappedItem: Content = {
          id: p.id,
          title: p.title,
          description: p.description || '',
          location: p.kategoriDestinasi
            ? `${p.kategoriDestinasi.daerah}, ${p.kategoriDestinasi.provinsi}`
            : '',
          price: p.kategoriKamar?.[0] ? Number(p.kategoriKamar[0].harga) : 0,
          rating: p.ratingRataRata || 0,
          reviews: p.reviews?.length ?? 0,
          rules: p.rules || '',
          faq: p.faq || '',
          fasilitas: (p.kategoriFasilitas || [])
            .map((f: any) => f.nama)
            .join(', '),
          image: p.image?.[0] || '/images/indonesia_1_1.jpg',
          gallery: p.image || [],
          category: p.kategoriPenginapan?.nama || 'penginapan',
          isPromo: (p.cupons || []).length > 0,
          isPopular: (p.ratingRataRata || 0) >= 4.5,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 86400000)
            .toISOString()
            .split('T')[0],
          guest: p.kategoriKamar?.[0]?.maxAdult || 4,
          minRooms: 1,
          maxRooms: p.kategoriKamar?.[0]?.maxKamar || 1,
          maxNights: 0,
          closedDates: [],
          bedConfigs: (p.kategoriKamar || []).map((k: any) => ({
            maxKasur: k.maxKasur || 1,
            maxAdult: k.maxAdult || 2,
            maxChild: k.maxChild || 0,
            maxKamar: k.maxKamar || 1,
            price: Number(k.harga) || 0,
            hargaPerChild: Number(k.hargaPerChild || 0),
            rooms: 1,
            capacity: (k.maxAdult || 2) + (k.maxChild || 0),
            count: k.maxKasur || 1,
            type: '',
            capacityAdults: k.maxAdult || 2,
            capacityChildren: k.maxChild || 0,
          })),
          roomsAvailable: p.kategoriKamar?.[0]?.maxKamar || 1,
        };

        setItem(mappedItem);

        // REVIEWS
        try {
          const { data: revData } = await api.get(`/reviews/penginapan/${id}`);

          setReviewsList(revData || []);
        } catch {}

        // BOOKING STATUS
        if (user?.id) {
          try {
            const { data: txData } = await api.get(
              `/transaksi-penginapan/user/${user.id}`,
            );

            setUserHasBooked(txData.some((tx: any) => tx.penginapanId === id));
          } catch {}
        }
      } catch (err) {
        console.error('Fetch Error:', err);

        toast.error('Gagal memuat detail. Coba lagi.');

        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, user]);

  const isAdminOrSuperAdmin =
    user?.role === 'admin' || user?.role === 'superadmin';

  // SAVE
  const handleToggleSave = () => {
    if (!user) {
      toast.error('Silakan login untuk menyimpan.');

      setAuthModal(true, 'login', `/explore/${id}`);

      return;
    }

    const key = `saved_hotels_${user.id}`;

    const savedList = JSON.parse(localStorage.getItem(key) || '[]');

    if (isSaved) {
      localStorage.setItem(
        key,
        JSON.stringify(savedList.filter((s: any) => s.id !== id)),
      );

      setIsSaved(false);

      toast.success('Dihapus dari simpanan.');
    } else if (item) {
      localStorage.setItem(
        key,
        JSON.stringify([
          ...savedList,
          {
            id: item.id,
            title: item.title,
            location: item.location,
            price: item.price,
            rating: item.rating,
            image: item.image,
            type: 'penginapan',
          },
        ]),
      );

      setIsSaved(true);

      toast.success('Berhasil disimpan.');
    }
  };

  // BOOK
  const handleBook = () => {
    if (isAdminOrSuperAdmin) {
      toast.error('Admin tidak dapat memesan.');

      return;
    }

    if (!dateRange?.from) {
      toast.error('Pilih tanggal check-in terlebih dahulu.');

      return;
    }

    if (!hasSelectedGuests) {
      toast.error('Tentukan jumlah tamu terlebih dahulu.');

      return;
    }

    const startStr = dateRange.from.toISOString().split('T')[0];

    const endStr = (dateRange.to || dateRange.from).toISOString().split('T')[0];

    if (!user) {
      setAuthModal(
        true,
        'login',
        `/explore/${id}/booking?start=${startStr}&end=${endStr}&rooms=${rooms}&adults=${adults}&children=${children}`,
      );

      toast.error('Login untuk melanjutkan pemesanan.');

      return;
    }

    router.push(
      `/explore/${id}/booking?start=${startStr}&end=${endStr}&rooms=${rooms}&adults=${adults}&children=${children}`,
    );
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (item?.gallery?.length) {
      setCurrentSlide(
        (p) => (p - 1 + item.gallery.length) % item.gallery.length,
      );
    }
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (item?.gallery?.length) {
      setCurrentSlide((p) => (p + 1) % item.gallery.length);
    }
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <div className="w-20 h-20 border-[6px] border-black border-t-[#ffcc00] rounded-full animate-spin" />
      </div>
    );
  }

  // NOT FOUND
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8] p-6 text-center">
        <div className="bg-white border-[6px] border-black p-12 rounded-3xl shadow-[12px_12px_0px_0px_black] max-w-lg">
          <FaExclamationTriangle className="mx-auto text-7xl text-[#e63b2e] mb-6" />

          <h1 className="text-4xl font-black uppercase mb-4">Item Not Found</h1>

          <p className="font-bold text-stone-500 mb-8 uppercase tracking-widest">
            Destinasi tidak ditemukan atau sudah dipindahkan.
          </p>

          <Link
            href="/explore"
            className="cursor-pointer inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase rounded-xl border-[3px] border-black shadow-[6px_6px_0px_0px_black] hover:bg-[#ffcc00] hover:text-black transition-all"
          >
            <FaArrowLeft />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] pb-16 text-black">
      {/* GALLERY */}
      {showGallery && (
        <GalleryModal
          item={item}
          onClose={() => setShowGallery(false)}
          onBook={handleBook}
          isAdminOrSuperAdmin={isAdminOrSuperAdmin}
        />
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* TOP NAV */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="cursor-pointer flex items-center gap-2 font-black uppercase text-[9px] tracking-widest hover:-translate-x-0.5 transition-all"
          >
            <FaArrowLeft className="text-xs" />
            Back to Explore
          </button>

          {/* SAVE */}
          {mounted && (
            <button
              onClick={handleToggleSave}
              className={`border-2 border-black px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                isSaved ? 'bg-[#ffcc00] text-black' : 'bg-white text-black'
              }`}
            >
              {isSaved ? (
                <FaHeart className="text-[#e63b2e] text-xs" />
              ) : (
                <FaRegHeart className="text-stone-400 text-xs" />
              )}

              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>

        {/* IMAGE */}
        <ImageCarousel
          item={item}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
          onPrev={prevSlide}
          onNext={nextSlide}
          onOpenGallery={() => setShowGallery(true)}
        />

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-10">
            <PropertyInfo item={item} mounted={mounted} />

            <ReviewsSection
              item={item}
              reviewsList={reviewsList}
              userHasBooked={userHasBooked}
              userId={user?.id}
              onReviewsUpdate={setReviewsList}
              onRatingUpdate={(rating, count) =>
                setItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        rating,
                        reviews: count,
                      }
                    : prev,
                )
              }
            />
          </div>

          {/* RIGHT */}
          <StickyBooking
            item={item}
            id={id}
            adults={adults}
            childGuests={children}
            rooms={rooms}
            hasSelectedGuests={hasSelectedGuests}
            dateRange={dateRange}
            displayMonth={displayMonth}
            isAdminOrSuperAdmin={isAdminOrSuperAdmin}
            onAdultsChange={setAdults}
            onChildrenChange={setChildren}
            onRoomsChange={setRooms}
            onHasSelectedGuestsChange={setHasSelectedGuests}
            onDateRangeChange={setDateRange}
            onDisplayMonthChange={setDisplayMonth}
            onBook={handleBook}
          />
        </div>
      </div>
    </div>
  );
};

export default WithAll(DetailPage);
