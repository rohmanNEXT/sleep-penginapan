'use client';

import { WithUser } from '@/hoc/WithUser';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Item } from './type';
import { useAuthStore } from '@/store/authStore';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaArrowRight,
  FaLock,
  FaExclamationTriangle,
  FaTag,
  FaUserCheck,
  FaMapMarkerAlt,
  FaSmile,
} from 'react-icons/fa';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const BookingPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuthStore();

  const [item, setItem] = useState<Item | null>(null);
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 2);
  const [children, setChildren] = useState(
    Number(searchParams.get('children')) || 0,
  );
  const [rooms, setRooms] = useState(Number(searchParams.get('rooms')) || 1);
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get('start')
      ? new Date(searchParams.get('start') as string)
      : new Date(),
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get('end')
      ? new Date(searchParams.get('end') as string)
      : new Date(Date.now() + 86400000),
  );

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // Info Section State
  const [name, setName] = useState(user?.name || '');
  const [note, setNote] = useState('');

  // Payment State
  const [balance, setBalance] = useState<number>(500);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id?: string;
    code: string;
    discountPercent?: number;
    discountUsd: number;
  } | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data: p } = await api.get(`/penginapan/${id}`);
        if (p) {
          const data: Item = {
            id: p.id,
            title: p.title,
            location: p.kategoriDestinasi
              ? `${p.kategoriDestinasi.daerah}, ${p.kategoriDestinasi.provinsi}`
              : '',
            price: p.kategoriKamar?.[0]
              ? Number(p.kategoriKamar[0].harga)
              : 150,
            rating: p.ratingRataRata || 0,
            reviews: p.reviews ? p.reviews.length : 0,
            image: p.image?.[0] || '/images/indonesia_1_1.jpg',
            description: p.description || '',
            category: p.kategoriPenginapan?.nama || 'penginapan',
            kamarId: p.kategoriKamar?.[0]?.id || '',
            kamarList: p.kategoriKamar || [],
          };
          setItem(data);
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        toast.error('Failed to load booking details.');
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id) {
        try {
          const { data } = await api.get(`/balances/${user.id}`);
          setBalance(Number(data.saldo));
        } catch (e) {
          console.error('Error fetching balance:', e);
        }
      }
    };
    fetchBalance();
  }, [user]);

  const inDate = checkIn || new Date();
  const outDate = checkOut || new Date(Date.now() + 86400000);
  const stayDays = Math.max(
    1,
    Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const nights = stayDays;

  const activeConfig = item?.kamarList?.[0];
  const maxRooms = activeConfig?.maxKamar || 1;
  const maxTotalGuestsAllowed =
    ((activeConfig?.maxAdult || 2) + (activeConfig?.maxChild || 0)) * rooms;

  const handleRoomsChange = (newRooms: number) => {
    setRooms(newRooms);
    const newMaxTotal =
      ((activeConfig?.maxAdult || 2) + (activeConfig?.maxChild || 0)) *
      newRooms;
    if (adults + children > newMaxTotal) {
      if (adults > newMaxTotal) {
        setAdults(newMaxTotal);
        setChildren(0);
      } else {
        setChildren(newMaxTotal - adults);
      }
    }
  };

  const pricePerNight =
    (item?.price || 0) * rooms +
    Number(activeConfig?.hargaPerChild || 0) * children;
  const subtotal = pricePerNight * nights;
  const taxAndFee = subtotal * 0.1;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (subtotal * Number(appliedCoupon.discountPercent)) / 100
      : appliedCoupon.discountUsd
    : 0;
  const total = Math.max(0, subtotal + taxAndFee - discountAmount);

  // Apply Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      toast.error('Kode kupon tidak boleh kosong');
      return;
    }
    const cleanCode = couponCodeInput.trim().toUpperCase();

    try {
      const { data } = await api.post('/cupons/validate', {
        code: cleanCode,
        penginapanId: item?.id,
        userId: user?.id,
      });

      if (!data.valid) {
        toast.error(data.message || 'Kode kupon tidak valid');
        return;
      }

      const discVal = (subtotal * Number(data.discountPercent)) / 100;
      setAppliedCoupon({
        code: cleanCode,
        id: data.cuponId,
        discountPercent: data.discountPercent,
        discountUsd: discVal,
      });
      toast.success('Kupon berhasil dipasang!', {
        description: `Anda menghemat Rp ${discVal.toLocaleString('id-ID')}!`,
      });
      setCouponCodeInput('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal memvalidasi kupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Kupon dilepas');
  };

  // Final Submit
  const handleConfirmBooking = async () => {
    if (!name.trim()) {
      toast.error('Mohon isi nama lengkap Anda');
      return;
    }

    if (balance < total) {
      toast.error('Saldo tidak mencukupi! Silakan top up saldo Anda.');
      return;
    }

    try {
      const payload = {
        userId: user?.id,
        penginapanId: item?.id,
        kamarId:
          (item as any).kamarId || (item as any).kamarList?.[0]?.id || '',
        cuponId: appliedCoupon ? appliedCoupon.id : null,
        checkIn: inDate.toISOString(),
        checkOut: outDate.toISOString(),
        jumlahDewasa: Number(adults),
        jumlahAnak: Number(children),
        jumlahKamar: Number(rooms),
      };

      await api.post('/transaksi-penginapan', payload);

      toast.success('Pemesanan Berhasil!', {
        description: `Selamat berlibur di ${item?.title}! Anda akan dialihkan ke dashboard.`,
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal melakukan pemesanan');
    }
  };

  if (!item) return null;

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-black Space_Grotesk">
      <main className="max-w-300 mx-auto pt-1 pb-80 px-4 md:px-8">
        {/* Step Progress bar with back button added on the left side */}
        <div className="bg-white border-2 border-black p-2 rounded-2xl mb-8 md:mb-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-bold uppercase text-xs md:text-sm hover:bg-stone-100 px-3 md:px-4 py-2 border-2 border-transparent hover:border-black rounded-xl transition-all cursor-pointer z-10"
          >
            <FaArrowLeft className="text-base md:text-lg" />
            Back
          </button>

          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="flex items-center gap-4 md:gap-12 pointer-events-auto">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm md:text-base ${step === 1 ? 'bg-[#ffcc00]' : 'bg-black text-white'}`}
                >
                  1
                </span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider hidden md:block">
                  Details
                </span>
              </div>
              <div className="w-12 md:w-24 h-0.5 bg-stone-300" />
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm md:text-base ${step === 2 ? 'bg-[#ffcc00]' : 'bg-white'}`}
                >
                  2
                </span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider hidden md:block">
                  Payment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Trip Details */}
            <div
              className={`relative transition-all duration-300 ${step !== 1 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            >
              <div className="absolute -top-4 -left-2 md:-left-4 bg-[#ffcc00] border-[2.5px] border-black px-4 py-1.5 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 rounded-lg">
                STEP 1
              </div>
              <div className="bg-white border-[3px] border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl space-y-10">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Trip Details
                </h2>

                <div className="space-y-8">
                  {/* When Section */}
                  <div className="space-y-4">
                    <h3 className="font-black uppercase border-b-[1.5px] border-stone-200 pb-2 tracking-[0.2em] text-[10px] text-stone-500">
                      When
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-black uppercase text-stone-600">
                          Check-in
                        </label>
                        <Popover
                          open={isCheckInOpen}
                          onOpenChange={setIsCheckInOpen}
                        >
                          <PopoverTrigger className="w-full text-left">
                            <div className="relative cursor-pointer group">
                              <input
                                type="text"
                                readOnly
                                value={
                                  checkIn ? format(checkIn, 'yyyy-MM-dd') : ''
                                }
                                className="w-full bg-[#f5f0e8] border-[1.5px] border-black px-4 py-3.5 rounded-[14px] font-black text-sm outline-none text-black cursor-pointer group-hover:bg-[#ebe6df] transition-colors"
                              />
                              <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm group-hover:text-black transition-colors" />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] bg-white overflow-hidden"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={(d) => {
                                if (d) {
                                  setCheckIn(d);
                                  if (checkOut && d > checkOut) setCheckOut(d);
                                  setIsCheckInOpen(false);
                                }
                              }}
                              disabled={(d) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return d < today;
                              }}
                              className="bg-white font-['Space_Grotesk']"
                              modifiersClassNames={{
                                selected:
                                  'bg-black text-white hover:bg-stone-800 hover:text-white focus:bg-black focus:text-white',
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-black uppercase text-stone-600">
                          Check-out
                        </label>
                        <Popover
                          open={isCheckOutOpen}
                          onOpenChange={setIsCheckOutOpen}
                        >
                          <PopoverTrigger className="w-full text-left">
                            <div className="relative cursor-pointer group">
                              <input
                                type="text"
                                readOnly
                                value={
                                  checkOut ? format(checkOut, 'yyyy-MM-dd') : ''
                                }
                                className="w-full bg-[#f5f0e8] border-[1.5px] border-black px-4 py-3.5 rounded-[14px] font-black text-sm outline-none text-black cursor-pointer group-hover:bg-[#ebe6df] transition-colors"
                              />
                              <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm group-hover:text-black transition-colors" />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] bg-white overflow-hidden"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={(d) => {
                                if (d) {
                                  if (checkIn && d < checkIn) {
                                    setCheckIn(d);
                                  }
                                  setCheckOut(d);
                                  setIsCheckOutOpen(false);
                                }
                              }}
                              disabled={(d) => {
                                const minDate = checkIn || new Date();
                                minDate.setHours(0, 0, 0, 0);
                                return d < minDate;
                              }}
                              className="bg-white font-['Space_Grotesk']"
                              modifiersClassNames={{
                                selected:
                                  'bg-black text-white hover:bg-stone-800 hover:text-white focus:bg-black focus:text-white',
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Who Section */}
                  <div className="space-y-4">
                    <h3 className="font-black uppercase border-b-[1.5px] border-stone-200 pb-2 tracking-[0.2em] text-[10px] text-stone-500">
                      Who
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#f5f0e8] border-[1.5px] border-black p-2.5 rounded-[14px] flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-[10px] leading-tight">
                            Rooms
                          </span>
                          <span className="text-[8px] font-bold text-stone-500 uppercase mt-0.5">
                            Max {maxRooms}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRoomsChange(Math.max(1, rooms - 1))
                            }
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            -
                          </button>
                          <span className="font-black text-sm w-4 text-center">
                            {rooms}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRoomsChange(Math.min(maxRooms, rooms + 1))
                            }
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="bg-[#f5f0e8] border-[1.5px] border-black p-2.5 rounded-[14px] flex justify-between items-center">
                        <div className="flex flex-col justify-center h-full">
                          <span className="font-black uppercase text-[10px]">
                            Adults
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            -
                          </button>
                          <span className="font-black text-sm w-4 text-center">
                            {adults}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAdults(
                                Math.min(
                                  maxTotalGuestsAllowed - children,
                                  adults + 1,
                                ),
                              )
                            }
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="bg-[#f5f0e8] border-[1.5px] border-black p-2.5 rounded-[14px] flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-[10px] leading-tight">
                            Children
                          </span>
                          <span className="text-[8px] font-bold text-stone-500 uppercase mt-0.5">
                            Ages 2-12
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setChildren(Math.max(0, children - 1))
                            }
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            -
                          </button>
                          <span className="font-black text-sm w-4 text-center">
                            {children}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setChildren(
                                Math.min(
                                  maxTotalGuestsAllowed - adults,
                                  children + 1,
                                ),
                              )
                            }
                            className="w-7 h-7 border-[1.5px] border-black bg-white flex items-center justify-center font-black rounded-lg cursor-pointer hover:bg-stone-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-4">
                    <h3 className="font-black uppercase border-b-[1.5px] border-stone-200 pb-2 tracking-[0.2em] text-[10px] text-stone-500">
                      Info
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-stone-600">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#f5f0e8] border-[1.5px] border-black px-4 py-3.5 rounded-[14px] font-black text-sm outline-none placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-stone-600">
                          Your Note
                        </label>
                        <textarea
                          placeholder="Special request or note..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          className="w-full bg-[#f5f0e8] border-[1.5px] border-black px-4 py-3.5 rounded-[14px] font-black text-sm outline-none placeholder:text-stone-400 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (!name.trim()) {
                        toast.error('Mohon isi nama lengkap Anda');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full sm:w-auto bg-[#ffcc00] border-[2.5px] border-black px-10 py-3.5 font-black uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer rounded-xl text-xs"
                  >
                    Continue to Payment
                    <FaArrowRight className="text-lg font-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div
              className={`relative transition-all duration-300 ${step !== 2 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            >
              <div className="absolute -top-4 -left-2 md:-left-4 bg-[#ffcc00] border-2 border-black px-4 py-1.5 font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 rounded-lg">
                STEP 2
              </div>

              {step !== 2 ? (
                // Locked Placeholder
                <div className="bg-[#e8e4db] border-2 border-black p-8 md:p-10 rounded-2xl flex justify-between items-center relative overflow-hidden">
                  <h2 className="text-2xl md:text-3xl font-black uppercase text-stone-400">
                    Payment
                  </h2>
                  <FaLock className="text-4xl text-stone-400" />
                </div>
              ) : (
                // Active Payment Section
                <div className="bg-white border-2 border-black p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                    Payment Details
                  </h2>

                  {/* Wallet Balance Card */}
                  <div className="space-y-4">
                    <h3 className="font-bold uppercase border-b-2 border-stone-100 pb-3 tracking-widest text-sm text-stone-500">
                      Sellepy Pay Wallet
                    </h3>
                    <div className="bg-[#f5f0e8] border-2 border-black p-6 rounded-xl space-y-3">
                      <span className="block text-xs font-bold uppercase text-stone-600 leading-none">
                        Your Balance
                      </span>
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <span className="text-3xl font-black tracking-tight">
                          Rp {balance.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1.5 rounded-lg tracking-widest">
                          ACTIVE
                        </span>
                      </div>
                      {balance < total && (
                        <div className="bg-red-50 border-2 border-red-500 p-3 rounded-lg mt-4">
                          <p className="text-red-600 font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                            <FaExclamationTriangle className="text-base" />
                            Saldo tidak mencukupi. Sila top up saldo di
                            dashboard Anda.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promo Code input */}
                  <div className="space-y-4">
                    <h3 className="font-bold uppercase border-b-2 border-stone-100 pb-3 tracking-widest text-sm text-stone-500">
                      Promo / Discount Coupon
                    </h3>
                    {appliedCoupon ? (
                      <div className="bg-green-50 border-2 border-green-600 p-5 rounded-xl flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaTag className="text-green-600 text-xl font-bold" />
                          </div>
                          <div>
                            <span className="block font-mono font-bold text-sm text-green-700">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-xs font-bold text-green-600">
                              Hemat Rp{' '}
                              {appliedCoupon.discountUsd.toLocaleString(
                                'id-ID',
                              )}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="px-3 py-1.5 border-2 border-green-600 bg-white text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer font-bold text-xs uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="ENTER PROMO CODE"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          className="grow bg-[#f5f0e8] border-2 border-black p-4 rounded-xl font-bold uppercase font-mono tracking-widest focus:ring-4 focus:ring-[#ffcc00]/20 outline-none placeholder:text-stone-400 placeholder:font-medium transition-all"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-8 py-4 bg-black text-white font-bold uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all rounded-xl cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="px-8 py-4 border-2 border-black font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-stone-100 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-xl"
                    >
                      <FaArrowLeft className="text-lg" />
                      Back
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={balance < total}
                      className={`grow py-4 px-6 font-bold uppercase text-sm tracking-wide border-2 border-black transition-all rounded-xl flex items-center justify-center gap-2 ${balance < total ? 'bg-stone-200 text-stone-500 cursor-not-allowed border-stone-300' : 'bg-[#ffcc00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer'}`}
                    >
                      Confirm Booking & Pay Rp {total.toLocaleString('id-ID')}
                      <FaUserCheck className="text-lg" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl sticky top-24">
              <div className="relative h-56 border-b-2 border-black">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 font-bold uppercase text-xs border-2 border-white rounded-lg shadow-sm">
                  {item.category || 'VILLA'}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-black uppercase leading-tight mb-3 tracking-tight">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-stone-500 mb-8">
                  <FaMapMarkerAlt className="text-base" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {item.location}
                  </span>
                </div>

                <div className="space-y-4 font-bold border-t-2 border-stone-200 border-dashed pt-6 mb-6 text-sm">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>
                      Rp {pricePerNight.toLocaleString('id-ID')} × {nights}{' '}
                      malam ({rooms} Kamar)
                    </span>
                    <span className="text-black">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span className="underline underline-offset-4 decoration-2 decoration-stone-200">
                      Pajak & Biaya (10%)
                    </span>
                    <span className="text-black">
                      Rp {taxAndFee.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 -mx-2 rounded-lg">
                      <span>Kupon ({appliedCoupon.code})</span>
                      <span className="font-black">
                        -Rp {appliedCoupon.discountUsd.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-black pt-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-lg font-bold uppercase">Total</span>
                    <span className="text-3xl font-black tracking-tight">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-right text-[10px] font-bold uppercase text-stone-400">
                    Includes taxes and fees
                  </p>
                </div>

                <div className="mt-8 flex justify-center gap-8 border-t-2 border-stone-100 pt-6 text-stone-400">
                  <FaUserCheck className="text-2xl hover:text-black transition-colors" />
                  <FaCalendarAlt className="text-2xl hover:text-black transition-colors" />
                  <FaSmile className="text-2xl hover:text-black transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithUser(BookingPage);
