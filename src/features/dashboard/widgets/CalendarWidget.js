import React from "react";
import { listTasks } from "../../data/local";

function startOfMonth(date) {
  const d = new Date(date); d.setDate(1); d.setHours(0,0,0,0); return d;
}
function daysInMonth(date) {
  const d = new Date(date); return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
}

export default function CalendarWidget() {
  const [cursor, setCursor] = React.useState(() => new Date());
  const tasks = listTasks();

  const first = startOfMonth(cursor);
  const dim = daysInMonth(cursor);
  const offset = first.getDay(); // 0-6

  const byDate = new Map();
  tasks.forEach(t => {
    const d = new Date(t.due); d.setHours(0,0,0,0);
    const key = d.toDateString();
    byDate.set(key, (byDate.get(key) || 0) + 1);
  });

  const grid = [];
  for (let i = 0; i < offset; i++) grid.push(null);
  for (let day = 1; day <= dim; day++) grid.push(day);

  const focusRing = { outline: "none", boxShadow: "0 0 0 2px rgba(59,130,246,0.6)" };

  const onPick = (day) => {
    const d = new Date(cursor); d.setDate(day); d.setHours(0,0,0,0);
    window.dispatchEvent(new CustomEvent("od:filterDate", { detail: { date: d } }));
  };

  return (
    <div className="nice-scroll" style={{ overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <button aria-label="Prev month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>&lt;</button>
        <div style={{ color: "#fff", fontWeight: 600 }}>
          {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>&gt;</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: 'center' }}>{d}</div>
        ))}
        {grid.map((day, i) => {
          if (day === null) return <div key={i} />;
          const d = new Date(cursor); d.setDate(day); d.setHours(0,0,0,0);
          const key = d.toDateString();
          const count = byDate.get(key) || 0;
          return (
            <button
              key={i}
              onClick={() => onPick(day)}
              aria-label={`Pick ${d.toDateString()}`}
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusRing.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              style={{
                height: 36,
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                position: 'relative',
              }}
            >
              <span style={{ position: 'absolute', top: 4, left: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{day}</span>
              {count > 0 && (
                <span style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 10, background: 'rgba(59,130,246,0.25)', color: '#93c5fd', borderRadius: 999, padding: '2px 6px' }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
