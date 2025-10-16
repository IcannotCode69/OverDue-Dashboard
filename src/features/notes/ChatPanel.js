import React from "react";

export default function ChatPanel(){
  return (
    <div style={{ border:`1px solid rgba(var(--notes-border))`, borderRadius:"var(--notes-radius)", background:`rgba(var(--notes-panel))`, boxShadow:"var(--notes-shadow)", padding:12, height:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ color:"#fff", fontWeight:600, marginBottom:8 }}>Talk to your Notes</div>
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column", gap:8 }} className="nice-scroll">
        <div style={{ alignSelf:'flex-start', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:12, padding:'8px 10px', maxWidth:'90%' }}>
          Hello! How can I help you with your notes today?
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <input aria-label="Ask a question" placeholder="Ask a question…" style={{ flex:1, background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 10px' }} />
        <button aria-label="Send" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>Send</button>
      </div>
    </div>
  );
}
