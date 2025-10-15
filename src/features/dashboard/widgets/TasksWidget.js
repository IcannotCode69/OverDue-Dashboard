import React from "react";
import { listTasks, toggleTask, addTask, tasksDueWithin, tasksOnDate, updateTask, resetSampleData } from "../../data/local";

export default function TasksWidget({ widgetId }) {
  const [tasks, setTasks] = React.useState([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [due, setDue] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [filterDate, setFilterDate] = React.useState(null);
  const [editing, setEditing] = React.useState(null); // {id,title,due}

  const load = React.useCallback(() => {
    const data = filterDate ? tasksOnDate(filterDate) : tasksDueWithin(7);
    setTasks(data.sort((a, b) => new Date(a.due) - new Date(b.due)));
  }, [filterDate]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const onFilter = (e) => {
      setFilterDate(e.detail?.date || null);
    };
    window.addEventListener("od:filterDate", onFilter);
    return () => window.removeEventListener("od:filterDate", onFilter);
  }, []);

  const onToggle = async (id, done) => {
    toggleTask(id, done);
    load();
  };

  const onAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), due: new Date(due) });
    setTitle("");
    setShowAdd(false);
    load();
  };

  const focusRing = {
    outline: "none",
    boxShadow: "0 0 0 2px rgba(59,130,246,0.6)",
  };

  return (
    <div className="nice-scroll" style={{ overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
          {filterDate ? (
            <button
              aria-label="Clear date filter"
              onClick={() => setFilterDate(null)}
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusRing.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              style={{ background: "transparent", color: "#93c5fd", border: "none", cursor: "pointer" }}
            >
              Clear filter
            </button>
          ) : (
            <span>Due in 7 days</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            aria-label="Add quick task"
            onClick={() => setShowAdd((s) => !s)}
          onFocus={(e) => (e.currentTarget.style.boxShadow = focusRing.boxShadow)}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", cursor: "pointer" }}
>
            +
          </button>
          <button
            aria-label="Complete all visible"
            title="Complete all visible"
            onClick={() => { tasks.forEach(t => !t.done && toggleTask(t.id, true)); load(); }}
            style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(34,197,94,0.5)", background: "rgba(34,197,94,0.15)", color: "#bbf7d0", cursor: "pointer" }}
          >
            Complete all
          </button>
          <button
            aria-label="Reset sample data"
            title="Reset sample data"
            onClick={() => { resetSampleData(); setFilterDate(null); load(); }}
            style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", cursor: "pointer" }}
          >
            Reset
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={onAdd} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            aria-label="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.boxShadow = focusRing.boxShadow)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            placeholder="Task"
            style={{ flex: 1, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
          <input
            aria-label="Due date"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
          <button aria-label="Save task" type="submit" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(59,130,246,0.6)", background: "rgba(59,130,246,0.15)", color: "#fff", cursor: "pointer" }}>Save</button>
        </form>
      )}

      <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
              aria-label={`Mark ${t.title} ${t.done ? 'undone' : 'done'}`}
              type="checkbox"
              checked={!!t.done}
              onChange={(e) => onToggle(t.id, e.target.checked)}
            />
            <div style={{ color: t.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)" }}>
              <div style={{ fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{new Date(t.due).toDateString()}</div>
            </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button aria-label={`Edit ${t.title}`} onClick={() => setEditing({ id: t.id, title: t.title, due: new Date(t.due).toISOString().slice(0,10) })} style={{ fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Edit</button>
            </div>
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>No upcoming tasks.</li>
        )}
      </ul>

      {editing && (
        <div role="dialog" aria-modal="true" aria-label="Edit task" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 12, width: 360 }}>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Edit Task</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input aria-label="Edit title" value={editing.title} onChange={(e)=> setEditing({ ...editing, title: e.target.value })} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 8px' }} />
              <input aria-label="Edit due date" type="date" value={editing.due} onChange={(e)=> setEditing({ ...editing, due: e.target.value })} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 8px' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button aria-label="Cancel edit" onClick={()=> setEditing(null)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button aria-label="Save edit" onClick={()=> { updateTask(editing.id, { title: editing.title, due: new Date(editing.due).toISOString() }); setEditing(null); load(); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.6)', background: 'rgba(59,130,246,0.15)', color: '#fff', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
