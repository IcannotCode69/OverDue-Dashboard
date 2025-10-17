import React from "react";
import { Conversation } from "../state/assistant.store";

export function ConversationListItem({ c, selected, onSelect, onRename, onDelete, onPin }: {
  c: Conversation;
  selected: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onPin: (pin: boolean) => void;
}){
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(c.title);
  return (
    <div
      onClick={onSelect}
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
        padding:'8px 10px', borderRadius:8,
        background: selected ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: selected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        color:'#fff', cursor:'pointer'
      }}
    >
      <div style={{ flex:1, minWidth:0 }}>
        {editing ? (
          <input value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={()=>{ setEditing(false); onRename(title.trim()||'Untitled'); }}
            onKeyDown={(e)=>{ if(e.key==='Enter'){ e.currentTarget.blur(); } if(e.key==='Escape'){ setTitle(c.title); setEditing(false);} }}
            style={{ width:'100%', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 6px' }}
            autoFocus />
        ) : (
          <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title || 'Untitled'}</div>
        )}
      </div>
      <div style={{ display:'flex', gap:6 }} onClick={(e)=> e.stopPropagation()}>
        <button title="Rename" onClick={()=>setEditing(true)} style={ghostBtn}>✎</button>
        <button title={c.pinned?"Unpin":"Pin"} onClick={()=>onPin(!c.pinned)} style={ghostBtn}>📌</button>
        <button title="Delete" onClick={onDelete} style={ghostBtn}>🗑</button>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  height: 28, width: 28, display:'inline-flex', alignItems:'center', justifyContent:'center',
  borderRadius:6, background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer'
};
