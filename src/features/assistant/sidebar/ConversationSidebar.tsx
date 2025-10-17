import React from "react";
import { Conversation } from "../state/assistant.store";
import { ConversationListItem } from "./ConversationListItem";

export function ConversationSidebar({
  conversations,
  selectedId,
  onNew,
  onSelect,
  onRename,
  onDelete,
  onPin,
}: {
  conversations: Conversation[];
  selectedId?: string;
  onNew: () => void;
  onSelect: (id?: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pin: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const pinned = conversations.filter(c=>c.pinned);
  const others = conversations.filter(c=>!c.pinned);
  const filt = (list: Conversation[]) => list.filter(c=>c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
        <input
          aria-label="Search conversations"
          placeholder="Search"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          style={{ flex:1, background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' }}
        />
        <button onClick={onNew} title="New chat" style={{ height:32, width:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff' }}>+</button>
      </div>
      <div style={{ overflow:'auto', padding: 8, display:'flex', flexDirection:'column', gap:6 }} className="nice-scroll">
        {pinned.length>0 && (
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, padding:'4px 8px' }}>Pinned</div>
        )}
        {filt(pinned).map(c=> (
          <ConversationListItem key={c.id} c={c} selected={c.id===selectedId} onSelect={()=>onSelect(c.id)} onRename={(t)=>onRename(c.id,t)} onDelete={()=>onDelete(c.id)} onPin={(p)=>onPin(c.id,p)} />
        ))}
        {others.length>0 && (
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, padding:'6px 8px', marginTop:6 }}>All</div>
        )}
        {filt(others).map(c=> (
          <ConversationListItem key={c.id} c={c} selected={c.id===selectedId} onSelect={()=>onSelect(c.id)} onRename={(t)=>onRename(c.id,t)} onDelete={()=>onDelete(c.id)} onPin={(p)=>onPin(c.id,p)} />
        ))}
        {conversations.length===0 && (
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:14, padding:12 }}>No conversations yet. Start a new chat.</div>
        )}
      </div>
    </div>
  );
}
