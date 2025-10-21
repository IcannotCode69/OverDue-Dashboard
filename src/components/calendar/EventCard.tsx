import React from "react";
import { format } from "date-fns";

export default function EventCard({
  title,
  start,
  end,
  color,
}: {
  title: string;
  start: Date;
  end: Date;
  color: string;
}) {
  return (
    <div
  className="cal-event"
  style={{
    background: `linear-gradient(180deg, ${color}33 0%, rgba(255,255,255,0.06) 100%)`,
    borderColor: `${color}88`,
    width: "92%",          // <<< keep chip inside the cell
    margin: "6px auto",    // <<< centered, vertical spacing
    boxSizing: "border-box",
  }}
>


      <div className="cal-event-title">{title}</div>
      <div className="cal-event-time">
        {format(start, "HH:mm")} – {format(end, "HH:mm")}
      </div>
      <div className="cal-event-peers">
        <span className="cal-badge" />
        <span className="cal-badge" />
        <span className="cal-badge" />
      </div>
    </div>
  );
}
