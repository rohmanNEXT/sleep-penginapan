'use client';

import React from 'react';

/**
 * Sponsor Component (React.FC)
 * Features a marquee-style scrolling bar with sponsor logos/names.
 * Adheres to the Bauhaus/Neo-Brutalist high-contrast aesthetic.
 */
const Sponsor: React.FC = () => {
  const SPONSORS = [
    { name: "Airbnb", url: "https://www.airbnb.com" },
    { name: "Booking.com", url: "https://www.booking.com" },
    { name: "Agoda", url: "https://www.agoda.com" },
    { name: "Traveloka", url: "https://www.traveloka.com" },
    { name: "Tiket.com", url: "https://www.tiket.com" }
  ];
  const movingSponsors = [...SPONSORS, ...SPONSORS, ...SPONSORS, ...SPONSORS, ...SPONSORS];

  return (
    <section className="w-full mb-24 overflow-hidden border-y-[3px] border-[#1a1a1a] relative z-10 bg-white">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
      
      <div className="py-4 px-10 flex whitespace-nowrap animate-marquee">
        {movingSponsors.map((sponsor, index) => (
          <a 
            key={`${sponsor.name}-${index}`} 
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-12 md:mx-20 font-['Space_Grotesk'] font-black text-base uppercase tracking-[0.2em] text-[#1a1a1a] opacity-60 hover:opacity-100 hover:text-[#0055ff] transition-all cursor-pointer"
          >
            {sponsor.name}
          </a>
        ))}
      </div>
    </section>
  );
};

export default Sponsor;
