'use client';

import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  title?: string;
  faqs: FAQItem[];
};

export function FAQAccordion({ title, faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            {title}
          </h2>
        )}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-blue-600 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 bg-slate-50 text-slate-600 border-t border-slate-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

