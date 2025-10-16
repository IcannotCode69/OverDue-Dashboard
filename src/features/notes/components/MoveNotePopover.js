import React from "react";
import { listClasses, listChapters, moveNote } from "../store";
import Button from "../../../components/ui/Button";

export default function MoveNotePopover({ noteId, onClose }){
  const [cid,setCid]=React.useState('');
  const [chid,setChid]=React.useState('');
  const classes=listClasses();
  const chapters = cid? listChapters(cid): [];
  return (
    <div style={{ position:'absolute', zIndex:30, top:'100%', right:0, marginTop:6, background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:8, width:260 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <select value={cid} onChange={(e)=> setCid(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }}>
          <option value="" style={{ color:'#000' }}>Unsorted</option>
          {classes.map(c=> <option key={c.id} value={c.id} style={{ color:'#000' }}>{c.name}</option>)}
        </select>
        <select value={chid} onChange={(e)=> setChid(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }}>
          <option value="" style={{ color:'#000' }}>No chapter</option>
          {chapters.map(ch=> <option key={ch.id} value={ch.id} style={{ color:'#000' }}>{ch.name}</option>)}
        </select>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={()=> { moveNote(noteId, { classId: cid||undefined, chapterId: chid||undefined }); onClose?.(); }}>Move</Button>
        </div>
      </div>
    </div>
  );
}