import React from "react";
import CalendarPageFeature from "../features/calendar/CalendarPage";

export default function CalendarPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '16px', color: 'white' }}>Calendar</h1>
      <CalendarPageFeature />
    </div>
  );
}
