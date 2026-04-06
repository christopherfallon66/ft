interface HoursGaugeProps {
  hoursUsed: number;
  allotment: number;
}

export default function HoursGauge({ hoursUsed, allotment }: HoursGaugeProps) {
  const remaining = Math.max(0, allotment - hoursUsed);
  const pct = Math.min(100, (hoursUsed / allotment) * 100);

  let strokeColor = '#EF9F27'; // gold
  if (pct >= 95) strokeColor = '#E24B4A'; // red
  else if (pct >= 80) strokeColor = '#F0997B'; // coral

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#0A2E22"
            strokeWidth="12"
          />
          {/* Progress arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-num text-4xl font-bold text-text-light">
            {remaining.toFixed(1)}
          </span>
          <span className="text-xs text-text-muted mt-1">hrs remaining</span>
        </div>
      </div>
      <p className="text-sm text-text-muted mt-2">
        <span className="font-mono-num text-text-light">{hoursUsed.toFixed(1)}</span> of{' '}
        <span className="font-mono-num">{allotment}</span> hours used
      </p>
    </div>
  );
}
