import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Never Miss a Lead Again
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto">
            AI infrastructure that answers every call, replies to every message, and logs every lead to your CRM. Automatically.
          </p>
        </div>
      </section>

      {/* Product Choice - Clean & Focused */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600 mb-12 text-lg">Choose your solution:</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lead Concierge Card */}
            <Link
              href="/products/ai-lead-concierge"
              className="group bg-white rounded-xl border-2 border-slate-200 p-8 hover:border-blue-600 hover:shadow-xl transition-all"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  AI Lead Concierge
                </h3>
                <p className="text-sm text-slate-500 mb-4">For Real Estate Agents</p>
                <p className="text-slate-600">
                  Instantly reply, qualify, and follow up with inbound leads — then write clean, structured summaries into any CRM.
                </p>
              </div>
              <div className="mt-6 text-blue-600 font-semibold group-hover:underline">
                View Product →
              </div>
            </Link>

            {/* Receptionist Card */}
            <Link
              href="/products/receptionist"
              className="group bg-white rounded-xl border-2 border-slate-200 p-8 hover:border-blue-600 hover:shadow-xl transition-all"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  AI Receptionist
                </h3>
                <p className="text-sm text-slate-500 mb-4">For SMBs</p>
                <p className="text-slate-600">
                  24/7 AI receptionist that answers calls, qualifies leads, and sends you summaries.
                </p>
              </div>
              <div className="mt-6 text-blue-600 font-semibold group-hover:underline">
                View Product →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof - Single Focused Testimonial */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl md:text-3xl text-slate-700 mb-6 leading-relaxed">
            "POSENTIA captured 3 leads in the first week that would have been missed. ROI in the first month."
          </p>
          <p className="text-slate-500">— Real Estate Agent, California</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Try our interactive demos to see POSENTIA in action
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products/ai-lead-concierge"
              className="bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              View AI Lead Concierge
            </Link>
            <Link
              href="/products/receptionist"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              View AI Receptionist
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
