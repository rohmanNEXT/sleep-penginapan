'use client';

import type { Content } from '../type';
import { FaMapMarkerAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaHourglassHalf, FaUtensils, FaWifi, FaSnowflake, FaSpa, FaParking, FaSwimmingPool, FaUtensils as FaRestaurant, FaDumbbell, FaTshirt, FaBuilding, FaCheck, FaHotel, FaUsers, FaChild, FaDoorOpen } from 'react-icons/fa';

interface PropertyInfoProps {
  item: Content;
  mounted: boolean;
}

const facilityIcon = (name: string) => {
  const n = name.trim().toLowerCase();
  if (n === 'sarapan' || n === 'breakfast') return <FaUtensils />;
  if (n === 'wifi') return <FaWifi />;
  if (n === 'ac') return <FaSnowflake />;
  if (n === 'spa') return <FaSpa />;
  if (n === 'parkir' || n.includes('parkir')) return <FaParking />;
  if (n === 'pool' || n.includes('kolam')) return <FaSwimmingPool />;
  if (n === 'restaurant' || n === 'restoran') return <FaRestaurant />;
  if (n === 'gym') return <FaDumbbell />;
  if (n === 'laundry') return <FaTshirt />;
  if (n === 'rooftop') return <FaBuilding />;
  return <FaCheck />;
};

export const PropertyInfo: React.FC<PropertyInfoProps> = ({ item, mounted }) => {
  const now = new Date();
  const startDate = item.startDate ? new Date(item.startDate) : new Date(now.getTime() - 86400000);
  const validUntil = item.endDate ? new Date(item.endDate) : new Date(now.getTime() + 30 * 86400000);
  const stock = item.roomsAvailable || 5;
  const daysLeft = (validUntil.getTime() - now.getTime()) / (1000 * 3600 * 24);
  const totalDays = Math.max(1, (validUntil.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  let badge = { label: 'Ongoing', color: 'bg-[#eafaf1] text-[#2e7d32]', icon: <FaCheckCircle /> };
  if (now < startDate) badge = { label: 'Incoming', color: 'bg-[#e6f0ff] text-[#0055ff]', icon: <FaClock /> };
  else if (stock <= 2) badge = { label: 'Limited Stock', color: 'bg-[#ffebee] text-[#c62828]', icon: <FaExclamationTriangle /> };
  else if (daysLeft > 0 && (daysLeft <= 7 || daysLeft <= totalDays * 0.15))
    badge = { label: 'Closing Soon', color: 'bg-[#fffde6] text-[#e65100]', icon: <FaHourglassHalf /> };

  const facilities = item.fasilitas ? item.fasilitas.split(',').filter(Boolean) : [];

  return (
    <div className="lg:col-span-2 space-y-10">
      {/* Title & Stats */}
      <div className="border-b-[3px] border-black pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-stone-400 text-sm" />
            <span className="font-black uppercase text-[9px] tracking-widest">{item.location}</span>
          </div>
        </div>
        <div className="pl-4 border-l-4 border-[#ffcc00] space-y-3">
          <h2 className="text-xl font-black uppercase leading-tight italic max-w-xl">{item.title}</h2>
          <p className="text-stone-500 font-medium leading-relaxed text-sm max-w-xl">{item.description}</p>
          {mounted && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black font-black uppercase text-[9px] tracking-widest shadow-[2px_2px_0px_0px_black] ${badge.color}`}>
              {badge.icon}
              {badge.label}
            </div>
          )}
        </div>
      </div>

      {/* Facilities */}
      <section className="bg-white border-[3px] border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_black]">
        <h3 className="text-xl font-black uppercase mb-8 border-b-[3px] border-[#ffcc00] inline-block pb-1">
          Most Popular Facilities
        </h3>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {facilities.length > 0
            ? facilities.map((f, i) => (
                <div key={i} className="flex items-center gap-2 group cursor-default">
                  <span className="text-green-700 text-xl group-hover:scale-110 transition-transform">
                    {facilityIcon(f)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100">{f.trim()}</span>
                </div>
              ))
            : [
                { icon: 'pool', label: 'Outdoor Pool' },
                { icon: 'wifi', label: 'Free WiFi' },
                { icon: 'local_parking', label: 'Free Parking' },
                { icon: 'restaurant', label: 'Restaurant' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 group cursor-default">
                  <span className="text-green-700 text-xl">{f.icon === 'restaurant' ? <FaRestaurant /> : <FaUtensils />}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{f.label}</span>
                </div>
              ))}
        </div>
      </section>

      {/* Room Details Config */}
      <section className="bg-white border-[3px] border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_black] space-y-6">
        <h3 className="text-xl font-black uppercase border-b-[3px] border-[#ffcc00] inline-block pb-1">
          Kamar & Kapasitas Tersedia
        </h3>
        
        {(() => {
          const config = (item.bedConfigs && item.bedConfigs.length > 0)
            ? item.bedConfigs[0]
            : { maxKasur: 1, maxAdult: 2, maxChild: 0, maxKamar: 1, price: item.price, hargaPerChild: 0 };
            
          return (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#f5f0e8]/30 border-2 border-black p-6 rounded-2xl">
              {/* Left Side: Room details grid */}
              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-4 grow">
                {/* Max Beds */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ffcc00] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] shrink-0">
                    <FaHotel className="text-black font-black text-xl" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-stone-400 leading-none mb-1">Max Kasur</span>
                    <span className="block text-xs font-black text-black leading-none">{config.maxKasur || config.count || 1} Kasur</span>
                  </div>
                </div>

                {/* Max Adults */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff9900] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] shrink-0">
                    <FaUsers className="text-black font-black text-xl" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-stone-400 leading-none mb-1">Max Adult</span>
                    <span className="block text-xs font-black text-black leading-none">{config.maxAdult || config.capacityAdults || 2} Dewasa</span>
                  </div>
                </div>

                {/* Max Children */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4a72b2] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] shrink-0">
                    <FaChild className="text-white font-black text-xl" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-stone-400 leading-none mb-1">Max Child</span>
                    <span className="block text-xs font-black text-black leading-none">{config.maxChild ?? config.capacityChildren ?? 0} Anak</span>
                  </div>
                </div>

                {/* Max Rooms */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2e7d32] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] shrink-0">
                    <FaDoorOpen className="text-white font-black text-xl" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-stone-400 leading-none mb-1">Max Kamar</span>
                    <span className="block text-xs font-black text-black leading-none">1 Kamar</span>
                  </div>
                </div>
              </div>

              {/* Divider for mobile, vertical on desktop */}
              <div className="h-0.5 md:h-auto md:self-stretch w-full md:w-0.5 bg-black/10 shrink-0" />

              {/* Right Side: Pricing display */}
              <div className="text-left md:text-right shrink-0">
                <span className="block text-[8px] font-black uppercase text-stone-400 leading-none mb-1">Harga per hari</span>
                <span className="block text-xl font-black text-black leading-none mb-1.5">
                  {config.price >= 1000000
                    ? `Rp ${(config.price / 1000000).toFixed(1).replace('.', ',')} Juta`
                    : `Rp ${config.price.toLocaleString('id-ID')}`}
                </span>
                {config.maxChild > 0 && (config.hargaPerChild ?? 0) > 0 && (
                  <span className="block text-[8px] font-bold text-stone-500 uppercase">
                    + Rp {(config.hargaPerChild ?? 0).toLocaleString('id-ID')} / tambahan anak
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Stay Rules */}
      <section className="bg-white border-[3px] border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_black]">
        <h3 className="text-xl font-black uppercase mb-8">Stay Rules</h3>
        {item.rules ? (
          <div className="text-stone-600 font-medium text-xs leading-relaxed whitespace-pre-line border-2 border-black/10 p-5 rounded-2xl bg-stone-50/50 italic">
            {item.rules}
          </div>
        ) : (
          <p className="text-stone-400 text-xs font-bold uppercase">Tidak ada aturan khusus.</p>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-white border-[3px] border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_black]">
        <h3 className="text-xl font-black uppercase mb-8">FAQ about {item.title}</h3>
        {item.faq ? (
          <div className="text-stone-600 font-medium text-xs leading-relaxed whitespace-pre-line border-2 border-black/10 p-5 rounded-2xl bg-stone-50/50 italic">
            {item.faq}
          </div>
        ) : (
          <p className="text-stone-400 text-xs font-bold uppercase">Belum ada FAQ.</p>
        )}
      </section>
    </div>
  );
};
