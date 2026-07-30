'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { setCookie, eraseCookie } from '@/lib/cookies';
import type { Content } from '../type';
import { FaCalendarAlt, FaChevronDown, FaUsers, FaTimes } from 'react-icons/fa';

interface StickyBookingProps {
  item: Content;
  id: string;
  adults: number;
  childGuests: number;
  rooms: number;
  hasSelectedGuests: boolean;
  dateRange: DateRange | undefined;
  displayMonth: Date;
  isAdminOrSuperAdmin: boolean;
  onAdultsChange: (v: number) => void;
  onChildrenChange: (v: number) => void;
  onRoomsChange: (v: number) => void;
  onHasSelectedGuestsChange: (v: boolean) => void;
  onDateRangeChange: (v: DateRange | undefined) => void;
  onDisplayMonthChange: (v: Date) => void;
  onBook: () => void;
}

export const StickyBooking: React.FC<StickyBookingProps> = ({
  item,
  id,
  adults,
  childGuests: children,
  rooms,
  hasSelectedGuests,
  dateRange,
  displayMonth,
  isAdminOrSuperAdmin,
  onAdultsChange,
  onChildrenChange,
  onRoomsChange,
  onHasSelectedGuestsChange,
  onDateRangeChange,
  onDisplayMonthChange,
  onBook,
}) => {
  const [openGuests, setOpenGuests] = useState(false);

  // Close guest picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!openGuests) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('guest-picker-wrapper');
      if (container && !container.contains(e.target as Node)) {
        setOpenGuests(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGuests(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openGuests]);

  // Active room config (first one)
  const activeConfig = item.bedConfigs?.[0];
  const maxRooms = activeConfig?.maxKamar || 1;
  const maxAdultsAllowed = (activeConfig?.maxAdult || 2) * rooms;
  const maxChildrenAllowed = (activeConfig?.maxChild || 0) * rooms;

  const basePrice = activeConfig?.price || item.price || 0;
  const childPrice = (activeConfig?.hargaPerChild || 0) * children;
  const pricePerDay = (basePrice * rooms) + childPrice;

  // Days = max(1, diff in days) — 1 day allowed
  const days = useMemo(() => {
    if (!dateRange?.from) return 1;
    if (!dateRange?.to) return 1;
    const diff = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, diff);
  }, [dateRange]);

  const subtotal = pricePerDay * days;
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const formatPrice = (v: number) => {
    if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1).replace('.', ',')} Juta`;
    return `Rp ${v.toLocaleString('id-ID')}`;
  };

  const formatDate = (d?: Date) => {
    if (!d) return '';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDateSelect = (val: DateRange | undefined) => {
    if (!val) {
      onDateRangeChange(undefined);
      eraseCookie(`booking_dates_${id}`);
      return;
    }
    if (val.from && !val.to) {
      onDateRangeChange(val);
      onDisplayMonthChange(val.from);
      return;
    }
    if (val.from && val.to) {
      // Allow same-day (1 day stay): to must be >= from
      if (val.to < val.from) {
        onDateRangeChange({ from: val.to, to: undefined });
        onDisplayMonthChange(val.to);
        eraseCookie(`booking_dates_${id}`);
        return;
      }
      onDateRangeChange(val);
      onDisplayMonthChange(val.from);
      setCookie(`booking_dates_${id}`, JSON.stringify(val));
    }
  };

  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleConfirmGuests = () => {
    onHasSelectedGuestsChange(true);
    setCookie(`booking_guests_${id}`, JSON.stringify({ rooms, adults, children }));
    setOpenGuests(false);
  };

  const handleClearGuests = () => {
    onAdultsChange(1);
    onChildrenChange(0);
    onRoomsChange(1);
    onHasSelectedGuestsChange(false);
    eraseCookie(`booking_guests_${id}`);
    setOpenGuests(false);
  };

  return (
    <div className="lg:col-span-1 sticky top-28">
      <div className="bg-white border-[3px] border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_black]">
        {/* Price header */}
        <div className="flex items-baseline gap-1 mb-6 border-b-2 border-black pb-3">
          <span className="text-2xl font-black tracking-tighter">{formatPrice(basePrice)}</span>
          <span className="text-[9px] font-black uppercase text-stone-400">/ HARI</span>
        </div>

        <div className="space-y-4 mb-8">
          {/* Date picker */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Tanggal</label>
            <Popover>
              <PopoverTrigger className="w-full bg-[#f5f0e8]/30 border-2 border-black px-4 py-3 h-12 rounded-xl font-black text-xs text-left flex justify-between items-center outline-none hover:bg-[#f5f0e8]/50 cursor-pointer transition-all">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FaCalendarAlt className="text-[16px] shrink-0" />
                  <span className="truncate text-xs">
                    {dateRange?.from
                      ? dateRange.to
                        ? `${formatDate(dateRange.from)} – ${formatDate(dateRange.to)}`
                        : formatDate(dateRange.from)
                      : 'Pilih Tanggal'}
                  </span>
                </div>
                <FaChevronDown className="text-sm shrink-0" />
              </PopoverTrigger>
              <PopoverContent className="p-3 w-auto bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_black] z-50" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={displayMonth}
                  onMonthChange={onDisplayMonthChange}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  disabled={disabledDates}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guest picker */}
          <div className="space-y-1 relative" id="guest-picker-wrapper">
            <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Tamu</label>
            <button
              type="button"
              onClick={() => setOpenGuests(!openGuests)}
              className="w-full bg-[#f5f0e8]/30 border-2 border-black px-4 py-3 h-12 rounded-xl font-black text-xs text-left flex justify-between items-center outline-none hover:bg-[#f5f0e8]/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <FaUsers className="text-[16px] shrink-0" />
                <span className="truncate">
                  {hasSelectedGuests ? `${rooms} Kamar, ${adults + children} Tamu` : 'Pilih Tamu'}
                </span>
              </div>
              <FaChevronDown className={`text-sm shrink-0 transition-transform duration-200 ${openGuests ? 'rotate-180' : ''}`} />
            </button>
            
            {openGuests && (
              <div className="absolute right-0 top-[calc(100%+3.5px)] w-60 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_black] z-50 flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[9px] uppercase opacity-60">
                    Kapasitas Kamar Pilihan
                  </span>
                  <button onClick={() => setOpenGuests(false)} className="w-5 h-5 flex items-center justify-center hover:bg-stone-100 rounded-full">
                    <FaTimes className="text-sm font-black" />
                  </button>
                </div>

                {/* Kamar */}
                <GuestCounter
                  label="Kamar"
                  value={rooms}
                  min={1}
                  max={maxRooms}
                  onChange={(newRooms) => {
                    onRoomsChange(newRooms);
                    const newMaxAdults = (activeConfig?.maxAdult || 2) * newRooms;
                    const newMaxChildren = (activeConfig?.maxChild || 0) * newRooms;
                    if (adults > newMaxAdults) {
                      onAdultsChange(newMaxAdults);
                    }
                    if (children > newMaxChildren) {
                      onChildrenChange(newMaxChildren);
                    }
                  }}
                />

                {/* Adults */}
                <GuestCounter
                  label="Dewasa"
                  value={adults}
                  min={1}
                  max={maxAdultsAllowed}
                  onChange={onAdultsChange}
                />

                {/* Children */}
                <GuestCounter
                  label="Anak-anak"
                  value={children}
                  min={0}
                  max={maxChildrenAllowed}
                  onChange={onChildrenChange}
                />

                <p className="text-[9px] font-bold text-stone-400 uppercase text-center">
                  {rooms} Kamar, {adults} Dewasa, {children} Anak dipilih
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearGuests}
                    className="flex-1 bg-[#e63b2e] hover:bg-[#ff4d4d] text-white py-2 rounded-xl font-black uppercase text-[10px] border-2 border-black shadow-[2px_2px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmGuests}
                    className="flex-2 bg-[#0a2e1d] hover:bg-[#0c3722] text-white py-2 rounded-xl font-black uppercase text-[10px] border-2 border-black shadow-[3px_3px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                  >
                    Perbarui
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 mb-8 border-t-2 border-black pt-6">
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-stone-400">{formatPrice(pricePerDay)} × {days} hari</span>
            <span className="font-black">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-stone-400">Pajak & Biaya (10%)</span>
            <span className="font-black">{formatPrice(taxes)}</span>
          </div>
          <div className="flex justify-between items-end pt-3 border-t border-black/10">
            <span className="text-sm font-black uppercase">Total</span>
            <span className="text-xl font-black">{formatPrice(total)}</span>
          </div>
        </div>

        <button
          onClick={onBook}
          disabled={isAdminOrSuperAdmin}
          className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(255,204,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-95 mb-3 ${
            isAdminOrSuperAdmin
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              : 'bg-black text-white'
          }`}
        >
          {isAdminOrSuperAdmin ? 'Admin Tidak Dapat Memesan' : 'Book Now'}
        </button>
        <p className="text-center text-[8px] font-black uppercase opacity-40 italic">No charges yet</p>
      </div>
    </div>
  );
};

// ─── Helper sub-component ────────────────────────────────────────────────────
interface GuestCounterProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

const GuestCounter: React.FC<GuestCounterProps> = ({ label, value, min, max, onChange }) => (
  <div className="flex justify-between items-center">
    <span className="font-bold text-xs">{label}</span>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-black font-black text-sm transition-all select-none ${
          value <= min
            ? 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
            : 'bg-[#f5f0e8] text-black hover:bg-stone-200 active:scale-90'
        }`}
      >
        -
      </button>
      <span className="w-4 text-center text-xs font-black">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-black font-black text-sm transition-all select-none ${
          value >= max
            ? 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
            : 'bg-[#f5f0e8] text-black hover:bg-stone-200 active:scale-90'
        }`}
      >
        +
      </button>
    </div>
  </div>
);
