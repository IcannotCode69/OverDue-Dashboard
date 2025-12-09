import React, { useEffect, useState } from "react";
import { getAdapter } from "../../features/assistant/adapters/resolveAdapter";
import type { Conversation } from "../../features/assistant/state/assistant.store";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  noteTitle?: string;
  classTitle?: string;
  chapterTitle?: string;
}

function makeConversation(): Conversation {
  const now = Date.now();
  return {
    id: "notes-ai",
    title: "Notes AI",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

const basePanelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: "var(--bg-1)",
  border: "1px solid var(--stroke-inner)",
  borderRadius: 16,
  boxShadow: "0 18px 45px rgba(0,0,0,0.5)",
  padding: 16,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
};

export default function AIAssistant(props: AIAssistantProps) {
  const { isOpen, onClose, noteContent, noteTitle, classTitle, chapterTitle } = props;

  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adapter = getAdapter();

  useEffect(() => {
    if (isOpen && noteContent && !inputText) {
      setInputText("Summarize this note in clear bullet points.");
    }
    if (!isOpen) {
      setResponseText("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, noteContent, inputText]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!noteContent.trim()) {
      setError("This note is empty. Add some content first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponseText("");

    const conv = makeConversation();
    const systemPrompt =
      "You are a study assistant that ONLY uses the provided note content as your knowledge source. " +
      "If something is not in the note, say you don't know. Use headings and bullet points when helpful.";

    const contextLines = [
      classTitle && `Class: ${classTitle}`,
      chapterTitle && `Chapter: ${chapterTitle}`,
      noteTitle && `Note title: ${noteTitle}`,
      "",
      "Note content:",
      noteContent,
      "",
      "User question:",
      inputText.trim(),
    ].filter(Boolean);

    const userText = contextLines.join("\n");

    try {
      const { fullText } = await adapter.send({
        conversation: conv,
        userText,
        systemPrompt,
        onToken: (chunk) => {
          setResponseText((prev) => prev + chunk);
        },
      });
      if (!responseText && fullText) {
        setResponseText(fullText);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Failed to contact AI. Check your Groq API key.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const runPreset = (prompt: string) => {
    setInputText(prompt);
    setTimeout(handleSend, 0);
  };

  const presetButtonStyle: React.CSSProperties = {
    border: "1px solid var(--stroke-inner)",
    borderRadius: 999,
    padding: "4px 12px",
    background: "rgba(255,255,255,0.04)",
    color: "var(--ink-1)",
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <div style={basePanelStyle}>
      <div style={cardStyle}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--stroke-outer)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontSize: "var(--h3)", fontWeight: 600, color: "var(--ink-0)" }}>
            Notes AI
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--ink-2)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            X
          </button>
        </div>

        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
            Ask questions about this note. I only use the note content you see in the editor.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button style={presetButtonStyle} onClick={() => runPreset("Summarize this note in concise bullet points.")}>
              Summarize
            </button>
            <button style={presetButtonStyle} onClick={() => runPreset("Explain this note like I'm new to the topic.")}>
              Explain simply
            </button>
            <button
              style={presetButtonStyle}
              onClick={() => runPreset("Generate 10 quiz questions with answers based on this note.")}
            >
              Quiz me
            </button>
            <button
              style={presetButtonStyle}
              onClick={() => runPreset("Create a 3-day study plan using only this note.")}
            >
              Study plan
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me anything about this note..."
            style={{
              width: "100%",
              minHeight: 90,
              maxHeight: 150,
              resize: "vertical",
              background: "var(--bg-2)",
              border: "1px solid var(--stroke-inner)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--ink-0)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          />

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 12,
              borderRadius: 12,
              background: "var(--bg-2)",
              border: "1px solid var(--stroke-inner)",
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--ink-0)",
            }}
          >
            {isLoading && <div>Thinking...</div>}
            {error && <div style={{ color: "#f87171" }}>{error}</div>}
            {!isLoading && !error && !responseText && (
              <div style={{ color: "var(--ink-2)" }}>Your AI answer will appear here.</div>
            )}
            {!isLoading && !error && responseText && <div>{responseText}</div>}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                background: "var(--acc-1)",
                color: "#fff",
                cursor: isLoading || !inputText.trim() ? "default" : "pointer",
                opacity: isLoading || !inputText.trim() ? 0.6 : 1,
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
