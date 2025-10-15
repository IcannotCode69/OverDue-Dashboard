// Simple in-browser data layer backed by localStorage with seeding.
// Types (informal):
// Task: { id, title, due: ISO string, done: boolean }
// Note: { id, title, body, createdAt: ISO }
// GradeItem: { id, label, weight: number (0..1), score: number (0..100) }
// AiJob: { id, title, status: 'queued'|'running'|'done'|'error', createdAt: ISO }

const KEYS = {
  tasks: 'od:tasks',
  notes: 'od:notes',
  grades: 'od:grades',
  aijobs: 'od:aijobs',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(d) {
  return new Date(d).toISOString();
}

// Seed helpers
function seedAll() {
  const now = new Date();
  if (!localStorage.getItem(KEYS.tasks)) {
    const tasks = [
      { id: uuid(), title: 'Sample task (today)', due: iso(now), done: false },
      { id: uuid(), title: 'Sample task (in 3 days)', due: iso(addDays(now, 3)), done: false },
    ];
    write(KEYS.tasks, tasks);
  }
  if (!localStorage.getItem(KEYS.notes)) {
    write(KEYS.notes, [
      { id: uuid(), title: 'Welcome note', body: 'You can jot quick ideas here.', createdAt: iso(now) },
    ]);
  }
  if (!localStorage.getItem(KEYS.grades)) {
    write(KEYS.grades, [
      { id: uuid(), label: 'Assignment 1', weight: 0.3, score: 85 },
      { id: uuid(), label: 'Midterm', weight: 0.7, score: 90 },
    ]);
  }
  if (!localStorage.getItem(KEYS.aijobs)) {
    write(KEYS.aijobs, [
      { id: uuid(), title: 'Summarize chapter notes', status: 'done', createdAt: iso(addDays(now, -1)) },
      { id: uuid(), title: 'Draft study plan', status: 'queued', createdAt: iso(now) },
    ]);
  }
}

// Seed data if empty on first load
seedAll();

export function resetSampleData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  seedAll();
}

// Tasks
export function listTasks() { return read(KEYS.tasks); }
export function addTask({ title, due }) {
  const tasks = read(KEYS.tasks);
  const item = { id: uuid(), title, due: iso(due), done: false };
  tasks.push(item); write(KEYS.tasks, tasks); return item;
}
export function toggleTask(id, done) {
  const tasks = read(KEYS.tasks).map(t => t.id === id ? { ...t, done } : t);
  write(KEYS.tasks, tasks); return tasks.find(t => t.id === id);
}
export function updateTask(id, patch) {
  const tasks = read(KEYS.tasks).map(t => t.id === id ? { ...t, ...patch } : t);
  write(KEYS.tasks, tasks); return tasks.find(t => t.id === id);
}
export function removeTask(id) {
  const tasks = read(KEYS.tasks).filter(t => t.id !== id);
  write(KEYS.tasks, tasks);
}

// Notes
export function listNotes() { return read(KEYS.notes); }
export function addNote({ title, body }) {
  const notes = read(KEYS.notes);
  const n = { id: uuid(), title, body, createdAt: iso(new Date()) };
  notes.unshift(n); write(KEYS.notes, notes); return n;
}

// Grades
export function listGrades() { return read(KEYS.grades); }
export function upsertGrade(gi) {
  const grades = read(KEYS.grades);
  const idx = grades.findIndex(g => g.id === gi.id);
  if (idx >= 0) grades[idx] = gi; else grades.push(gi);
  write(KEYS.grades, grades); return gi;
}

// AI Jobs
export function listAiJobs() { return read(KEYS.aijobs); }
export function upsertAiJob(job) {
  const jobs = read(KEYS.aijobs);
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx >= 0) jobs[idx] = job; else jobs.unshift(job);
  write(KEYS.aijobs, jobs); return job;
}

// Helpers for date filtering
export function tasksDueWithin(days) {
  const now = new Date();
  const until = addDays(now, days);
  return listTasks().filter(t => new Date(t.due) <= until);
}

export function tasksOnDate(date) {
  const d0 = new Date(date); d0.setHours(0,0,0,0);
  const d1 = new Date(date); d1.setHours(23,59,59,999);
  return listTasks().filter(t => {
    const d = new Date(t.due); return d >= d0 && d <= d1;
  });
}
