import * as React from 'react';
import './streak-widget.css';

interface StreakWidgetProps {
  onRemove?: () => void;
}

const STORAGE_KEY = 'od:streak:days';

export default function StreakWidget({ onRemove }: StreakWidgetProps) {
  const [days, setDays] = React.useState<number>(0);
  const [bump, setBump] = React.useState(false);

  // Load initial value from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < 100000) {
        setDays(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const triggerBump = () => {
    // restart the animation class
    setBump(false);
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => setBump(true));
    } else {
      setBump(true);
    }
  };

  const increment = () => {
    const next = days + 1;
    setDays(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
    triggerBump();
  };

  // Clean up bump state after the animation duration
  React.useEffect(() => {
    if (!bump) return;
    const timeout = window.setTimeout(() => setBump(false), 220);
    return () => window.clearTimeout(timeout);
  }, [bump]);

  const label = days === 1 ? 'Streak day' : 'Streak days';

  return (
    <div className="streak-widget app-card app-card--flush">
      <div className="streak-widget__inner">
        <div className="streak-widget__top-row">
          <div className="streak-widget__flame" aria-hidden="true">
            🔥
          </div>
          {/* Optional remove support if onRemove is passed */}
          {onRemove && (
            <button
              type="button"
              className="streak-widget__remove react-grid-no-drag"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove streak widget"
            >
              ✕
            </button>
          )}
        </div>

        <div className="streak-widget__content">
          <div className="streak-widget__number-row">
            <span
              className={
                'streak-widget__number' +
                (bump ? ' streak-widget__number--bump' : '')
              }
            >
              {days}
            </span>
            <span className="streak-widget__label">{label}</span>
          </div>

          <div className="streak-widget__character" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="streak-widget__button react-grid-no-drag"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            increment();
          }}
        >
          + Add day
        </button>
      </div>
    </div>
  );
}
