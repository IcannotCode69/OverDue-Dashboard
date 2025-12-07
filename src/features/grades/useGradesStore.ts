import * as React from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  AssignmentPayload,
  GradeAssignment,
  GradeCourse,
  GradeItem,
  GradesState,
} from './grades.types';
import { generateId } from '../../utils/randomId';

const STORAGE_KEY = 'grades.state.v2';

const uuid = () => generateId();

function seedState(): GradesState {
  return {
    version: 2,
    courses: [],
    assignments: [],
  };
}

function migrateLegacy(): GradesState | null {
  try {
    const raw = localStorage.getItem('grades.items');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GradeItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const courseMap = new Map<string, GradeCourse>();
    const assignments: GradeAssignment[] = [];
    parsed.forEach((item) => {
      if (!item.course) return;
      let course = courseMap.get(item.course);
      if (!course) {
        course = { id: uuid(), name: item.course, createdAt: Date.now() };
        courseMap.set(item.course, course);
      }
      assignments.push({
        id: uuid(),
        courseId: course.id,
        name: item.assignment,
        due: item.due,
        pointsEarned: item.pointsEarned,
        pointsPossible: item.pointsPossible,
        status: item.status,
        letter: null,
        notes: item.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    if (!assignments.length) return null;

    return {
      version: 2,
      courses: Array.from(courseMap.values()),
      assignments,
    };
  } catch {
    return null;
  }
}

const INITIAL_STATE: GradesState = (() => migrateLegacy() ?? seedState())();

export function useGradesStore() {
  const [state, setState] = useLocalStorage<GradesState>(STORAGE_KEY, INITIAL_STATE);

  const addCourse = React.useCallback(
    (name: string): GradeCourse => {
      const course: GradeCourse = {
        id: uuid(),
        name: name.trim(),
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        courses: [...prev.courses, course],
      }));
      return course;
    },
    [setState]
  );

  const removeCourse = React.useCallback(
    (courseId: string) => {
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
        assignments: prev.assignments.filter((a) => a.courseId !== courseId),
      }));
    },
    [setState]
  );

  const updateCourse = React.useCallback(
    (courseId: string, patch: Partial<GradeCourse>) => {
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((course) =>
          course.id === courseId ? { ...course, ...patch } : course
        ),
      }));
    },
    [setState]
  );

  const upsertAssignment = React.useCallback(
    (payload: AssignmentPayload, id?: string) => {
      setState((prev) => {
        if (id) {
          return {
            ...prev,
            assignments: prev.assignments.map((assignment) =>
              assignment.id === id
                ? {
                    ...assignment,
                    ...payload,
                    name: payload.name,
                    courseId: payload.courseId,
                    due: payload.due,
                    pointsEarned: payload.pointsEarned,
                    pointsPossible: payload.pointsPossible,
                    letter: payload.letter ?? null,
                    status: payload.status,
                    notes: payload.notes,
                    updatedAt: Date.now(),
                  }
                : assignment
            ),
          };
        }

        const newAssignment: GradeAssignment = {
          id: uuid(),
          courseId: payload.courseId,
          name: payload.name,
          due: payload.due,
          pointsEarned: payload.pointsEarned,
          pointsPossible: payload.pointsPossible,
          letter: payload.letter ?? null,
          status: payload.status,
          notes: payload.notes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        return {
          ...prev,
          assignments: [...prev.assignments, newAssignment],
        };
      });
    },
    [setState]
  );

  const removeAssignment = React.useCallback(
    (assignmentId: string) => {
      setState((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((assignment) => assignment.id !== assignmentId),
      }));
    },
    [setState]
  );

  const replaceAssignmentsForCourse = React.useCallback(
    (courseId: string, items: GradeAssignment[]) => {
      setState((prev) => ({
        ...prev,
        assignments: [
          ...prev.assignments.filter((assignment) => assignment.courseId !== courseId),
          ...items,
        ],
      }));
    },
    [setState]
  );

  return {
    courses: state.courses,
    assignments: state.assignments,
    addCourse,
    removeCourse,
    updateCourse,
    upsertAssignment,
    removeAssignment,
    replaceAssignmentsForCourse,
  };
}
