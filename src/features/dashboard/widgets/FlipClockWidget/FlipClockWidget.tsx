import * as React from 'react';
import './flipClockWidget.styles.css';

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }

function useClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h24 = now.getHours();
  const h12 = ((h24 + 11) % 12) + 1; // 1-12
  const hours = pad2(h12);
  const minutes = pad2(now.getMinutes());
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return { hours, minutes, ampm, now };
}

// Generic flip cell (two-digit string like "12" or "38")
type FlipCellProps = { value: string; label: string };

function FlipCell({ value, label }: FlipCellProps) {
  const [curr, setCurr] = React.useState(value);
  const [prev, setPrev] = React.useState(value);
  const [isFlipping, setIsFlipping] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (value !== curr) {
      setPrev(curr);
      setCurr(value);
      setIsFlipping(true);
      const t = setTimeout(() => setIsFlipping(false), 480);
      return () => clearTimeout(t);
    }
  }, [value, curr]);

  // Resize-aware font sizing
  React.useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        ref.current!.style.setProperty('--digit-size', Math.max(34, Math.floor(h * 0.50)) + 'px');
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`flip-clock-card ${isFlipping ? 'is-anim' : ''}`} ref={ref} aria-label={label}>
      <div className="fc-split" aria-hidden>
        <div className="fc-top">{curr}</div>
        <div className="fc-bottom">{curr}</div>
        <div className={`fc-flip fc-flip-top ${isFlipping ? 'is-anim' : ''}`}>
          <div className="fc-top fc-face">{prev}</div>
        </div>
        <div className={`fc-flip fc-flip-bottom ${isFlipping ? 'is-anim' : ''}`}>
          <div className="fc-bottom fc-face">{curr}</div>
        </div>
      </div>
    </div>
  );
}

export default function FlipClockWidget() {
  const { hours, minutes, ampm, now } = useClock();
  const timeLabel = React.useMemo(() => {
    return `${hours}:${minutes} ${ampm}`;
  }, [hours, minutes, ampm]);

  return (
    <div className="flip-clock-wrap" aria-label={`Current time ${timeLabel}`}>
      <div className="flip-clock-inner">
        <div className="flip-clock-left">
          <FlipCell value={hours} label="Hours" />
          <div className="flip-clock-ampm" aria-hidden>{ampm}</div>
        </div>
        <div className="flip-clock-right">
          <FlipCell value={minutes} label="Minutes" />
        </div>
      </div>
    </div>
  );
}
