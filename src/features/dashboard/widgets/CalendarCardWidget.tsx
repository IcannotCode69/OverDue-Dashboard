import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../../calendar/types';
import { readCalendarEvents, getEventsForDate } from '../../calendar/storage';
import CalendarCardSettings from './CalendarCardSettings';
import './calendar-card.css';

interface CalendarCardWidgetProps {
  onRemove?: () => void;
}

export default function CalendarCardWidget({ onRemove }: CalendarCardWidgetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { loadEvents(selectedDate); }, [selectedDate]);

  useEffect(() => {
    // Listen for local calendar data updates
    const handleCalendarEvent = () => { loadEvents(selectedDate); };
    window.addEventListener('calendar-events-updated', handleCalendarEvent as any);

    return () => {
      window.removeEventListener('calendar-events-updated', handleCalendarEvent as any);
    };
  }, [selectedDate]);

  const loadEvents = (date: Date) => {
    setIsLoading(true);
    try {
      const all = readCalendarEvents() as any as CalendarEvent[];
      const todays = getEventsForDate(all as any, date) as any as CalendarEvent[];
      setEvents(todays);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRange = (start: Date, end: Date): string => {
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    return `${startTime}–${endTime}`;
  };

  const getEventVariant = (index: number): 'primary' | 'secondary' | 'subtle' => {
    if (index === 0) return 'primary';
    if (index === 1) return 'secondary';
    return 'subtle';
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString([], { month: 'short' }).toUpperCase();
  };

  const formatDay = (date: Date): string => {
    return date.getDate().toString();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="calendar-card">
      {/* Header */}
      <div className="calendar-card__header">
        <div className="calendar-card__date">
          <div className="calendar-card__month">
            {formatMonth(selectedDate)}
          </div>
          <div className="calendar-card__day">
            {formatDay(selectedDate)}
          </div>
        </div>
        
        <div className="calendar-card__controls">
          <button
            className="calendar-card__nav-btn react-grid-no-drag"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateDate('prev');
            }}
            aria-label="Previous day"
          >
            ‹
          </button>
          <button
            className="calendar-card__nav-btn react-grid-no-drag"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateDate('next');
            }}
            aria-label="Next day"
          >
            ›
          </button>
          
          {/* Settings button within controls */}
          <button
            ref={settingsButtonRef}
            className="calendar-card__settings-btn react-grid-no-drag"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSettingsOpen(!isSettingsOpen);
            }}
            style={{ 
              position: 'relative',
              zIndex: 1000,
              pointerEvents: 'auto',
              backgroundColor: isSettingsOpen ? 'rgba(74, 168, 255, 0.2)' : 'transparent'
            }}
            onMouseOver={(e) => {
              if (!isSettingsOpen) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSettingsOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            aria-label="Calendar settings"
          >
            ⚙︎
          </button>
        </div>

        {/* Drag handle for react-grid-layout */}
        <div className="react-grid-dragHandle calendar-card__drag-handle" />
      </div>

      {/* Events list */}
      {isLoading ? (
        <div className="calendar-card__loading">
          <div className="calendar-event-skeleton" />
          <div className="calendar-event-skeleton" />
          <div className="calendar-event-skeleton" />
        </div>
      ) : events.length === 0 ? (
        <div className="calendar-card__empty">
          <div className="calendar-card__empty-icon">📅</div>
          <div className="calendar-card__empty-text">{isToday(selectedDate) ? 'No events today' : 'No events for this day'}</div>
          <div className="calendar-card__empty-subtext">Your calendar is clear!</div>
        </div>
      ) : (
        <div className="calendar-card__events nice-scroll">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`calendar-event calendar-event--${getEventVariant(index)}${
                event.allDay ? ' calendar-event--all-day' : ''
              }`}
            >
              <div className="calendar-event__title">
                {event.title}
              </div>
              {!event.allDay && (
                <div className="calendar-event__time">
                  {formatTimeRange(event.start, event.end)}
                </div>
              )}
              {event.location && (
                <div className="calendar-event__location">
                  📍 {event.location}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Settings panel */}
      <CalendarCardSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        anchorElement={settingsButtonRef.current}
      />
    </div>
  );
}
