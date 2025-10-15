import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { renderWidget, widgetDefaults, WIDGET_KINDS } from "./widgets/registry";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_KEY = "od:layout:v1";
const ITEMS_KEY = "od:items:v1";

// Allowed snapped sizes
const ALLOWED_W = [3, 4, 6, 12];
const ALLOWED_H = [3, 4, 5, 6, 8];
const nearest = (list, v) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), list[0]);
const snapSize = (w, h) => ({ w: nearest(ALLOWED_W, w), h: nearest(ALLOWED_H, h) });

// Simple skyline packer to reduce gaps (lg breakpoint)
function packTight(items, cols = 12) {
  const skyline = new Array(cols).fill(0);
  const out = [];
  const sorted = [...items].sort((a, b) => b.h - a.h || b.w - a.w || a.i.localeCompare(b.i));
  const spanMax = (start, width) => {
    let m = 0;
    for (let c = start; c < start + width; c++) m = Math.max(m, skyline[c] ?? Infinity);
    return m;
  };
  for (const it of sorted) {
    let bestX = 0,
      bestY = Infinity;
    for (let x = 0; x <= cols - it.w; x++) {
      const y = spanMax(x, it.w);
      if (y < bestY) {
        bestY = y;
        bestX = x;
      }
    }
    const placed = { ...it, x: bestX, y: bestY };
    for (let c = bestX; c < bestX + it.w; c++) skyline[c] = bestY + it.h;
    out.push(placed);
  }
  const map = new Map(out.map((l) => [l.i, l]));
  return items.map((i) => ({ ...i, x: map.get(i.i).x, y: map.get(i.i).y }));
}

const COLS = { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const ALL_BPS = Object.keys(COLS);

function parseKind(id) {
  if (id === "quick" || id === "upcoming" || id === "scratch") return id;
  const idx = id.indexOf("-");
  return idx > 0 ? id.slice(0, idx) : "quick";
}

function makeDefaultLayout(id, bp) {
  const kind = parseKind(id);
  const def = widgetDefaults[kind] || { w: 4, h: 4 };
  return {
    i: id,
    x: 0,
    y: Infinity,
    w: Math.min(def.w, COLS[bp]),
    h: def.h,
    minW: 3,
    minH: 3,
  };
}

function normalizeLayouts(input) {
  const l = input || {};
  const out = {};
  const ids = new Set();

  // Copy known arrays and collect ids
  ALL_BPS.forEach((bp) => {
    const arr = Array.isArray(l[bp]) ? l[bp] : [];
    out[bp] = arr.map((lay) => {
      ids.add(lay.i);
      const def = widgetDefaults[parseKind(lay.i)] || { w: 4, h: 4 };
      const minW = lay.minW ?? 3;
      const minH = lay.minH ?? 3;
      const wVal = lay.w ?? def.w;
      const hVal = lay.h ?? def.h;
      return {
        i: lay.i,
        x: lay.x ?? 0,
        y: lay.y ?? Infinity,
        w: Math.max(minW, Math.min(wVal, COLS[bp])),
        h: Math.max(minH, hVal),
        minW,
        minH,
      };
    });
  });

  // Seed with defaults if nothing present
  if ([...ids].length === 0) {
    defaultItems().forEach((it) => ids.add(it.i));
  }

  // Ensure each breakpoint has entries for all ids
  ALL_BPS.forEach((bp) => {
    const arr = out[bp] ?? (out[bp] = []);
    ids.forEach((id) => {
      if (!arr.some((lay) => lay.i === id)) arr.push(makeDefaultLayout(id, bp));
    });
  });

  return out;
}

function defaultItems() {
  return [
    { i: "quick", kind: "quick" },
    { i: "upcoming", kind: "upcoming" },
    { i: "scratch", kind: "scratch" },
  ];
}

function defaultLayouts() {
  const base = [
    { i: "quick", kind: "quick" },
    { i: "upcoming", kind: "upcoming" },
    { i: "scratch", kind: "scratch" },
  ];
  const result = {};
  ALL_BPS.forEach((bp) => {
    result[bp] = base.map(({ i, kind }, idx) => {
      const def = widgetDefaults[kind];
      const w = Math.min((def.sizes?.[bp] ?? def.w), COLS[bp]);
      const h = def.h;
      return { i, x: (idx * w) % COLS[bp], y: 0, w, h, minW: 3, minH: 3 };
    });
  });
  return result;
}

export default function DashboardGrid() {
  const [layouts, setLayouts] = React.useState(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    const base = saved ? JSON.parse(saved) : defaultLayouts();
    return normalizeLayouts(base);
  });

  const [items, setItems] = React.useState(() => {
    const savedItems = localStorage.getItem(ITEMS_KEY);
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.every((p) => p && typeof p.i === "string" && typeof parseKind(p.i) === "string")) {
          return parsed.map((p) => ({ i: p.i, kind: p.kind || parseKind(p.i) }));
        }
      } catch {}
    }
    // Derive from saved layouts if present
    try {
      const savedLayouts = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
      if (savedLayouts) {
        const ids = new Set();
        ALL_BPS.forEach((bp) => (Array.isArray(savedLayouts[bp]) ? savedLayouts[bp] : []).forEach((l) => ids.add(l.i)));
        const list = [...ids].map((id) => ({ i: id, kind: parseKind(id) }));
        if (list.length) return list;
      }
    } catch {}
    return defaultItems();
  });

  const onLayoutsChange = (l) => {
    const normalized = normalizeLayouts(l);
    setLayouts(normalized);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(normalized));
  };

  // One-time migration: snap any persisted sizes to the allowed set
  const migratedRef = React.useRef(false);
  React.useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    const next = { ...layouts };
    let changed = false;
    Object.keys(next).forEach((bp) => {
      const arr = Array.isArray(next[bp]) ? next[bp] : [];
      next[bp] = arr.map((it) => {
        const s = snapSize(it.w, it.h);
        if (s.w !== it.w || s.h !== it.h) changed = true;
        return { ...it, w: s.w, h: s.h };
      });
    });
    if (changed) onLayoutsChange(next);
  }, []);

  const removeItem = (id) => {
    const nextItems = items.filter((i) => i.i !== id);
    setItems(nextItems);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(nextItems));

    const next = { ...layouts };
    Object.keys(next).forEach((bp) => {
      next[bp] = next[bp]?.filter((lay) => lay.i !== id) ?? [];
    });
    onLayoutsChange(next);
  };

  const addWidget = (kind) => {
    const id = `${kind}-${crypto.randomUUID().slice(0, 6)}`;
    const def = widgetDefaults[kind];

    // Clone layouts deeply enough for arrays per breakpoint
    const next = Object.fromEntries(
      Object.entries(layouts).map(([bp, arr]) => [bp, Array.isArray(arr) ? [...arr] : []])
    );

    // Placement: fill rows left-to-right using current visible items; start at top
    const computePlacement = (arr, bp, w) => {
      const perRow = Math.max(1, Math.floor(COLS[bp] / w));
      // consider only items that are actually rendered
      const visibleIds = new Set(items.map((it) => it.i));
      const visibleCount = (arr || []).filter((l) => visibleIds.has(l.i)).length;
      const x = (visibleCount % perRow) * w;
      const y = 0; // let RGL resolve collisions; vertical compaction will settle nicely
      return { x, y };
    };

    // Ensure the item exists in all breakpoints with reasonable defaults
    Object.keys(COLS).forEach((bp) => {
      const arr = next[bp] ?? (next[bp] = []);
      if (!arr.some((l) => l.i === id)) {
        const w0 = Math.min((def.sizes?.[bp] ?? def.w), COLS[bp]);
        const s = snapSize(w0, def.h);
        arr.push({ i: id, x: 0, y: Infinity, w: s.w, h: s.h, minW: 3, minH: 3 });
      }
    });

    // Apply layouts first to avoid a render where RGL guesses 1x1
    setLayouts(next);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));

    // Then add the item to the render list and persist items
    const nextItems = [...items, { i: id, kind }];
    setItems(nextItems);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(nextItems));
  };

  const buttonStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.9)",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  };

  const [newKind, setNewKind] = React.useState(WIDGET_KINDS[0]);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Add widget:</span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setMenuOpen(true); setHighlight((i)=> Math.min(i+1, WIDGET_KINDS.length-1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setMenuOpen(true); setHighlight((i)=> Math.max(i-1, 0)); }
              if (e.key === 'Enter' && menuOpen) { setNewKind(WIDGET_KINDS[highlight]); setMenuOpen(false); }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer'
            }}
          >
            <span style={{ letterSpacing: 0.2 }}>{newKind}</span>
            <span aria-hidden style={{ opacity: 0.7 }}>▾</span>
          </button>
          {menuOpen && (
            <div role="listbox" aria-label="Widget types" className="nice-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20, minWidth: 160, maxHeight: 220, overflow: 'auto', background: 'rgba(2,6,23,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 6, boxShadow: '0 10px 20px rgba(0,0,0,0.35)' }}>
              {WIDGET_KINDS.map((k, idx) => (
                <div
                  key={k}
                  role="option"
                  aria-selected={k === newKind}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => { setNewKind(k); setMenuOpen(false); }}
                  style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: idx === highlight ? 'rgba(59,130,246,0.2)' : 'transparent',
                    color: '#fff', cursor: 'pointer'
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          aria-label="Add selected widget"
          style={buttonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
          onClick={() => addWidget(newKind)}
        >
          Add
        </button>
        <button
          aria-label="Auto-Arrange layout"
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/15"
          style={buttonStyle}
          onClick={() => {
            const lg = (layouts.lg ?? []);
            const snapped = lg.map((it) => ({ ...it, ...snapSize(it.w, it.h) }));
            const packed = packTight(snapped);
            const next = { ...layouts, lg: packed };
            onLayoutsChange(next);
            // toast substitute
            // eslint-disable-next-line no-console
            console.info("Auto-Arrange applied", next.lg);
          }}
        >
          Auto-Arrange
        </button>
      </div>

      <div
        className="grid-bg"
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 12,
          backgroundColor: "rgba(15,23,42,0.6)", // slate-900/60
          flex: 1,
          minHeight: 0,
        }}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          cols={COLS}
          breakpoints={BREAKPOINTS}
          rowHeight={36}
          margin={[12, 12]}
          compactType="vertical"
          preventCollision={false}
          onLayoutsChange={onLayoutsChange}
          onResizeStop={(_l, _old, item) => {
            const s = snapSize(item.w, item.h);
            item.w = s.w;
            item.h = s.h;
            onLayoutsChange(layouts);
          }}
          draggableHandle=".react-grid-dragHandle"
        >
          {items.map(({ i, kind }) => (
            <div key={i}>{renderWidget(kind, i, () => removeItem(i))}</div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
