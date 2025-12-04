import React, { useState, useRef, useEffect } from "react";
import getAdapter from "../features/assistant/adapters/resolveAdapter";
import type { Conversation } from "../features/assistant/state/assistant.store";
import { buildUserStudyContext } from "../features/assistant/buildUserStudyContext";
import PageHeader from "../components/layout/PageHeader";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const adapter = getAdapter();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

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

    const conversation: Conversation = {
      id: "simple-chat",
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
      <PageHeader
        title="AI Assistant"
        subtitle="Ask questions about your schedule, grades, and study plans."
        actions={<span className="assistant-model-chip">Model: Groq Llama 3.1 8B</span>}
      />
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
  );
};

export default AssistantPage;
