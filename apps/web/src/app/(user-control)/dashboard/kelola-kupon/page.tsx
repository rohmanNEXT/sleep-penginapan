'use client';

import { WithAdmin } from '@/hoc/WithAdmin';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  FaPlus,
  FaTags,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import {
  adminActionDelete,
  adminActionEdit,
  adminActionIcon,
  adminActionView,
  adminPageSubtitle,
  adminPrimaryBtn,
  adminTableCell,
  adminTableCellMuted,
} from '../adminActionStyles';

interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  penginapanId: string | null;
  penginapan?: {
    id: string;
    title: string;
  };
  expiredAt: string | null;
  link: string | null;
}

interface AccommodationItem {
  id: string;
  title: string;
}

function KelolaKuponPage() {
  const { user } = useAuthStore();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([]);
  const [couponPage, setCouponPage] = useState(1);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [couponFormData, setCouponFormData] = useState<Partial<CouponItem>>({
    code: '',
    discountPercent: 0,
    penginapanId: '',
    expiredAt: '',
    link: '',
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await api.get('/cupons', {
        params: { adminId: user?.id },
      });
      setCoupons(data || []);
    } catch (err) {
      console.error('Gagal memuat kupon:', err);
    }
  }, [user?.id]);

  const fetchAccommodations = async () => {
    try {
      const { data } = await api.get('/penginapan');
      setAccommodations(data || []);
    } catch (err) {
      console.error('Gagal memuat penginapan:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchCoupons();
      fetchAccommodations();
    }
  }, [user, fetchCoupons]);

  const handleEditCoupon = (cp: CouponItem) => {
    setEditingCoupon(cp);
    setCouponFormData({
      code: cp.code,
      discountPercent: cp.discountPercent,
      penginapanId: cp.penginapanId,
      expiredAt: cp.expiredAt ? cp.expiredAt.split('T')[0] : '',
      link: cp.link || '',
    });
    setIsCouponModalOpen(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kupon ini?')) return;
    try {
      await api.delete(`/cupons/${id}`);
      toast.success('Kupon berhasil dihapus');
      fetchCoupons();
    } catch {
      toast.error('Gagal menghapus kupon');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCoupon(true);
    try {
      const resolvedPenginapanId =
        user?.role === 'superadmin'
          ? null
          : couponFormData.penginapanId || null;
      const autoLink = resolvedPenginapanId
        ? `/explore/${resolvedPenginapanId}`
        : null;
      const payload = {
        penginapanId: resolvedPenginapanId,
        code: couponFormData.code?.toUpperCase(),
        discountPercent: Number(couponFormData.discountPercent) || 10,
        expiredAt: couponFormData.expiredAt
          ? new Date(couponFormData.expiredAt).toISOString()
          : null,
        link: autoLink,
      };
      if (editingCoupon) {
        await api.put(`/cupons/${editingCoupon.id}`, payload);
        toast.success('Kupon berhasil diupdate');
      } else {
        await api.post('/cupons', payload);
        toast.success('Kupon baru berhasil ditambahkan');
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan kupon');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'superadmin';
  const hasAccess = user && (isAdmin || isSuperAdmin);
  const totalPages = Math.ceil(coupons.length / 10) || 1;
  const agedCoupons = coupons.slice((couponPage - 1) * 10, couponPage * 10);
  const pagedCoupons = agedCoupons;
  const selectedPenginapan = accommodations.find(
    (a) => a.id === couponFormData.penginapanId,
  );

  // Set penginapanId yang sudah punya kupon (untuk validasi 1 kupon per penginapan)
  const penginapanWithCoupon = new Set(
    coupons
      .filter((cp) => cp.penginapanId !== null)
      .map((cp) => cp.penginapanId as string),
  );

  // Penginapan yang tersedia untuk kupon baru (belum punya kupon)
  const availableAccommodations = accommodations.filter(
    (a) => !penginapanWithCoupon.has(a.id),
  );

  const handleOpenAddModal = () => {
    if (isAdmin && availableAccommodations.length === 0) {
      toast.error('Semua penginapan Anda sudah memiliki kupon.', {
        description:
          'Hapus kupon yang ada terlebih dahulu sebelum membuat yang baru.',
      });
      return;
    }
    setEditingCoupon(null);
    setCouponFormData({
      code: '',
      discountPercent: 0,
      penginapanId: availableAccommodations[0]?.id || '',
      expiredAt: '',
      link: '',
    });
    setIsCouponModalOpen(true);
  };

  return hasAccess ? (
    <div className="bg-white border-[3px] border-black px-3 py-4 sm:px-4 sm:py-5 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_black] h-217.5 flex flex-col overflow-y-auto justify-between">
      {/* Header */}
      <div className="border-b-[3px] border-black pb-4 mb-4 flex justify-between items-center shrink-0 gap-2">
        <div>
          <h2 className="text-base sm:text-lg md:text-2xl font-black uppercase tracking-tight">
            Kelola Kupon
          </h2>
          <p className={adminPageSubtitle}>
            Kelola semua kupon diskon penginapan aktif ({coupons.length} Kupon)
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className={`${adminPrimaryBtn} px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[9px] sm:text-[10px]`}
        >
          <FaPlus
            className="text-xs sm:text-sm shrink-0 text-inherit"
            aria-hidden
          />
          <span className="hidden sm:inline">Tambah Kupon</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Table / Empty State */}
      <div className="grow overflow-y-auto mb-4">
        {coupons.length === 0 ? (
          <div className="bg-stone-50 border-2 border-dashed border-black/20 p-8 sm:p-12 text-center rounded-2xl h-full flex flex-col items-center justify-center">
            <FaTags
              className="text-4xl sm:text-5xl text-stone-500 mb-3"
              aria-hidden
            />
            <h3 className="text-sm sm:text-base font-black uppercase text-stone-600 mb-1">
              Belum ada kupon dikonfigurasi
            </h3>
          </div>
        ) : (
          <div className="border-2 border-black rounded-xl overflow-hidden bg-stone-50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs min-w-125">
                <thead>
                  <tr className="bg-black text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                    <th className="p-2 sm:p-3">Nama Penginapan</th>
                    <th className="p-2 sm:p-3">Kode Kupon</th>
                    <th className="p-2 sm:p-3">Diskon (%)</th>
                    <th className="p-2 sm:p-3">Berlaku Hingga</th>
                    <th className="p-2 sm:p-3">Link Penginapan</th>
                    <th className="p-2 sm:p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCoupons.map((cp: CouponItem) => {
                    const expiredLabel = cp.expiredAt
                      ? new Date(cp.expiredAt).toLocaleDateString('id-ID')
                      : 'Selamanya';
                    const exploreHref = cp.penginapanId
                      ? `/explore/${cp.penginapanId}`
                      : null;

                    return (
                      <tr
                        key={cp.id}
                        className="border-b-2 border-black/10 last:border-0 hover:bg-stone-100 transition-colors"
                      >
                        <td
                          className={`p-2 sm:p-3 truncate max-w-25 sm:max-w-37.5 ${adminTableCell}`}
                        >
                          {cp.penginapan?.title || (
                            <span className="text-stone-500">Global</span>
                          )}
                        </td>
                        <td
                          className={`p-2 sm:p-3 font-mono ${adminTableCell}`}
                        >
                          {cp.code}
                        </td>
                        <td className={`p-2 sm:p-3 ${adminTableCell}`}>
                          {cp.discountPercent}%
                        </td>
                        <td className={`p-2 sm:p-3 ${adminTableCellMuted}`}>
                          {expiredLabel}
                        </td>
                        <td className="p-2 sm:p-3 text-[8px] sm:text-[9px]">
                          {exploreHref ? (
                            <Link
                              href={exploreHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Lihat penginapan"
                              aria-label="Lihat penginapan"
                              className={adminActionView}
                            >
                              <FaExternalLinkAlt
                                className={`${adminActionIcon} text-inherit`}
                              />
                            </Link>
                          ) : (
                            <span
                              className={`${adminTableCellMuted} font-black`}
                            >
                              -
                            </span>
                          )}
                        </td>
                        <td className="p-2 sm:p-3 text-center">
                          <div className="flex gap-1.5 sm:gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => handleEditCoupon(cp)}
                              title="Ubah kupon"
                              aria-label="Ubah kupon"
                              className={adminActionEdit}
                            >
                              <FaEdit
                                className={`${adminActionIcon} text-inherit`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(cp.id)}
                              title="Hapus kupon"
                              aria-label="Hapus kupon"
                              className={adminActionDelete}
                            >
                              <FaTrash
                                className={`${adminActionIcon} text-inherit`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {coupons.length > 0 && (
        <div className="flex justify-between items-center pt-3 border-t-2 border-black bg-stone-50/50 p-2 sm:p-2.5 rounded-xl border-2 shrink-0 gap-2">
          <button
            disabled={couponPage === 1}
            onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="font-black text-[9px] sm:text-[10px] uppercase text-center">
            Halaman {couponPage} dari {totalPages}
          </span>
          <button
            disabled={couponPage >= totalPages}
            onClick={() => setCouponPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f5f0e8] border-[5px] border-black w-full max-w-137.5 rounded-3xl shadow-[15px_15px_0px_0px_black] overflow-hidden">
            <div className="bg-black text-white p-5 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase">
                {editingCoupon ? 'Ubah Coupon' : 'Tambah Coupon Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                title="Tutup"
                aria-label="Tutup"
                className="text-xl text-white font-black hover:text-[#ffcc00] cursor-pointer inline-flex items-center justify-center"
              >
                <FaTimes className="text-inherit" />
              </button>
            </div>

            <form
              onSubmit={handleCouponSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Superadmin notice */}
              {isSuperAdmin && (
                <div className="bg-yellow-100 p-3 rounded-xl border-2 border-yellow-400">
                  <p className="text-[10px] font-black uppercase text-yellow-800">
                    Global Coupon (Berlaku untuk semua penginapan)
                  </p>
                  <p className="text-[9px] font-bold text-yellow-700 mt-1">
                    Link tidak diperlukan untuk kupon global.
                  </p>
                </div>
              )}

              {/* Admin: pilih penginapan */}
              {isAdmin && (
                <div>
                  <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                    Pilih Penginapan
                  </label>
                  <select
                    required
                    value={couponFormData.penginapanId || ''}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        penginapanId: e.target.value,
                      })
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs rounded-xl outline-none font-black text-[10px] uppercase cursor-pointer"
                  >
                    <option value="">-- Pilih Penginapan --</option>
                    {(editingCoupon
                      ? accommodations
                      : availableAccommodations
                    ).map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {!editingCoupon && availableAccommodations.length === 0 && (
                    <p className="text-[9px] font-black text-red-500 uppercase mt-1">
                      Semua penginapan sudah memiliki kupon.
                    </p>
                  )}
                </div>
              )}

              {/* SuperAdmin: hidden penginapan field but set to null */}
              {isSuperAdmin && <input type="hidden" value="" />}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                    Kode Kupon
                  </label>
                  <input
                    required
                    type="text"
                    value={couponFormData.code || ''}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs rounded-xl outline-none uppercase font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                    Diskon (%)
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={100}
                    value={couponFormData.discountPercent || ''}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs rounded-xl outline-none font-black"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                    🗓️ Berakhir Pada
                  </label>
                  <input
                    type="date"
                    value={couponFormData.expiredAt || ''}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        expiredAt: e.target.value,
                      })
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs rounded-xl outline-none font-black"
                  />
                </div>
              </div>

              {/* Admin only: coupon box preview + link di bawahnya */}
              {isAdmin && couponFormData.penginapanId && (
                <div>
                  <label className="block font-black uppercase text-[9px] mb-2 text-stone-500">
                    Preview Kupon
                  </label>
                  <div className="bg-[#ffcc00] border-[3px] border-black rounded-2xl shadow-[5px_5px_0px_0px_black] p-4 relative overflow-hidden">
                    <div className="absolute -left-3 bottom-10 w-6 h-6 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />
                    <div className="absolute -right-3 bottom-10 w-6 h-6 rounded-full bg-[#f5f0e8] border-[3px] border-black z-20" />
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[8px] font-black uppercase bg-black/10 px-2 py-0.5 rounded border border-black/10 tracking-wider">
                          Stay Cupon
                        </span>
                        <h3 className="text-sm font-black uppercase mt-2 leading-tight tracking-tight truncate max-w-45">
                          {selectedPenginapan?.title || 'Penginapan'}
                        </h3>
                      </div>
                      <div className="bg-black text-[#ffcc00] border-2 border-black rounded-full w-14 h-14 flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_black]">
                        <span className="text-[7px] font-black uppercase leading-none">
                          DISKON
                        </span>
                        <span className="font-black text-sm leading-tight">
                          {couponFormData.discountPercent || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="border-t-2 border-dashed border-black/30 my-2" />
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[7px] font-black text-black/45 uppercase leading-none">
                          Kode Promo
                        </span>
                        <p className="text-xs font-black uppercase tracking-wider font-mono mt-0.5">
                          {couponFormData.code || '—'}
                        </p>
                      </div>
                      {couponFormData.expiredAt && (
                        <span className="text-[8px] font-bold text-black/60 uppercase">
                          s/d{' '}
                          {new Date(
                            couponFormData.expiredAt,
                          ).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link penginapan di bawah coupon box — dihapus dari modal */}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingCoupon}
                className="w-full py-3 bg-black text-white font-black uppercase text-xs tracking-wider hover:bg-[#ffcc00] hover:text-black transition-all rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_black] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:shadow-[4px_4px_0px_0px_black]"
              >
                {isSubmittingCoupon
                  ? 'Memproses...'
                  : editingCoupon
                    ? 'Simpan Perubahan'
                    : 'Buat Coupon Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] text-center">
      <p className="font-black uppercase text-sm text-red-500">
        Akses ditolak. Hanya admin.
      </p>
    </div>
  );
}

export default WithAdmin(KelolaKuponPage);
