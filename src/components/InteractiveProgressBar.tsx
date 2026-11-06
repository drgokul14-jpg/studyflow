import React, { useState } from 'react';

interface InteractiveProgressBarProps {
  completed: number;
  target: number;
  color?: string;
  showTicks?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onUpdateCompleted?: (newValue: number) => void;
  className?: string;
}

export const InteractiveProgressBar: React.FC<InteractiveProgressBarProps> = ({
  completed,
  target,
  color = '#2563eb',
  showTicks = true,
  size = 'md',
  interactive = false,
  onUpdateCompleted,
  className = '',
}) => {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const percentage = target > 0 ? Math.min(100, Math.max(0, Math.round((completed / target) * 100))) : 0;

  const heightClasses = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onUpdateCompleted || target <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newDays = Math.round(ratio * target);
    onUpdateCompleted(newDays);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || target <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    setHoverX(x);
    setHoverDay(Math.round(ratio * target));
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverDay(null);
  };

  return (
    <div className={`w-full relative ${className}`}>
      {/* Outer track */}
      <div
        onClick={handleBarClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full ${heightClasses[size]} bg-slate-100 rounded-full overflow-hidden border border-slate-200/90 shadow-inner transition-all ${
          interactive ? 'cursor-pointer hover:border-slate-300' : ''
        }`}
        title={interactive ? 'Click anywhere on the bar to scrub to that day target' : undefined}
      >
        {/* Fill bar with gradient and subtle sheen */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 relative overflow-hidden"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}dd 0%, ${color} 100%)`,
          }}
        >
          {/* Subtle gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />

          {size === 'lg' && percentage > 15 && (
            <span className="text-[11px] font-bold text-white tracking-wider tabular-nums drop-shadow-xs relative z-10">
              {percentage}%
            </span>
          )}
        </div>

        {/* Milestone notches (25%, 50%, 75%) */}
        {showTicks && (
          <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5">
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className="w-0.5 h-full bg-white/60 absolute top-0"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>
        )}

        {/* Hover scrubber indicator */}
        {interactive && hoverX !== null && hoverDay !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 pointer-events-none"
            style={{ left: `${hoverX}px` }}
          />
        )}
      </div>

      {/* Floating tooltip on hover */}
      {interactive && hoverX !== null && hoverDay !== null && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-0.5 px-2 rounded pointer-events-none shadow-md z-20 whitespace-nowrap"
          style={{ left: `${hoverX}px` }}
        >
          Set to Day {hoverDay} ({target > 0 ? Math.round((hoverDay / target) * 100) : 0}%)
        </div>
      )}

      {/* Helper caption if interactive */}
      {interactive && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-medium">
          <span>0 days</span>
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <span>Scrub to adjust</span>
          </span>
          <span>{target} days target</span>
        </div>
      )}
    </div>
  );
};
