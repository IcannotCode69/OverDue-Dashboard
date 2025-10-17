import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ markdown }: { markdown: string }){
  return (
    <div className="markdown-body" style={{ lineHeight: 1.6 }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}
        components={{
          code({inline, children}: any){
            const text = String(children);
            if(inline){
              return <code style={inlineCode}>{text}</code>;
            }
            return (
              <div style={codeBlockWrapper}>
                <pre style={preStyle}><code>{text}</code></pre>
                <button
                  aria-label="Copy code"
                  onClick={()=> navigator.clipboard.writeText(text)}
                  style={copyBtn}
                >Copy</button>
              </div>
            );
          },
          table(props){ return <table style={tableStyle} {...props} />; },
          th(props){ return <th style={thtdStyle} {...props} />; },
          td(props){ return <td style={thtdStyle} {...props} />; },
          a(props){ return <a style={{ color:'#93c5fd' }} target="_blank" rel="noreferrer" {...props} />; }
        }}
      >{markdown}</ReactMarkdown>
    </div>
  );
}

const inlineCode: React.CSSProperties = { background:'rgba(255,255,255,0.08)', padding:'0 4px', borderRadius:4 };
const codeBlockWrapper: React.CSSProperties = { position:'relative', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, overflow:'hidden', margin:'8px 0' };
const preStyle: React.CSSProperties = { margin:0, padding:12, background:'#0b1020', color:'#e5e7eb', overflowX:'auto' };
const copyBtn: React.CSSProperties = { position:'absolute', top:6, right:6, height:28, padding:'0 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(17,24,39,0.8)', color:'#fff', cursor:'pointer' };
const tableStyle: React.CSSProperties = { width:'100%', borderCollapse:'collapse', margin:'8px 0', border:'1px solid rgba(255,255,255,0.08)' };
const thtdStyle: React.CSSProperties = { border:'1px solid rgba(255,255,255,0.08)', padding:'6px 8px' };
