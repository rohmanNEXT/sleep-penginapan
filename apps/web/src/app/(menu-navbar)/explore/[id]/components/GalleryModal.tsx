'use client';

import Image from 'next/image';
import type { Content } from '../type';
import { FaTimes } from 'react-icons/fa';

interface GalleryModalProps {
  item: Content;
  onClose: () => void;
  onBook: () => void;
  isAdminOrSuperAdmin: boolean;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  item,
  onClose,
  onBook,
  isAdminOrSuperAdmin,
}) => {
  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      <header className="bg-white border-b-4 border-black p-4 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h2 className="text-sm md:text-lg font-black uppercase tracking-tight">{item.title}</h2>
        <div className="flex items-center gap-4">
          {!isAdminOrSuperAdmin && (
            <button
              onClick={() => { onClose(); onBook(); }}
              className="cursor-pointer bg-[#ffcc00] border-[2.5px] border-black px-6 py-2 rounded-lg font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Book Now
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer w-10 h-10 flex items-center justify-center bg-white border-[2.5px] border-black rounded-lg hover:bg-stone-50 transition-colors"
          >
            <FaTimes className="font-black" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(item.gallery && item.gallery.length > 0 ? item.gallery : [item.image]).map((img, i) => (
            <div
              key={i}
              className="aspect-video relative border-[3px] border-black rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-zoom-in shadow-[6px_6px_0px_0px_black]"
            >
              <Image src={img} alt={`Gallery ${i}`} fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
