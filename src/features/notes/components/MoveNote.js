import React from "react";
import { listClasses, listChapters, moveNoteTo } from "../store";

export default function MoveNote({ noteId, open, onOpenChange }){
  const [cid, setCid] = React.useState("");
  const [chid, setChid] = React.useState("");
  const classes = listClasses();
  const chapters = cid ? listChapters(cid) : [];
  if (!open) return null;
  return (
    <div role="dialog" aria-modal style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:49 }} onClick={()=> onOpenChange?.(false)}>
      <div onClick={(e)=> e.stopPropagation()} style={{ position:"absolute", inset:"0", display:"grid", placeItems:"center" }}>
        <div style={{ background:"rgba(2,6,23,0.98)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:12, width:320 }}>
          <div style={{ color:"#fff", fontWeight:700, marginBottom:8 }}>Move note</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <select aria-label="Select class" value={cid} onChange={(e)=> setCid(e.target.value)} style={{ background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"6px 8px" }}>
              <option value="" style={{ color:'#000' }}>Unsorted</option>
              {classes.map(c=> <option key={c.id} value={c.id} style={{ color:'#000' }}>{c.name}</option>)}
            </select>
            <select aria-label="Select chapter" value={chid} onChange={(e)=> setChid(e.target.value)} style={{ background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"6px 8px" }}>
              <option value="" style={{ color:'#000' }}>No chapter</option>
              {chapters.map(ch=> <option key={ch.id} value={ch.id} style={{ color:'#000' }}>{ch.name}</option>)}
            </select>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:6 }}>
              <button onClick={()=> onOpenChange?.(false)} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff" }}>Cancel</button>
              <button onClick={()=> { moveNoteTo(noteId, { classId: cid || undefined, chapterId: chid || undefined }); onOpenChange?.(false); }} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(99,102,241,0.2)", color:"#c7d2fe" }}>Move</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
