'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Mail, Phone, Send } from 'lucide-react';
import api from '@/lib/api';

const ReportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error('Mohon lengkapi semua kolom!');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/report/send-report', formData);
      toast.success('Laporan Terkirim!', {
        description:
          'Laporan Anda telah berhasil kami kirimkan ke email admin dan akan segera diproses.',
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.error ||
          'Gagal mengirimkan laporan. Silakan coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-12 pb-60 px-6 font-['Space_Grotesk'] antialiased">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-black mb-12 text-center uppercase">
          Report
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_black]">
              <h3 className="text-lg font-black uppercase mb-4 tracking-tight">
                Informasi Kontak
              </h3>
              <p className="text-stone-600 text-xs font-bold uppercase tracking-wider mb-6">
                Kami siap membantu Anda menyelesaikan masalah penginapan Anda.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffcc00] border-2 border-black flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40 leading-none">
                      Kantor Pusat
                    </p>
                    <p className="text-xs font-black uppercase mt-0.5">
                      Jakarta, Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0055ff] border-2 border-black flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40 leading-none">
                      Surel Resmi
                    </p>
                    <p className="text-xs font-black mt-0.5">
                      support@trips.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e63b2e] border-2 border-black flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40 leading-none">
                      Layanan Telepon
                    </p>
                    <p className="text-xs font-black uppercase mt-0.5">
                      +62 21-1234-5678
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-black text-white p-6 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
              <h4 className="font-black uppercase text-[#ffcc00] text-sm mb-2 tracking-tight">
                Penting
              </h4>
              <p className="text-[10px] opacity-80 font-bold uppercase leading-relaxed">
                Untuk masalah terkait transaksi atau pengembalian dana, mohon
                sertakan ID Pemesanan Anda di kolom subjek laporan untuk
                mempercepat penyelesaian.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] space-y-6"
            >
              <div>
                <label className="block text-[9px] font-black uppercase opacity-60 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#ffcc00]/20 transition-all placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase opacity-60 mb-2">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#ffcc00]/20 transition-all placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase opacity-60 mb-2">
                  Subjek Laporan
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Contoh: Kendala Pembayaran / ID Pemesanan"
                  className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#ffcc00]/20 transition-all placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase opacity-60 mb-2">
                  Pesan Laporan
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Jelaskan kendala Anda secara rinci..."
                  className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#ffcc00]/20 transition-all placeholder:text-stone-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white hover:bg-[#ffcc00] hover:text-black font-black uppercase text-xs tracking-widest border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
