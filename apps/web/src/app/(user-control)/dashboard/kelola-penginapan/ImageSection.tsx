import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { FaTimes, FaImage } from "react-icons/fa";
import { adminActionDelete, adminActionIcon } from "../adminActionStyles";

interface ImageSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageSection: React.FC<ImageSectionProps> = ({ images, onChange }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - images.length;
    const toAdd = files.slice(0, remaining);

    if (toAdd.length === 0) {
      if (images.length >= 6) {
        toast.error("Sudah mencapai batas maksimal 6 gambar!");
      }
      return;
    }

    let loaded = 0;
    const loadedImages: string[] = [];
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loadedImages.push(reader.result as string);
        loaded++;
        if (loaded === toAdd.length) {
          const finalImages = [...images, ...loadedImages];
          onChange(finalImages);
          toast.success(`${toAdd.length} Gambar berhasil diunggah!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    const nextImages = images.filter((_, i) => i !== indexToRemove);
    onChange(nextImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b-2 border-black pb-2 gap-2">
        <div>
          <span className="block font-black uppercase text-[10px] tracking-wider text-black">
            Gambar Penginapan (Min 1, Max 6)
          </span>
          <span className="block text-[8px] font-bold text-stone-400 uppercase mt-0.5">
            Pilih file gambar lokal Anda untuk diunggah
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className={`relative w-full h-11.5 border-2 border-black rounded-xl overflow-hidden transition-all flex items-center justify-center font-black text-[10px] uppercase bg-[#ffcc00] hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer`}>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={images.length >= 6}
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
          />
          <span>📁 {images.length >= 6 ? "Slot Gambar Penuh" : `Pilih & Unggah Gambar (Sisa ${6 - images.length} Slot)`}</span>
        </div>
      </div>

      {/* Previews with a strictly identical fixed-height box (h-[180px]) */}
      {images.length > 0 ? (
        <div className="h-45 border-2 border-black rounded-2xl bg-stone-50 p-3 overflow-y-auto shadow-[3px_3px_0px_0px_black] grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative h-17.5 border-2 border-black rounded-xl overflow-hidden group bg-white shadow-[1.5px_1.5px_0px_0px_black]">
              {img ? (
                <Image src={img} alt="Penginapan" fill className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-[8px] uppercase">
                  Kosong
                </div>
              )}
              <div className="absolute top-1 left-1 bg-black text-white px-1 py-0.5 rounded text-[7px] font-black uppercase">
                #{index + 1}
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                title="Hapus gambar"
                aria-label="Hapus gambar"
                className={`absolute top-1 right-1 w-5! h-5! min-w-0! rounded ${adminActionDelete} hover:bg-black`}
              >
                <FaTimes className={`${adminActionIcon} text-[9px] text-inherit`} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Fixed-height empty box strictly matching the image preview height */
        <div className="h-45 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-100/50 flex flex-col items-center justify-center text-center p-6">
          <FaImage className="text-4xl text-stone-500 mb-2" aria-hidden />
          <span className="text-[10px] font-black uppercase text-stone-600">Pratinjau Gambar Kosong</span>
          <span className="text-[8px] font-bold text-stone-500 uppercase mt-0.5 max-w-62.5">
            Wajib memasukkan minimal 1 gambar dan maksimal 6 gambar
          </span>
        </div>
      )}
    </div>
  );
};
