import * as React from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../features/grades/useLocalStorage';
import type { GradeItem } from '../features/grades/grades.types';
import GradeDialog from '../components/grades/GradeDialog';

// styles
import '../features/calendar/calendar.styles.css';
import '../features/grades/grades.styles.css';

const SEED: GradeItem[] = [
  {
    id: crypto.randomUUID(),
    course: 'CS 2410',
    assignment: 'Project Proposal',
    due: new Date(2025, 9, 14, 23, 59).toISOString(),
    pointsPossible: 20,
    pointsEarned: 18,
    status: 'Graded',
  },
  {
    id: crypto.randomUUID(),
    course: 'CS 4920',
    assignment: 'Sprint 1 Report',
    due: new Date(2025, 9, 18, 12, 0).toISOString(),
    pointsPossible: 100,
    pointsEarned: null,
    status: 'In Progress',
  },
  {
    id: crypto.randomUUID(),
    course: 'MATH 2210',
    assignment: 'Homework 4',
    due: new Date(2025, 9, 16, 9, 0).toISOString(),
    pointsPossible: 10,
    pointsEarned: 10,
    status: 'Graded',
  },
];

export default function Grades() {
  const [items, setItems] = useLocalStorage<GradeItem[]>('grades.items', SEED);
  const [query, setQuery] = React.useState('');
  const [courseFilter, setCourseFilter] = React.useState<string>('All');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GradeItem | undefined>(undefined);

  const courses = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.course));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return items
      .filter(i => courseFilter === 'All' || i.course === courseFilter)
      .filter(i =>
        q === '' ||
        i.course.toLowerCase().includes(q) ||
        i.assignment.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  }, [items, query, courseFilter]);

  // Summary cards
  const summary = React.useMemo(() => {
    const total = items.length;
    const graded = items.filter(i => i.pointsEarned != null).length;
    const completed = items.filter(i => i.status === 'Graded' || i.status === 'Submitted').length;

    const earned = items.reduce((sum, i) => sum + (i.pointsEarned ?? 0), 0);
    const possible = items.reduce((sum, i) => sum + i.pointsPossible, 0);
    const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0;

    return { total, graded, completed, pct };
  }, [items]);

  const openAdd = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (it: GradeItem) => { setEditing(it); setDialogOpen(true); };

  const saveItem = (data: Omit<GradeItem, 'id'>, id?: string) => {
    if (id) {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
    } else {
      setItems(prev => prev.concat({ id: crypto.randomUUID(), ...data }));
    }
  };

  const removeItem = (id: string) => {
    if (!confirm('Delete this grade item?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const statusChip = (s: GradeItem['status']) => {
    const map = {
      'Not Started': 'ns',
      'In Progress': 'ip',
      'Submitted': 'sub',
      'Graded': 'gr',
    } as const;
    return <span className={`gr-status ${map[s]}`}>{s}</span>;
  };

  return (
    <div className="grades-wrap">
      {/* Left column */}
      <div className="grades-left">
        <div className="gr-card">
          <div className="gr-card-title">Summary</div>
          <div className="gr-summary">
            <div className="gr-pill">
              <div className="label">Overall</div>
              <div className="value">{summary.pct}%</div>
            </div>
            <div className="gr-pill">
              <div className="label">Graded</div>
              <div className="value">{summary.graded}/{summary.total}</div>
            </div>
            <div className="gr-pill">
              <div className="label">Completed</div>
              <div className="value">{summary.completed}</div>
            </div>
          </div>
        </div>

        <div className="gr-card">
          <div className="gr-card-title">Filters</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="gr-search">
              <input
                placeholder="Search course or assignment…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="cal-input"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="grades-main">
        <div className="gr-toolbar">
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Grades</h1>
          <button className="cal-btn cal-btn-primary" onClick={openAdd}>
            <Plus size={16} style={{ marginRight: 8 }} /> Add Item
          </button>
        </div>

        <table className="gr-table">
          <thead className="gr-head">
            <tr>
              <th>Course</th>
              <th>Assignment</th>
              <th>Due</th>
              <th>Points</th>
              <th>Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="gr-empty">No items yet.</td></tr>
            )}
            {filtered.map(it => {
              const pts = `${it.pointsEarned ?? '—'} / ${it.pointsPossible}`;
              return (
                <tr key={it.id} className="gr-row">
                  <td className="gr-course">{it.course}</td>
                  <td>{it.assignment}</td>
                  <td>{format(new Date(it.due), 'MMM d, yyyy • HH:mm')}</td>
                  <td>{pts}</td>
                  <td>{statusChip(it.status)}</td>
                  <td>
                    <div className="gr-actions">
                      <button className="cal-btn cal-btn-ghost" onClick={() => openEdit(it)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="cal-btn cal-btn-ghost" onClick={() => removeItem(it.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <GradeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={saveItem}
        item={editing}
      />
    </div>
  );
}

