export interface Note {
  id: string;
  content: string;
  updatedAt: string; // ISO string
}

export interface Chapter {
  id: string;
  name: string;
  note: Note;
}

export interface Class {
  id: string;
  name: string;
  color: string; // gradient color identifier
  chapters: Chapter[];
}