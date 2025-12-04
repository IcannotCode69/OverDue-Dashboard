import React from "react";
import getAdapter from "../../assistant/adapters/resolveAdapter";
import { buildUserStudyContext } from "../../assistant/buildUserStudyContext";
import WidgetFrame from "../WidgetFrame";
import "./smart-suggestions.css";

type Suggestion = { id: string; text: string };

interface SmartSuggestionsWidgetProps {
  onRemove?: () => void;
}

export default function SmartSuggestionsWidget({ onRemove }: SmartSuggestionsWidgetProps) {
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
    <WidgetFrame title="Smart Suggestions" onRemove={onRemove} className="app-card--accent">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
          AI study ideas based on your calendar, notes, and grades.
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="dashboard-widget-icon-button app-button-primary"
          style={{ fontSize: 12 }}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="nice-scroll smart-suggestions-body">
        {isLoading && <div className="dashboard-widget-empty">Thinking...</div>}
        {error && <div className="dashboard-widget-error">{error}</div>}
        {!isLoading && !error && suggestions.length === 0 && (
          <div className="dashboard-widget-empty">No suggestions yet. Try refreshing.</div>
        )}
        {!isLoading &&
          !error &&
          suggestions.map((s) => (
            <div key={s.id} className="smart-suggestion-pill">
              {s.text}
            </div>
          ))}
      </div>
    </WidgetFrame>
  );
}
