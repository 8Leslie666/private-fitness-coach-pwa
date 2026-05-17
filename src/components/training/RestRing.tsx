import { clamp } from '../../utils/time';

export function RestRing({ progress, children }: { progress: number; children: React.ReactNode }) {
  const safeProgress = clamp(progress, 0, 1);
  const circumference = 2 * Math.PI * 112;
  const offset = circumference * (1 - safeProgress);

  return (
    <div className="relative grid h-[286px] place-items-center">
      <div className="absolute h-[266px] w-[266px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.10)_0_48%,rgba(255,255,255,.03)_49%,rgba(255,255,255,0)_70%)] blur-[1px]" />
      <svg className="absolute h-[266px] w-[266px] -rotate-90" viewBox="0 0 266 266" aria-hidden="true">
        <circle cx="133" cy="133" r="112" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="13" />
        <circle
          cx="133"
          cy="133"
          r="112"
          fill="none"
          stroke="url(#rest-ring)"
          strokeLinecap="round"
          strokeWidth="13"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#ring-glow)"
        />
        <defs>
          <linearGradient id="rest-ring" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#F8FBFF" />
            <stop offset=".62" stopColor="#DCE7F7" />
            <stop offset="1" stopColor="#8FB9FF" />
          </linearGradient>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute h-[266px] w-[266px] animate-ring-orbit">
        <div className="ml-[126px] mt-[10px] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_rgba(143,185,255,.95)]" />
      </div>
      <div className="relative grid h-[205px] w-[205px] place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.13),rgba(255,255,255,.03)_58%,rgba(0,0,0,.10))] shadow-[inset_0_1px_0_rgba(255,255,255,.16)]">
        {children}
      </div>
    </div>
  );
}

