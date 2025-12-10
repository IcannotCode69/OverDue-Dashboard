import React from "react";
import getAdapter from "../../assistant/adapters/resolveAdapter";
import { buildUserStudyContext } from "../../assistant/buildUserStudyContext";
import WidgetFrame from "../WidgetFrame";
import "./smart-suggestions.css";
import "./smart-suggestions-widget.css";
import { emitAddTodoTask } from "./todoEvents";

type SuggestionItem = { id: string; text: string };

interface SmartSuggestionsWidgetProps {
  onRemove?: () => void;
}

export default function SmartSuggestionsWidget({ onRemove }: SmartSuggestionsWidgetProps) {
  const [suggestions, setSuggestions] = React.useState<SuggestionItem[]>([]);
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
        .map((line) => line.replace(/^[-ź?>\d\.\s]+/, "").trim())
        .filter(Boolean);
      const parsed = lines.slice(0, 5).map((text, idx) => ({
        id: `sugg-${idx}`,
        text,
      }));
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

  // Compact refresh icon for the widget header
  const refreshButton = (
    <button
      type="button"
      className="react-grid-no-drag"
      onClick={fetchSuggestions}
      aria-label="Refresh suggestions"
      title="Refresh suggestions"
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(15,23,42,0.9)",
        color: "rgba(255,255,255,0.85)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        padding: 0,
      }}
    >
      ⟳
    </button>
  );

  return (
    <WidgetFrame
      title="Smart Suggestions"
      onRemove={onRemove}
      className="smart-suggestions-widget"
      rightActions={refreshButton}
    >
      <div className="nice-scroll smart-suggestions-body">
        {isLoading && <div className="dashboard-widget-empty">Thinking...</div>}
        {error && <div className="dashboard-widget-error">{error}</div>}
        {!isLoading && !error && suggestions.length === 0 && (
          <div className="dashboard-widget-empty">No suggestions yet. Try refreshing.</div>
        )}
        {!isLoading &&
          !error &&
          suggestions.map((suggestion, index) => {
            const text = suggestion.text;
            const key = suggestion.id ?? `sugg-${index}`;

            return (
              <div
                key={key}
                className="smart-suggestion-card smart-suggestion-pill"
                style={{
                  position: "relative",
                }}
              >
                <div className="smart-suggestion-send">
                  <button
                    type="button"
                    className="smart-suggestion-send-button react-grid-no-drag"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      emitAddTodoTask({
                        text,
                        source: "smartSuggestions",
                      });
                    }}
                    title="Send to Tasks"
                    aria-label="Send to Tasks"
                  >
                    ↗
                  </button>
                </div>

                {text}
              </div>
            );
          })}
      </div>
    </WidgetFrame>
  );
}
