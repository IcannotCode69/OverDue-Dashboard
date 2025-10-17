import { autoArrange } from "./packing";

// Given a layouts object like RGL uses: { bp: [{i,x,y,w,h,...}], ... }
// returns a new layouts with x,y replaced by tight top-left packing per breakpoint.
export function autoArrangeLayouts(layouts: any, colsMap: Record<string, number>, lockedIds: Set<string> = new Set()) {
  const next: any = { ...layouts };
  Object.keys(colsMap).forEach((bp) => {
    const arr = Array.isArray(layouts[bp]) ? layouts[bp] : [];
    const widgets = arr.map((it: any) => ({ id: it.i, w: it.w, h: it.h }));
    const locked: any[] = arr
      .filter((it: any) => lockedIds.has(it.i))
      .map((it: any) => ({ id: it.i, x: it.x || 0, y: it.y || 0, w: it.w, h: it.h }));
    const placed = autoArrange(widgets, colsMap[bp], locked);
    const map = new Map(placed.map((p: any) => [p.id, p]));
    next[bp] = arr.map((it: any) => {
      const p = map.get(it.i);
      return p ? { ...it, x: p.x, y: p.y } : it;
    });
  });
  return next;
}
