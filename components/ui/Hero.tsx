import Link from 'next/link';

type HeroProps = {
  title: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  credibility?: string;
};

export function Hero({ title, subtitle, primaryCTA, secondaryCTA, credibility }: HeroProps) {
  return (
    <section className="bg-slate-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        
        {(primaryCTA || secondaryCTA) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-colors"
              >
                {primaryCTA.text}
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="bg-slate-800 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-colors"
              >
                {secondaryCTA.text}
              </Link>
            )}
          </div>
        )}

        {credibility && (
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            {credibility}
          </p>
        )}
      </div>
    </section>
  );
}

