import React, { ReactNode } from "react";

export function AssistantLayout({
  sidebar,
  header,
  messages,
  composer,
  inspector,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  messages: ReactNode;
  composer: ReactNode;
  inspector: ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr var(--assistant-right, 0px)', height: 'calc(100vh - 80px)', background: '#0f0f23' }}>
      <aside style={{ borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: '#111827' }}>
        {sidebar}
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>{header}</div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{messages}</div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>{composer}</div>
      </main>
      <section style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: '#111827' }}>
        {inspector}
      </section>
    </div>
  );
}
