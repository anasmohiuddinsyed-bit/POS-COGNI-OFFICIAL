'use client';

type TickerItem = {
  text: string;
};

type TickerProps = {
  items: TickerItem[];
  speed?: 'slow' | 'normal' | 'fast';
};

export function Ticker({ items, speed = 'normal' }: TickerProps) {
  const speedClasses = {
    slow: 'animate-ticker-slow',
    normal: 'animate-ticker',
    fast: 'animate-ticker-fast',
  };

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 py-3 border-y border-slate-700">
      <div className="flex whitespace-nowrap">
        <div className={`flex items-center ${speedClasses[speed]}`}>
          {duplicatedItems.map((item, idx) => (
            <div key={idx} className="flex items-center flex-shrink-0">
              <span className="text-white font-medium text-sm mx-8">{item.text}</span>
              <span className="text-slate-600">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

