import React from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type MiniCalendarProps = {
  /** Controlled selected date (highlighted in the mini calendar) */
  selectedDate?: Date;
  /** Backward-compatible alias if other callers ever pass it */
  date?: Date;
  /** Fires when a day is picked */
  onChange?: (d: Date) => void;
  /** Backward-compatible alias */
  onSelectDate?: (d: Date) => void;
  className?: string;
};

export default function MiniCalendar({
  selectedDate,
  date,
  onChange,
  onSelectDate,
  className,
}: MiniCalendarProps) {
  // normalize incoming selected date
  const controlledSelected = selectedDate ?? date ?? new Date();

  const [monthCursor, setMonthCursor] = React.useState<Date>(
    startOfMonth(controlledSelected)
  );

  // Keep visible month in sync if parent changes selected date
  React.useEffect(() => {
  setMonthCursor(startOfMonth(controlledSelected));
}, [controlledSelected.getTime()]);


  const weekStart = startOfWeek(monthCursor, { weekStartsOn: 0 });

  const days: Date[] = React.useMemo(() => {
    // 6 weeks * 7 days = 42 cells (standard mini calendar grid)
    return Array.from({ length: 42 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const pick = (d: Date) => {
    onChange?.(d);
    onSelectDate?.(d);
  };

  return (
    <div className={`mini-cal ${className ?? ""}`}>
      <div className="mini-cal__header">
        <button
          type="button"
          aria-label="Previous month"
          className="mini-cal__nav"
          onClick={() => setMonthCursor((m) => subMonths(m, 1))}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="mini-cal__title">{format(monthCursor, "MMMM yyyy")}</div>
        <button
          type="button"
          aria-label="Next month"
          className="mini-cal__nav"
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mini-cal__dow">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="mini-cal__dow-cell">
            {d}
          </div>
        ))}
      </div>

      <div className="mini-cal__grid">
        {days.map((d) => {
          const outside = !isSameMonth(d, monthCursor);
          const selected = isSameDay(d, controlledSelected);
          const today = isSameDay(d, new Date());
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => pick(d)}
              className={[
                "mini-cal__cell",
                outside ? "is-outside" : "",
                today ? "is-today" : "",
                selected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}