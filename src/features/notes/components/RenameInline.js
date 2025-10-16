import React from "react";

export default function RenameInline({ initial, onSave, onCancel }){
  const [v,setV]=React.useState(initial||'');
  return (
    <input autoFocus value={v} onChange={(e)=> setV(e.target.value)} onBlur={()=> onCancel?.()} onKeyDown={(e)=> { if(e.key==='Enter') onSave?.(v.trim()); if(e.key==='Escape') onCancel?.(); }} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 6px', color:'#fff' }} />
  );
}