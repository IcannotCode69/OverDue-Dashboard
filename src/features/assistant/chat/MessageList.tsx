import React, { useEffect, useRef } from "react";
import { Conversation } from "../state/assistant.store";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ conversation }: { conversation: Conversation | null }){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversation?.messages.length]);
  if(!conversation){
    return <div style={{ color:'rgba(255,255,255,0.7)', padding:16 }}>Start a new conversation.</div>;
  }
  return (
    <div ref={ref} style={{ padding: 16 }} className="nice-scroll">
      {conversation.messages.map(m => (
        <MessageBubble key={m.id} role={m.role} content={m.content} createdAt={m.createdAt} />
      ))}
    </div>
  );
}
