'use client';

import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const FAQS = [
  {
    question: 'How do I book a trip?',
    answer:
      "Booking is simple! Just browse our destinations, select your favorite trip, and click the 'Book Now' button to proceed to booking.",
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'We offer free cancellations up to 48 hours before your departure date. For late cancellations, a small fee may apply depending on the service provider.',
  },
  {
    question: 'Do you offer group discounts?',
    answer:
      'Yes! For groups of 5 or more, we provide exclusive discounts. Contact our support team for a personalized quote.',
  },
  {
    question: 'Are the trips inclusive of insurance?',
    answer:
      'Travel insurance is optional but highly recommended. You can add it to your booking during the booking process.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-175 h-100 mx-auto mb-24 font-['Inter'] px-4 sm:px-6">
      <h2 className="text-lg lg:text-xl font-black mb-8 text-center tracking-tight">
        Common Questions
      </h2>

      <div className="space-y-3">
        {FAQS.map((faq, index) => (
          <div
            key={index}
            className="border-[3px] border-black shadow-[4px_4px_0px_0px_#1a1a1a] rounded-2xl overflow-hidden bg-white hover:-translate-y-0.5 transition-all"
          >
            <button
              type="button"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between p-3 md:p-4 text-left cursor-default"
            >
              <span className="text-xs font-black tracking-tight">
                {faq.question}
              </span>

              <FaChevronDown
                className={`w-4 h-4 transition-transform duration-300 shrink-0 cursor-pointer ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6 pt-4 text-stone-600 font-bold text-sm border-t-2 border-black/5 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}