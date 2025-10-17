import { describe, it, expect } from "vitest";
import { placeWidgetsMaxRects, Placed, WidgetIn } from "../maxrects";

function overlaps(a: Placed, b: Placed){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function anyOverlap(list: Placed[]): boolean {
  for(let i=0;i<list.length;i++){
    for(let j=i+1;j<list.length;j++){
      if (overlaps(list[i], list[j])) return true;
    }
  }
  return false;
}

describe("maxrects packer", () => {
  it("tightness: no immediate gap above/left", () => {
    const widgets: WidgetIn[] = [
      { id: "a", w: 4, h: 2 },
      { id: "b", w: 4, h: 2 },
      { id: "c", w: 3, h: 3 },
      { id: "d", w: 2, h: 2 },
      { id: "e", w: 2, h: 2 },
    ];
    const placed = placeWidgetsMaxRects(widgets, 12);
    // immediate move up/left should collide for all
    placed.forEach(p => {
      const up = { ...p, y: p.y - 1 } as Placed;
      const left = { ...p, x: p.x - 1 } as Placed;
      const others = placed.filter(q => q.id !== p.id);
      if (p.y > 0) expect(others.some(o => overlaps(up, o))).toBe(true);
      if (p.x > 0) expect(others.some(o => overlaps(left, o)) || left.x < 0).toBe(true);
    });
  });

  it("determinism: same input -> same output", () => {
    const widgets: WidgetIn[] = [
      { id: "a", w: 4, h: 2 },
      { id: "b", w: 4, h: 2 },
      { id: "c", w: 3, h: 3 },
      { id: "d", w: 2, h: 2 },
      { id: "e", w: 2, h: 2 },
    ];
    const p1 = placeWidgetsMaxRects(widgets, 12);
    const p2 = placeWidgetsMaxRects(widgets, 12);
    expect(p1).toEqual(p2);
  });

  it("locked support: respect pre-placed blocks", () => {
    const widgets: WidgetIn[] = [
      { id: "a", w: 4, h: 3 },
      { id: "b", w: 4, h: 2 },
    ];
    const locked: Placed[] = [{ id: "L", x: 0, y: 0, w: 6, h: 2 } as any];
    const placed = placeWidgetsMaxRects(widgets, 12, locked);
    // Ensure none overlaps with locked
    placed.forEach(p => {
      const l = locked[0];
      expect(!(p.x < l.x + l.w && p.x + p.w > l.x && p.y < l.y + l.h && p.y + p.h > l.y)).toBe(true);
    });
  });

  it("bounds & no overlaps", () => {
    const widgets: WidgetIn[] = Array.from({ length: 30 }).map((_, i) => ({ id: `w${i}`, w: 1 + (i % 4), h: 1 + ((i*7) % 4) }));
    const COLS = 12;
    const placed = placeWidgetsMaxRects(widgets, COLS);
    expect(anyOverlap(placed)).toBe(false);
    placed.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(COLS);
    });
  });
});
