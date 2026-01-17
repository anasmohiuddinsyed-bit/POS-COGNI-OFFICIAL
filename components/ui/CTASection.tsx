import Link from 'next/link';

type CTASectionProps = {
  title: string;
  subtitle?: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  className?: string;
};

export function CTASection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  className = '',
}: CTASectionProps) {
  return (
    <section className={`bg-blue-600 py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl text-blue-100 mb-8">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCTA.href.startsWith('http') ? (
            <a
              href={primaryCTA.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              {primaryCTA.text}
            </a>
          ) : (
            <Link
              href={primaryCTA.href}
              className="bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              {primaryCTA.text}
            </Link>
          )}
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              {secondaryCTA.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

