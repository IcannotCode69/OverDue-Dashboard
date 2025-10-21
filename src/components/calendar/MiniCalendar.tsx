import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type MiniCalendarProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: Array<{ start: Date; categoryId: string }>;
  categoryColors: Record<string, string>;
};

export default function MiniCalendar({ selectedDate, onDateChange, events, categoryColors }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="cal-mini-header">
        <button
          className="cal-btn cal-btn-icon"
          onClick={prevMonth}
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="cal-mini-title">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          className="cal-btn cal-btn-icon"
          onClick={nextMonth}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="cal-mini-grid">
        {days.map((day) => (
          <div
            key={day}
            className="cal-mini-weekday"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        // Check if there are events on this day
        const dayEvents = events.filter(event => isSameDay(event.start, cloneDay));
        
        days.push(
          <div
            key={day.toString()}
            className={`cal-mini-day ${isSelected ? 'cal-mini-day--selected' : ''} ${!isCurrentMonth ? 'cal-mini-day--disabled' : ''}`}
            onClick={() => onDateChange(cloneDay)}
          >
            {format(day, 'd')}
            {dayEvents.length > 0 && (
              <div className="cal-mini-day-events">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div 
                    key={index}
                    className={`cal-mini-day-event ${categoryColors[event.categoryId] || 'cal-event-default'}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="cal-mini-week">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="cal-mini-body">{rows}</div>;
  };

  return (
    <div className="cal-mini">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}