'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Search, 
  ChevronDown,
  Plus,
  Minus,
  Navigation,
  ChevronLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie, eraseCookie } from "@/lib/cookies";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const PROVINCES_BY_COUNTRY = [
  {
    country: "Indonesia",
    provinces: [
      { name: "Bali", districts: ["Ubud", "Kuta", "Seminyak", "Canggu", "Nusa Dua"] },
      { name: "Jawa Barat", districts: ["Lembang", "Dago", "Ciumbuleuit", "Cicendo", "Padjajaran"] },
      { name: "Yogyakarta", districts: ["Malioboro", "Kaliurang", "Prawirotaman", "Sleman"] },
      { name: "DKI Jakarta", districts: ["Menteng", "Kemang", "Senayan", "PIK", "Kelapa Gading"] }
    ]
  },
  {
    country: "Jepang",
    provinces: [
      { name: "Tokyo", districts: ["Shibuya", "Shinjuku", "Ginza", "Akihabara"] }
    ]
  },
  {
    country: "Korea Selatan",
    provinces: [
      { name: "Seoul", districts: ["Gangnam", "Hongdae", "Myeongdong", "Itaewon"] }
    ]
  },
  {
    country: "Thailand",
    provinces: [
      { name: "Bangkok", districts: ["Sukhumvit", "Silom", "Siam"] }
    ]
  }
];

interface Hero2Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  guests: number;
}

export default function Hero2({ searchTerm, setSearchTerm, guests: initialGuests }: Hero2Props) {
  const router = useRouter();
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [hasSelectedDates, setHasSelectedDates] = useState(false);
  const [pickingFrom, setPickingFrom] = useState(true);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [hasSelectedGuests, setHasSelectedGuests] = useState(false);

  // Clamp initialGuests between 0 and 10
  const clampedInitialGuests = Math.min(10, Math.max(0, initialGuests || 0));
  const [guests, setGuests] = useState({ adults: clampedInitialGuests, children: 0, rooms: 0 });
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Memoize setSearchTerm to prevent unnecessary re-renders
  const memoizedSetSearchTerm = useCallback(setSearchTerm, [setSearchTerm]);

  // Client-side mount: load from cookie if exists
  useEffect(() => {
  if (typeof window !== "undefined") {
    const savedDates = getCookie("hero_booking_dates");

    if (savedDates) {
      try {
        const parsed = JSON.parse(savedDates);

        if (parsed.from) {
          setDate({
            from: parsed.from ? new Date(parsed.from) : undefined,
            to: parsed.to ? new Date(parsed.to) : undefined,
          });

          setHasSelectedDates(true);
        }
      } catch (e) {
        console.error("Error loading hero dates:", e);
      }
    }

    const savedGuests = getCookie("hero_booking_guests");

    if (savedGuests) {
      try {
        const parsed = JSON.parse(savedGuests);

        if (parsed.adults !== undefined) {
          setGuests(parsed);
          setHasSelectedGuests(true);
        }
      } catch (e) {
        console.error("Error loading hero guests:", e);
      }
    }

    const savedDest = getCookie("hero_destination");

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");

    if (searchParam) {
      memoizedSetSearchTerm(searchParam);
    } else if (savedDest && savedDest === "All") {
      memoizedSetSearchTerm("All");
    } else {
      memoizedSetSearchTerm("");
    }
  }
}, [memoizedSetSearchTerm]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    if (pickingFrom) {
      setDate({ from: selected, to: undefined });
      setHasSelectedDates(false);
      setPickingFrom(false);
      const newDisplayMonth = new Date(selected);
      newDisplayMonth.setDate(1);
      setDisplayMonth(newDisplayMonth);
      eraseCookie("hero_booking_dates");
    } else {
      // Check-out harus lebih besar atau sama dengan check-in (tidak boleh lebih kecil)
      if (selected < (date.from as Date)) {
        setDate({ from: selected, to: undefined });
        setPickingFrom(false);
        const newDisplayMonth = new Date(selected);
        newDisplayMonth.setDate(1);
        setDisplayMonth(newDisplayMonth);
        return;
      }
      const newDate = { from: date.from, to: selected };
      setDate(newDate);
      setHasSelectedDates(true);
      setPickingFrom(true);
      setCookie("hero_booking_dates", JSON.stringify(newDate));
    }
  };

  // Strict month navigation: always show 2 consecutive months
  const handleMonthChange = (newMonth: Date) => {
    const currentFirst = new Date(displayMonth);
    currentFirst.setDate(1);
    
    const newFirst = new Date(newMonth);
    newFirst.setDate(1);
    
    // Only allow moving by exactly 1 month at a time
    const monthDiff = (newFirst.getFullYear() - currentFirst.getFullYear()) * 12 + 
                      (newFirst.getMonth() - currentFirst.getMonth());
    
    if (Math.abs(monthDiff) === 1) {
      setDisplayMonth(newFirst);
    }
  };
  const popupRef = useRef(null);

  return (
    <section className="w-full mb-8 font-['Space_Grotesk'] px-4 sm:px-6" ref={popupRef}>
      <div className="max-w-250 w-full mx-auto">
        <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-0 bg-white/80 backdrop-filter-sm rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_black] overflow-hidden">
            
            {/* Destination Search */}
            <div className="lg:w-60 w-full shrink-0 relative border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black">
              <Popover open={isDestOpen} onOpenChange={(open) => {
                setIsDestOpen(open);
                if (!open) {
                  setSelectedProvince(null);
                }
              }}>
              <PopoverTrigger className="w-full h-full">
                <div className="flex items-center gap-3.5 h-full px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0055ff] border-2 border-black text-white shadow-[2px_2px_0px_0px_black] group-hover:bg-[#3377ff] transition-colors shrink-0">
                    <MapPin className="w-4.5 h-4.5 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Destination</span>
                    <span className="text-black font-black text-xs uppercase tracking-tight truncate leading-none">
                      {searchTerm || "Where to?"}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] bg-white overflow-hidden font-['Space_Grotesk']" align="start">
                <Command className="border-none bg-white">
                  <div className="p-4 border-b-[3px] border-black bg-stone-50 flex items-center justify-between gap-3">
                    {selectedProvince ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedProvince(null)}
                        className="rounded-xl border-[2.5px] border-black bg-stone-200 hover:bg-stone-300 text-black font-black uppercase text-[10px] h-10 px-4 shadow-[2.5px_2.5px_0px_0px_black] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_black] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <ChevronLeft className="text-sm font-black" />
                        Back
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          setSearchTerm("All");
                          setCookie("hero_destination", "All");
                          setIsDestOpen(false); 
                        }}
                        className="w-full justify-start gap-3 rounded-xl border-2 border-black bg-[#ffcc00] hover:bg-[#ffdd33] text-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_black] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_black] transition-all cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 stroke-[2.5px]" />
                        All
                      </Button>
                    )}
                  </div>
                  {!selectedProvince && (
                    <CommandInput placeholder="Search destination..." className="h-10 border-none my-1 border-black/20 focus:ring-0 font-thin placeholder:text-stone-400" />
                  )}
                  <CommandList className="max-h-75">
                    <CommandEmpty className="p-4 text-center font-bold uppercase text-stone-500">No results found.</CommandEmpty>
                    
                    {!selectedProvince ? (
                      PROVINCES_BY_COUNTRY.map((countryGroup) => (
                        <CommandGroup 
                          key={countryGroup.country} 
                          heading={countryGroup.country} 
                          className="p-2 font-black uppercase text-xs text-stone-400 border-b-2 border-black/40 last:border-0"
                        >
                          {countryGroup.provinces.map((prov) => (
                            <CommandItem
                              key={prov.name}
                              onSelect={() => {
                                setSelectedProvince(prov.name);
                              }}
                              className="flex justify-between my-1 border-black/40 items-center p-3 cursor-pointer hover:bg-stone-50 rounded-xl border transition-all"
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-black text-sm text-black uppercase tracking-tight">{prov.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="bg-[#ffcc00] text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-black shadow-[1px_1px_0px_0px_black]">Province</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))
                    ) : (
                      (() => {
                        const provinceObj = PROVINCES_BY_COUNTRY.flatMap(c => c.provinces).find(p => p.name === selectedProvince);
                        if (!provinceObj) return null;
                        return (
                          <CommandGroup 
                            heading={`Districts in ${selectedProvince}`} 
                            className="p-2 font-black uppercase text-xs text-stone-400"
                          >
                            {provinceObj.districts.map((dist) => (
                              <CommandItem
                                key={dist}
                                onSelect={() => {
                                  setSearchTerm(dist);
                                  setCookie("hero_destination", dist);
                                  setSelectedProvince(null);
                                  setIsDestOpen(false);
                                }}
                                className="flex justify-between my-1 items-center p-3 cursor-pointer hover:bg-stone-50 rounded-xl border border-black/40 transition-all"
                              >
                                <div className="flex flex-col text-left">
                                  <span className="font-black text-sm text-black uppercase tracking-tight">{dist}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="bg-[#0055ff] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-black shadow-[1px_1px_0px_0px_black]">District</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        );
                      })()
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Stay Date */}
          <div className="lg:flex-1 w-full shrink-0 relative border-b-[3px] lg:border-b-0 border-r-0 lg:border-r-[3px] border-black">
            <Popover>
              <PopoverTrigger className="w-full h-full">
                <div className="flex items-center gap-3.5 h-full px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0055ff] border-2 border-black text-white shadow-[2px_2px_0px_0px_black] group-hover:bg-[#3377ff] transition-colors shrink-0">
                    <CalendarIcon className="w-4.5 h-4.5 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Stay Date</span>
                    <span className="text-black font-black text-xs uppercase tracking-tight truncate leading-none">
                      {hasSelectedDates && date.from && date.to ? (
                        `${format(date.from, "dd MMM")} - ${format(date.to, "dd MMM")}`
                      ) : (
                        "Select Dates"
                      )}
                    </span>
                  </div>
                  {hasSelectedDates && date.from && date.to && (
                    <span className="text-[8px] font-black text-blue-800 bg-blue-50 border-2 border-black px-1.5 py-0.5 rounded-md ml-auto shadow-[1.5px_1.5px_0px_0px_black] uppercase">
                      {Math.max(1, Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)))} Night
                    </span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] bg-white overflow-hidden" align="start">
                <Calendar
                  mode="single"
                  selected={pickingFrom ? date.from : date.to}
                  onSelect={handleDateSelect}
                  defaultMonth={displayMonth}
                  onMonthChange={handleMonthChange}
                  numberOfMonths={1}
                  className="bg-white"
                  modifiers={{
                    range_start: date.from ? [date.from] : [],
                    range_end: date.to ? [date.to] : [],
                    range_middle: date.from && date.to
                      ? { from: new Date(date.from.getTime() + 86400000), to: new Date(date.to.getTime() - 86400000) }
                      : [],
                  }}
                  modifiersClassNames={{
                    range_start: "bg-black text-white rounded-full",
                    range_end: "bg-black text-white rounded-full",
                    range_middle: "bg-stone-100 rounded-none",
                  }}
                  disabled={(d) => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    // Only disable past dates (before today)
                    if (d < today) return true;
                    return false;
                  }}
                  footer={
                    <p className="text-center text-[10px] font-black uppercase text-stone-500 py-2 border-t border-black/10 mt-2">
                      {pickingFrom ? "Select Check-in Date" : "Select Check-out Date"}
                    </p>
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div className="lg:w-60 w-full shrink-0 relative border-b-[3px] lg:border-b-0 border-black">
            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
              <PopoverTrigger className="w-full h-full">
                <div className="flex items-center justify-between h-full px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0055ff] border-2 border-black text-white shadow-[2px_2px_0px_0px_black] group-hover:bg-[#3377ff] transition-colors shrink-0">
                      <Users className="w-4.5 h-4.5 stroke-[2.5px]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Guests</span>
                      <span className="text-black font-black text-xs uppercase tracking-tight truncate leading-none">
                        {hasSelectedGuests ? (
                          `${guests.adults} Ad, ${guests.children} Ch, ${guests.rooms} Rm`
                        ) : (
                          "Select Guests"
                        )}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="text-black w-3.5 h-3.5 stroke-[3px] group-hover:translate-y-0.5 transition-transform" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-5 border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] bg-white font-['Space_Grotesk']" align="end">
                <div className="space-y-5">
                  {[
                    { label: "Adult", key: "adults", icon: <Users className="w-4 h-4 stroke-[2px]" /> },
                    { label: "Children", key: "children", icon: <Navigation className="w-4 h-4 rotate-180 stroke-[2px]" /> },
                    { label: "Room", key: "rooms", icon: <Search className="w-4 h-4 stroke-[2px]" /> }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-[#ffcc00] bg-black p-1.5 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_0px_black]">{item.icon}</div>
                        <span className="font-black text-sm text-black uppercase tracking-tight">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          className={`w-8 h-8 cursor-pointer rounded-lg border-2 border-black active:scale-95 shadow-[1.5px_1.5px_0px_0px_black] transition-all ${
                            guests[item.key as keyof typeof guests] <= 0
                              ? "bg-stone-200 border-stone-300 text-stone-400 cursor-not-allowed shadow-none active:scale-100"
                              : "bg-stone-100 hover:bg-stone-200 text-black"
                          }`}
                          onClick={() => {
                            const k = item.key as keyof typeof guests;
                            if (guests[k] <= 0) return;
                            setGuests({ ...guests, [k]: guests[k] - 1 });
                          }}
                        >
                          <Minus className="w-3 h-3 stroke-[3px]" />
                        </Button>
                        <span className="font-black text-sm text-black w-4 text-center">{guests[item.key as keyof typeof guests]}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          className={`w-8 h-8 cursor-pointer rounded-lg border-2 border-black active:scale-95 shadow-[1.5px_1.5px_0px_0px_black] transition-all ${
                            (item.key === "rooms" && guests.rooms >= 10) ||
                            ((item.key === "adults" || item.key === "children") && guests.adults + guests.children >= 10)
                              ? "bg-stone-200 border-stone-300 text-stone-400 cursor-not-allowed shadow-none active:scale-100"
                              : "bg-[#ffcc00] hover:bg-[#ffdd33] text-black"
                          }`}
                          onClick={() => {
                            const k = item.key as keyof typeof guests;
                            if (k === "rooms" && guests.rooms >= 10) return;
                            if ((k === "adults" || k === "children") && guests.adults + guests.children >= 10) return;
                            setGuests({ ...guests, [k]: guests[k] + 1 });
                          }}
                        >
                          <Plus className="w-3 h-3 stroke-[3px]" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      type="button"
                      onClick={() => {
                        setGuests({ adults: 0, children: 0, rooms: 0 });
                        setHasSelectedGuests(false);
                        eraseCookie("hero_booking_guests");
                        setIsGuestsOpen(false);
                      }}
                      className="flex-1 cursor-pointer bg-[#e63b2e] hover:bg-[#ff4d4d] text-white border-2 border-black h-11 rounded-xl shadow-[2px_2px_0px_0px_black] hover:translate-x-px hover:translate-y-px hover:shadow-[1.5px_1.5px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-black uppercase text-xs tracking-wider transition-all"
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={() => {
                        setHasSelectedGuests(true);
                        setCookie("hero_booking_guests", JSON.stringify(guests));
                        setIsGuestsOpen(false);
                      }}
                      className="flex-2 cursor-pointer bg-black hover:bg-stone-900 text-white border-2 border-black h-11 rounded-xl shadow-[3px_3px_0px_0px_black] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-black uppercase text-xs tracking-wider transition-all"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button (Flush Full Cell) */}
          <button 
            type="button"
            onClick={() => {
              if (!hasSelectedDates) {
                toast.error("Please select dates first.");
                return;
              }
              if (!hasSelectedGuests) {
                toast.error("Please specify number of guests first.");
                return;
              }
              setCookie("hero_destination", searchTerm);
              setSearchTerm(searchTerm);
              
              // Update URL search parameter, ensuring 'All' search doesn't show in the URL
              const urlParams = new URLSearchParams(window.location.search);
              if (searchTerm && searchTerm !== "All") {
                urlParams.set("search", searchTerm);
              } else {
                urlParams.delete("search");
              }
              router.push(`/explore?${urlParams.toString()}`);
            }}
            className="lg:w-40 w-full flex items-center justify-center gap-2 bg-[#ffcc00]/80 hover:bg-[#ffdd33]/80 active:bg-[#e6b800]/80 backdrop-filter-sm text-black font-black uppercase text-xs tracking-widest lg:border-l-[3px] border-black transition-colors py-4 px-5 shrink-0 cursor-pointer"
          >
            <span>Search</span>
            <Search className="w-4 h-4 stroke-[3px]" />
          </button>

        </div>
      </div>
    </section>
  );
}
