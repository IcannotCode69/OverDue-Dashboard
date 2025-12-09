import React from "react";

export default function WidgetFrame({
  title,
  onRemove,
  children,
  className,
  rightActions = null,
}) {
  const classes = ["widget-frame", "app-card", "app-card--flush"];
  if (className) {
    classes.push(className);
  }

  return (
    <div className={classes.join(" ")} style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          minHeight: 40,
        }}
      >
        {/* drag handle + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="react-grid-dragHandle"
            title="Drag to move"
            aria-hidden
            style={{
              cursor: "move",
              userSelect: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 16,
              lineHeight: 1,
              marginRight: 4,
            }}
          >
            ≡
          </span>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>

        {/* header actions + close */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {rightActions}
          {onRemove && (
            <button
              onClick={onRemove}
              aria-label={`Remove ${title} widget`}
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                lineHeight: 1,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.9)";
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div
        className="nice-scroll"
        style={{ padding: 12, height: "calc(100% - 40px)", overflow: "auto" }}
      >
        {children}
      </div>
    </div>
  );
}
