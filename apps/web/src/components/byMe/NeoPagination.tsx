'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export type PaginationItem = number | 'ellipsis';

/** Max 3 page buttons; uses `1 2 ...` style when totalPages > 3 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const page = Math.min(Math.max(1, currentPage), totalPages);

  if (page <= 2) {
    return [1, 2, 'ellipsis'];
  }
  if (page >= totalPages - 1) {
    return ['ellipsis', totalPages - 1, totalPages];
  }
  return ['ellipsis', page, 'ellipsis'];
}

interface NeoPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const NeoPagination: React.FC<NeoPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const items = getPaginationRange(safePage, totalPages);

  const pageBtnClass = (active: boolean) =>
    `w-10 h-10 flex items-center justify-center border-[3px] border-black font-black transition-all rounded-lg shadow-[3px_3px_0px_0px_black] cursor-pointer ${
      active ? 'bg-black text-white' : 'bg-white hover:bg-stone-50'
    }`;

  const navBtnClass =
    'flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-black bg-white font-black shadow-[3px_3px_0px_0px_black] transition-all hover:bg-[#ffcc00] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer';

  return (
    <nav
      className={`mt-12 flex items-center justify-center gap-2 pb-4 ${className}`.trim()}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage <= 1}
        className={navBtnClass}
        aria-label="Halaman sebelumnya"
      >
        <FaChevronLeft />
      </button>

      <div className="flex gap-2 items-center">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="w-10 h-10 flex items-center justify-center font-black text-black select-none"
              aria-hidden
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={pageBtnClass(safePage === item)}
              aria-current={safePage === item ? 'page' : undefined}
              aria-label={`Halaman ${item}`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage >= totalPages}
        className={navBtnClass}
        aria-label="Halaman berikutnya"
      >
        <FaChevronRight />
      </button>
    </nav>
  );
};

export default NeoPagination;
