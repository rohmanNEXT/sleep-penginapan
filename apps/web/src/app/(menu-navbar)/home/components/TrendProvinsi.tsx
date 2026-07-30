'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

import {
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaArrowRight,
  FaMapMarkerAlt,
  FaThLarge,
} from 'react-icons/fa';

interface TrendingProvinsi {
  provinsi: string;
  negara: string;
  count: number;
}

interface ProvinsiWithImage extends TrendingProvinsi {
  image: string;
  description: string;
  hotelCount: number;
}

const TrendProvinsi: React.FC = () => {
  const [trendingList, setTrendingList] = useState<ProvinsiWithImage[]>([]);
  const [allProvinsi, setAllProvinsi] = useState<ProvinsiWithImage[]>([]);
  const [activeNegara, setActiveNegara] = useState<string>('Semua');
  const [negaraList, setNegaraList] = useState<string[]>(['Semua']);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: trending } = await api.get<TrendingProvinsi[]>(
          '/transaksi-penginapan/trending-provinsi',
        );

        const { data: penginapanData } = await api.get('/penginapan');

        const penginapanList: any[] =
          penginapanData.penginapan || penginapanData || [];

        const provinsiMap: Record<
          string,
          { image: string; hotelCount: number }
        > = {};

        penginapanList.forEach((p: any) => {
          const prov = p.kategoriDestinasi?.provinsi;

          if (!prov) return;

          if (!provinsiMap[prov]) {
            provinsiMap[prov] = {
              image: '',
              hotelCount: 0,
            };
          }

          provinsiMap[prov].hotelCount++;

          if (!provinsiMap[prov].image && p.image?.[0]) {
            provinsiMap[prov].image = p.image[0];
          }
        });

        const mapped: ProvinsiWithImage[] = (trending || []).map((t) => ({
          ...t,
          image: provinsiMap[t.provinsi]?.image || '',
          hotelCount: provinsiMap[t.provinsi]?.hotelCount || 0,
          description: `Jelajahi keindahan ${t.provinsi} dengan berbagai pilihan penginapan terbaik.`,
        }));

        setAllProvinsi(mapped);
        setTrendingList(mapped);

        const negaraSet = new Set<string>(mapped.map((m) => m.negara));

        setNegaraList(['Semua', ...Array.from(negaraSet)]);
      } catch (err) {
        console.error('Gagal memuat trend provinsi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(0);

    if (activeNegara === 'Semua') {
      setTrendingList(allProvinsi);
    } else {
      setTrendingList(allProvinsi.filter((p) => p.negara === activeNegara));
    }
  }, [activeNegara, allProvinsi]);

  const carouselItems = [...trendingList, { type: 'see-all' as const }];

  const totalPages = Math.ceil(carouselItems.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const displayedItems = carouselItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <section className="w-full mb-32 font-['Space_Grotesk'] relative px-4 sm:px-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-black mb-6 text-[#1a1a1a]">
          Trend Provinsi
        </h2>

        {/* FILTER */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {negaraList.map((negara) => (
            <button
              key={negara}
              onClick={() => setActiveNegara(negara)}
              className={`px-6 py-2.5 cursor-pointer border-[3px] border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_0px_black] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_black] ${
                activeNegara === negara
                  ? 'bg-[#ffcc00] text-black'
                  : 'bg-white text-[#1a1a1a] hover:bg-stone-50'
              }`}
            >
              {negara === 'Semua' ? 'Semua Wilayah' : negara}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 mt-12">
        {/* NAVIGATION */}
        {totalPages > 1 && (
          <div className="absolute inset-y-0 left-1 sm:left-4 right-1 sm:right-4 flex items-center justify-between z-40 pointer-events-none">
            <button
              type="button"
              onClick={prevPage}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ffcc00] transition-all cursor-default"
            >
              <FaChevronLeft className="text-black text-sm cursor-pointer" />
            </button>

            <button
              type="button"
              onClick={nextPage}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ffcc00] transition-all cursor-default"
            >
              <FaChevronRight className="text-black text-sm cursor-pointer" />
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-100 bg-stone-100 border-[3px] border-black/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : trendingList.length === 0 ? (
          /* EMPTY */
          <div className="text-center py-20 border-[3px] border-dashed border-black/20 rounded-3xl">
            <FaFire className="mx-auto text-4xl text-stone-300 mb-3 cursor-pointer" />

            <p className="font-black uppercase text-xs text-stone-400">
              Belum ada data trending. Lakukan transaksi untuk memulai.
            </p>
          </div>
        ) : (
          /* GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedItems.map((item: any, idx) =>
              item.type === 'see-all' ? (
                /* SEE ALL */
                <Link
                  key="see-all"
                  href="/explore"
                  className="h-100 block cursor-default cursor-pointer"
                >
                  <div className="h-full bg-[#ffcc00] border-[3px] border-[#1a1a1a] rounded-2xl shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col items-center justify-center group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    <div className="w-16 h-16 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-4">
                      <FaThLarge className="text-3xl text-black cursor-pointer" />
                    </div>

                    <p className="text-xl font-black uppercase text-black">
                      See All
                    </p>

                    <p className="text-xs font-black uppercase text-black/60 mt-1">
                      Discover More
                    </p>
                  </div>
                </Link>
              ) : (
                /* CARD */
                <Link
                  key={`${item.provinsi}-${idx}`}
                  href={`/explore?negara=${encodeURIComponent(
                    item.negara,
                  )}&provinsi=${encodeURIComponent(item.provinsi)}`}
                  className="h-100 block cursor-default"
                >
                  <div className="bg-white border-[3px] border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col h-full group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    {/* IMAGE */}
                    <div className="relative h-48 overflow-hidden border-b-2 border-black bg-stone-100">
                      {!item.image && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#ffcc00]/10">
                          <FaFire className="text-5xl text-stone-300 cursor-pointer" />
                        </div>
                      )}

                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.provinsi}
                          width={500}
                          height={300}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      )}

                      {/* TRENDING */}
                      <div className="absolute top-2 left-2 bg-[#e63b2e]/80 backdrop-filter-sm border-2 border-black rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-[1px_1px_0px_0px_black] flex items-center gap-1 z-20">
                        <FaFire className="text-[10px] cursor-pointer" />
                        {item.count}x Dipesan
                      </div>

                      {/* RANK */}
                      <div className="absolute top-2 right-2 bg-[#ffcc00]/80 backdrop-filter-sm border-2 border-black rounded-md w-8 h-8 flex items-center justify-center text-[10px] font-black text-black shadow-[1px_1px_0px_0px_black] z-20">
                        #{currentPage * itemsPerPage + idx + 1}
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-black uppercase tracking-tight leading-tight text-black group-hover:text-blue-600 transition-colors">
                            {item.provinsi}
                          </h3>

                          <span className="text-[8px] font-black uppercase tracking-widest bg-stone-100 border border-black/10 px-1.5 py-0.5 rounded text-stone-400">
                            PROVINSI
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-stone-500 mb-2">
                          <FaMapMarkerAlt className="text-xs text-stone-400 cursor-pointer" />

                          <span className="text-[9px] font-black uppercase tracking-wider">
                            {item.negara}
                          </span>
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-tight leading-normal text-stone-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* FOOTER */}
                      <div className="pt-3 mt-auto border-t-2 border-stone-100 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-stone-400">
                          🏢 {item.hotelCount} Hotel
                        </span>

                        <div className="w-8 h-8 bg-blue-600 text-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black] group-hover:bg-[#ffcc00] group-hover:text-black transition-all">
                          <FaArrowRight className="text-sm cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}

        {/* DOTS */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2.5 mt-8">
            {Array.from({
              length: totalPages,
            }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all cursor-default ${
                  currentPage === i
                    ? 'bg-[#ffcc00] scale-110 shadow-[2px_2px_0px_0px_black]'
                    : 'bg-stone-200 hover:bg-stone-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendProvinsi;
