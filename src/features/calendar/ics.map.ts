export function guessCategoryId(title: string, location?: string, description?: string): string {
  const norm = (s?: string) => (s || '').toLowerCase().replace(/\s+-\s+(available|due).*$/i, '');
  const t = norm(title);
  const l = norm(location);
  const d = norm(description);
  const hay = `${t} ${l} ${d}`;

  if (/\b(quiz|midterm|exam)\b/i.test(hay)) return 'work';
  if (/\b(homework|assignment|lab)\b/i.test(hay)) return 'personal';
  return 'personal';
}

