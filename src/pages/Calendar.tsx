import React from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import MiniCalendar from '../components/calendar/MiniCalendar';
import CategoryList from '../components/calendar/CategoryList';
import EventCard from '../components/calendar/EventCard';
import EventDialog from '../components/calendar/EventDialog';
import type { Event } from '../components/calendar/EventCard';
import Button from '../components/ui/Button';

// Import custom CSS
import "../features/calendar/calendar.styles.css";

// Sample data
const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Booking test app',
    start: parseISO('2025-10-13T09:00:00'),
    end: parseISO('2025-10-13T10:00:00'),
    categoryId: 'work',
    location: 'Office',
  },
  {
    id: '2',
    title: 'Design onboarding',
    start: parseISO('2025-10-13T11:00:00'),
    end: parseISO('2025-10-13T12:30:00'),
    categoryId: 'work',
  },
  {
    id: '3',
    title: 'Development meet',
    start: parseISO('2025-10-13T10:00:00'),
    end: parseISO('2025-10-13T11:00:00'),
    categoryId: 'work',
    location: 'Room 3B',
  },
  {
    id: '4',
    title: 'Design review',
    start: parseISO('2025-10-16T15:00:00'),
    end: parseISO('2025-10-16T16:00:00'),
    categoryId: 'work',
    location: 'Design Lab',
  },
  {
    id: '5',
    title: 'Meet Gabriel at the International Library',
    start: parseISO('2025-10-12T12:00:00'),
    end: parseISO('2025-10-12T13:30:00'),
    categoryId: 'personal',
    location: 'International Library',
  },
];

const CATEGORIES = [
  { id: 'personal', name: 'Personal', color: 'bg-purple-500/80', enabled: true },
  { id: 'work', name: 'Work', color: 'bg-blue-500/80', enabled: true },
  { id: 'health', name: 'Health', color: 'bg-green-500/80', enabled: true },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 6); // 6am to 6pm

export default function Calendar() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<'week' | 'day'>('week');
  const [categories, setCategories] = React.useState(CATEGORIES);
  const [events, setEvents] = React.useState(SAMPLE_EVENTS);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | undefined>(undefined);

  const startDate = startOfWeek(selectedDate);
  
  const days = React.useMemo(() => {
    if (viewMode === 'week') {
      return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    }
    return [selectedDate];
  }, [startDate, selectedDate, viewMode]);

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const toggleCategory = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    if (selectedEvent) {
      // Edit existing event
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id
            ? { ...event, ...eventData }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
      };
      setEvents([...events, newEvent]);
    }
  };

  const filteredEvents = events.filter(
    (event) => categories.find((cat) => cat.id === event.categoryId)?.enabled
  );

  const categoryColors = categories.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat.color }),
    {} as Record<string, string>
  );

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return filteredEvents.filter((event) => {
      const eventHour = event.start.getHours();
      return isSameDay(event.start, day) && eventHour === hour;
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return filteredEvents
      .filter((event) => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3);
  };

  return (
    <div className="cal-root">
      {/* Left sidebar */}
      <div className="cal-sidebar">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          events={filteredEvents}
          categoryColors={categoryColors}
        />
        
        <div className="cal-upcoming">
          <h3 className="cal-upcoming-title">Upcoming</h3>
          <div>
            {getUpcomingEvents().map((event) => (
              <div
                key={event.id}
                className={`cal-upcoming-event cal-event--${event.categoryId}`}
                onClick={() => handleEditEvent(event)}
              >
                <div className="cal-upcoming-time">
                  {format(event.start, 'MMM d, h:mm a')}
                </div>
                <div className="cal-upcoming-title">
                  {event.title}
                </div>
              </div>
            ))}
            {getUpcomingEvents().length === 0 && (
              <div className="cal-upcoming-event">No upcoming events</div>
            )}
          </div>
        </div>
        
        <div className="cal-categories">
          <h3 className="cal-upcoming-title">Categories</h3>
          <CategoryList categories={categories} onToggle={toggleCategory} />
        </div>
      </div>

      {/* Main content */}
      <div className="cal-main">
        {/* Header */}
        <div className="cal-header">
          <div className="cal-header-left">
            <h1 className="cal-header-title">
              {format(selectedDate, 'MMMM yyyy')}
            </h1>
            <div className="cal-nav-buttons">
              <button
                onClick={handlePrevious}
                className="cal-btn cal-btn-icon cal-btn-ghost"
              >
                <ChevronLeft size={20} />
              </button>
              <Button
                onClick={handleToday}
                variant="secondary"
                size="xs"
              >
                Today
              </Button>
              <button
                onClick={handleNext}
                className="cal-btn cal-btn-icon cal-btn-ghost"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="cal-btn-group">
            <button
              onClick={() => setViewMode('week')}
              className={`cal-btn ${
                viewMode === 'week'
                  ? 'cal-btn-active'
                  : 'cal-btn-ghost'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`cal-btn ${
                viewMode === 'day'
                  ? 'cal-btn-active'
                  : 'cal-btn-ghost'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="cal-scroll">
          <div className="cal-days">
            {/* Time column header */}
            <div></div>
            
            {/* Day headers */}
            {days.map((day) => (
              <div
                key={day.toString()}
                className={`cal-daychip ${
                  isSameDay(day, new Date()) ? 'cal-daychip--today' : ''
                }`}
              >
                <div className="cal-day-name">
                  {format(day, 'EEEE')}
                </div>
                <div className="cal-day-number">
                  {format(day, 'd')}
                </div>
              </div>
            ))}
            
            {/* Time rows */}
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="cal-time-label">
                  {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                
                {/* Day slots */}
                {days.map((day) => {
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="cal-slot"
                    >
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          categoryColor={`cal-event--${event.categoryId}`}
                          onClick={() => handleEditEvent(event)}
                        />
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event button */}
      <button
        onClick={handleAddEvent}
        className="cal-add-event"
      >
        <Plus size={20} />
        <span>Add Event</span>
      </button>

      {/* Event dialog */}
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        categories={categories}
      />
    </div>
  );
}