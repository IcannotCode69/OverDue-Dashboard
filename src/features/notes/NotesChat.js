import React from "react";

export default function NotesChat(){
  const [messages, setMessages] = React.useState([
    { role:'ai', text:"Hello! How can I help you with your notes today? Ask me anything about the content." }
  ]);
  const [input, setInput] = React.useState("");

  const send = ()=>{
    if (!input.trim()) return;
    const user = { role:'user', text: input.trim() };
    const ai = { role:'ai', text: "Stub: summarizing key concepts..." };
    setMessages(prev => [...prev, user, ai]);
    setInput("");
  };

  const container = { border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, background:'rgba(15,23,42,0.6)', padding:12, display:'flex', flexDirection:'column', height:'100%' };
  const bubble = (role)=> ({ alignSelf: role==='user'?'flex-end':'flex-start', background: role==='user'? 'rgba(99,102,241,0.2)':'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:12, padding:'8px 10px', maxWidth:'90%' });

  return (
    <div style={container}>
      <div style={{ color:'#fff', fontWeight:600, marginBottom:8 }}>Talk to your Notes</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, overflow:'auto', flex:1 }}>
        {messages.map((m,idx)=> (
          <div key={idx} style={bubble(m.role)}>{m.text}</div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <input aria-label="Ask a question" value={input} onChange={(e)=> setInput(e.target.value)} placeholder="Ask a question..." style={{ flex:1, background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 10px' }} />
        <button aria-label="Send" onClick={send} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>Send</button>
      </div>
    </div>
  );
}