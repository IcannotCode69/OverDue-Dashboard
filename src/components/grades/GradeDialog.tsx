import * as React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { GradeItem, GradeStatus } from '../../features/grades/grades.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<GradeItem, 'id'>, id?: string) => void;
  item?: GradeItem; // if set -> edit mode
};

const STATUSES: GradeStatus[] = ['Not Started', 'In Progress', 'Submitted', 'Graded'];

export default function GradeDialog({ isOpen, onClose, onSave, item }: Props) {
  const [course, setCourse] = React.useState(item?.course ?? '');
  const [assignment, setAssignment] = React.useState(item?.assignment ?? '');
  const [due, setDue] = React.useState(
    item?.due ? format(new Date(item.due), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [pointsPossible, setPointsPossible] = React.useState<number>(item?.pointsPossible ?? 100);
  const [pointsEarned, setPointsEarned] = React.useState<string>(
    item?.pointsEarned != null ? String(item.pointsEarned) : ''
  );
  const [status, setStatus] = React.useState<GradeStatus>(item?.status ?? 'Not Started');
  const [notes, setNotes] = React.useState(item?.notes ?? '');

  React.useEffect(() => {
    if (isOpen) {
      setCourse(item?.course ?? '');
      setAssignment(item?.assignment ?? '');
      setDue(item?.due ? format(new Date(item.due), "yyyy-MM-dd'T'HH:mm") : '');
      setPointsPossible(item?.pointsPossible ?? 100);
      setPointsEarned(item?.pointsEarned != null ? String(item.pointsEarned) : '');
      setStatus(item?.status ?? 'Not Started');
      setNotes(item?.notes ?? '');
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<GradeItem, 'id'> = {
      course: course.trim(),
      assignment: assignment.trim(),
      due: new Date(due).toISOString(),
      pointsPossible: Number(pointsPossible) || 0,
      pointsEarned: pointsEarned === '' ? null : Number(pointsEarned),
      status,
      notes: notes.trim() || undefined,
    };
    onSave(payload, item?.id);
    onClose();
  };

  return (
    <div className="cal-dialog-overlay">
      <div className="cal-dialog-content">
        <div className="cal-dialog-header">
          <h2 className="cal-dialog-title">{item ? 'Edit Grade Item' : 'Add Grade Item'}</h2>
          <button onClick={onClose} className="cal-dialog-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="cal-dialog-form">
          <div className="cal-grid-2">
            <div>
              <label className="cal-label" htmlFor="course">Course</label>
              <input id="course" className="cal-input" value={course}
                onChange={(e) => setCourse(e.target.value)} required />
            </div>
            <div>
              <label className="cal-label" htmlFor="assignment">Assignment</label>
              <input id="assignment" className="cal-input" value={assignment}
                onChange={(e) => setAssignment(e.target.value)} required />
            </div>
          </div>

          <div className="cal-grid-2">
            <div>
              <label className="cal-label" htmlFor="due">Due</label>
              <input id="due" type="datetime-local" className="cal-input"
                value={due} onChange={(e) => setDue(e.target.value)} required />
            </div>
            <div>
              <label className="cal-label" htmlFor="status">Status</label>
              <select id="status" className="cal-input" value={status}
                onChange={(e) => setStatus(e.target.value as GradeStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="cal-grid-2">
            <div>
              <label className="cal-label" htmlFor="pointsPossible">Points Possible</label>
              <input id="pointsPossible" type="number" min={0} className="cal-input"
                value={pointsPossible} onChange={(e) => setPointsPossible(Number(e.target.value))} required />
            </div>
            <div>
              <label className="cal-label" htmlFor="pointsEarned">Points Earned (optional)</label>
              <input id="pointsEarned" type="number" min={0} className="cal-input"
                value={pointsEarned} onChange={(e) => setPointsEarned(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="cal-label" htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" className="cal-textarea" value={notes}
              onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="cal-dialog-footer">
            <button type="button" className="cal-btn cal-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="cal-btn cal-btn-primary">{item ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

