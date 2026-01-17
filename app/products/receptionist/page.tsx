import { ProductHero } from '@/components/ui/ProductHero';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { FAQAccordion } from '@/components/ui/FAQAccordion';
import { CTASection } from '@/components/ui/CTASection';
import { ReceptionistDemo } from '@/components/demos/ReceptionistDemo';
import { Ticker } from '@/components/ui/Ticker';
import Link from 'next/link';

export default function ReceptionistPage() {
  // Get payment link from environment variable
  const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST;
  
  // Debug: Log in server (check terminal/console)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Receptionist] Payment Link:', paymentLink ? '✓ Set' : '✗ Not set');
  }
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <ProductHero
        title="POSENTIA AI Receptionist"
        subtitle="24/7 AI-powered receptionist that answers calls, qualifies leads, and sends you summaries. Never miss a call again."
        installTime="24 hours"
        primaryCTA={{
          text: 'Buy Now',
          href: paymentLink || '/checkout?product=receptionist',
        }}
        secondaryCTA={{
          text: 'Try Live Demo',
          href: '#demo',
        }}
      />

      {/* Industry Ticker */}
      <Ticker
        items={[
          { text: 'Mario\'s Italian Kitchen' },
          { text: 'Coastal HVAC Solutions' },
          { text: 'Bliss Salon & Spa' },
          { text: 'Bright Smile Dental' },
          { text: 'SparkleClean Services' },
          { text: 'Metro Moving Co.' },
          { text: 'Downtown Hardware Store' },
          { text: 'Precision Auto Repair' },
          { text: 'QuickFlow Plumbing' },
          { text: 'Peak Roofing Systems' },
          { text: '24/7 Lock & Key' },
          { text: 'GreenScape Landscaping' },
          { text: 'Premier Electrical Co.' },
          { text: 'City Legal Group' },
          { text: 'Wellness Medical Center' },
          { text: 'PawCare Veterinary' },
          { text: 'Elite Home Services' },
          { text: 'Bella Nails & Beauty' },
          { text: 'Advanced Carpet Care' },
          { text: 'Summit Auto Body' },
        ]}
        speed="normal"
      />

      {/* Interactive Demo */}
      <section id="demo" className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Try Your AI Receptionist for Free
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Enter your business name to get your personalized Receptionist
            </p>
          </div>
          <ReceptionistDemo />
          
          {/* CTA Below Demo */}
          <div className="mt-12 text-center">
            <a
              href={paymentLink || '/checkout?product=receptionist'}
              target={paymentLink ? '_blank' : undefined}
              rel={paymentLink ? 'noopener noreferrer' : undefined}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              Buy Now
            </a>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            What You Get
          </h2>
          <FeatureGrid
            features={[
              {
                title: '24/7 Call Answering',
                description: 'AI answers every call with human-like voice, even after hours. No missed calls, no frustrated customers.',
              },
              {
                title: 'Lead Capture',
                description: 'Captures caller name, reason for calling, urgency level, contact information, and service preferences automatically.',
              },
              {
                title: 'SMS + Email Follow-Up',
                description: 'After each call, AI sends personalized SMS and email follow-up with next steps, appointment confirmations, or requested information.',
              },
              {
                title: 'Appointment Qualification',
                description: 'Qualifies appointments by asking about date/time preferences, service type, location, and urgency. Sends confirmations automatically.',
              },
              {
                title: 'Clean Summaries',
                description: 'Business owner receives clean, structured summaries via SMS or email after each call. Key details highlighted, no noise.',
              },
              {
                title: 'Urgent Call Routing',
                description: 'Optional: Route urgent calls directly to business owner via SMS alert or phone call. Never miss critical situations.',
              },
            ]}
            columns={3}
          />
        </div>
      </section>

      {/* Use Cases by Industry */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Perfect For These Industries
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              See how POSENTIA works for different types of SMBs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { industry: 'Restaurants', useCase: 'Reservations, takeout orders, catering inquiries' },
              { industry: 'HVAC Services', useCase: 'Service calls, emergency repairs, maintenance scheduling' },
              { industry: 'Salons & Spas', useCase: 'Appointment booking, service inquiries, cancellations' },
              { industry: 'Dental Clinics', useCase: 'Appointments, emergency calls, insurance questions' },
              { industry: 'Cleaning Services', useCase: 'Scheduling, estimates, one-time or recurring jobs' },
              { industry: 'Moving Companies', useCase: 'Quotes, booking dates, storage inquiries' },
              { industry: 'Retail Stores', useCase: 'Hours, inventory questions, special orders' },
              { industry: 'Auto Repair', useCase: 'Service appointments, parts availability, estimates' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">{item.industry}</h3>
                <p className="text-slate-600 text-sm">{item.useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQAccordion
        title="Frequently Asked Questions"
        faqs={[
          {
            question: 'How does the AI sound?',
            answer: 'Our AI uses advanced voice synthesis to sound natural and human-like. It adapts tone and pacing based on context. You can preview the voice in the demo above.',
          },
          {
            question: 'What if I need to handle a call personally?',
            answer: 'You can route urgent calls directly to your phone via SMS alert or automatic call forwarding. You can also call back any number from the call log.',
          },
          {
            question: 'How long does setup take?',
            answer: 'Typical setup is 2–3 days. We integrate with your phone system (or set up a new number), configure your business profile, and test the AI responses. You\'ll receive training on how to review and optimize calls.',
          },
          {
            question: 'Can the AI handle multiple languages?',
            answer: 'Currently, the AI supports English. Multi-language support is coming soon. Contact us if you need a specific language.',
          },
          {
            question: 'What happens during peak hours?',
            answer: 'The AI can handle unlimited concurrent calls. There\'s no queue or busy signal. Every caller gets immediate attention.',
          },
          {
            question: 'How are summaries delivered?',
            answer: 'You choose: SMS, email, or both. Summaries include caller name, phone, reason, urgency, and key details extracted from the conversation. You can also access full transcripts in the dashboard.',
          },
          {
            question: 'Is this compliant with call recording laws?',
            answer: 'The AI announces that calls may be recorded for quality assurance. You can customize this message to meet your state\'s requirements. We recommend consulting with legal counsel for your specific jurisdiction.',
          },
        ]}
      />

      {/* CTA Banner */}
      <CTASection
        title="Ready to Answer Every Call?"
        subtitle="Get started with your AI Receptionist and never miss another lead"
        primaryCTA={{
          text: 'Buy Now',
          href: paymentLink || '/checkout?product=receptionist',
        }}
        secondaryCTA={{
          text: 'Try Live Demo',
          href: '#demo',
        }}
      />
    </main>
  );
}

