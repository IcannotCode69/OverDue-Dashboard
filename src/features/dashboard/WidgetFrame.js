import React from "react";

export default function WidgetFrame({ title, onRemove, children }) {
  return (
    <div
      style={{
        height: "100%",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        backgroundColor: "rgba(30,41,59,0.8)", // slate-800/80
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        {/* drag handle */}
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
        <button
          onClick={onRemove}
          aria-label={`Remove ${title} widget`}
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.85)",
            border: "none",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
        >
          Remove
        </button>
      </div>
      <div className="nice-scroll" style={{ padding: 12, height: "calc(100% - 40px)", overflow: "auto" }}>{children}</div>
    </div>
  );
}
