import Link from 'next/link';

type PricingCardProps = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
  };
  featured?: boolean;
  addon?: string;
};

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured = false,
  addon,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-8 ${
        featured
          ? 'border-2 border-slate-900 shadow-xl scale-105'
          : 'border border-slate-200 shadow-sm hover:shadow-md transition-shadow'
      }`}
    >
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      
      <div className="mb-6">
        <span className="text-5xl font-bold text-slate-900">{price}</span>
        {period && <span className="text-slate-500 ml-2">/{period}</span>}
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      {addon && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700">{addon}</p>
        </div>
      )}
      
      <Link
        href={cta.href}
        className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
          featured
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
        }`}
      >
        {cta.text}
      </Link>
    </div>
  );
}

