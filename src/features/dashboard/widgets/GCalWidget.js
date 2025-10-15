import React from "react";
import WidgetFrame from "../WidgetFrame";
import { getEmbedUrl, withParam } from "../../calendar/useCalendarEmbed";

function buildWeekUrl() {
  const raw = getEmbedUrl();
  if (!raw) return undefined;
  const u = withParam(raw, "mode", "WEEK");
  const withTz = withParam(u, "ctz", Intl.DateTimeFormat().resolvedOptions().timeZone);
  const noTitle = withParam(withTz, "showTitle", "0");
  const noPrint = withParam(noTitle, "showPrint", "0");
  return noPrint;
}

export default function GCalWidget({ onRemove }) {
  const url = buildWeekUrl();

  return (
    <WidgetFrame title="Google Calendar (Week)" onRemove={onRemove}>
      {!url ? (
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          No Google Calendar embed URL configured.
          <div style={{ marginTop: 8 }}>
            Go to <a style={{ textDecoration: 'underline', color: '#93c5fd' }} href="/calendar">Calendar</a> → Settings to paste your embed link.
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <iframe
            title="Google Calendar (Week)"
            src={url}
            style={{ width: '100%', height: 360, border: 0 }}
            frameBorder="0"
            scrolling="yes"
          />
        </div>
      )}
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <a
          href="/calendar?mode=week"
          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none' }}
        >
          Open full calendar →
        </a>
      </div>
    </WidgetFrame>
  );
}