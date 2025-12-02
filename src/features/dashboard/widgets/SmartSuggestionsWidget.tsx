import React from "react";
import getAdapter from "../../assistant/adapters/resolveAdapter";
import { buildUserStudyContext } from "../../assistant/buildUserStudyContext";

type Suggestion = { id: string; text: string };

interface SmartSuggestionsWidgetProps {
  className?: string;
  onRemove?: () => void;
}

export default function SmartSuggestionsWidget({ className }: SmartSuggestionsWidgetProps) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const adapter = React.useMemo(() => getAdapter(), []);

  const fetchSuggestions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const ctx = buildUserStudyContext();
    const now = Date.now();
    const conversation = {
      id: "smart-suggestions",
      title: "Smart Suggestions",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    const userText =
      "Based on the context above, generate 3 to 5 short, actionable study suggestions for today. Each suggestion should fit on one line.";

    const systemPrompt =
      "You are a personal study assistant. You will be given a snapshot of the user's classes, notes, upcoming calendar events, and grades.\n" +
      "Use this context to produce a compact list of highly actionable, concrete suggestions for what they should study or do next.\n" +
      "Each suggestion should be a single sentence. Avoid long explanations.\n\n" +
      "Here is the user's context:\n" +
      ctx.text;

    try {
      let full = "";
      await adapter.send({
        conversation,
        userText,
        systemPrompt,
        onToken: (chunk: string) => {
          full += chunk;
        },
      });
      const lines = full
        .split("\n")
        .map((line) => line.replace(/^[-•\d\.\s]+/, "").trim())
        .filter(Boolean);
      const parsed = lines.slice(0, 5).map((text, idx) => ({ id: `sugg-${idx}`, text }));
      setSuggestions(parsed);
    } catch (e: any) {
      console.error("SmartSuggestionsWidget error", e);
      setError(e?.message || "Could not load suggestions. Check AI configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  React.useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 16,
        borderRadius: 16,
        background: "var(--bg-1)",
        border: "1px solid var(--stroke-inner)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: "var(--h4)", fontWeight: 600, color: "var(--ink-0)" }}>
            Smart Suggestions
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
            AI study ideas based on your calendar, notes, and grades.
          </div>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 999,
            border: "1px solid var(--stroke-inner)",
            background: "transparent",
            color: "var(--ink-2)",
            cursor: isLoading ? "default" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 13,
        }}
      >
        {isLoading && <div style={{ color: "var(--ink-2)" }}>Thinking...</div>}
        {error && <div style={{ color: "#f97373" }}>{error}</div>}
        {!isLoading && !error && suggestions.length === 0 && (
          <div style={{ color: "var(--ink-2)" }}>No suggestions yet. Try refreshing.</div>
        )}
        {!isLoading &&
          !error &&
          suggestions.map((s) => (
            <div
              key={s.id}
              style={{
                borderRadius: 12,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--stroke-inner)",
              }}
            >
              {s.text}
            </div>
          ))}
      </div>
    </div>
  );
}
