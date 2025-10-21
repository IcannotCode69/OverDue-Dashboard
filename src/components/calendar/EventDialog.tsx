import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { Event } from './EventCard';

type EventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  event?: Event;
  categories: Array<{ id: string; name: string; color: string }>;
};

export default function EventDialog({ isOpen, onClose, onSave, event, categories }: EventDialogProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-300 mb-1">
                Start
              </label>
              <input
                id="start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-300 mb-1">
                End
              </label>
              <input
                id="end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}