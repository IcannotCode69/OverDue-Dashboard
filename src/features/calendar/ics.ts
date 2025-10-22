// Lightweight .ics parser tailored for Brightspace exports.
// Pure functions, no DOM usage.

export type IcsEvent = {
  uid?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  lastModified?: Date;
};

// Unfold folded lines per RFC 5545 (continuations start with space or tab)
export function unfoldLines(text: string): string {
  return text.replace(/\r?\n[ \t]/g, "");
}

function unescapeValue(v: string): string {
  return v
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";");
}

function decodeEntities(v: string): string {
  return v
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function parseIcsDate(raw: string): Date | null {
  // UTC: YYYYMMDDTHHMMSSZ
  if (/^\d{8}T\d{6}Z$/.test(raw)) {
    const iso = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(9,11)}:${raw.slice(11,13)}:${raw.slice(13,15)}Z`;
    return new Date(iso);
  }
  // Local date-time: YYYYMMDDTHHMMSS (treat as local)
  if (/^\d{8}T\d{6}$/.test(raw)) {
    const iso = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(9,11)}:${raw.slice(11,13)}:${raw.slice(13,15)}`;
    return new Date(iso);
  }
  // All-day: YYYYMMDD (local midnight)
  if (/^\d{8}$/.test(raw)) {
    const iso = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T00:00:00`;
    return new Date(iso);
  }
  return null;
}

export function parseICS(icsText: string): IcsEvent[] {
  const text = unfoldLines(icsText);
  const lines = text.split(/\r?\n/);
  const events: IcsEvent[] = [];

  let inEvent = false;
  let cur: Partial<IcsEvent & { _rawEnd?: string; _rawStart?: string }> = {};

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) { inEvent = true; cur = {}; continue; }
    if (line.startsWith("END:VEVENT")) {
      if (inEvent) {
        // finalize
        if (cur._rawStart) cur.start = parseIcsDate(cur._rawStart) || undefined as any;
        if (cur._rawEnd) cur.end = parseIcsDate(cur._rawEnd) || undefined as any;
        if (!cur.end && cur.start) {
          cur.end = new Date(cur.start.getTime() + 60 * 60 * 1000);
        }
        if (cur.title && cur.start && cur.end) {
          events.push({
            uid: cur.uid,
            title: cur.title,
            start: cur.start,
            end: cur.end,
            location: cur.location,
            description: cur.description,
            lastModified: cur.lastModified,
          });
        }
      }
      inEvent = false; cur = {};
      continue;
    }
    if (!inEvent) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const prop = line.slice(0, idx).toUpperCase();
    const valueRaw = line.slice(idx + 1);
    const value = decodeEntities(unescapeValue(valueRaw.trim()));

    const base = prop.split(";")[0];
    switch (base) {
      case "SUMMARY":
        cur.title = value;
        break;
      case "DTSTART":
        cur._rawStart = value;
        break;
      case "DTEND":
        cur._rawEnd = value;
        break;
      case "LOCATION":
        cur.location = value;
        break;
      case "DESCRIPTION":
        cur.description = value;
        break;
      case "UID":
        cur.uid = value;
        break;
      case "LAST-MODIFIED":
        cur.lastModified = parseIcsDate(value) || undefined as any;
        break;
      default:
        break;
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// Export helpers for optional testing
export const __ics_test = { parseIcsDate, unescapeValue, decodeEntities };

