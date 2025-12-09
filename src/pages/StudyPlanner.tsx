import React, { useState, useEffect, useCallback } from "react";
import getAdapter from "../features/assistant/adapters/resolveAdapter";
import type { Conversation } from "../features/assistant/state/assistant.store";
import { buildUserStudyContext } from "../features/assistant/buildUserStudyContext";
import PageHeader from "../components/layout/PageHeader";

const StudyPlannerPage: React.FC = () => {
  const adapter = getAdapter();
  const [plan, setPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState(() => buildUserStudyContext());

  const generatePlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const now = Date.now();
    const conversation: Conversation = {
      id: `study-planner-${now}`,
      title: "Study Planner",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const ctx = buildUserStudyContext();
      setContext(ctx);

      const systemPrompt =
        "You are a focused, practical study planning assistant for a busy university student. " +
        "You will be given a summary of their current classes, upcoming assignments, calendar events, and grades. " +
        "Using ONLY that information, create a concrete, realistic plan for how they should study over the next few days. " +
        "Organize the plan with clear headings such as 'Today', 'Tomorrow', and 'This Week'. " +
        "Under each heading, use bullet points with specific tasks that mention the course and topic. " +
        "Prefer short, actionable items over long paragraphs. Do not invent courses or assignments that are not mentioned in the context. " +
        "If there is very little data, give a simple but still specific generic study plan.";

      const result = await adapter.send({
        conversation,
        userText: ctx.text,
        systemPrompt,
      });

      const full = (result && result.fullText) || "";
      setPlan(full.trim());
    } catch (e: any) {
      console.error("StudyPlanner error", e);
      setError(e?.message || "Could not generate study plan. Check AI configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    // Generate an initial plan when the page first loads
    generatePlan();
  }, [generatePlan]);

  const hasContext =
    context &&
    context.text &&
    context.text !== "No user context available yet.";

  return (
    <div className="study-planner-page">
      <PageHeader
        title="Study Planner"
        subtitle="Turn your classes, assignments, and schedule into a focused plan."
        actions={
          <button
            type="button"
            className="app-button-primary"
            onClick={generatePlan}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : plan ? "Regenerate plan" : "Generate plan"}
          </button>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        <section
          className="app-card"
          style={{
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <h2 style={{ fontSize: "var(--h3)", margin: 0 }}>Your current workload</h2>
          <p
            style={{
              fontSize: "var(--body)",
              color: "var(--ink-2)",
              margin: 0,
            }}
          >
            This summary is built from your notes, calendar, and grades.
          </p>
          <div
            className="nice-scroll"
            style={{
              marginTop: 12,
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.22)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--body)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {hasContext
              ? context.summary || context.text
              : "No context available yet. Add some notes, events, or grades to get a richer plan."}
          </div>
        </section>

        <section
          className="app-card"
          style={{
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <h2 style={{ fontSize: "var(--h3)", margin: 0 }}>AI study plan</h2>
          <p
            style={{
              fontSize: "var(--body)",
              color: "var(--ink-2)",
              margin: 0,
            }}
          >
            A step-by-step plan you can follow over the next few days.
          </p>
          <div
            className="nice-scroll"
            style={{
              marginTop: 12,
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.22)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--body)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              maxHeight: 420,
              overflow: "auto",
            }}
          >
            {error && (
              <div style={{ color: "var(--acc-red)" }}>{error}</div>
            )}
            {!error && isLoading && (
              <div style={{ color: "var(--ink-2)" }}>
                Generating your plan based on your current workload...
              </div>
            )}
            {!error && !isLoading && !plan && (
              <div style={{ color: "var(--ink-2)" }}>
                Click “Generate plan” to create a personalized study plan.
              </div>
            )}
            {!error && !isLoading && plan && <div>{plan}</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
