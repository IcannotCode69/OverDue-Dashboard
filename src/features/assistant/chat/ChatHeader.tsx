import React from "react";

export function ChatHeader({ title, model, onRename, inspectorOpen, onToggleInspector }: {
  title: string;
  model?: string;
  onRename: (t: string) => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
}){
  const [editing, setEditing] = React.useState(false);
  const [t, setT] = React.useState(title);
  React.useEffect(()=> setT(title), [title]);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
        {editing ? (
          <input value={t} onChange={(e)=>setT(e.target.value)} onBlur={()=>{ setEditing(false); onRename(t.trim()||'Untitled'); }}
            onKeyDown={(e)=>{ if(e.key==='Enter'){ e.currentTarget.blur(); } if(e.key==='Escape'){ setEditing(false); setT(title);} }}
            style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' }}
            autoFocus />
        ) : (
          <h2 style={{ margin:0, color:'#fff', fontSize:16, fontWeight:600 }} onClick={()=>setEditing(true)} title="Rename">{title}</h2>
        )}
        {model && (
          <span style={{ fontSize:12, color:'#93c5fd', border:'1px solid rgba(59,130,246,0.4)', padding:'2px 6px', borderRadius:999 }}> {model} </span>
        )}
      </div>
      <button
        onClick={()=>{
          onToggleInspector();
          const open = !inspectorOpen; (document.documentElement as any).style.setProperty('--assistant-right', open? '320px':'0px');
        }}
        title={inspectorOpen? 'Hide inspector':'Show inspector'}
        style={{ height:32, width:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff' }}
      >≡</button>
    </div>
  );
}
