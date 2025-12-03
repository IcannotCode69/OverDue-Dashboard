import * as React from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import GradeDialog from '../components/grades/GradeDialog';
import {
  parseBrightspaceText,
  parsedToAssignments,
  type ParsedGradeLine,
} from '../features/grades/parseBrightspaceText';
import type { GradeAssignment } from '../features/grades/grades.types';
import { useGradesStore } from '../features/grades/useGradesStore';

import '../features/calendar/calendar.styles.css';
import '../features/grades/grades.styles.css';

type CourseFilter = 'all' | string;

export default function Grades() {
  const {
    courses,
    assignments,
    addCourse,
    removeCourse,
    upsertAssignment,
    removeAssignment,
    replaceAssignmentsForCourse,
  } = useGradesStore();

  const [selectedCourseId, setSelectedCourseId] = React.useState<CourseFilter>('all');
  const [query, setQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GradeAssignment | undefined>(undefined);
  const [isAddingCourse, setIsAddingCourse] = React.useState(false);
  const [newCourseName, setNewCourseName] = React.useState('');

  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [preview, setPreview] = React.useState<ParsedGradeLine[] | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedCourseId !== 'all' && !courses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId('all');
    }
  }, [courses, selectedCourseId]);

  const courseMap = React.useMemo(() => {
    return new Map(courses.map((course) => [course.id, course]));
  }, [courses]);

  const assignmentsForCourse = React.useMemo(() => {
    if (selectedCourseId === 'all') return assignments;
    return assignments.filter((assignment) => assignment.courseId === selectedCourseId);
  }, [selectedCourseId, assignments]);

  const visibleAssignments = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return assignmentsForCourse
      .filter((assignment) => {
        if (!q) return true;
        const courseName = courseMap.get(assignment.courseId)?.name ?? '';
        return (
          assignment.name.toLowerCase().includes(q) ||
          courseName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aTime = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      });
  }, [assignmentsForCourse, query, courseMap]);

  const summaryAssignments = React.useMemo(() => {
    if (selectedCourseId === 'all') return assignments;
    return assignments.filter((assignment) => assignment.courseId === selectedCourseId);
  }, [assignments, selectedCourseId]);

  const summary = React.useMemo(() => {
    const total = summaryAssignments.length;
    const graded = summaryAssignments.filter((assignment) => assignment.pointsEarned != null)
      .length;
    const completed = summaryAssignments.filter(
      (assignment) => assignment.status === 'Graded' || assignment.status === 'Submitted'
    ).length;
    const earned = summaryAssignments.reduce(
      (sum, assignment) => sum + (assignment.pointsEarned ?? 0),
      0
    );
    const possible = summaryAssignments.reduce(
      (sum, assignment) => sum + (assignment.pointsPossible ?? 0),
      0
    );
    const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    return { total, graded, completed, pct };
  }, [summaryAssignments]);

  const openAdd = () => {
    if (!courses.length) {
      window.alert('Add a class before creating assignments.');
      return;
    }
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (assignment: GradeAssignment) => {
    setEditing(assignment);
    setDialogOpen(true);
  };

  const saveAssignment = (payload: Parameters<typeof upsertAssignment>[0], id?: string) => {
    upsertAssignment(payload, id);
  };

  const handleRemoveAssignment = (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    removeAssignment(id);
  };

  const statusChip = (status: GradeAssignment['status']) => {
    const map = {
      'Not Started': 'ns',
      'In Progress': 'ip',
      Submitted: 'sub',
      Graded: 'gr',
    } as const;
    return <span className={`gr-status ${map[status]}`}>{status}</span>;
  };

  const handleAddCourseClick = () => {
    setIsAddingCourse(true);
    window.setTimeout(() => {
      document.getElementById('new-course-input')?.focus();
    }, 0);
  };

  const saveNewCourse = () => {
    const trimmed = newCourseName.trim();
    if (!trimmed) return;
    const course = addCourse(trimmed);
    setNewCourseName('');
    setIsAddingCourse(false);
    setSelectedCourseId(course.id);
  };

  const cancelNewCourse = () => {
    setNewCourseName('');
    setIsAddingCourse(false);
  };

  const handleRemoveCourse = (courseId: string) => {
    const name = courseMap.get(courseId)?.name ?? 'this class';
    if (!window.confirm(`Delete ${name} and all of its assignments?`)) return;
    removeCourse(courseId);
  };

  const activeCourse =
    selectedCourseId === 'all' ? null : courses.find((course) => course.id === selectedCourseId);

  const openImportModal = () => {
    if (!activeCourse) return;
    setImportOpen(true);
  };

  const closeImportModal = () => {
    setImportOpen(false);
    setImportText('');
    setPreview(null);
    setParseError(null);
  };

  const handleParseImport = () => {
    try {
      const result = parseBrightspaceText(importText);
      if (!result.length) {
        setParseError('No grade items detected. Paste from the Brightspace Grades page.');
        setPreview(null);
        return;
      }
      setPreview(result);
      setParseError(null);
    } catch {
      setParseError('Could not parse this text. Try again.');
      setPreview(null);
    }
  };

  const handleApplyImport = () => {
    if (!activeCourse || !preview || preview.length === 0) return;
    const items = parsedToAssignments(activeCourse.id, preview);
    replaceAssignmentsForCourse(activeCourse.id, items);
    closeImportModal();
  };

  return (
    <div className="grades-wrap">
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
              <div className="value">
                {summary.graded}/{summary.total}
              </div>
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
                placeholder="Search class or assignment"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grades-main">
        <div className="gr-toolbar">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Grades</h1>
            <p style={{ opacity: 0.7, marginTop: 4, fontSize: 13 }}>
              Organize assignments by class and import directly from Brightspace.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {activeCourse && (
              <button className="cal-btn cal-btn-ghost" onClick={openImportModal}>
                <Upload size={16} style={{ marginRight: 6 }} /> Paste from Brightspace
              </button>
            )}
            <button className="cal-btn cal-btn-primary" onClick={openAdd}>
              <Plus size={16} style={{ marginRight: 8 }} /> Add Item
            </button>
          </div>
        </div>

        <div className="gr-tabs">
          <button
            className={`gr-tab ${selectedCourseId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCourseId('all')}
          >
            All Classes
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              className={`gr-tab ${selectedCourseId === course.id ? 'active' : ''}`}
              onClick={() => setSelectedCourseId(course.id)}
            >
              {course.name}
              <span
                className="gr-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCourse(course.id);
                }}
                aria-label="Remove class"
              >
                x
              </span>
            </button>
          ))}
          {!isAddingCourse && (
            <button className="gr-tab add" onClick={handleAddCourseClick}>
              + Add Class
            </button>
          )}
        </div>

        {isAddingCourse && (
          <div className="gr-add-class">
            <input
              id="new-course-input"
              className="cal-input"
              placeholder="Course name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
            <div className="gr-add-class-actions">
              <button className="cal-btn cal-btn-primary" onClick={saveNewCourse}>
                Save
              </button>
              <button className="cal-btn cal-btn-ghost" onClick={cancelNewCourse}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <table className="gr-table">
          <thead className="gr-head">
            <tr>
              {selectedCourseId === 'all' && <th>Course</th>}
              <th>Assignment</th>
              <th>Due</th>
              <th>Points</th>
              <th>Letter</th>
              <th>Status</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleAssignments.length === 0 && (
              <tr>
                <td colSpan={selectedCourseId === 'all' ? 7 : 6} className="gr-empty">
                  No assignments yet.
                </td>
              </tr>
            )}
            {visibleAssignments.map((assignment) => {
              const courseName = courseMap.get(assignment.courseId)?.name ?? 'Unknown';
              const dueText = assignment.due
                ? format(new Date(assignment.due), 'MMM d, yyyy @ HH:mm')
                : '--';
              const points =
                assignment.pointsPossible != null
                  ? `${assignment.pointsEarned ?? '--'} / ${assignment.pointsPossible}`
                  : assignment.pointsEarned ?? '--';

              return (
                <tr key={assignment.id} className="gr-row">
                  {selectedCourseId === 'all' && <td className="gr-course">{courseName}</td>}
                  <td>{assignment.name}</td>
                  <td>{dueText}</td>
                  <td>{points}</td>
                  <td>{assignment.letter ?? '--'}</td>
                  <td>{statusChip(assignment.status)}</td>
                  <td>
                    <div className="gr-actions">
                      <button className="cal-btn cal-btn-ghost" onClick={() => openEdit(assignment)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        className="cal-btn cal-btn-ghost"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
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

      <GradeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={saveAssignment}
        item={editing}
        courses={courses}
        defaultCourseId={selectedCourseId === 'all' ? undefined : selectedCourseId}
      />

      {importOpen && activeCourse && (
        <div className="cal-dialog-overlay">
          <div className="cal-dialog-content" style={{ maxWidth: 640 }}>
            <div className="cal-dialog-header">
              <h2 className="cal-dialog-title">Import from Brightspace</h2>
              <button
                onClick={closeImportModal}
                className="cal-dialog-close"
                aria-label="Close import dialog"
              >
                x
              </button>
            </div>
            <div className="cal-dialog-form" style={{ gap: 16 }}>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>
                In Brightspace, open the Grades page for <strong>{activeCourse.name}</strong>,
                select all text (Ctrl+A), copy, and paste it below. We will replace any existing
                assignments for this class with the parsed items.
              </p>
              <textarea
                className="cal-textarea"
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste the raw text from Brightspace Grades..."
              />
              {parseError && <div className="gr-import-error">{parseError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="cal-btn cal-btn-ghost" type="button" onClick={handleParseImport}>
                  Parse Preview
                </button>
                <button
                  className="cal-btn cal-btn-primary"
                  type="button"
                  onClick={handleApplyImport}
                  disabled={!preview || preview.length === 0}
                >
                  Import into {activeCourse.name}
                </button>
              </div>

              {preview && preview.length > 0 && (
                <div className="gr-import-preview">
                  <div className="gr-card-title" style={{ marginBottom: 8 }}>
                    Preview ({preview.length} items)
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Name</th>
                        <th>Earned</th>
                        <th>Possible</th>
                        <th>Letter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((item, index) => (
                        <tr key={`${item.name}-${index}`}>
                          <td>{item.name}</td>
                          <td>{item.earned ?? '--'}</td>
                          <td>{item.possible ?? '--'}</td>
                          <td>{item.letter ?? '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
