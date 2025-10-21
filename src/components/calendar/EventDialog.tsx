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
};

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  event,
  categories
}: EventDialogProps) {
  const [title, setTitle] = React.useState(event?.title || '');
  const [start, setStart] = React.useState(
    event?.start ? format(event.start, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [end, setEnd] = React.useState(
    event?.end ? format(event.end, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [categoryId, setCategoryId] = React.useState(event?.categoryId || categories[0]?.id || '');
  const [location, setLocation] = React.useState(event?.location || '');
  const [description, setDescription] = React.useState(event?.description || '');

  React.useEffect(() => {
    if (isOpen) {
      setTitle(event?.title || '');
      setStart(event?.start ? format(event.start, "yyyy-MM-dd'T'HH:mm") : '');
      setEnd(event?.end ? format(event.end, "yyyy-MM-dd'T'HH:mm") : '');
      setCategoryId(event?.categoryId || categories[0]?.id || '');
      setLocation(event?.location || '');
      setDescription(event?.description || '');
    }
  }, [isOpen, event, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      start: new Date(start),
      end: new Date(end),
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
          <h2 className="cal-dialog-title">{event ? 'Add Event' : 'Add Event'}</h2>
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
              <label htmlFor="start" className="cal-label">Start</label>
              <input
                id="start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="cal-input"
                required
              />
            </div>
            <div>
              <label htmlFor="end" className="cal-label">End</label>
              <input
                id="end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
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
            <button type="submit" className="cal-btn cal-btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
