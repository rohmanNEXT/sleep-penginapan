'use client';

import Image from 'next/image';
import type { Content } from '../type';
import { FaChevronLeft, FaChevronRight, FaImages } from 'react-icons/fa';

interface ImageCarouselProps {
  item: Content;
  currentSlide: number;
  onSlideChange: (idx: number) => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onOpenGallery: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  item,
  currentSlide,
  onSlideChange,
  onPrev,
  onNext,
  onOpenGallery,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 h-112.5">
      {/* Main Image */}
      <div
        onClick={onOpenGallery}
        className="relative md:col-span-2 border-[3px] border-black rounded-2xl overflow-hidden group h-full"
      >
        <Image
          src={item.gallery?.[currentSlide] || item.image}
          alt={item.title}
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-700"
          fill
        />

        {item.gallery && item.gallery.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-stone-50 transition-colors shadow-[2px_2px_0px_0px_black] active:scale-95 active:shadow-none z-10"
            >
              <FaChevronLeft className="text-sm font-black" />
            </button>
            <button
              onClick={onNext}
              className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-stone-50 transition-colors shadow-[2px_2px_0px_0px_black] active:scale-95 active:shadow-none z-10"
            >
              <FaChevronRight className="text-sm font-black" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-white/20 z-10">
              {item.gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); onSlideChange(idx); }}
                  className={`cursor-pointer w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#ffcc00] scale-125' : 'bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Side thumbnails */}
      <div className="hidden md:flex flex-col gap-4 h-full">
        <div
          onClick={onOpenGallery}
          className="relative flex-1 border-[3px] border-black rounded-2xl overflow-hidden cursor-pointer group"
        >
          <Image
            src={item.gallery?.[1] || item.image}
            alt={item.title}
            fill
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div
          onClick={onOpenGallery}
          className="relative flex-1 border-[3px] border-black rounded-2xl overflow-hidden cursor-pointer group"
        >
          <Image
            src={item.gallery?.[2] || item.image}
            alt={item.title}
            fill
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors flex flex-col items-center justify-center text-white p-2">
            <FaImages className="text-3xl mb-1 font-medium select-none" />
            <span className="text-[10px] font-black uppercase tracking-wider text-center drop-shadow-md">
              Lihat semua {item.gallery?.length ?? 4} foto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
