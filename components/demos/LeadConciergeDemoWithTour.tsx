'use client';

import { useRef } from 'react';
import { LeadConciergeDemo, DemoActions } from './LeadConciergeDemo';

export function LeadConciergeDemoWithTour() {
  const demoRef = useRef<DemoActions>(null);

  return (
    <LeadConciergeDemo ref={demoRef} />
  );
}

