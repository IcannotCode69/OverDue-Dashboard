import React from "react";
import { getEmbedUrl, setEmbedUrl } from "./useCalendarEmbed";

export default function CalendarSettingsModal({ open, onClose, onSaved }) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (open) setValue(getEmbedUrl() || "");
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Calendar settings" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'rgba(2,6,23,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, width: 520, padding: 16 }}>
        <div style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>Calendar Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ color: '#fff' }}>Embed URL</label>
          <input aria-label="Embed URL" value={value} onChange={(e)=> setValue(e.target.value)} placeholder="https://calendar.google.com/calendar/embed?..." style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 10px' }} />
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Get this from Google Calendar → Settings → your calendar → Integrate calendar → Embed code.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button aria-label="Close" onClick={onClose} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>Close</button>
            <button aria-label="Save" onClick={()=> { setEmbedUrl(value.trim()); onSaved?.(); onClose?.(); }} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(59,130,246,0.6)', background:'rgba(59,130,246,0.15)', color:'#fff', cursor:'pointer' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}