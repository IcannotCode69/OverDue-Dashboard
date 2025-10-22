import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import Card from "../../components/ui/Card";
import { renderWidget, widgetDefaults, WIDGET_KINDS } from "./widgets/registry";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_KEY = "od:layout:v2";
const ITEMS_KEY = "od:items:v2";
const COLS = { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

// Generate default layouts for widget items
function generateDefaultLayouts(items) {
  console.log('Generating default layouts for items:', items);
  console.log('Widget defaults:', widgetDefaults);
  const layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
  let position = { x: 0, y: 0 };
  
  items.forEach((item) => {
    const kind = item.kind || 'default';
    const defaults = widgetDefaults[kind] || { lg: { w: 4, h: 4 } };
    
    Object.keys(BREAKPOINTS).forEach((breakpoint) => {
      const size = defaults[breakpoint] || defaults.lg || { w: 4, h: 4 };
      console.log(`Layout for ${breakpoint}:`, size);
      
      layouts[breakpoint].push({
        i: item.i,
        x: position.x,
        y: position.y,
        w: size.w,
        h: size.h
      });
    });
    
    // Update position for next item (simple left-to-right, top-to-bottom packing)
    position.x += (defaults.lg?.w || 4);
    if (position.x >= COLS.lg) {
      position.x = 0;
      position.y += (defaults.lg?.h || 4);
    }
  });
  
  return layouts;
}

export default function DashboardGrid() {
  const [items, setItems] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ITEMS_KEY) || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        // Validate saved items have valid widget kinds
        const validItems = saved.filter(item => 
          item && typeof item.i === "string" && 
          (item.kind && WIDGET_KINDS.includes(item.kind))
        );
        if (validItems.length > 0) {
          return validItems;
        }
      }
      
      // Initialize with default calendar widget only (flip clock hidden for now)
      const itemB = { i: `calendarCard-${Date.now()}-b`, kind: 'calendarCard' };
      return [itemB];
    } catch { 
      localStorage.removeItem(LAYOUT_KEY);
      localStorage.removeItem(ITEMS_KEY);
      
      // Initialize with calendar widget on error
      const itemB = { i: `calendarCard-${Date.now()}-b`, kind: 'calendarCard' };
      return [itemB]; 
    }
  });

  const [layouts, setLayouts] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
      if (saved && Object.keys(saved).length > 0) {
        return saved;
      }
    } catch { /* ignore */ }
    
    // Generate default layouts for current items
    return generateDefaultLayouts(items);
  });

  const onLayoutsChange = (l) => {
    setLayouts(l);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(l));
  };

  const removeItem = (id) => {
    const nextItems = items.filter((i) => i.i !== id);
    setItems(nextItems);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(nextItems));
    const nextLayouts = Object.fromEntries(
      Object.entries(layouts).map(([bp, arr]) => [bp, (arr || []).filter(it => it.i !== id)])
    );
    onLayoutsChange(nextLayouts);
  };

  // Enable CSS animation for grid items
  React.useEffect(() => {
    const styleId = "grid-anim-style";
    if (!document.getElementById(styleId)) {
      const tag = document.createElement("style");
      tag.id = styleId;
      tag.textContent = ".react-grid-item{transition:transform 220ms ease,height 220ms ease,width 220ms ease;}";
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", height: "100%", padding: "var(--space-5)" }}>

      <div 
        style={{ 
          position: 'relative',
          borderRadius: "var(--r-2xl)", 
          padding: "var(--space-5)", 
          background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", 
          border: "1px solid var(--stroke-outer)",
          backdropFilter: "blur(var(--blur))",
          minHeight: 420,
          flex: 1,
        }}
      >
        <div className="mesh-overlay" style={{ borderRadius: 'inherit' }} />
        {items.length === 0 && (
          <div style={{ 
            color: "var(--ink-2)", 
            textAlign: "center", 
            padding: "var(--space-6)",
            fontSize: "var(--h3)",
            fontFamily: "var(--font-sans)",
            position: "relative",
            zIndex: 1
          }}>
            <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>📊</div>
            <div style={{ fontWeight: 500 }}>Dashboard is empty</div>
            <div style={{ fontSize: "var(--body)", marginTop: "var(--space-2)", color: "var(--muted)" }}>
              We'll add a curated set of default widgets next.
            </div>
          </div>
        )}
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
          draggableHandle=".react-grid-dragHandle"
        >
          {items.map((item) => {
            const widgetContent = renderWidget(item.kind, item.i, () => removeItem(item.i));
            
            return (
              <div key={item.i} style={{ height: '100%' }}>
                {widgetContent || (
                  <Card
                    header={
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div 
                          className="react-grid-dragHandle" 
                          style={{ 
                            cursor: 'grab', 
                            opacity: 0.7,
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            fontSize: "var(--body)",
                            fontWeight: 500,
                            color: "var(--ink-1)"
                          }}
                        >
                          <span style={{ display: 'inline-block', width: 18 }}>
                            <span style={{ display: 'block', height: 2, background: 'var(--muted)', margin: '3px 0', borderRadius: 2 }} />
                            <span style={{ display: 'block', height: 2, background: 'var(--muted)', margin: '3px 0', borderRadius: 2 }} />
                            <span style={{ display: 'block', height: 2, background: 'var(--muted)', margin: '3px 0', borderRadius: 2 }} />
                          </span>
                          Unknown widget: {item.kind}
                        </div>
                        <button 
                          onClick={() => removeItem(item.i)} 
                          style={{ 
                            background: "transparent", 
                            border: "none", 
                            color: "var(--ink-2)", 
                            cursor: "pointer",
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: "var(--r-sm)",
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255,93,122,0.12)";
                            e.currentTarget.style.color = "var(--acc-red)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--ink-2)";
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    }
                  >
                    <div style={{ 
                      padding: "var(--space-3) 0", 
                      color: "var(--ink-2)",
                      fontSize: "var(--body)",
                      fontFamily: "var(--font-sans)"
                    }}>
                      Widget kind '{item.kind}' not found
                    </div>
                  </Card>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
