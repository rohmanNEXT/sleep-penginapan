'use client';

import Image from 'next/image';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useSettingsStore, Currency } from '@/store/settingsStore';
import ExploreHero from '@/components/byMe/ExploreHero';
import { Item } from '@/app/(user-control)/dashboard/kelola-penginapan/types';
import {
  FaChevronUp,
  FaChevronDown,
  FaThLarge,
  FaList,
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaArrowRight,
} from 'react-icons/fa';
import NeoPagination from '@/components/byMe/NeoPagination';

const exchangeRates: Record<Currency, number> = {
  IDR: 1,
  USD: 16000,
  SGD: 12000,
  JPY: 105,
  KRW: 12,
  EUR: 17000,
};
const currencySymbols: Record<Currency, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  JPY: '¥',
  KRW: '₩',
  EUR: '€',
};

const ExploreContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating-desc');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(16000000);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    [],
  );
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [filterNegara, setFilterNegara] = useState<string>('');
  const [filterProvinsi, setFilterProvinsi] = useState<string>('');
  const [filterDaerah, setFilterDaerah] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    neighborhoods: true,
    rating: true,
    facilities: true,
  });

  const { currency } = useSettingsStore();

  const uniqueCategories = Array.from(
    new Set(allItems.map((i) => i.category).filter(Boolean)),
  ) as string[];
  const uniqueFacilities = Array.from(
    new Set(allItems.flatMap((i) => i.facilities || []).filter(Boolean)),
  ) as string[];

  const formatPrice = (value: number) => {
    const converted =
      value / (currency === 'IDR' ? 1 : exchangeRates[currency]);
    if (currency === 'IDR') {
      if (converted >= 1000000)
        return `Rp ${(converted / 1000000).toFixed(1).replace('.', ',')} Juta`;
      return `Rp ${converted.toLocaleString('id-ID')}`;
    }
    return `${currencySymbols[currency]} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const nh = searchParams.get('neighborhood');
    const negara = searchParams.get('negara');
    const provinsi = searchParams.get('provinsi');
    const daerah = searchParams.get('daerah');
    if (searchParam) {
      setSearchTerm(searchParam);
      setDebouncedSearch(searchParam);
    } else {
      setSearchTerm('');
      setDebouncedSearch('');
    }
    if (nh) setSelectedNeighborhoods([nh]);
    setFilterNegara(negara || '');
    setFilterProvinsi(provinsi || '');
    setFilterDaerah(daerah || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const { data } = await api.get('/penginapan');
        const mapped: Item[] = (data.penginapan || data || []).map(
          (p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            facilities: (p.kategoriFasilitas || []).map((f: any) => f.nama),
            category: p.kategoriPenginapan?.nama || '',
            price: p.kategoriKamar?.[0] ? Number(p.kategoriKamar[0].harga) : 0,
            isPromo: (p.cupons || []).length > 0,
            rating: p.ratingRataRata || 0,
            reviewCount: p.reviews ? p.reviews.length : 0,
            location: p.kategoriDestinasi
              ? `${p.kategoriDestinasi.daerah}, ${p.kategoriDestinasi.provinsi}`
              : '',
            address: p.address || '',
            image: p.image?.[0] || '',
            images: p.image || [],
            isPopular: (p.ratingRataRata || 0) >= 4.5,
            negara: p.kategoriDestinasi?.negara
              ? [p.kategoriDestinasi.negara]
              : [],
            provinsi: p.kategoriDestinasi?.provinsi
              ? [p.kategoriDestinasi.provinsi]
              : [],
            kecamatan: p.kategoriDestinasi?.daerah
              ? [p.kategoriDestinasi.daerah]
              : [],
            bedConfigs: (p.kategoriKamar || []).map((k: any) => ({
              count: k.maxKasur,
              type: '',
              capacityAdults: k.maxAdult,
              capacityChildren: k.maxChild,
              capacity: (k.maxAdult || 0) + (k.maxChild || 0),
              price: Number(k.harga) || 0,
              hargaPerChild: Number(k.hargaPerChild) || 0,
              rooms: k.maxKamar || 1,
              maxKasur: k.maxKasur,
              maxAdult: k.maxAdult,
              maxChild: k.maxChild,
              maxKamar: k.maxKamar || 1,
            })),
          }),
        );
        setAllItems(mapped);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllItems();
  }, []);

  useEffect(() => {
    let filtered = [...allItems];
    if (debouncedSearch && debouncedSearch.toLowerCase() !== 'all') {
      const s = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          (i.location || '').toLowerCase().includes(s),
      );
    }
    if (filterNegara)
      filtered = filtered.filter((i) =>
        (i.negara || []).some(
          (n) => n.toLowerCase() === filterNegara.toLowerCase(),
        ),
      );
    if (filterProvinsi)
      filtered = filtered.filter((i) =>
        (i.provinsi || []).some(
          (p) => p.toLowerCase() === filterProvinsi.toLowerCase(),
        ),
      );
    if (filterDaerah)
      filtered = filtered.filter((i) =>
        (i.kecamatan || []).some(
          (d) => d.toLowerCase() === filterDaerah.toLowerCase(),
        ),
      );
    filtered = filtered.filter((i) => {
      const p = i.price || 0;
      return p >= minPrice && p <= maxPrice;
    });
    if (selectedNeighborhoods.length > 0)
      filtered = filtered.filter((i) =>
        selectedNeighborhoods.includes(i.category || ''),
      );
    if (selectedFacilities.length > 0)
      filtered = filtered.filter((i) =>
        selectedFacilities.some((f) => (i.facilities || []).includes(f)),
      );
    if (minRating > 0) filtered = filtered.filter((i) => i.rating >= minRating);
    if (sortBy === 'rating-desc')
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'rating-asc')
      filtered = [...filtered].sort((a, b) => a.rating - b.rating);
    setTotalItems(filtered.length);
    setItems(filtered.slice((currentPage - 1) * limit, currentPage * limit));
  }, [
    allItems,
    currentPage,
    debouncedSearch,
    minRating,
    limit,
    sortBy,
    minPrice,
    maxPrice,
    selectedNeighborhoods,
    selectedFacilities,
    filterNegara,
    filterProvinsi,
    filterDaerah,
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f0e8]">
        <div className="h-20 w-20 animate-spin rounded-full border-[6px] border-black border-t-[#ffcc00]" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-360 px-4 sm:px-6 pt-6 pb-20 font-[Inter]">
      <ExploreHero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        guests={2}
      />

      <main className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="space-y-6 lg:col-span-3">
          {/* Price Range */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_0px_black]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black tracking-tight uppercase">
                  Price Range
                </h3>
                <p className="text-[9px] font-bold text-stone-500 uppercase">
                  Per room, per night
                </p>
              </div>
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(16000000);
                  setCurrentPage(1);
                }}
                className="text-[10px] cursor-pointer font-black text-blue-600 uppercase hover:underline"
              >
                Reset
              </button>
            </div>
            <div className="space-y-4 pt-2">
              <input
                type="range"
                min="0"
                max="16000000"
                step="250000"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg border-2 border-black bg-stone-200 accent-[#ffcc00]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[8px] font-black uppercase opacity-60">
                    Min Price
                  </label>
                  <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-stone-50 px-2.5 py-1.5">
                    <span className="text-[10px] font-black opacity-50">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full border-none bg-transparent p-0 text-xs font-black outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[8px] font-black uppercase opacity-60">
                    Max Price
                  </label>
                  <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-stone-50 px-2.5 py-1.5">
                    <span className="text-[10px] font-black opacity-50">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full border-none bg-transparent p-0 text-xs font-black outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tempat Tinggal */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_0px_black]">
            <div
              onClick={() =>
                setExpandedSections((p) => ({
                  ...p,
                  neighborhoods: !p.neighborhoods,
                }))
              }
              className="group flex cursor-pointer items-center justify-between"
            >
              <h3 className="text-sm font-black tracking-tight uppercase transition-colors group-hover:text-blue-600">
                Tempat tinggal
              </h3>
              <span className="rounded-full bg-blue-50 p-0.5 text-lg text-blue-600">
                {expandedSections.neighborhoods ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </span>
            </div>
            {expandedSections.neighborhoods && (
              <div className="space-y-3 pt-5">
                {uniqueCategories.length === 0 ? (
                  <p className="text-[9px] font-bold text-stone-400 uppercase">
                    Belum ada data kategori
                  </p>
                ) : (
                  uniqueCategories.map((catName) => {
                    const isChecked = selectedNeighborhoods.includes(catName);
                    const count = allItems.filter(
                      (i) => i.category === catName,
                    ).length;
                    return (
                      <label
                        key={catName}
                        className="group flex cursor-pointer items-start gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedNeighborhoods((p) =>
                              isChecked
                                ? p.filter((x) => x !== catName)
                                : [...p, catName],
                            );
                            setCurrentPage(1);
                          }}
                          className="mt-0.5 h-5 w-5 cursor-pointer shrink-0 rounded-md border-2 border-black accent-[#ffcc00]"
                        />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${isChecked ? 'text-black font-black' : 'opacity-80 group-hover:opacity-100'}`}
                          >
                            {catName}
                          </span>
                          <span className="text-[9px] font-bold text-stone-400">
                            ({count})
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_0px_black]">
            <div
              onClick={() =>
                setExpandedSections((p) => ({ ...p, rating: !p.rating }))
              }
              className="group flex cursor-pointer items-center justify-between"
            >
              <h3 className="text-sm font-black tracking-tight uppercase transition-colors group-hover:text-blue-600">
                Rating
              </h3>
              <span className="rounded-full bg-blue-50 p-0.5 text-lg text-blue-600">
                {expandedSections.rating ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expandedSections.rating && (
              <div className="space-y-3 pt-5">
                {[
                  { label: '⭐ 5 Bintang', value: 5 },
                  { label: '⭐ 4 Ke atas', value: 4 },
                  { label: '⭐ 3 Ke atas', value: 3 },
                  { label: '⭐ 2 Ke atas', value: 2 },
                ].map((opt) => {
                  const isChecked = minRating === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="group flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setMinRating(isChecked ? 0 : opt.value);
                          setCurrentPage(1);
                        }}
                        className="h-5 w-5 cursor-pointer shrink-0 rounded-md border-2 border-black accent-[#ffcc00]"
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${isChecked ? 'text-black font-black' : 'opacity-80 group-hover:opacity-100'}`}
                      >
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fasilitas */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_0px_black]">
            <div
              onClick={() =>
                setExpandedSections((p) => ({
                  ...p,
                  facilities: !p.facilities,
                }))
              }
              className="group flex cursor-pointer items-center justify-between"
            >
              <h3 className="text-sm font-black tracking-tight uppercase transition-colors group-hover:text-blue-600">
                Fasilitas
              </h3>
              <span className="rounded-full bg-blue-50 p-0.5 text-lg text-blue-600">
                {expandedSections.facilities ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </span>
            </div>
            {expandedSections.facilities && (
              <div className="space-y-3 pt-5">
                {uniqueFacilities.length === 0 ? (
                  <p className="text-[9px] font-bold text-stone-400 uppercase">
                    Belum ada data fasilitas
                  </p>
                ) : (
                  uniqueFacilities.map((facName) => {
                    const isChecked = selectedFacilities.includes(facName);
                    const count = allItems.filter((i) =>
                      (i.facilities || []).includes(facName),
                    ).length;
                    return (
                      <label
                        key={facName}
                        className="group flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedFacilities((p) =>
                              isChecked
                                ? p.filter((x) => x !== facName)
                                : [...p, facName],
                            );
                            setCurrentPage(1);
                          }}
                          className="h-5 w-5 cursor-pointer shrink-0 rounded-md border-2 border-black accent-[#ffcc00]"
                        />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${isChecked ? 'text-black font-black' : 'opacity-80 group-hover:opacity-100'}`}
                        >
                          {facName}
                        </span>
                        <span className="text-[9px] font-bold text-stone-400">
                          ({count})
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 flex flex-col justify-between h-full">
          <div>
            {/* Sort & View */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border-[3px] border-black bg-white p-4 shadow-[6px_6px_0px_0px_black] md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase opacity-40 whitespace-nowrap">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="cursor-pointer rounded-full border-2 border-black bg-blue-50 pl-4 pr-8 py-1.5 text-[10px] font-black text-blue-700 uppercase outline-none min-w-35 appearance-none"
                  >
                    <option value="rating-desc">Rating Tertinggi</option>
                    <option value="rating-asc">Rating Terendah</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-700 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex rounded-full border-2 border-black bg-stone-50 p-1">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`p-1.5 rounded-full cursor-pointer ${viewType === 'grid' ? 'bg-white shadow-md text-blue-600 border border-black/5' : 'opacity-30'}`}
                  >
                    <FaThLarge className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`p-1.5 rounded-full cursor-pointer ${viewType === 'list' ? 'bg-white shadow-md text-blue-600 border border-black/5' : 'opacity-30'}`}
                  >
                    <FaList className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-black bg-white py-20 text-center shadow-[6px_6px_0px_0px_black]">
                <FaSearch className="mb-3 text-5xl text-stone-400" />
                <h3 className="mb-1 text-xl font-black uppercase">Not Found</h3>
                <p className="text-[10px] font-bold uppercase opacity-60">
                  {filterNegara
                    ? `Tidak ada penginapan di ${filterNegara}.`
                    : filterProvinsi
                      ? `Tidak ada penginapan di ${filterProvinsi}.`
                      : filterDaerah
                        ? `Tidak ada penginapan di ${filterDaerah}.`
                        : debouncedSearch
                          ? `Tidak ada hasil untuk "${debouncedSearch}".`
                          : 'Coba ubah filter atau kata kunci pencarian.'}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewType === 'list'
                    ? 'flex flex-col gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                }
              >
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/explore/${item.id}`}
                    className="group block"
                  >
                    <article
                      className={`bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_black] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_black] rounded-2xl overflow-hidden flex ${viewType === 'list' ? 'flex-col md:flex-row md:h-47.5' : 'flex-col h-full'}`}
                    >
                      <div
                        className={`${viewType === 'list' ? 'w-full md:w-64 h-52 md:h-full shrink-0' : 'h-44'} relative border-black ${viewType === 'list' ? 'md:border-r-[3px] border-b-[3px] md:border-b-0' : 'border-b-[3px]'}`}
                      >
                        <Image
                          src={item.image || '/images/placeholder.svg'}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.isPromo && (
                          <div className="absolute top-4 left-4 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black text-white uppercase shadow-[2px_2px_0px_0px_black]">
                            PROMO
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1 flex items-start justify-between">
                          <h3 className="font-[Space_Grotesk] text-base leading-tight font-black uppercase transition-colors group-hover:text-blue-600">
                            {item.title}
                          </h3>
                          {item.rating > 0 && (item.reviewCount ?? 0) > 0 && (
                            <div className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 shrink-0">
                              <FaStar className="fill-current text-sm text-blue-600" />
                              <span className="text-xs font-black text-blue-700">
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mb-2 flex items-center gap-1.5 text-stone-500">
                          <FaMapMarkerAlt className="text-sm" />
                          <p className="text-[10px] font-bold tracking-tight uppercase">
                            {item.location}
                          </p>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {(item.facilities || []).slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-black/5 bg-stone-100 px-2 py-0.5 text-[8px] font-bold text-stone-600 uppercase"
                            >
                              {f}
                            </span>
                          ))}
                          {item.category && (
                            <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-600 uppercase">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto flex items-end justify-between border-t-2 border-black/5 pt-2">
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-40">
                              Starts from
                            </p>
                            <p className="font-[Space_Grotesk] text-2xl font-black text-red-600">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-blue-600 text-white shadow-[3px_3px_0px_0px_black]">
                            <FaArrowRight />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {!isLoading && (
            <NeoPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const ExplorePage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f0e8]">
          <div className="h-20 w-20 animate-spin rounded-full border-[6px] border-black border-t-[#ffcc00]" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
};

export default ExplorePage;
