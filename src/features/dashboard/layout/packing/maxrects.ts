export type WidgetIn = { id: string; w: number; h: number };
export type Placed = WidgetIn & { x: number; y: number };

export type Rect = { x: number; y: number; w: number; h: number };

const MAX_H = 100000; // effectively infinite column height

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function contains(a: Rect, b: Rect): boolean {
  return a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h;
}

function pruneFreeRectangles(free: Rect[]): Rect[] {
  // Remove contained rects and zero-area
  const out: Rect[] = [];
  for (let i = 0; i < free.length; i++) {
    const r = free[i];
    if (r.w <= 0 || r.h <= 0) continue;
    let contained = false;
    for (let j = 0; j < free.length; j++) {
      if (i === j) continue;
      if (contains(free[j], r)) { contained = true; break; }
    }
    if (!contained) out.push(r);
  }
  return out;
}

function splitFreeRectangles(free: Rect[], used: Rect): Rect[] {
  const next: Rect[] = [];
  for (const fr of free) {
    if (!intersects(fr, used)) { next.push(fr); continue; }
    // Split fr by used (guillotine into up to 4 rects)
    // Left
    if (used.x > fr.x) {
      next.push({ x: fr.x, y: fr.y, w: used.x - fr.x, h: fr.h });
    }
    // Right
    const frRight = fr.x + fr.w;
    const usedRight = used.x + used.w;
    if (usedRight < frRight) {
      next.push({ x: usedRight, y: fr.y, w: frRight - usedRight, h: fr.h });
    }
    // Top
    if (used.y > fr.y) {
      next.push({ x: fr.x, y: fr.y, w: fr.w, h: used.y - fr.y });
    }
    // Bottom
    const frBottom = fr.y + fr.h;
    const usedBottom = used.y + used.h;
    if (usedBottom < frBottom) {
      next.push({ x: fr.x, y: usedBottom, w: fr.w, h: frBottom - usedBottom });
    }
  }
  return pruneFreeRectangles(next);
}

function collidesAny(r: Rect, blocks: Rect[]): boolean {
  for (const b of blocks) if (intersects(r, b)) return true;
  return false;
}

function placeOneBSSF(free: Rect[], w: number, h: number): { placed?: Rect; freeOut: Rect[] } {
  let best: { rect: Rect; short: number; long: number } | null = null;
  for (const fr of free) {
    if (w <= fr.w && h <= fr.h) {
      const short = Math.min(fr.w - w, fr.h - h);
      const longV = Math.max(fr.w - w, fr.h - h);
      const candidate: Rect = { x: fr.x, y: fr.y, w, h };
      if (!best) best = { rect: candidate, short, long: longV };
      else {
        const b = best;
        if (
          short < b.short ||
          (short === b.short && (candidate.y < b.rect.y ||
            (candidate.y === b.rect.y && (candidate.x < b.rect.x ||
              (candidate.x === b.rect.x && longV < b.long)))))
        ) {
          best = { rect: candidate, short, long: longV };
        }
      }
    }
  }
  if (!best) return { freeOut: free };
  const freeOut = splitFreeRectangles(free, best.rect);
  return { placed: best.rect, freeOut };
}

export function placeWidgetsMaxRects(
  widgets: WidgetIn[],
  gridCols: number,
  locked: Placed[] = []
): Placed[] {
  // Initialize free space
  let free: Rect[] = [{ x: 0, y: 0, w: gridCols, h: MAX_H }];
  const placed: Placed[] = [];
  const occupied: Rect[] = [];

  // Carve out locked items first (respect bounds)
  const lockedRects: Rect[] = [];
  for (const lk of locked) {
    const rect: Rect = { x: Math.max(0, lk.x), y: Math.max(0, lk.y), w: Math.min(lk.w, gridCols), h: lk.h };
    lockedRects.push(rect);
    free = splitFreeRectangles(free, rect);
    occupied.push(rect);
  }

  // Sort widgets by area desc, then h desc, then w desc, then id asc for determinism
  const order = [...widgets].sort((a, b) => {
    const area = (b.w * b.h) - (a.w * a.h);
    if (area !== 0) return area;
    if (b.h !== a.h) return b.h - a.h;
    if (b.w !== a.w) return b.w - a.w;
    return a.id.localeCompare(b.id);
  });

  for (const w of order) {
    // Clamp oversize widths
    const ww = Math.min(w.w, gridCols);
    const hh = w.h;

    // Try to place using BSSF within free rects
    let { placed: p, freeOut } = placeOneBSSF(free, ww, hh);

    // If no fit found (shouldn't happen with MAX_H), extend by creating a new rect below the lowest point
    if (!p) {
      // find lowest y among occupied columns at x=0..cols-1 by scanning free rects minimal y
      // Simpler: place at the minimal y among free rects' y + h (bottom). We'll compute current max height of occupied
      const currentMaxY = occupied.length ? Math.max(...occupied.map(r => r.y + r.h)) : 0;
      p = { x: 0, y: currentMaxY, w: ww, h: hh };
      freeOut = splitFreeRectangles(free, p);
    }
    free = freeOut;
    occupied.push(p);
    placed.push({ id: w.id, w: ww, h: hh, x: p.x, y: p.y });
  }

  // Compaction pass: slide up, then left, respecting locked and others
  const allBlocks: Rect[] = [...lockedRects];
  const byYX = [...placed].sort((a, b) => (a.y - b.y) || (a.x - b.x) || a.id.localeCompare(b.id));
  const map = new Map<string, Placed>(placed.map(p => [p.id, { ...p }]));

  for (const item of byYX) {
    let cur = map.get(item.id)!;
    // Slide up
    while (cur.y > 0) {
      const test: Rect = { x: cur.x, y: cur.y - 1, w: cur.w, h: cur.h };
      const others: Rect[] = allBlocks.concat(
        [...map.values()].filter(v => v.id !== cur.id).map(v => ({ x: v.x, y: v.y, w: v.w, h: v.h }))
      );
      if (collidesAny(test, others)) break;
      cur = { ...cur, y: cur.y - 1 };
      map.set(cur.id, cur);
    }
    // Slide left
    while (cur.x > 0) {
      const test: Rect = { x: cur.x - 1, y: cur.y, w: cur.w, h: cur.h };
      const others: Rect[] = allBlocks.concat(
        [...map.values()].filter(v => v.id !== cur.id).map(v => ({ x: v.x, y: v.y, w: v.w, h: v.h }))
      );
      if (collidesAny(test, others)) break;
      cur = { ...cur, x: cur.x - 1 };
      map.set(cur.id, cur);
    }
    allBlocks.push({ x: cur.x, y: cur.y, w: cur.w, h: cur.h });
  }

  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}
