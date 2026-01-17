import Link from 'next/link';
import { ProductHero } from '@/components/ui/ProductHero';
import { CTASection } from '@/components/ui/CTASection';

const industries = [
  {
    name: 'Restaurants',
    icon: '🍽️',
    description: 'Handle reservations, takeout orders, catering inquiries, and customer questions 24/7.',
    useCases: [
      'Reservation management and confirmation',
      'Takeout order intake and coordination',
      'Catering inquiry qualification',
      'Hours and menu information',
      'Table availability checks',
    ],
    testimonial: 'POSENTIA handles all our reservation calls after hours. We never miss a booking opportunity.',
  },
  {
    name: 'HVAC Services',
    icon: '❄️',
    description: 'Answer service calls, qualify emergencies, schedule maintenance, and capture customer information.',
    useCases: [
      'Emergency service call qualification',
      'Maintenance appointment scheduling',
      'Service area verification',
      'System type identification',
      'Callback scheduling for estimates',
    ],
    testimonial: 'Our call volume dropped by 60% after hours, but we capture 100% of leads through POSENTIA.',
  },
  {
    name: 'Salons & Spas',
    icon: '💇',
    description: 'Book appointments, handle cancellations, answer service questions, and manage availability.',
    useCases: [
      'Appointment booking and scheduling',
      'Cancellation and rescheduling',
      'Service pricing inquiries',
      'Stylist availability checks',
      'Gift card purchases',
    ],
    testimonial: 'We book appointments 24/7 now. Our booking rate increased by 35% since implementing POSENTIA.',
  },
  {
    name: 'Dental Clinics',
    icon: '🦷',
    description: 'Schedule appointments, handle emergencies, answer insurance questions, and manage patient inquiries.',
    useCases: [
      'New patient appointment scheduling',
      'Emergency appointment triage',
      'Insurance verification questions',
      'Treatment consultation requests',
      'Follow-up appointment reminders',
    ],
    testimonial: 'POSENTIA handles all non-emergency calls, allowing our staff to focus on patient care.',
  },
  {
    name: 'Cleaning Services',
    icon: '🧹',
    description: 'Capture cleaning requests, schedule estimates, handle recurring service inquiries, and qualify leads.',
    useCases: [
      'One-time cleaning estimates',
      'Recurring service setup',
      'Move-in/move-out cleaning',
      'Commercial cleaning inquiries',
      'Service area verification',
    ],
    testimonial: 'We capture every cleaning inquiry, even when we\'re on jobs. No more missed opportunities.',
  },
  {
    name: 'Moving Companies',
    icon: '📦',
    description: 'Qualify moving requests, schedule estimates, answer pricing questions, and capture moving dates.',
    useCases: [
      'Moving quote requests',
      'Moving date scheduling',
      'Packing service inquiries',
      'Storage solution questions',
      'Local vs. long-distance qualification',
    ],
    testimonial: 'POSENTIA qualifies leads and schedules estimates automatically. Our conversion rate improved significantly.',
  },
  {
    name: 'Retail Stores',
    icon: '🏪',
    description: 'Answer product questions, check inventory, provide store hours, and handle customer service.',
    useCases: [
      'Product availability checks',
      'Store hours and location',
      'Return policy questions',
      'Special order inquiries',
      'Gift card purchases',
    ],
    testimonial: 'Customers can get answers to common questions instantly, reducing walk-in frustration.',
  },
  {
    name: 'Auto Repair Shops',
    icon: '🔧',
    description: 'Schedule service appointments, handle diagnostic questions, provide estimates, and capture vehicle information.',
    useCases: [
      'Service appointment scheduling',
      'Diagnostic service requests',
      'Parts availability checks',
      'Service pricing estimates',
      'Vehicle information capture',
    ],
    testimonial: 'We never miss a service call, even on weekends. POSENTIA books appointments and sends confirmations.',
  },
  {
    name: 'Plumbing Services',
    icon: '🚰',
    description: 'Qualify emergency calls, schedule service visits, answer repair questions, and capture customer details.',
    useCases: [
      'Emergency plumbing triage',
      'Service call scheduling',
      'Repair estimate requests',
      'Installation inquiries',
      'Maintenance program sign-ups',
    ],
    testimonial: 'POSENTIA identifies true emergencies and routes them immediately. Non-urgent calls are scheduled automatically.',
  },
  {
    name: 'Roofing Contractors',
    icon: '🏠',
    description: 'Capture roof inspection requests, schedule estimates, handle insurance questions, and qualify repair needs.',
    useCases: [
      'Roof inspection requests',
      'Estimate scheduling',
      'Insurance claim coordination',
      'Emergency repair qualification',
      'Replacement vs. repair consultation',
    ],
    testimonial: 'We capture every roofing inquiry, even during peak season. POSENTIA ensures no lead falls through.',
  },
];

export default function ReceptionistIndustriesPage() {
  // Get payment link from environment variable
  const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST;
  
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <ProductHero
        title="AI Receptionist for SMBs"
        subtitle="Never miss a call. POSENTIA answers every call, qualifies leads, and sends you summaries. Perfect for service businesses that live by the phone."
        installTime="2–3 days"
        primaryCTA={{
          text: 'Buy Now',
          href: paymentLink || '/checkout?product=receptionist',
        }}
        secondaryCTA={{
          text: 'Book Demo',
          href: process.env.NEXT_PUBLIC_CALENDLY_URL || '#',
        }}
      />

      {/* Industries Grid */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by SMBs Across Industries
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              POSENTIA AI Receptionist works for any service business that relies on phone calls to generate revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{industry.name}</h3>
                <p className="text-slate-600 mb-4">{industry.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Key Use Cases:</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {industry.useCases.slice(0, 3).map((useCase, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <p className="text-sm text-slate-600 italic">"{industry.testimonial}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for SMBs */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            How It Works for Your Business
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Call Comes In',
                desc: 'Customer calls your business number, POSENTIA answers instantly',
              },
              {
                step: '2',
                title: 'AI Qualifies',
                desc: 'AI asks questions, captures details, and understands the request',
              },
              {
                step: '3',
                title: 'You Get Summary',
                desc: 'Clean summary sent via SMS/email with all key information',
              },
              {
                step: '4',
                title: 'Follow-Up Sent',
                desc: 'AI automatically sends confirmation SMS to customer',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl font-bold text-blue-600 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to Never Miss Another Call?"
        subtitle="Join hundreds of SMBs using POSENTIA AI Receptionist"
        primaryCTA={{
          text: 'Buy Now',
          href: paymentLink || '/checkout?product=receptionist',
        }}
        secondaryCTA={{
          text: 'Book Demo',
          href: process.env.NEXT_PUBLIC_CALENDLY_URL || '#',
        }}
      />
    </main>
  );
}

