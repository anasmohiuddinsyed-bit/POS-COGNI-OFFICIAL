type Feature = {
  title: string;
  description: string;
};

type FeatureGridProps = {
  title?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
};

export function FeatureGrid({ title, features, columns = 3 }: FeatureGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            {title}
          </h2>
        )}
        <div className={`grid gap-8 ${gridCols[columns]}`}>
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

