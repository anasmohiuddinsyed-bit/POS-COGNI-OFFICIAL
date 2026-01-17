'use client';

import { ReactNode } from 'react';

type DemoCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function DemoCard({ title, subtitle, children, className = '' }: DemoCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-slate-600">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

