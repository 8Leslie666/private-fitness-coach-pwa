interface TimelineItem {
  title: string;
  detail: string;
  minutes: string;
  done?: boolean;
}

interface InkTimelineProps {
  items: TimelineItem[];
  activeIndex: number;
}

export function InkTimeline({ items, activeIndex }: InkTimelineProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <div key={item.title} className="relative flex gap-3">
            <div className="flex w-8 flex-col items-center">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${active ? 'bg-mountain text-white' : item.done ? 'bg-seal/10 text-seal' : 'bg-inkwash text-muted'}`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              {index < items.length - 1 && <div className="mt-2 h-8 w-px bg-ink/12" />}
            </div>
            <div className={`min-w-0 flex-1 rounded-2xl p-3 ${active ? 'bg-white/90 shadow-soft' : 'bg-white/55'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink">{item.title}</p>
                <span className="text-xs text-muted">{item.minutes}</span>
              </div>
              <p className="mt-1 text-sm leading-5 text-muted">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
