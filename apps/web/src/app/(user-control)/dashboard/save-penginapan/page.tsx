"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { FaBookmark, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';

const SavePenginapanPage: React.FC = () => {
  const { user } = useAuthStore();
  const [savedHotels, setSavedHotels] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (user) {
      const list = JSON.parse(localStorage.getItem(`saved_hotels_${user.id}`) || "[]");
      setSavedHotels(list);
    }
  }, [user]);

  const handleRemoveSave = (id: string) => {
    if (user) {
      const updated = savedHotels.filter((h: any) => h.id !== id);
      localStorage.setItem(`saved_hotels_${user.id}`, JSON.stringify(updated));
      setSavedHotels(updated);
      toast.success("Hotel dihapus dari daftar simpan.");
    }
  };

  const totalPages = Math.ceil(savedHotels.length / itemsPerPage) || 1;
  const pagedHotels = savedHotels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user) return null;

  return (
    <div className="bg-white border-[3px] border-black px-3 py-4 sm:px-4 sm:py-5 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_black] h-217.5 flex flex-col">

      {/* Header */}
      <div className="border-b-[3px] border-black pb-4 mb-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Save Penginapan</h2>
        <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">
          Daftar hotel favorit yang Anda simpan ({savedHotels.length})
        </p>
      </div>

      {/* Content */}
      <div className="grow overflow-y-auto mb-4">
        {savedHotels.length === 0 ? (
          <div className="bg-stone-50 border-2 border-dashed border-black/20 p-12 text-center rounded-2xl h-full flex flex-col items-center justify-center">
            <FaBookmark className="text-5xl text-stone-400 mb-3" />
            <h3 className="text-base font-black uppercase text-black mb-1">Belum ada hotel disimpan</h3>
            <p className="text-stone-500 font-bold text-xs uppercase max-w-sm mb-6 text-center">
              Simpan hotel favorit Anda saat menjelajah untuk melihatnya di sini.
            </p>
            <Link
              href="/explore?type=penginapan"
              className="bg-[#ffcc00] text-black border-2 border-black px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Mulai Menjelajah
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 auto-rows-fr">
            {pagedHotels.map((item) => (
              <div
                key={item.id}
                className="bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_black] transition-all rounded-xl overflow-hidden flex flex-col group relative"
              >
                {/* Image */}
                <div className="relative h-28 overflow-hidden border-b-2 border-black shrink-0">
                 <Image
  src={item.image}
  alt={item.title}
  width={500}
  height={300}
  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
/>
                  <div className="absolute top-1.5 left-1.5 bg-white border-2 border-black px-1.5 py-0.5 text-[8px] font-black uppercase shadow-[1px_1px_0px_0px_black] flex items-center gap-0.5">
                    <span className="text-[#ffcc00]">★</span> {item.rating}
                  </div>
                  <button
                    onClick={() => handleRemoveSave(item.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border-2 border-black rounded-md flex items-center justify-center text-[#e63b2e] hover:bg-[#e63b2e] hover:text-white shadow-[1px_1px_0px_0px_black] hover:shadow-none transition-all cursor-pointer z-10"
                  >
                    <FaHeart className="text-[11px] font-black" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-2.5 flex flex-col justify-between grow">
                  <div>
                    <h3 className="font-black text-black text-[10px] uppercase truncate leading-tight group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-0.5 text-stone-500 mt-1">
                      <FaMapMarkerAlt className="text-[9px] text-stone-400" />
                      <span className="text-[7px] font-black uppercase tracking-wider truncate">{item.location}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center mt-1.5">
                    <div className="flex flex-col">
                      <span className="text-[6px] font-black text-stone-400 uppercase leading-none">Mulai dari</span>
                      <span className="text-[11px] font-black text-black mt-0.5">${item.price}</span>
                    </div>
                    <Link
                      href={`/explore/${item.id}?type=${item.type || 'penginapan'}`}
                      className="bg-blue-600 group-hover:bg-[#ffcc00] text-white group-hover:text-black px-2.5 py-1 rounded-lg border-2 border-black font-black text-[7px] uppercase shadow-[2px_2px_0px_0px_black] group-hover:shadow-[1px_1px_0px_0px_black] transition-all"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination — fixed di bawah */}
      {savedHotels.length > 0 && (
        <div className="flex justify-between items-center pt-3 border-t-2 border-black bg-stone-50/50 p-2 sm:p-2.5 rounded-xl border-2 shrink-0 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="font-black text-[9px] sm:text-[10px] uppercase text-center">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default SavePenginapanPage;
