export interface CalendarEventLike {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  categoryId?: string;
  location?: string;
  description?: string;
  [key: string]: any;
}

export interface UpcomingOptions {
  now?: Date;
  maxCount?: number;
  daysAhead?: number;
}

export function getUpcomingEvents<T extends CalendarEventLike>(
  events: T[],
  options: UpcomingOptions = {}
): T[] {
  const now = options.now ?? new Date();
  const daysAhead = options.daysAhead ?? 14;
  const maxCount = options.maxCount ?? 5;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfRange = new Date(startOfToday);
  endOfRange.setDate(startOfToday.getDate() + daysAhead);

  return events
    .filter((event) => {
      const start = new Date(event.start);
      return start >= startOfToday && start <= endOfRange;
    })
    .sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )
    .slice(0, maxCount);
}
