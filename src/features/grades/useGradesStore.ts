import * as React from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  AssignmentPayload,
  GradeAssignment,
  GradeCourse,
  GradeItem,
  GradesState,
} from './grades.types';

const STORAGE_KEY = 'grades.state.v2';

const uuid = () =>
  globalThis.crypto?.randomUUID?.() ?? `grade-${Math.random().toString(36).slice(2, 10)}`;

function seedState(): GradesState {
  const now = Date.now();
  const courseA: GradeCourse = { id: uuid(), name: 'CS 2410', createdAt: now };
  const courseB: GradeCourse = { id: uuid(), name: 'CS 4920', createdAt: now + 1 };
  const courseC: GradeCourse = { id: uuid(), name: 'MATH 2210', createdAt: now + 2 };

  const assignments: GradeAssignment[] = [
    {
      id: uuid(),
      courseId: courseA.id,
      name: 'Project Proposal',
      due: new Date(2025, 9, 14, 23, 59).toISOString(),
      pointsPossible: 20,
      pointsEarned: 18,
      status: 'Graded',
      letter: 'A-',
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      courseId: courseB.id,
      name: 'Sprint 1 Report',
      due: new Date(2025, 9, 18, 12, 0).toISOString(),
      pointsPossible: 100,
      pointsEarned: null,
      status: 'In Progress',
      letter: null,
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      courseId: courseC.id,
      name: 'Homework 4',
      due: new Date(2025, 9, 16, 9, 0).toISOString(),
      pointsPossible: 10,
      pointsEarned: 10,
      status: 'Graded',
      letter: 'A',
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    version: 2,
    courses: [courseA, courseB, courseC],
    assignments,
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
