'use client';

import { WithAdmin } from '@/hoc/WithAdmin';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaTags,
  FaPlus,
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

import { Item, PROVINCES_BY_COUNTRY, PREDEFINED_FACILITIES } from './types';
import { BedConfigsSection } from './BedConfigsSection';
import { ImageSection } from './ImageSection';

const KelolaAdminPage: React.FC = () => {
  const { user } = useAuthStore();

  const [items, setItems] = useState<Item[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbDestinations, setDbDestinations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemPage, setItemPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destination selection state
  const [selNegara, setSelNegara] = useState('');
  const [selProvinsi, setSelProvinsi] = useState('');
  const [selDaerah, setSelDaerah] = useState('');
  const [formData, setFormData] = useState<Partial<Item>>({
    title: '',
    location: '',
    address: '',
    price: 0,
    rating: 0,
    image: '',
    category: '',
    kategoriPenginapanId: '',
    kategoriDestinasiId: '',
    isPromo: false,
    isPopular: false,
    description: '',
    roomsAvailable: 0,
    rules: '',
    faq: '',
    facilities: [],
    hasCoupon: false,
    couponDiscount: 0,
    couponCode: '',
    bedConfigs: [],
  });

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/penginapan', {
        params: {
          adminId: user?.id,
        },
      });
      const mapped = (data || []).map((it: any) => ({
        id: it.id,
        title: it.title,
        location: it.kategoriDestinasi
          ? `${it.kategoriDestinasi.daerah}, ${it.kategoriDestinasi.provinsi}`
          : '',
        address: it.address || '',
        price: it.kategoriKamar?.[0] ? Number(it.kategoriKamar[0].harga) : 0,
        rating: it.ratingRataRata || 0,
        description: it.description || '',
        image: it.image?.[0] || '',
        images: it.image || [],
        category: it.kategoriPenginapan?.nama || '',
        kategoriPenginapanId: it.kategoriPenginapanId,
        kategoriDestinasiId: it.kategoriDestinasiId,
        isPromo: (it.cupons || []).length > 0,
        isPopular: (it.ratingRataRata || 0) >= 4.5,
        facilities: (it.kategoriFasilitas || []).map((f: any) => f.nama),
        rules: it.rules || '',
        faq: it.faq || '',
        umurPenginapan: it.umurPenginapan,
        bedConfigs: (it.kategoriKamar || []).map((k: any) => ({
          maxKasur: k.maxKasur,
          maxAdult: k.maxAdult,
          maxChild: k.maxChild,
          maxKamar: k.maxKamar || 1,
          harga: Number(k.harga),
          hargaPerChild: Number(k.hargaPerChild || 0),
        })),
        hasCoupon: (it.cupons || []).length > 0,
        couponCode: it.cupons?.[0]?.code || '',
        couponDiscount: it.cupons?.[0]?.discountPercent || 0,
        couponEndDate: it.cupons?.[0]?.expiredAt
          ? it.cupons[0].expiredAt.split('T')[0]
          : '',
      }));

      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data penginapan');
    }
  }, [user?.id]);

  const fetchMetadata = async () => {
    try {
      const [{ data: categoriesData }, { data: destinationsData }] =
        await Promise.all([
          api.get('/penginapan/categories'),
          api.get('/penginapan/destinations'),
        ]);
      setDbCategories(categoriesData || []);
      setDbDestinations(destinationsData || []);
    } catch (err) {
      console.error('Gagal memuat metadata:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchItems();
      fetchMetadata();
    }
  }, [user, fetchItems]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // --- Validasi FE ---
      if (!formData.title || !formData.title.trim()) {
        toast.error('Nama Penginapan wajib diisi');
        setIsSubmitting(false);
        return;
      }
      if (!formData.kategoriPenginapanId) {
        toast.error('Silakan pilih Kategori Penginapan');
        setIsSubmitting(false);
        return;
      }
      if (!selNegara || !selProvinsi || !selDaerah) {
        toast.error('Silakan pilih Negara, Provinsi, dan Daerah');
        setIsSubmitting(false);
        return;
      }
      if (!formData.address || !formData.address.trim()) {
        toast.error('Alamat Lengkap wajib diisi');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description || !formData.description.trim()) {
        toast.error('Deskripsi wajib diisi');
        setIsSubmitting(false);
        return;
      }
      if (!formData.facilities || formData.facilities.length === 0) {
        toast.error('Pilih minimal 1 fasilitas');
        setIsSubmitting(false);
        return;
      }
      if (!formData.rules || !formData.rules.trim()) {
        toast.error('Peraturan wajib diisi');
        setIsSubmitting(false);
        return;
      }
      if (!formData.faq || !formData.faq.trim()) {
        toast.error('FAQ wajib diisi');
        setIsSubmitting(false);
        return;
      }
      if (!formData.images || formData.images.length === 0) {
        toast.error('Upload minimal 1 gambar penginapan');
        setIsSubmitting(false);
        return;
      }
      if (!formData.umurPenginapan || Number(formData.umurPenginapan) < 1) {
        toast.error('Lama Penginapan wajib diisi minimal 1 hari');
        setIsSubmitting(false);
        return;
      }

      // Validasi kamar
      if (!formData.bedConfigs || formData.bedConfigs.length !== 1) {
        toast.error('Setiap penginapan wajib memiliki tepat 1 kamar.');
        setIsSubmitting(false);
        return;
      }
      for (const config of formData.bedConfigs || []) {
        if (!config.maxKasur || config.maxKasur < 1) {
          toast.error('Max Kasur wajib diisi minimal 1');
          setIsSubmitting(false);
          return;
        }
        if (!config.maxAdult || config.maxAdult < 1) {
          toast.error('Max Adult wajib diisi minimal 1');
          setIsSubmitting(false);
          return;
        }
        if (!config.maxKamar || config.maxKamar < 1) {
          toast.error('Max Kamar wajib diisi minimal 1');
          setIsSubmitting(false);
          return;
        }
        if (!config.harga || config.harga < 1) {
          toast.error('Harga wajib diisi dan tidak boleh 0');
          setIsSubmitting(false);
          return;
        }
        // maxChild boleh 0 — tidak divalidasi
      }

      // Auto-create or find destination
      const { data: destinationData } = await api.post(
        '/penginapan/destinations',
        {
          negara: selNegara,
          provinsi: selProvinsi,
          daerah: selDaerah,
        },
      );

      const kategoriDestinasiId = destinationData.id;

      const payload = {
        title: formData.title,
        kategoriPenginapanId: formData.kategoriPenginapanId,
        kategoriDestinasiId: kategoriDestinasiId,
        address: formData.address || formData.location,
        description: formData.description || '',
        umurPenginapan: formData.umurPenginapan
          ? Number(formData.umurPenginapan)
          : 7,
        rules: formData.rules || '',
        faq: formData.faq || '',
        image: formData.images || (formData.image ? [formData.image] : []),
        fasilitas: formData.facilities || [],
        kamar: (formData.bedConfigs || []).map((b) => ({
          maxKasur: Number(b.maxKasur),
          maxAdult: Number(b.maxAdult),
          maxChild: Number(b.maxChild),
          maxKamar: Number(b.maxKamar) || 1,
          harga: Number(b.harga),
          hargaPerChild: Number(b.hargaPerChild || 0),
        })),
      };

      let savedItem: any;
      if (editingItem) {
        const { data } = await api.put(
          `/penginapan/${editingItem.id}`,
          payload,
        );
        savedItem = data.penginapan;
      } else {
        const { data } = await api.post(`/penginapan`, payload);
        savedItem = data.penginapan;
      }

      if (savedItem) {
        // Sync Coupon if needed
        if (formData.hasCoupon && formData.couponCode) {
          try {
            const { data: couponsData } = await api.get('/cupons');
            const existing = couponsData.find(
              (c: any) => c.penginapanId === savedItem.id,
            );
            const couponPayload = {
              penginapanId: savedItem.id,
              code: formData.couponCode,
              discountPercent: Number(formData.couponDiscount || 10),
              expiredAt: formData.couponEndDate
                ? new Date(formData.couponEndDate).toISOString()
                : null,
            };
            if (existing) {
              await api.put(`/cupons/${existing.id}`, couponPayload);
            } else {
              await api.post('/cupons', couponPayload);
            }
          } catch (e) {
            console.error('Gagal menyinkronkan kupon:', e);
          }
        } else {
          try {
            const { data: couponsData } = await api.get('/cupons');
            const existing = couponsData.find(
              (c: any) => c.penginapanId === savedItem.id,
            );
            if (existing) {
              await api.delete(`/cupons/${existing.id}`);
            }
          } catch (e) {}
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
      toast.success('Item berhasil disimpan');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Gagal menyimpan item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await api.delete(`/penginapan/${id}`);
        fetchItems();
        toast.success('Item berhasil dihapus');
      } catch (err) {
        console.error(err);
        toast.error('Gagal menghapus item');
      }
    }
  };

  const availableCountries = PROVINCES_BY_COUNTRY.map((c) => c.country);

  const selectedCountryObj = PROVINCES_BY_COUNTRY.find(
    (c) => c.country === selNegara,
  );
  const availableProvinces = selectedCountryObj
    ? selectedCountryObj.provinces.map((p) => p.name)
    : [];

  const selectedProvinceObj = selectedCountryObj?.provinces.find(
    (p) => p.name === selProvinsi,
  );
  const availableDistricts = selectedProvinceObj
    ? selectedProvinceObj.districts
    : [];

  const hasAccess =
    user && (user.role === 'admin' || user.role === 'superadmin');

  return !hasAccess ? (
    <div className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] text-center">
      <p className="font-black uppercase text-sm text-red-500">
        Akses ditolak. Halaman ini khusus untuk Admin.
      </p>
    </div>
  ) : (
    <div className="space-y-6">
      {/* Kelola Penginapan List */}
      <div className="bg-white border-[3px] h-217.5 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_black] flex flex-col gap-4">
        <div className="border-b-[3px] border-black pb-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              Kelola Penginapan
            </h2>
            <p className={adminPageSubtitle}>
              Kelola semua penginapan ({items.length} Item)
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormData({
                id: '',
                title: '',
                location: '',
                address: '',
                price: 0,
                rating: 0,
                image: '',
                category: '',
                kategoriPenginapanId: dbCategories[0]?.id || '',
                kategoriDestinasiId: '',
                isPromo: false,
                isPopular: false,
                description: '',
                roomsAvailable: 0,
                rules: '',
                faq: '',
                facilities: [],
                hasCoupon: false,
                couponDiscount: 0,
                couponCode: '',
                bedConfigs: [],
              });
              setSelNegara('');
              setSelProvinsi('');
              setSelDaerah('');
              setIsModalOpen(true);
            }}
            className={`${adminPrimaryBtn} px-4 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] tracking-wider shadow-[4px_4px_0px_0px_black] hover:translate-x-px hover:translate-y-px hover:shadow-none`}
          >
            <FaPlus
              className="text-xs sm:text-sm shrink-0 text-inherit"
              aria-hidden
            />
            <span className="hidden sm:inline">Tambah Penginapan Baru</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="grow overflow-y-auto">
          <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black] h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white font-black uppercase text-[9px] tracking-wider border-b-[3px] border-black">
                    <th className="p-5">Gambar</th>
                    <th className="p-5">Judul</th>
                    <th className="p-5">Lokasi</th>
                    <th className="p-5">Kategori</th>
                    <th className="p-5">Link Penginapan</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice((itemPage - 1) * 7, itemPage * 7).map((item) => (
                    <tr
                      key={item.id}
                      className="border-b-2 border-black/10 last:border-0 hover:bg-[#f5f0e8]/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="w-14 h-14 border-2 border-black rounded-lg overflow-hidden relative bg-stone-100 shrink-0">
                          <Image
                            src={item.image || '/images/avatar.svg'}
                            alt={item.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="grayscale"
                          />
                        </div>
                      </td>
                      <td className={`p-3 max-w-50 truncate ${adminTableCell}`}>
                        {item.title}
                      </td>

                      <td className={`p-3 truncate ${adminTableCellMuted}`}>
                        {item.location}
                      </td>

                      <td className={`p-3 truncate ${adminTableCellMuted}`}>
                        {item.category}
                      </td>

                      <td className="p-3 text-[10px]">
                        <a
                          href={`/explore/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Lihat penginapan"
                          aria-label="Lihat penginapan"
                          className={adminActionView}
                        >
                          <FaExternalLinkAlt
                            className={`${adminActionIcon} text-inherit`}
                          />
                        </a>
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            title="Edit penginapan"
                            aria-label="Edit penginapan"
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({
                                ...item,
                                images:
                                  item.images ||
                                  (item.image ? [item.image] : []),
                              });
                              // Pre-populate destination dropdowns from existing item location
                              // Parse "daerah, provinsi" format from item.location
                              const locParts = (item.location || '')
                                .split(',')
                                .map((s) => s.trim());
                              if (locParts.length >= 2) {
                                setSelDaerah(locParts[0]);
                                setSelProvinsi(locParts[1]);
                                // Try to find negara from predefined data
                                const foundCountry = PROVINCES_BY_COUNTRY.find(
                                  (c) =>
                                    c.provinces.some(
                                      (p) => p.name === locParts[1],
                                    ),
                                );
                                setSelNegara(
                                  foundCountry
                                    ? foundCountry.country
                                    : 'Indonesia',
                                );
                              }
                              setIsModalOpen(true);
                            }}
                            className={adminActionEdit}
                          >
                            <FaEdit
                              className={`${adminActionIcon} text-inherit`}
                            />
                          </button>
                          <button
                            type="button"
                            title="Hapus penginapan"
                            aria-label="Hapus penginapan"
                            onClick={() => handleAdminDelete(item.id)}
                            className={adminActionDelete}
                          >
                            <FaTrash
                              className={`${adminActionIcon} text-inherit`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex justify-between items-center pt-3 border-t-2 border-black bg-stone-50/50 p-2 sm:p-2.5 rounded-xl border-2 shrink-0 gap-2">
            <button
              disabled={itemPage === 1}
              onClick={() => setItemPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="font-black text-[9px] sm:text-[10px] uppercase text-center">
              Halaman {itemPage} dari {Math.ceil(items.length / 7) || 1}
            </span>
            <button
              disabled={itemPage >= Math.ceil(items.length / 7)}
              onClick={() =>
                setItemPage((p) => Math.min(Math.ceil(items.length / 7), p + 1))
              }
              className="px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-black rounded-lg font-black text-[8px] sm:text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Admin CRUD Modal */}
      {isModalOpen &&
        (user?.role === 'admin' || user?.role === 'superadmin') && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#f5f0e8] border-[5px] border-black w-full max-w-187.5 rounded-3xl shadow-[15px_15px_0px_0px_black] overflow-hidden">
              <div className="bg-black text-white p-5 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingItem ? 'Edit Penginapan' : 'Tambah Penginapan Baru'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  title="Tutup"
                  aria-label="Tutup"
                  className="text-xl text-white font-black hover:text-[#ffcc00] transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  <FaTimes className="text-inherit" />
                </button>
              </div>

              <form
                onSubmit={handleAdminSubmit}
                className="p-6 space-y-5 text-left max-h-[75vh] overflow-y-auto pr-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Nama Penginapan */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Nama Penginapan
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>

                  {/* 3. Kategori Tempat Tinggal */}
                  <div className="md:col-span-1">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Kategori Tempat Tinggal
                    </label>
                    <select
                      required
                      value={formData.kategoriPenginapanId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kategoriPenginapanId: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 text-[10px] uppercase cursor-pointer"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {dbCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nama.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Destinasi Lokasi — 3 Dropdown Terpisah */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block font-black uppercase text-[9px] text-stone-500">
                      Destinasi Lokasi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Negara */}
                      <div>
                        <label className="block font-black uppercase text-[8px] mb-1 text-stone-400">
                          Negara
                        </label>
                        <select
                          required
                          value={selNegara}
                          onChange={(e) => {
                            setSelNegara(e.target.value);
                            setSelProvinsi('');
                            setSelDaerah('');
                          }}
                          className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 text-[10px] uppercase cursor-pointer"
                        >
                          <option value="">-- Pilih Negara --</option>
                          {availableCountries.map((n) => (
                            <option key={n} value={n}>
                              {n.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Provinsi */}
                      <div>
                        <label className="block font-black uppercase text-[8px] mb-1 text-stone-400">
                          Provinsi
                        </label>
                        <select
                          required
                          value={selProvinsi}
                          disabled={!selNegara}
                          onChange={(e) => {
                            setSelProvinsi(e.target.value);
                            setSelDaerah('');
                          }}
                          className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 text-[10px] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">-- Pilih Provinsi --</option>
                          {availableProvinces.map((p) => (
                            <option key={p} value={p}>
                              {p.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Daerah / Kota */}
                      <div>
                        <label className="block font-black uppercase text-[8px] mb-1 text-stone-400">
                          Daerah / Kota
                        </label>
                        <select
                          required
                          value={selDaerah}
                          disabled={!selProvinsi}
                          onChange={(e) => setSelDaerah(e.target.value)}
                          className="w-full bg-white border-2 border-black/40 p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 text-[10px] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">-- Pilih Daerah --</option>
                          {availableDistricts.map((d) => (
                            <option key={d} value={d}>
                              {d.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 5. Alamat Lengkap */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Alamat Lengkap
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Contoh: Jalan Wisata Alam Indah No. 45"
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>

                  {/* 6. Deskripsi */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Deskripsi
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Tuliskan deskripsi lengkap di sini..."
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>

                  {/* 7. Fasilitas (WiFi, dll) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-black uppercase text-[9px] text-stone-500">
                      Fasilitas (WiFi, dll)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {PREDEFINED_FACILITIES.map((fac) => (
                        <label
                          key={fac}
                          className="flex items-center gap-2 cursor-pointer p-2 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_black] hover:bg-stone-50 transition-all select-none"
                        >
                          <input
                            type="checkbox"
                            checked={(formData.facilities || []).includes(fac)}
                            className="hidden"
                            onChange={(e) => {
                              const currentFacs = formData.facilities || [];
                              let newFacs = [...currentFacs];
                              if (e.target.checked) {
                                if (!newFacs.includes(fac)) newFacs.push(fac);
                              } else {
                                newFacs = newFacs.filter((f) => f !== fac);
                              }
                              setFormData({
                                ...formData,
                                facilities: newFacs,
                              });
                            }}
                          />
                          <div
                            className={`w-4.5 h-4.5 border-2 border-black rounded flex items-center justify-center shrink-0 ${(formData.facilities || []).includes(fac) ? 'bg-[#ffcc00]' : 'bg-white'}`}
                          >
                            {(formData.facilities || []).includes(fac) && (
                              <FaCheck
                                className="text-[9px] text-inherit"
                                aria-hidden
                              />
                            )}
                          </div>
                          <span className="font-black text-[9px] uppercase leading-none">
                            {fac}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 8. Kamar Tersedia */}
                  <div className="md:col-span-2 border-2 border-black p-4 rounded-2xl bg-white space-y-3 shadow-[3px_3px_0px_0px_black]">
                    <BedConfigsSection
                      bedConfigs={formData.bedConfigs || []}
                      onChange={(newConfigs) =>
                        setFormData({ ...formData, bedConfigs: newConfigs })
                      }
                    />
                  </div>

                  {/* 9. Umur / Lama Penginapan (Hari) */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Umur Penginapan / Minimal Durasi Tinggal (Hari)
                    </label>

                    <input
                      required
                      type="number"
                      min={1}
                      value={
                        formData.umurPenginapan === 0
                          ? ''
                          : formData.umurPenginapan || ''
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          umurPenginapan: Number(e.target.value),
                        })
                      }
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>

                  {/* 10. Aturan */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      Aturan
                    </label>

                    <textarea
                      required
                      rows={3}
                      value={formData.rules || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: e.target.value,
                        })
                      }
                      placeholder={`Contoh:
1. Check-in pukul 14:00
2. Dilarang merokok di kamar`}
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>

                  {/* 11. FAQ */}
                  <div className="md:col-span-2">
                    <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                      FAQ
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.faq || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, faq: e.target.value })
                      }
                      placeholder="Contoh:&#10;Q: Apakah Wi-Fi gratis?&#10;A: Ya, berkecepatan tinggi."
                      className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                    />
                  </div>
                </div>

                {/* 12. Gambar Penginapan */}
                <div className="border-2 border-black p-4 rounded-2xl bg-white space-y-4 shadow-[3px_3px_0px_0px_black]">
                  <ImageSection
                    images={formData.images || []}
                    onChange={(newImages) =>
                      setFormData({
                        ...formData,
                        images: newImages,
                        image: newImages[0] || '',
                      })
                    }
                  />
                </div>

                {/* Akses Coupon Section */}
                <div className="border-2 border-black p-4 rounded-2xl bg-stone-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-black uppercase text-[10px] tracking-wider text-black">
                        Akses Coupon
                      </span>
                      <span className="block text-[8px] font-bold text-stone-400 uppercase mt-0.5">
                        Berikan kupon diskon khusus untuk penginapan ini
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, hasCoupon: true })
                        }
                        className={`px-4 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${formData.hasCoupon ? 'bg-green-500 text-white' : 'bg-white hover:bg-stone-50'}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, hasCoupon: false })
                        }
                        className={`px-4 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${!formData.hasCoupon ? 'bg-red-500 text-white' : 'bg-white hover:bg-stone-50'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {formData.hasCoupon ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-black/5 h-45 overflow-y-auto pr-1">
                      <div>
                        <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                          Persentase Diskon (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={
                            formData.couponDiscount === 0
                              ? ''
                              : formData.couponDiscount || ''
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              couponDiscount: Number(e.target.value),
                            })
                          }
                          placeholder="Contoh: 15"
                          className="w-full bg-white border-2 border-black p-2 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                        />
                      </div>
                      <div>
                        <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                          Kode Kupon
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.couponCode || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                couponCode: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="PROMODISC"
                            className="grow bg-white border-2 border-black p-2 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 uppercase"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !formData.couponCode ||
                                !formData.couponCode.trim()
                              ) {
                                toast.error(
                                  'Silakan masukkan kode kupon terlebih dahulu',
                                );
                                return;
                              }
                              toast.success('Kupon berhasil diterapkan!', {
                                description: `Kode kupon: ${formData.couponCode}`,
                              });
                            }}
                            className="bg-[#ffcc00] border-2 border-black px-3 rounded-xl font-black text-[9px] uppercase shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          >
                            🔄 Apply
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-black uppercase text-[9px] mb-1 text-stone-500">
                          Tanggal Kedaluwarsa
                        </label>
                        <input
                          type="date"
                          value={formData.couponEndDate || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              couponEndDate: e.target.value,
                            })
                          }
                          className="w-full bg-white border-2 border-black p-2 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-45 border-2 border-dashed border-stone-300 rounded-xl bg-stone-100/50 flex flex-col items-center justify-center text-center p-4">
                      <FaTags
                        className="text-stone-500 text-lg mb-1"
                        aria-hidden
                      />
                      <span className="text-[9px] font-black uppercase text-stone-600">
                        Pengaturan Kupon Nonaktif
                      </span>
                      <span className="text-[8px] font-bold text-stone-500 uppercase mt-0.5">
                        Aktifkan Akses Coupon untuk memberikan diskon khusus
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-black text-white font-black uppercase text-xs tracking-wider hover:bg-[#ffcc00] hover:text-black transition-all rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {isSubmitting
                    ? 'Memproses...'
                    : editingItem
                      ? 'Simpan Perubahan'
                      : 'Buat Item Baru'}
                </button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default WithAdmin(KelolaAdminPage);
