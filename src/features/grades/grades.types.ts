export type GradeStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';

export type GradeItem = {
  id: string;
  course: string;
  assignment: string;
  due: string;
  pointsEarned: number | null;
  pointsPossible: number;
  status: GradeStatus;
  notes?: string;
};

export interface GradeCourse {
  id: string;
  name: string;
  color?: string | null;
  createdAt: number;
}

export interface GradeAssignment {
  id: string;
  courseId: string;
  name: string;
  due: string | null;
  pointsEarned: number | null;
  pointsPossible: number | null;
  letter?: string | null;
  status: GradeStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AssignmentPayload {
  courseId: string;
  name: string;
  due: string | null;
  pointsEarned: number | null;
  pointsPossible: number | null;
  letter?: string | null;
  status: GradeStatus;
  notes?: string;
}

export interface GradesState {
  version: 2;
  courses: GradeCourse[];
  assignments: GradeAssignment[];
}
