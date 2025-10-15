import React from "react";

export default function CalendarPeekWidget(){
  const now = new Date();
  const label = now.toLocaleDateString(undefined, { month:'long', year:'numeric' });
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color:'#fff' }}>{label}</div>
      <a href="/calendar?mode=week" aria-label="Open Calendar" style={{ display:'inline-block', padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', color:'#93c5fd', textDecoration:'none' }}>
        Open Calendar →
      </a>
    </div>
  );
}