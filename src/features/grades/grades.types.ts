export type GradeStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';

export type GradeItem = {
  id: string;
  course: string;
  assignment: string;
  due: string; // ISO date string
  pointsEarned: number | null; // null until graded
  pointsPossible: number;
  status: GradeStatus;
  notes?: string;
};

