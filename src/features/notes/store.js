// Hierarchical local store for Classes → Chapters → Notes
const K = {
  classes: 'od:notes:classes',
  chapters: 'od:notes:chapters',
  notes: 'od:notes:items',
  legacy: 'od:notes:guest',
};

function _uuid(){ return (window.crypto?.randomUUID?.() || ('id-' + Math.random().toString(36).slice(2,10))); }
function _r(key){ try{ const raw = localStorage.getItem(key); return raw? JSON.parse(raw): []; }catch{ return []; } }
function _w(key, v){ localStorage.setItem(key, JSON.stringify(v)); }

export function seedIfEmpty(){
  // Migrate legacy single-list notes if present and new keys empty
  const cls = _r(K.classes), chs = _r(K.chapters), nts = _r(K.notes);
  const legacy = _r(K.legacy);
  if (!cls.length && !nts.length && legacy.length){
    // Build classes from legacy note.course
    const byCourse = {};
    for (const n of legacy){ if (n.course) byCourse[n.course] = true; }
    const classList = Object.keys(byCourse).map((name,idx)=> ({ id:_uuid(), name, order: idx }));
    const notes = legacy.map(n=> ({ id:_uuid(), classId: classList.find(c=> c.name===n.course)?.id, chapterId: undefined, title: n.title||'Untitled', body: n.body||'', tags:n.tags||[], createdAt: n.createdAt||new Date().toISOString(), updatedAt: n.updatedAt||new Date().toISOString() }));
    _w(K.classes, classList);
    _w(K.chapters, []);
    _w(K.notes, notes);
    localStorage.removeItem(K.legacy);
    return;
  }
  if (cls.length || nts.length) return;
  // Seed fresh
  const c1 = { id:_uuid(), name:'Software Engineering', order:0 };
  const c2 = { id:_uuid(), name:'Physics 101', order:1 };
  const ch1 = { id:_uuid(), classId:c1.id, name:'Chapter 1: Intro to SE', order:0 };
  const ch2 = { id:_uuid(), classId:c1.id, name:'Chapter 2: SDLC', order:1 };
  const now = new Date().toISOString();
  const n1 = { id:_uuid(), classId:c1.id, chapterId:ch1.id, title:'What is SE', body:'SE is systematic...', tags:[], createdAt:now, updatedAt:now };
  const n2 = { id:_uuid(), classId:c1.id, chapterId:ch2.id, title:'SDLC overview', body:'Plan → Build → Test', tags:['sdlc'], createdAt:now, updatedAt:now };
  const n3 = { id:_uuid(), classId:c2.id, chapterId:undefined, title:'Kinematics', body:'Displacement, Velocity, Acceleration', tags:['phys'], createdAt:now, updatedAt:now };
  _w(K.classes, [c1,c2]); _w(K.chapters, [ch1,ch2]); _w(K.notes, [n1,n2,n3]);
}

// Classes
export function listClasses(){ return _r(K.classes).sort((a,b)=> a.order-b.order); }
export function createClass(name){ const arr=_r(K.classes); const it={ id:_uuid(), name, order:arr.length }; arr.push(it); _w(K.classes, arr); return it; }
export function renameClass(id,name){ const arr=_r(K.classes); const i=arr.findIndex(c=>c.id===id); if(i>=0){ arr[i].name=name; _w(K.classes,arr);} }
export function deleteClass(id, opts){ const notes=_r(K.notes); const chapters=_r(K.chapters).filter(ch=> ch.classId!==id); let newNotes=notes; if(opts?.moveNotesToUnsorted){ newNotes=notes.map(n=> n.classId===id? { ...n, classId:undefined, chapterId:undefined }: n); } else { newNotes=notes.filter(n=> n.classId!==id); } _w(K.chapters, chapters); _w(K.notes, newNotes); _w(K.classes, _r(K.classes).filter(c=> c.id!==id)); }
export function reorderClasses(ids){ const arr=_r(K.classes); const map=new Map(arr.map(c=>[c.id,c])); const next=ids.map((id,idx)=> ({ ...map.get(id), order: idx })); _w(K.classes, next); }

// Chapters
export function listChapters(classId){ return _r(K.chapters).filter(ch=> ch.classId===classId).sort((a,b)=> a.order-b.order); }
export function createChapter(classId, name){ const arr=_r(K.chapters); const it={ id:_uuid(), classId, name, order: listChapters(classId).length }; arr.push(it); _w(K.chapters, arr); return it; }
export function renameChapter(id,name){ const arr=_r(K.chapters); const i=arr.findIndex(ch=>ch.id===id); if(i>=0){ arr[i].name=name; _w(K.chapters,arr);} }
export function deleteChapter(id, opts){ const notes=_r(K.notes); let newNotes=notes; if(opts?.moveNotesToClass){ newNotes=notes.map(n=> n.chapterId===id? { ...n, classId: opts.moveNotesToClass, chapterId: undefined }: n); } else { newNotes=notes.filter(n=> n.chapterId!==id); } _w(K.notes,newNotes); _w(K.chapters, _r(K.chapters).filter(ch=> ch.id!==id)); }
export function reorderChapters(classId, ids){ const arr=_r(K.chapters); const map=new Map(arr.map(c=>[c.id,c])); const next=ids.map((id,idx)=> ({ ...map.get(id), order: idx })); const merged = arr.map(ch=> next.find(n=> n.id===ch.id) || ch); _w(K.chapters, merged); }

// Notes
export function listAllNotes(){ return _r(K.notes).sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt)); }
export function listNotesByClass(classId){ return _r(K.notes).filter(n=> (classId===undefined? n.classId===undefined : n.classId===classId) ).sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt)); }
export function listNotesByChapter(chapterId){ return _r(K.notes).filter(n=> n.chapterId===chapterId).sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt)); }
export function getNote(id){ return _r(K.notes).find(n=> n.id===id); }
export function createNote(p){ const now=new Date().toISOString(); const it={ id:_uuid(), classId:p.classId, chapterId:p.chapterId, title: p.title||'Untitled', body:p.body||'', tags:p.tags||[], createdAt:now, updatedAt:now }; const arr=_r(K.notes); arr.unshift(it); _w(K.notes,arr); return it; }
export function updateNote(id, patch){ const arr=_r(K.notes); const i=arr.findIndex(n=> n.id===id); if(i<0) throw new Error('note not found'); const now=new Date().toISOString(); arr[i]={ ...arr[i], ...patch, updatedAt: patch.updatedAt||now }; _w(K.notes,arr); return arr[i]; }
export function deleteNote(id){ _w(K.notes, _r(K.notes).filter(n=> n.id!==id)); }
export function moveNoteTo(id, t){ const n=getNote(id); if(!n) return; const patch={ classId: t.classId, chapterId: t.chapterId }; updateNote(id, patch); }
// Back-compat alias
export const moveNote = moveNoteTo;
