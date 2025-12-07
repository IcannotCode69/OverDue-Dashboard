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
  if (existing && existing.length > 0) {
    return; // Already has data
  }
  // Start brand new users with no classes
  setNotes([]);
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
