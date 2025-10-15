import React from "react";
import { getEmbedUrl, withParam } from "./useCalendarEmbed";

import CalendarSettingsModal from "./CalendarSettingsModal";

export default function CalendarPageFeature() {
  const query = new URL(window.location.href).searchParams;
  const defaultMode = (query.get('mode') || 'week').toLowerCase();
  const [mode, setMode] = React.useState(defaultMode);
  const [open, setOpen] = React.useState(false);
  const baseUrl = getEmbedUrl();
  const url = baseUrl ? withParam(baseUrl, 'mode', mode.toUpperCase()) : undefined;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>Calendar</h2>
        {url && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Source: Google Calendar (read-only)</div>
            <div style={{ display:'inline-flex', gap:6, marginLeft:8 }}>
              {['week','month','agenda'].map(v => (
                <button key={v} aria-label={`Switch to ${v}`} onClick={()=> setMode(v)} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background: mode===v? 'rgba(255,255,255,0.08)':'transparent', color:'#fff', cursor:'pointer' }}>{v[0].toUpperCase()+v.slice(1)}</button>
              ))}
            </div>
            <a
              href={baseUrl || url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in Google Calendar"
              style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#93c5fd', textDecoration:'none' }}
            >
              Open in Google Calendar ↗
            </a>
            <button
              aria-label="Calendar settings"
              onClick={()=> setOpen(true)}
              style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}
            >
              Settings
            </button>
          </div>
        )}
      </div>

      {!url ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, background: 'rgba(15,23,42,0.6)', padding: 16, color:'#fff' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Connect Google Calendar (embed)</h3>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color:'rgba(255,255,255,0.85)' }}>
            <li>Open Google Calendar in a browser.</li>
            <li>Gear icon → <em>Settings</em> → pick your calendar under “Settings for my calendars”.</li>
            <li>Go to <em>Integrate calendar</em> → copy the <b>Embed code</b> URL.</li>
            <li>Paste it into your <code>.env</code> as <code>REACT_APP_GCAL_EMBED_URL</code> (or <code>VITE_GCAL_EMBED_URL</code>) and restart dev.</li>
          </ol>
          <p style={{ color:'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 14 }}>
            Tip: Set <code>showTitle=0</code>, <code>mode=WEEK</code>, and we auto-append your timezone (<code>ctz=…</code>).
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, background: 'rgba(15,23,42,0.6)', overflow: 'hidden' }}>
          <iframe
            title="Google Calendar"
            src={url}
            style={{ width: '100%', height: 'calc(100vh - 160px)', border: 0 }}
            frameBorder="0"
            scrolling="yes"
          />
        </div>
      )}
      <CalendarSettingsModal open={open} onClose={()=> setOpen(false)} onSaved={()=> window.location.reload()} />
    </div>
  );
}
