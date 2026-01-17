'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product');

  // Get payment links from environment variables
  const leadConciergeLink = process.env.NEXT_PUBLIC_PAYMENT_LINK_LEAD_CONCIERGE;
  const receptionistLink = process.env.NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST;

  // Debug logging (remove after confirming it works)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment Links Debug:', {
        leadConcierge: leadConciergeLink ? '✓ Set' : '✗ Not set',
        receptionist: receptionistLink ? '✓ Set' : '✗ Not set',
        product: product,
      });
    }
  }, [leadConciergeLink, receptionistLink, product]);

  const productData =
    product === 'ai-lead-concierge'
      ? {
          name: 'POSENTIA AI Lead Concierge for Real Estate',
          price: '$999',
          priceNote: 'one-time payment, lifetime access',
          description: 'Instantly reply, qualify, and follow up with inbound leads — then write clean, structured summaries into any CRM.',
          paymentLink: leadConciergeLink || null,
        }
      : product === 'receptionist'
      ? {
          name: 'POSENTIA AI Receptionist',
          price: '$99/month',
          priceNote: 'recurring subscription',
          description: '24/7 AI-powered receptionist that answers calls, qualifies leads, and sends you summaries.',
          paymentLink: receptionistLink || null,
        }
      : null;

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h1>
          <p className="text-slate-600 mb-6">Please select a product from the homepage.</p>
          <Link
            href="/"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Checkout</h1>
          <p className="text-slate-600 mb-8">Complete your purchase</p>

          {/* Product Summary */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{productData.name}</h2>
            <p className="text-slate-600 mb-4">{productData.description}</p>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600">{productData.price}</div>
                <p className="text-sm text-slate-500 mt-1">{productData.priceNote}</p>
              </div>
            </div>
          </div>

          {/* Payment Link or Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Information</h3>
            
            {productData.paymentLink && productData.paymentLink.trim() !== '' ? (
              // Payment link available - redirect to payment page
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-800 font-semibold mb-2">✓ Secure Payment Processing</p>
                  <p className="text-green-700 text-sm mb-4">
                    Click the button below to complete your payment securely.
                  </p>
                  <a
                    href={productData.paymentLink.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-4 rounded-lg text-center transition-colors shadow-lg"
                  >
                    Complete Payment - {productData.price}
                  </a>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  You'll be redirected to a secure payment page to complete your purchase.
                </p>
              </div>
            ) : (
              // No payment link - show placeholder
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <p className="text-amber-800 font-semibold mb-2">⚠️ Payment Link Not Configured</p>
                  <p className="text-amber-700 text-sm mb-3">
                    Payment link not yet configured. Please make sure you've added the payment links to your <code className="bg-amber-100 px-1 rounded">.env.local</code> file and restarted the dev server.
                  </p>
                  <div className="bg-amber-100 border border-amber-300 rounded p-3 text-xs font-mono text-amber-900">
                    <p className="mb-1">Add these to your .env.local file:</p>
                    <p>NEXT_PUBLIC_PAYMENT_LINK_LEAD_CONCIERGE=https://buy.stripe.com/...</p>
                    <p>NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST=https://buy.stripe.com/...</p>
                    <p className="mt-2 text-amber-800">⚠️ Restart your dev server after adding these variables!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alternative CTA */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-4 text-center">
              To complete your purchase, please contact us directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#'}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold px-6 py-3 rounded-lg text-center transition-colors"
              >
                Book Install Call
              </Link>
              <a
                href="mailto:sales@posentia.com"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg text-center transition-colors"
              >
                Email Sales
              </a>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href={product === 'ai-lead-concierge' ? '/products/ai-lead-concierge' : '/products/receptionist'}
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Back to product page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-slate-600">Loading...</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

