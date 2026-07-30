'use client';

import TrendProvinsi from "./components/TrendProvinsi";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Sponsor from "./components/Sponsor";
import Promos from "./components/Cupon";

import Link from "next/link";
import Image from "next/image";

import {
  FaTags,
  FaHandPointer,
  FaHeadset,
} from "react-icons/fa";

const TOP_COUNTRIES = [
  {
    id: "c1",
    name: "Indonesia",
    image: "/images/indonesia_premium.jpg",
    negara: "Indonesia",
  },
  {
    id: "c2",
    name: "Jepang",
    image: "/images/jepang_premium.jpg",
    negara: "Jepang",
  },
  {
    id: "c3",
    name: "Korea Selatan",
    image: "/images/korea_selatan_fresh.jpg",
    negara: "Korea Selatan",
  },
  {
    id: "c4",
    name: "Thailand",
    image: "/images/thailand_premium.jpg",
    negara: "Thailand",
  },
];

const HomePage = () => {
  return (
    <div className="flex flex-col font-['Inter'] antialiased">
      <main className="grow pt-1 pb-16">

        {/* HERO */}
        <Hero />

        {/* SPONSOR */}
        <Sponsor />

        {/* PROMOS */}
        <Promos />

        {/* TOP COUNTRIES */}
        <section className="w-full mb-24 px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-black mb-12 text-center">
            Top Countries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_COUNTRIES.map((country) => (
              <Link
                key={country.id}
                href={`/explore?negara=${encodeURIComponent(country.negara)}`}
                className="relative h-64 w-full overflow-hidden rounded-2xl border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Image
                  src={country.image}
                  alt={country.name}
                  fill
                  sizes="(max-width:768px)100vw,(max-width:1200px)50vw,25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent" />

                <div className="relative z-10 p-6 text-white/80 backdrop-flter-sm">
                  <h3 className="text-3xl font-black leading-none mb-1">
                    {country.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TREND */}
        <TrendProvinsi />

        {/* USP */}
        <section className="max-w-300 mx-auto px-4 sm:px-6 mb-24 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-12">
            Kenapa Pilih App Ini
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

            {/* CARD 1 */}
            <div className="border-[3px] border-[#1a1a1a] p-6 text-center bg-white shadow-[6px_6px_0px_0px_#1a1a1a] rounded-2xl cursor-default">
              <div className="w-16 h-16 bg-[#ffcc00] border-[3px] border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 rounded-xl">
                <FaTags className="text-3xl text-black cursor-pointer" />
              </div>

              <h3 className="text-xl font-black uppercase mb-2">
                HARGA
              </h3>

              <p className="font-bold text-gray-400 text-sm">
                Best Rates Guaranteed. No hidden fees. Pay what you see.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="border-[3px] border-[#1a1a1a] p-6 text-center bg-white shadow-[6px_6px_0px_0px_#1a1a1a] rounded-2xl cursor-default">
              <div className="w-16 h-16 bg-[#e63b2e] border-[3px] border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 rounded-xl">
                <FaHandPointer className="text-3xl text-white cursor-pointer" />
              </div>

              <h3 className="text-xl font-black uppercase mb-2">
                MUDAH
              </h3>

              <p className="font-bold text-gray-400 text-sm">
                Simple Booking. Just three clicks and you are ready to explore.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="border-[3px] border-[#1a1a1a] p-6 text-center bg-white shadow-[6px_6px_0px_0px_#1a1a1a] rounded-2xl cursor-default">
              <div className="w-16 h-16 bg-[#0055ff] border-[3px] border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 rounded-xl">
                <FaHeadset className="text-3xl text-white cursor-pointer" />
              </div>

              <h3 className="text-xl font-black uppercase mb-2">
                SUPPORT
              </h3>

              <p className="font-bold text-gray-400 text-sm">
                24/7 Assistance. We have got your back wherever you wander.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ />

      </main>
    </div>
  );
};

export default HomePage;