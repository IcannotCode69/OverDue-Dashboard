import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

// The dialog doesn't need the EventCard type. Define a local, minimal shape:
type CalendarEventInput = {
  title: string;
  start: Date;
  end: Date;
  categoryId: string;
  location?: string;
  description?: string;
};

type EventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEventInput) => void;
  // When editing we may pass an event-like object; keep it optional and compatible
  event?: Partial<CalendarEventInput> & { start?: Date; end?: Date };
  categories: Array<{ id: string; name: string; color: string }>;
  // NEW (non-breaking): base date used when adding with time-only inputs
  baseDate?: Date;
};

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  event,
  categories,
  baseDate,
}: EventDialogProps) {
  const [title, setTitle] = React.useState(event?.title || '');
  // Time-only strings (HH:mm). For edit mode, derive from given dates
  const [startTime, setStartTime] = React.useState(
    event?.start ? format(event.start, 'HH:mm') : ''
  );
  const [endTime, setEndTime] = React.useState(
    event?.end ? format(event.end, 'HH:mm') : ''
  );
  const [categoryId, setCategoryId] = React.useState(event?.categoryId || categories[0]?.id || '');
  const [location, setLocation] = React.useState(event?.location || '');
  const [description, setDescription] = React.useState(event?.description || '');

  React.useEffect(() => {
    if (isOpen) {
      setTitle(event?.title || '');
      setStartTime(event?.start ? format(event.start, 'HH:mm') : '');
      setEndTime(event?.end ? format(event.end, 'HH:mm') : '');
      setCategoryId(event?.categoryId || categories[0]?.id || '');
      setLocation(event?.location || '');
      setDescription(event?.description || '');
    }
  }, [isOpen, event, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine baseDate (selected day) with HH:mm time strings
    const base = event?.start || baseDate || new Date();
    const [sh, sm] = (startTime || '00:00').split(':').map(Number);
    const [eh, em] = (endTime || '00:00').split(':').map(Number);
    const s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh || 0, sm || 0);
    const en = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh || 0, em || 0);
    onSave({
      title,
      start: s,
      end: en,
      categoryId,
      location,
      description,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cal-dialog-overlay">
      <div className="cal-dialog-content">
        <div className="cal-dialog-header">
          <h2 className="cal-dialog-title">{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button onClick={onClose} className="cal-dialog-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cal-dialog-form">
          <div>
            <label htmlFor="title" className="cal-label">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cal-input"
              required
            />
          </div>

          <div className="cal-grid-2">
            <div>
              <label htmlFor="start" className="cal-label">Start Time</label>
              <input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="cal-input"
                required
              />
            </div>
            <div>
              <label htmlFor="end" className="cal-label">End Time</label>
              <input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="cal-input"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="cal-label">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="cal-input"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="cal-label">Location (optional)</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="cal-input"
            />
          </div>

          <div>
            <label htmlFor="description" className="cal-label">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="cal-textarea"
            />
          </div>

          <div className="cal-dialog-footer">
            <button type="button" onClick={onClose} className="cal-btn cal-btn-ghost">Cancel</button>
            <button type="submit" className="cal-btn cal-btn-primary">{event ? 'Save' : 'Add Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
