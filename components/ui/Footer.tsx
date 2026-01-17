import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">POSENTIA</h3>
            <p className="text-slate-400 text-sm">
              AI Sales Infrastructure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products/ai-lead-concierge" className="hover:text-blue-400 transition-colors">
                  AI Lead Concierge
                </Link>
              </li>
              <li>
                <Link href="/products/receptionist" className="hover:text-blue-400 transition-colors">
                  AI Receptionist
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Products</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/products/ai-lead-concierge" className="hover:text-blue-400 transition-colors">
                  AI Lead Concierge
                </Link>
              </li>
              <li>
                <Link href="/products/receptionist" className="hover:text-blue-400 transition-colors">
                  AI Receptionist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="mailto:sales@posentia.com" className="hover:text-blue-400 transition-colors">
                  sales@posentia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <p className="text-slate-400 text-sm text-center">
            © {currentYear} POSENTIA. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs text-center mt-2">
            Powered by Cognivators
          </p>
        </div>
      </div>
    </footer>
  );
}

