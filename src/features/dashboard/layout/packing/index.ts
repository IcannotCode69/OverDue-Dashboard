export { placeWidgetsMaxRects as autoArrangeCore } from "./maxrects";
import type { WidgetIn, Placed } from "./maxrects";

export function autoArrange(widgets: WidgetIn[], gridCols: number, locked?: Placed[]) {
  return autoArrangeCore(widgets, gridCols, locked);
}
