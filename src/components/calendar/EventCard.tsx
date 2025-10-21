import React from 'react';
import { format } from 'date-fns';

export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  categoryId: string;
  location?: string;
  description?: string;
};

type EventCardProps = {
  event: Event;
  categoryColor: string;
  onClick: () => void;
};

export default function EventCard({ event, categoryColor, onClick }: EventCardProps) {
  const startTime = format(event.start, 'h:mm a');
  const endTime = format(event.end, 'h:mm a');
  
  return (
    <div 
      className={`cal-event ${categoryColor}`}
      onClick={onClick}
    >
      <div className="cal-event-time">
        {startTime} - {endTime}
      </div>
      <div className="cal-event-title">
        {event.title}
      </div>
      {event.location && (
        <div className="cal-event-location">
          {event.location}
        </div>
      )}
    </div>
  );
}