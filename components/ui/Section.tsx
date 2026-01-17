type SectionProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function Section({ title, subtitle, children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${className.includes('text-white') ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-xl max-w-3xl mx-auto ${className.includes('text-white') ? 'text-slate-300' : 'text-slate-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

