import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

export function MessageBubble({ role, content, createdAt }: { role: 'user'|'assistant'|'system'; content: string; createdAt: number }){
  const isUser = role === 'user';
  const bg = isUser ? '#1f2937' : '#111827';
  const border = '1px solid rgba(255,255,255,0.08)';
  return (
    <div style={{ display:'flex', justifyContent: isUser? 'flex-end':'flex-start', marginBottom: 12 }}>
      <div style={{ maxWidth: '80%', background: bg, border, padding: 12, borderRadius: 12, color:'#fff' }}>
        {role === 'assistant' ? (
          <MarkdownRenderer markdown={content} />
        ) : (
          <div style={{ whiteSpace:'pre-wrap', lineHeight:1.6 }}>{content}</div>
        )}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          {new Date(createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
