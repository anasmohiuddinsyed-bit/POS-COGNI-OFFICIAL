'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link href="/" className="flex flex-col gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/POSENTIA-LG.png" 
                alt="POSENTIA Logo" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold text-slate-900">POSENTIA</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 ml-[40px] sm:ml-[52px] hidden sm:block">
              Powered by Cognivators
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
              Home
            </Link>
            <Link href="/products/ai-lead-concierge" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
              AI Lead Concierge
            </Link>
            <Link href="/products/receptionist" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
              AI Receptionist
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <Link
            href="/contact"
            className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-2 py-2"
              >
                Home
              </Link>
              <Link
                href="/products/ai-lead-concierge"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-2 py-2"
              >
                AI Lead Concierge
              </Link>
              <Link
                href="/products/receptionist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-2 py-2"
              >
                AI Receptionist
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-2 py-2"
              >
                Contact Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
