interface RestRingProps {
  remainingSeconds: number;
  totalSeconds: number;
  formattedTime: string;
  dark?: boolean;
}

export function RestRing({ remainingSeconds, totalSeconds, formattedTime, dark = false }: RestRingProps) {
  const progress = totalSeconds ? Math.min(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 100) : 0;
  return (
    <div
      className="rest-ring rest-ring-system mx-auto"
      style={{
        background: `conic-gradient(${dark ? '#7DD3C7' : '#2E8B57'} ${progress * 3.6}deg, ${dark ? 'rgba(255,255,255,0.12)' : '#ECE5DC'} 0deg)`,
      }}
    >
      <div className={`rest-ring-core ${dark ? 'bg-white/10 text-white' : 'bg-white/78 text-ink900'}`}>
        <p className="text-[52px] font-semibold tracking-normal">{formattedTime}</p>
      </div>
    </div>
  );
}
