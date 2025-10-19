import { Class, Chapter, Note } from './types';

const KEY = "od:notes:v2";

const GRADIENT_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600"
];

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get classes from localStorage
export function getNotes(): Class[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error reading notes from localStorage:', error);
    return [];
  }
}

// Save classes to localStorage
export function setNotes(classes: Class[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

// Create demo data if storage is empty
export function seedIfEmpty(): void {
  const existing = getNotes();
  if (existing.length > 0) {
    return; // Already has data
  }

  const mathClass: Class = {
    id: generateId(),
    name: "Mathematics",
    color: GRADIENT_COLORS[0], // blue
    chapters: [
      {
        id: generateId(),
        name: "Calculus I",
        note: {
          id: generateId(),
          content: "# Calculus I Notes\n\n## Limits\n- Definition of a limit\n- Properties of limits\n- Continuity\n\n## Derivatives\n- Power rule\n- Product rule\n- Chain rule\n\n## Applications\n- Related rates\n- Optimization problems",
          updatedAt: new Date().toISOString()
        }
      },
      {
        id: generateId(),
        name: "Linear Algebra",
        note: {
          id: generateId(),
          content: "# Linear Algebra Notes\n\n## Vectors\n- Vector operations\n- Dot product\n- Cross product\n\n## Matrices\n- Matrix operations\n- Determinants\n- Eigenvalues and eigenvectors",
          updatedAt: new Date().toISOString()
        }
      }
    ]
  };

  const physicsClass: Class = {
    id: generateId(),
    name: "Physics",
    color: GRADIENT_COLORS[2], // pink
    chapters: [
      {
        id: generateId(),
        name: "Mechanics",
        note: {
          id: generateId(),
          content: "# Mechanics Notes\n\n## Kinematics\n- Position, velocity, acceleration\n- Motion in one dimension\n- Motion in two dimensions\n\n## Dynamics\n- Newton's laws of motion\n- Forces and free-body diagrams\n- Work and energy",
          updatedAt: new Date().toISOString()
        }
      }
    ]
  };

  setNotes([mathClass, physicsClass]);
}

// Helper to get a random gradient color
export function getRandomGradientColor(): string {
  return GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];
}

// Helper to create a new empty note
export function createEmptyNote(): Note {
  return {
    id: generateId(),
    content: "",
    updatedAt: new Date().toISOString()
  };
}

// Helper to create a new chapter
export function createChapter(name: string): Chapter {
  return {
    id: generateId(),
    name,
    note: createEmptyNote()
  };
}

// Helper to create a new class
export function createClass(name: string): Class {
  return {
    id: generateId(),
    name,
    color: getRandomGradientColor(),
    chapters: []
  };
}