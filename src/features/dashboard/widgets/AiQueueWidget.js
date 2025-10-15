import React from "react";
import { listAiJobs } from "../../data/local";

function Chip({ status }) {
  const palette = {
    queued: { bg: 'rgba(59,130,246,0.15)', fg: '#93c5fd' },
    running: { bg: 'rgba(234,179,8,0.15)', fg: '#fde047' },
    done: { bg: 'rgba(34,197,94,0.15)', fg: '#86efac' },
    error: { bg: 'rgba(239,68,68,0.15)', fg: '#fca5a5' },
  }[status] || { bg: 'rgba(255,255,255,0.1)', fg: '#fff' };
  return <span style={{ background: palette.bg, color: palette.fg, borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>{status}</span>;
}

export default function AiQueueWidget() {
  const jobs = listAiJobs().slice(0, 5);
  return (
    <div className="nice-scroll" style={{ overflow: 'auto' }}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jobs.map(j => (
          <li key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ color: '#fff', fontSize: 14 }}>{j.title}</div>
            <Chip status={j.status} />
          </li>
        ))}
        {jobs.length === 0 && <li style={{ color: 'rgba(255,255,255,0.7)' }}>No jobs.</li>}
      </ul>
      <a href="/assistant" aria-label="View all AI jobs" style={{ display: 'inline-block', marginTop: 8, color: '#93c5fd' }}>View all →</a>
    </div>
  );
}
