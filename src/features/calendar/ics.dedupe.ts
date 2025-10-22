import type { CalendarEvent } from '../../pages/Calendar';

type Enriched = CalendarEvent & { __icsUid?: string; __lastModified?: Date };

function normTitle(t: string) { return t.trim().replace(/\s+/g, ' ').toLowerCase(); }

export function dedupeByUidThenTitleStart(existing: Enriched[], imported: Enriched[]): Enriched[] {
  const map = new Map<string, Enriched>();

  const keyOf = (e: Enriched) => e.__icsUid ? `UID:${e.__icsUid}` : `TS:${normTitle(e.title)}|${e.start.getTime()}`;

  // seed with existing (existing wins by default when equal)
  for (const e of existing) {
    map.set(keyOf(e), e);
  }

  // merge imported — prefer newer lastModified if available
  for (const e of imported) {
    const k = keyOf(e);
    const cur = map.get(k);
    if (!cur) { map.set(k, e); continue; }
    const a = (cur.__lastModified?.getTime?.() ?? 0);
    const b = (e.__lastModified?.getTime?.() ?? 0);
    if (b > a) map.set(k, e);
  }

  return Array.from(map.values());
}

