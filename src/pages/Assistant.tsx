import React, { useState, useRef, useEffect } from "react";
import getAdapter from "../features/assistant/adapters/resolveAdapter";
import type { Conversation } from "../features/assistant/state/assistant.store";
import { buildUserStudyContext } from "../features/assistant/buildUserStudyContext";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

// Match the existing assistant store key:
// src/features/assistant/state/assistant.store.tsx -> const KEY = "overdue.ai.conversations.v1";
const ASSISTANT_STORAGE_KEY = "overdue.ai.conversations.v1";

function createEmptyConversation(): ChatConversation {
  const now = Date.now();
  return {
    id: `conv-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function getConversationTitleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const cleaned = firstUser.content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New chat";
  return cleaned.length > 42 ? cleaned.slice(0, 42) + "…" : cleaned;
}

function loadConversationsFromStorage(): ChatConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASSISTANT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversationsToStorage(conversations: ChatConversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ASSISTANT_STORAGE_KEY,
      JSON.stringify(conversations)
    );
  } catch {
    // ignore
  }
}

const AssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const adapter = getAdapter();

  useEffect(() => {
    const stored = loadConversationsFromStorage();
    if (stored.length > 0) {
      setConversations(stored);
      setSelectedConversationId(stored[0].id);
      setMessages(stored[0].messages || []);
    } else {
      const initial = createEmptyConversation();
      setConversations([initial]);
      setSelectedConversationId(initial.id);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConversationId) return;
    if (conversations.length === 0) return;

    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              messages,
              title: getConversationTitleFromMessages(messages) || conv.title || "New chat",
              updatedAt: Date.now(),
            }
          : conv
      );
      saveConversationsToStorage(updated);
      return updated;
    });
  }, [messages, selectedConversationId]);

  const handleNewChat = () => {
    const next = createEmptyConversation();
    setConversations((prev) => {
      const updated = [next, ...prev];
      saveConversationsToStorage(updated);
      return updated;
    });
    setSelectedConversationId(next.id);
    setMessages([]);
    setInput("");
    setError(null);
  };

  const handleSelectConversation = (id: string) => {
    if (id === selectedConversationId) return;
    const conv = conversations.find((c) => c.id === id);
    setSelectedConversationId(id);
    setMessages(conv?.messages || []);
    setInput("");
    setError(null);
    setIsSending(false);
  };

  const handleRenameConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    const suggestedTitle =
      conv.title && conv.title !== "New chat"
        ? conv.title
        : getConversationTitleFromMessages(conv.messages);

    const nextTitle = window.prompt(
      "Rename chat",
      suggestedTitle || "New chat"
    );

    if (!nextTitle) return;

    const trimmed = nextTitle.trim();
    if (!trimmed) return;

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c
      );
      saveConversationsToStorage(updated);
      return updated;
    });
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      const nextList =
        remaining.length > 0 ? remaining : [createEmptyConversation()];

      // Choose next selected conversation
      const nextSelected = nextList[0]?.id ?? null;
      setSelectedConversationId(nextSelected);
      setMessages(
        nextSelected
          ? nextList.find((c) => c.id === nextSelected)?.messages || []
          : []
      );
      setInput("");
      setError(null);
      setIsSending(false);

      saveConversationsToStorage(nextList);
      return nextList;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const now = Date.now();
    const userMsg: ChatMessage = {
      id: `u-${now}`,
      role: "user",
      content: text,
      createdAt: now,
    };

    const assistantId = `a-${now}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: now,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const conversationId =
      selectedConversationId ||
      conversations[0]?.id ||
      "simple-chat";

    const conversation: Conversation = {
      id: conversationId,
      title: "Study Assistant",
      messages: [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      createdAt: now,
      updatedAt: now,
    };

    const context = buildUserStudyContext();
    const systemPrompt =
      "You are a personal study assistant for a university student. " +
      "You are given a snapshot of their classes, notes, upcoming calendar events, and grades. " +
      "Use this context to provide concrete, personalized advice. Always reference relevant classes, exams, and deadlines.\n\n" +
      "User context:\n" +
      context.text;

    try {
      await adapter.send({
        conversation,
        userText: text,
        systemPrompt,
        onToken: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
      });
    } catch (e: any) {
      console.error("Assistant error", e);
      setError(
        e?.message ||
          "Something went wrong talking to the AI. Check your API key."
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content ||
                  "Warning: Error generating response. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="assistant-page">
      <div className="page-actions-row page-actions-row--end">
        <span className="assistant-model-chip">Model: Groq Llama 3.1 8B</span>
      </div>

      <div className="assistant-layout">
        {/* Sidebar: conversations list */}
        <aside className="assistant-sidebar app-card">
          <div className="assistant-sidebar__header">
            <div className="assistant-sidebar__title">Chats</div>
            <button
              type="button"
              className="assistant-sidebar__new"
              onClick={handleNewChat}
            >
              + New chat
            </button>
          </div>

          <div className="assistant-sidebar__list nice-scroll">
            {conversations.length === 0 ? (
              <div className="assistant-sidebar__empty">
                No chats yet. Start a new conversation.
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={
                    "assistant-sidebar__item" +
                    (conv.id === selectedConversationId
                      ? " assistant-sidebar__item--active"
                      : "")
                  }
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="assistant-sidebar__item-main">
                    <div className="assistant-sidebar__item-title">
                      {conv.title || "New chat"}
                    </div>
                    <div className="assistant-sidebar__item-meta">
                      {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )}
                    </div>
                  </div>

                  <div className="assistant-sidebar__item-actions">
                    <button
                      type="button"
                      className="assistant-sidebar__icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameConversation(conv.id);
                      }}
                      aria-label="Rename chat"
                      title="Rename chat"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="assistant-sidebar__icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main chat panel – keep your existing content here */}
        <div className="assistant-panel app-card app-card--flush">
          <div ref={chatRef} className="assistant-chat nice-scroll">
            {messages.length === 0 && (
              <div
                style={{
                  marginTop: 40,
                  textAlign: "center",
                  color: "var(--ink-2)",
                  fontSize: 14,
                }}
              >
                <div>Start a conversation by asking for a study plan, help with a topic, or advice on upcoming exams.</div>
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  Try prompts like:
                  <ul style={{ listStyle: "disc", textAlign: "left", margin: "8px auto 0", paddingLeft: 20, display: "inline-block" }}>
                    <li>What should I study this week based on my upcoming exams?</li>
                    <li>Look at my calendar and make a 3-day plan for finals.</li>
                    <li>Help me prepare for my next Physics test.</li>
                  </ul>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  transition: "all 0.2s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "8px 12px",
                    borderRadius: 14,
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                    background:
                      m.role === "user"
                        ? "var(--acc-1)"
                        : "rgba(255,255,255,0.04)",
                    color: m.role === "user" ? "#fff" : "var(--ink-0)",
                    boxShadow:
                      m.role === "user"
                        ? "0 8px 18px rgba(0,0,0,0.4)"
                        : "0 8px 18px rgba(0,0,0,0.25)",
                  }}
                >
                  {m.content || (m.role === "assistant" ? "..." : "")}
                </div>
              </div>
            ))}

            {error && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#f97373",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
          </div>
          <div className="assistant-composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
            />
            <button
              className="app-button-primary"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              style={{ minHeight: 44 }}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
