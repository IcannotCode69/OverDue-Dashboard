export type Size = { w: number; h: number };
export type WidgetKind =
  | "calendarWeek"
  | "tasks"
  | "aiQueue"
  | "quickNote"
  | "gpa"
  | "custom";

type Ctx = { cols: number; data?: any };

export const widgetSizing = {
  calendarWeek: {
    min: (ctx: Ctx): Size => ({ w: Math.min(ctx.cols, 8), h: 6 }),
    preferred: (ctx: Ctx): Size => ({ w: Math.min(ctx.cols, 10), h: 6 }),
  },
  tasks: {
    min: (_: Ctx): Size => ({ w: 6, h: 3 }),
    preferred: (_: Ctx, count = 6): Size => ({ w: 8, h: Math.min(8, Math.max(3, Math.ceil((count * 2) / 3))) }),
  },
  aiQueue: {
    min: (_: Ctx): Size => ({ w: 5, h: 3 }),
    preferred: (_: Ctx, count = 2): Size => ({ w: 6, h: Math.max(3, count + 2) }),
  },
  quickNote: {
    min: (_: Ctx): Size => ({ w: 5, h: 3 }),
    preferred: (_: Ctx): Size => ({ w: 6, h: 4 }),
  },
  gpa: {
    min: (_: Ctx): Size => ({ w: 4, h: 2 }),
    preferred: (_: Ctx): Size => ({ w: 5, h: 2 }),
  },
  custom: {
    min: (_: Ctx): Size => ({ w: 4, h: 3 }),
    preferred: (_: Ctx): Size => ({ w: 6, h: 4 }),
  },
} as const;

export function getDefaultSize(kind: WidgetKind, ctx: Ctx): Size {
  const entry: any = (widgetSizing as any)[kind] ?? widgetSizing.custom;
  return entry.preferred(ctx);
}
export function clampToMin(kind: WidgetKind, size: Size, ctx: Ctx): Size {
  const m: any = ((widgetSizing as any)[kind] ?? widgetSizing.custom).min(ctx);
  return { w: Math.max(size.w, m.w), h: Math.max(size.h, m.h) };
}
