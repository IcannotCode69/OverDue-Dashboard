// @ts-nocheck
import React from "react";

function stripMarkdown(md){
  if(!md) return "";
  return md
    .replace(/`{1,3}[^`]*`{1,3}/g, " ") // inline code
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/\!\[[^\]]*\]\([^\)]*\)/g, " ") // images
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " $1 ") // links
    .replace(/[#>*_~`>-]+/g, " ") // md tokens
    .replace(/\s+/g, " ")
    .trim();
}

function fmtDate(s){
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function NotePreviewCard({ note, onClick }){
  const text = stripMarkdown(note.body || "");
  const snippet = text.slice(0, 280) + (text.length > 280 ? "…" : "");
  return (
    <button onClick={onClick} aria-label={`Open ${note.title}`} title={note.title}
      style={{ width:'100%', textAlign:'left', marginBottom:12, padding:12, borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer' }}
      onMouseEnter={(e)=> e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
      onMouseLeave={(e)=> e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
      <div style={{ fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{note.title}</div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>{fmtDate(note.updatedAt)}</div>
      <div style={{ color:'rgba(255,255,255,0.9)' }}>{snippet}</div>
    </button>
  );
}
