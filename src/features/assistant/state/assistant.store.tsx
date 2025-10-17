import { v4 as uuid } from "uuid";
import React from "react";

export type Role = "user" | "assistant" | "system";
export type Message = { id: string; role: Role; content: string; createdAt: number };
export type Conversation = {
  id: string;
  title: string;
  pinned?: boolean;
  systemPrompt?: string;
  model?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
export type AssistantStoreState = {
  conversations: Conversation[];
  selectedId?: string;
  ui: { inspectorOpen: boolean };
};

const KEY = "overdue.ai.conversations.v1";

function load(): AssistantStoreState {
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return { conversations: [], ui: { inspectorOpen: false } };
    const parsed = JSON.parse(raw);
    return { conversations: parsed.conversations||[], selectedId: parsed.selectedId, ui: parsed.ui||{ inspectorOpen:false } };
  } catch { return { conversations: [], ui:{ inspectorOpen:false } }; }
}
function save(state: AssistantStoreState){
  localStorage.setItem(KEY, JSON.stringify(state));
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(null);

function createStore(){
  const [state, setState] = React.useState<AssistantStoreState>(load());
  const update = (patch: Partial<AssistantStoreState>) => setState(prev => { const s = { ...prev, ...patch }; save(s); return s; });

  return {
    get conversations(){ return state.conversations; },
    get selectedId(){ return state.selectedId; },
    get ui(){ return state.ui; },
    newConversation(initial: Partial<Conversation> = {}){
      const now = Date.now();
      const conv: Conversation = {
        id: uuid(),
        title: initial.title || "New chat",
        pinned: !!initial.pinned,
        systemPrompt: initial.systemPrompt,
        model: initial.model || "mock-gpt",
        messages: [], createdAt: now, updatedAt: now,
      };
      const conversations = [conv, ...state.conversations];
      update({ conversations, selectedId: conv.id });
      return conv.id;
    },
    renameConversation(id: string, title: string){
      const conversations = state.conversations.map(c=> c.id===id? { ...c, title, updatedAt: Date.now() }: c);
      update({ conversations });
    },
    deleteConversation(id: string){
      const conversations = state.conversations.filter(c=> c.id!==id);
      const selectedId = state.selectedId===id? conversations[0]?.id: state.selectedId;
      update({ conversations, selectedId });
    },
    pinConversation(id: string, pin: boolean){
      const conversations = state.conversations.map(c=> c.id===id? { ...c, pinned: pin, updatedAt: Date.now() }: c);
      update({ conversations });
    },
    addMessage(convId: string, msg: Message){
      const conversations = state.conversations.map(c=> c.id===convId? { ...c, messages: [...c.messages, msg], title: c.title|| (msg.role==='user'? msg.content.split(/\s+/).slice(0,8).join(' '): c.title), updatedAt: Date.now() }: c);
      update({ conversations });
    },
    updateMessage(convId: string, msgId: string, patch: Partial<Message>){
      const conversations = state.conversations.map(c=> c.id===convId? { ...c, messages: c.messages.map(m=> m.id===msgId? { ...m, ...patch }: m), updatedAt: Date.now() }: c);
      update({ conversations });
    },
    selectConversation(id?: string){ update({ selectedId: id }); },
    toggleInspector(){ update({ ui: { inspectorOpen: !state.ui.inspectorOpen } }); },
  };
}

export function useAssistantStore(){
  const ctx = React.useContext(StoreContext);
  if(!ctx) throw new Error("AssistantStoreProvider missing");
  return ctx;
}

export function AssistantStoreProvider({ children }: { children: React.ReactNode }){
  const store = createStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
