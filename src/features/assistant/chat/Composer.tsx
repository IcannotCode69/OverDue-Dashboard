import React from "react";
import { Conversation, Message } from "../state/assistant.store";
import { ProviderAdapter } from "../adapters/types";

export function Composer({ conversation, adapter, onAddMessage, onUpdateMessage }: {
  conversation: Conversation | null;
  adapter: ProviderAdapter;
  onAddMessage: (convId: string, msg: Message) => void;
  onUpdateMessage: (convId: string, msgId: string, patch: Partial<Message>) => void;
}){
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const send = async () => {
    if(!conversation || !text.trim()) return;
    const user: Message = { id: crypto.randomUUID(), role:'user', content: text.trim(), createdAt: Date.now() } as any;
    onAddMessage(conversation.id, user);
    setText("");
    setPending(true);

    const assistant: Message = { id: crypto.randomUUID(), role:'assistant', content: "", createdAt: Date.now() } as any;
    onAddMessage(conversation.id, assistant);

    const ac = new AbortController(); abortRef.current = ac;
    try{
      await adapter.send({
        conversation,
        userText: user.content,
        model: conversation.model,
        onToken: (chunk) => {
          onUpdateMessage(conversation.id, assistant.id, { content: (assistant.content += chunk) });
        },
        signal: ac.signal,
      });
    } catch(e){
      onUpdateMessage(conversation.id, assistant.id, { content: "⚠️ Error generating response." });
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  };

  return (
    <div style={{ padding: 12, display:'flex', gap:8, alignItems:'flex-end' }}>
      <textarea
        aria-label="Message composer"
        placeholder="Type a message"
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onKeyDown={(e)=>{
          if((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); send(); }
        }}
        style={{ flex:1, minHeight:60, maxHeight:180, resize:'vertical', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 10px' }}
      />
      <button onClick={send} disabled={!conversation || !text.trim() || pending} style={{ height:36, borderRadius:8, padding:'0 12px', border:'1px solid rgba(59,130,246,0.6)', background:'rgba(59,130,246,0.15)', color:'#fff' }}>Send</button>
      {pending && <button onClick={()=>abortRef.current?.abort()} style={{ height:36, borderRadius:8, padding:'0 12px', border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' }}>Stop</button>}
    </div>
  );
}
