import Link from 'next/link';
import { LeadConciergeDemoWithTour } from '@/components/demos/LeadConciergeDemoWithTour';
import { FAQAccordion } from '@/components/ui/FAQAccordion';

export default function AILeadConciergePage() {
  // Get payment link from environment variable
  const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK_LEAD_CONCIERGE;
  
  // Debug: Log in server (check terminal/console)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Lead Concierge] Payment Link:', paymentLink ? '✓ Set' : '✗ Not set');
  }
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
              <span className="text-blue-600 font-semibold">$999 one-time • Lifetime access</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Never Miss a Lead Again. POSENTIA Replies + Qualifies + Follows Up Automatically.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              AI conversations that turn inbound texts and emails into qualified leads and structured CRM entries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="#demo"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              Try the Live Demo
            </Link>
            <a
              href={paymentLink || '/checkout?product=ai-lead-concierge'}
              target={paymentLink ? '_blank' : undefined}
              rel={paymentLink ? 'noopener noreferrer' : undefined}
              className="bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 font-semibold px-8 py-4 rounded-lg text-lg transition-colors text-center"
            >
              Activate for $999
            </a>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Works with any CRM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Setup-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Secure by design</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Benefit Tiles */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Speed-to-lead in seconds</h3>
              <p className="text-slate-600">
                AI responds instantly to every inbound lead. No delays, no missed opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Qualification + scoring</h3>
              <p className="text-slate-600">
                Automatically qualify and score leads: Hot/Warm/Cold/Spam. Know what to prioritize.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">CRM-ready summaries</h3>
              <p className="text-slate-600">
                Structured summaries with tags automatically written into your CRM. Any CRM, any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              { step: '1', title: 'Lead Enters', desc: 'SMS, email, or web form submission' },
              { step: '2', title: 'POSENTIA Replies', desc: 'Instant AI response with context' },
              { step: '3', title: 'POSENTIA Qualifies', desc: 'Extracts intent, timeline, budget, scores lead' },
              { step: '4', title: 'Follow-Ups Triggered', desc: 'Automated sequences based on lead score' },
              { step: '5', title: 'CRM Write-Back', desc: 'Structured summary written into your CRM' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Interactive Demo */}
      <section id="demo" className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Try the Live Demo
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
              See how POSENTIA handles inbound leads, qualifies them, and writes structured summaries to your CRM
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-amber-800">
                <strong>Demo Notice:</strong> This is a demo. Real deployment will be more AI-powered and native to your CRM.
              </p>
            </div>
          </div>
          <LeadConciergeDemoWithTour />
          
          {/* CTA After Demo */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to activate POSENTIA?
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Stop losing leads. Get started today with one-time payment and lifetime access.
            </p>
            <a
              href={paymentLink || '/checkout?product=ai-lead-concierge'}
              target={paymentLink ? '_blank' : undefined}
              rel={paymentLink ? 'noopener noreferrer' : undefined}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              Activate for $999 (one-time)
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQAccordion
        title="Frequently Asked Questions"
        faqs={[
          {
            question: 'Does this replace my CRM?',
            answer: 'No. POSENTIA is an AI lead-handling layer that sits between your inbound leads and your CRM. It handles conversations, qualification, and follow-up, then writes structured summaries back to your CRM. Your CRM remains the source of truth for contact management.',
          },
          {
            question: 'Which CRMs do you support?',
            answer: 'We support your CRM. POSENTIA works with any CRM through standard integrations.',
          },
          {
            question: 'Does it handle SMS and email?',
            answer: 'Yes. POSENTIA handles both SMS and email conversations. The demo shows both channels in action, and real deployments integrate with Twilio or similar services for SMS, and standard email APIs for email handling.',
          },
          {
            question: 'How fast is setup?',
            answer: 'We activate quickly. POSENTIA can start handling leads within 24-48 hours after setup.',
          },
        ]}
      />

      {/* Final CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop losing leads. Activate POSENTIA today.
          </h2>
          <a
            id="demo-cta-activate"
            href={paymentLink || '/checkout?product=ai-lead-concierge'}
            target={paymentLink ? '_blank' : undefined}
            rel={paymentLink ? 'noopener noreferrer' : undefined}
            className="inline-block bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg mb-4"
          >
            Activate for $999 (one-time)
          </a>
          <p className="text-blue-100 text-sm mt-4">
            One-time payment. Lifetime access. No subscriptions.
          </p>
        </div>
      </section>
    </main>
  );
}

