import React from "react";
import { Conversation } from "../state/assistant.store";

export function InspectorPanel({ open, conversation, onModelChange }: {
  open: boolean;
  conversation: Conversation | null;
  onModelChange: (m: string)=> void;
}){
  React.useEffect(()=>{
    document.documentElement.style.setProperty('--assistant-right', open? '320px':'0px');
  }, [open]);
  return (
    <div style={{ width: open? 320: 0, opacity: open? 1: 0, pointerEvents: open? 'auto':'none', transition:'all 0.2s ease', height: '100%' }}>
      {open && (
        <div style={{ padding: 12, color:'#fff', display:'flex', flexDirection:'column', gap:12 }}>
          <section>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>Model & settings</div>
            <select value={conversation?.model || 'mock-gpt'} onChange={(e)=> onModelChange(e.target.value)}
              style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' }}>
              <option value="mock-gpt">mock-gpt</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </section>
          <section>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>Context</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>No context sources configured.</div>
          </section>
          <section>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>History</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Coming soon.</div>
          </section>
        </div>
      )}
    </div>
  );
}
