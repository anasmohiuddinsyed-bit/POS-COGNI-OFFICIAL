import Link from 'next/link';

type ProductHeroProps = {
  title: string;
  subtitle: string;
  installTime?: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
};

export function ProductHero({
  title,
  subtitle,
  installTime,
  primaryCTA,
  secondaryCTA,
}: ProductHeroProps) {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        
        {installTime && (
          <p className="text-slate-600 mb-8">⚡ Live in {installTime}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCTA.href.startsWith('http') ? (
            <a
              href={primaryCTA.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              {primaryCTA.text}
            </a>
          ) : (
            <Link
              href={primaryCTA.href}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              {primaryCTA.text}
            </Link>
          )}
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              {secondaryCTA.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

