import React from "react";
import { addNote, listNotes } from "../../data/local";

export default function QuickNoteWidget() {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [recent, setRecent] = React.useState([]);

  const load = React.useCallback(() => {
    const items = listNotes().slice(0, 3);
    setRecent(items);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onSave = () => {
    if (!title.trim() && !body.trim()) return;
    addNote({ title: title.trim() || "Untitled", body: body.trim() });
    setTitle(""); setBody("");
    load();
  };

  const inputStyle = { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" };

  return (
    <div className="nice-scroll" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input aria-label="Note title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      <textarea aria-label="Note body" placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button aria-label="Save note" onClick={onSave} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.6)', background: 'rgba(59,130,246,0.15)', color: '#fff', cursor: 'pointer' }}>Save</button>
        <a href="/notes" aria-label="Open notes page" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: '#93c5fd', textDecoration: 'none' }}>Open /notes</a>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Recent</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recent.map(n => (
          <li key={n.id}>
            <div style={{ color: '#fff', fontSize: 14 }}>{n.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {recent.length === 0 && <li style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>No notes yet.</li>}
      </ul>
    </div>
  );
}
