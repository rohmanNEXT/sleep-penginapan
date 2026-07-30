'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Image from 'next/image';
import {
  FaChevronLeft,
  FaChevronRight,
  FaThLarge,
  FaImage,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCompass,
} from 'react-icons/fa';

export default function TrendingActivity() {
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  // Real Database States
  const [trendingProvinces, setTrendingProvinces] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [favoriteProvince, setFavoriteProvince] = useState<string | null>(null);
  const [recommendedHotels, setRecommendedHotels] = useState<any[]>([]);
  const [loadingRecommendation, setLoadingRecommendation] =
    useState<boolean>(false);

  const filteredProvinces =
    activeCategory === 'Semua'
      ? trendingProvinces
      : trendingProvinces.filter((p) => p.category === activeCategory);

  const carouselItems = [...filteredProvinces, { type: 'see-all' }];
  const totalPages = Math.ceil(carouselItems.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () =>
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  // Load trending provinces and personalized recommendations dynamically from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingRecommendation(true);
        // Fetch all hotels
        const { data: allHotels } = await api.get('/penginapan');

        // Group by province
        const groups: Record<
          string,
          {
            name: string;
            country: string;
            accommodations: any[];
          }
        > = {};

        (allHotels || []).forEach((h: any) => {
          const provName = h.kategoriDestinasi?.provinsi;
          if (!provName) return;
          const key = provName.toLowerCase().trim();
          if (!groups[key]) {
            groups[key] = {
              name: provName,
              country: h.kategoriDestinasi.negara || 'Indonesia',
              accommodations: [],
            };
          }
          groups[key].accommodations.push(h);
        });

        const provincesList = Object.entries(groups).map(([key, g], idx) => {
          const ratingSum = g.accommodations.reduce(
            (sum, acc) => sum + (acc.ratingRataRata || 0),
            0,
          );
          const avgRating =
            g.accommodations.length > 0
              ? ratingSum / g.accommodations.length
              : 4.5;
          const totalReviews = g.accommodations.reduce(
            (sum, acc) => sum + (acc.reviews?.length || 0),
            0,
          );

          // Realistic purchases count based on reviews + count
          const purchases = totalReviews * 2 + g.accommodations.length * 3 + 5;
          const growth = `🔥 ${(g.accommodations.length * 1.2 + 1.5).toFixed(1)}x`;

          // Pick the first non-empty image or a nice default image
          const img =
            g.accommodations.find((acc) => acc.image?.[0])?.image?.[0] ||
            'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=600&q=80';

          // Format country name capitalized
          const countryFormatted =
            g.country.charAt(0).toUpperCase() +
            g.country.slice(1).toLowerCase();

          return {
            id: idx + 1,
            name: g.name,
            country: countryFormatted,
            purchases,
            hotels: g.accommodations.length,
            growth,
            rating: avgRating > 0 ? avgRating.toFixed(1) : '4.5',
            category: countryFormatted,
            image: img,
            description: `Jelajahi keindahan wilayah ${g.name} dengan ${g.accommodations.length} pilihan penginapan premium.`,
          };
        });

        setTrendingProvinces(provincesList);

        // Build dynamic countries list
        const countriesSet = new Set<string>();
        provincesList.forEach((p) => {
          if (p.country) {
            countriesSet.add(p.country);
          }
        });
        setCategories(['Semua', ...Array.from(countriesSet)]);

        // Recommendations Logic
        if (!user?.id) {
          // Default recommendations when not logged in
          const defaults = (allHotels || [])
            .filter(
              (h: any) =>
                h.kategoriDestinasi?.provinsi?.toLowerCase() === 'bali' ||
                h.kategoriDestinasi?.provinsi?.toLowerCase() === 'jawa barat',
            )
            .slice(0, 4);
          setRecommendedHotels(
            defaults.length > 0 ? defaults : (allHotels || []).slice(0, 4),
          );
          return;
        }

        // Fetch user's bookings
        const { data: transactions } = await api.get(
          `/transaksi-penginapan/user/${user.id}`,
        );

        if (transactions && transactions.length > 0) {
          const counts: Record<string, number> = {};
          transactions.forEach((tx: any) => {
            const prov = tx.penginapan?.kategoriDestinasi?.provinsi;
            if (prov) counts[prov] = (counts[prov] || 0) + 1;
          });

          let maxProv: string | null = null;
          let maxVal = -1;
          Object.entries(counts).forEach(([prov, val]) => {
            if (val > maxVal) {
              maxVal = val;
              maxProv = prov;
            }
          });

          if (maxProv) {
            setFavoriteProvince(maxProv);
            const matching = (allHotels || []).filter(
              (h: any) =>
                h.kategoriDestinasi?.provinsi?.toLowerCase() ===
                (maxProv as string).toLowerCase(),
            );
            setRecommendedHotels(matching.slice(0, 4));
          } else {
            setRecommendedHotels((allHotels || []).slice(0, 4));
          }
        } else {
          // Fallback if user has no purchases
          const defaults = (allHotels || [])
            .filter(
              (h: any) =>
                h.kategoriDestinasi?.provinsi?.toLowerCase() === 'bali' ||
                h.kategoriDestinasi?.provinsi?.toLowerCase() === 'jawa barat',
            )
            .slice(0, 4);
          setRecommendedHotels(
            defaults.length > 0 ? defaults : (allHotels || []).slice(0, 4),
          );
        }
      } catch (err) {
        console.error('Error loading trending data:', err);
      } finally {
        setLoadingRecommendation(false);
      }
    };

    loadData();
  }, [user]);

  const displayedItems = carouselItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <section className="w-full mb-32 font-['Space_Grotesk'] relative">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-[#1a1a1a]">
          Trend Provinsi
        </h2>

        {/* Category Buttons directly under the title */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 cursor-pointer border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_black] font-black text-xs uppercase rounded-xl transition-all ${activeCategory === cat ? 'bg-[#ffcc00] text-black' : 'bg-white text-[#1a1a1a] hover:bg-stone-50'}`}
            >
              {cat === 'Semua' ? ' Wilayah' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 mt-12">
        {/* Navigation Carousel Chevrons */}
        {totalPages > 1 && (
          <div className="absolute inset-y-0 left-1 sm:left-4 right-1 sm:right-4 flex items-center justify-between z-40 pointer-events-none">
            <button
              onClick={prevPage}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black hover:bg-[#ffcc00] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_0px_black] transition-all cursor-pointer"
            >
              <FaChevronLeft className="font-black text-xl" />
            </button>
            <button
              onClick={nextPage}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black hover:bg-[#ffcc00] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_0px_black] transition-all cursor-pointer"
            >
              <FaChevronRight className="font-black text-xl" />
            </button>
          </div>
        )}

        {/* Carousel Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedItems.map((item: any) =>
            item.type === 'see-all' ? (
              <Link key="see-all" href="/explore" className="h-100 block">
                <div className="bg-[#ffcc00] border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col items-center justify-center h-full group cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-2xl">
                  <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000] mb-4">
                    <FaThLarge className="text-3xl font-black" />
                  </div>
                  <p className="font-black text-black text-xl uppercase">
                    See All
                  </p>
                  <p className="text-black/60 text-xs font-black mt-1 uppercase">
                    Discover More
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                key={item.id}
                href={`/explore?search=${item.name}`}
                className="h-100 block"
              >
                <div className="bg-white border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col h-full group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-2xl overflow-hidden cursor-pointer">
                  {/* Cover Image & Badges */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl shrink-0 border-b-2 border-black bg-stone-100">
                    <div className="absolute inset-0 bg-[#ffcc00]/10 flex items-center justify-center">
                      <FaImage className="text-stone-400/40 text-5xl" />
                    </div>
                    <Image
                      src={item.image}
                      alt=""
                      width={500}
                      height={500}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 z-10"
                    />

                    {/* Rating Badge */}
                    <div className="absolute top-2 left-2 bg-white border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_black] flex items-center gap-0.5 text-black z-20">
                      <span className="text-[#ffcc00]">★</span> {item.rating}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-black text-lg leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 border border-black/10 px-1.5 py-0.5 rounded">
                          PROVINSI
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-stone-500 mb-2">
                        <FaMapMarkerAlt className="text-xs text-stone-400" />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {item.country}
                        </span>
                      </div>

                      <p className="text-stone-600 text-[10px] font-bold leading-normal line-clamp-2 uppercase tracking-tight">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t-2 border-stone-100 flex justify-between items-center mt-auto">
                      <span className="text-[9px] font-black uppercase text-stone-400">
                        🏢 {item.hotels} Hotel
                      </span>
                      <div className="w-8 h-8 bg-blue-600 group-hover:bg-[#ffcc00] text-white group-hover:text-black rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_black] group-hover:shadow-[1px_1px_0px_0px_black] group-hover:translate-x-px group-hover:translate-y-px transition-all">
                        <FaArrowRight className="font-black text-base" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>

        {/* Pagination Dot Indicators */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2.5 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all cursor-pointer ${currentPage === i ? 'bg-[#ffcc00] scale-110 shadow-[2px_2px_0px_0px_black]' : 'bg-stone-200 hover:bg-stone-300'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Accommodations Section based on User's most-purchased Province */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 mt-24">
        <div className="border-[3px] border-black p-8 rounded-3xl bg-[#fcfbf9] shadow-[8px_8px_0px_0px_black] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black/10 pb-4 gap-4">
            <div>
              <span className="text-[9px] font-black uppercase text-[#0055ff] tracking-widest bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Personalized Recommendation
              </span>
              <h3 className="text-xl md:text-2xl font-black uppercase mt-1">
                {favoriteProvince
                  ? `Penginapan Terpopuler di ${favoriteProvince}`
                  : 'Rekomendasi Penginapan Untuk Anda'}
              </h3>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight mt-0.5">
                {favoriteProvince
                  ? `Berdasarkan provinsi yang paling sering Anda pesan (${favoriteProvince})`
                  : 'Mulai petualangan Anda dengan pilihan penginapan terbaik berikut'}
              </p>
            </div>
            <Link
              href="/explore"
              className="bg-black text-white px-5 py-2.5 font-black uppercase text-[10px] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_black] hover:bg-[#ffcc00] hover:text-black transition-all active:scale-95 cursor-pointer"
            >
              Jelajahi Semua
            </Link>
          </div>

          {loadingRecommendation ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-72 bg-stone-100 border-2 border-black/10 rounded-2xl animate-pulse animate-duration-1000"
                />
              ))}
            </div>
          ) : recommendedHotels.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <FaCompass className="text-4xl opacity-30" />
              <p className="text-stone-400 font-black uppercase text-[10px] tracking-wider">
                Belum ada penginapan yang cocok.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedHotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/explore/${hotel.id}`}
                  className="block group"
                >
                  <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 rounded-2xl overflow-hidden transition-all flex flex-col h-80">
                    <div className="h-36 relative bg-stone-100 border-b-2 border-black shrink-0">
                      <Image
                        src={hotel.image?.[0] || '/images/indonesia_1_1.jpg'}
                        alt={hotel.title}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-white border-2 border-black px-1.5 py-0.5 text-[8px] font-black uppercase shadow-[1px_1px_0px_0px_black] flex items-center gap-0.5 text-black">
                        ★ {hotel.ratingRataRata || 0}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <h4 className="font-black text-sm uppercase leading-tight truncate text-black group-hover:text-blue-600 transition-colors">
                          {hotel.title}
                        </h4>
                        <div className="flex items-center gap-1 text-stone-400 mt-1">
                          <FaMapMarkerAlt className="text-[10px]" />
                          <span className="text-[8px] font-black uppercase tracking-tight">
                            {hotel.kategoriDestinasi?.daerah || 'Indonesia'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-stone-100 flex justify-between items-center mt-auto shrink-0 bg-white">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-stone-400 uppercase leading-none">
                            Mulai dari
                          </span>
                          <span className="font-black text-xs text-black mt-0.5">
                            Rp{' '}
                            {Number(
                              hotel.kategoriKamar?.[0]?.harga || 150,
                            ).toLocaleString('id-ID')}{' '}
                            / malam
                          </span>
                        </div>
                        <div className="w-6 h-6 bg-stone-50 border border-black rounded flex items-center justify-center text-xs shadow-[1.5px_1.5px_0px_0px_black] group-hover:bg-[#ffcc00] transition-colors">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
