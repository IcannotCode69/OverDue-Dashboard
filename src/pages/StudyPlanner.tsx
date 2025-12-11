import React, { useState, useEffect, useCallback } from "react";
import getAdapter from "../features/assistant/adapters/resolveAdapter";
import type { Conversation } from "../features/assistant/state/assistant.store";
import { buildUserStudyContext } from "../features/assistant/buildUserStudyContext";

const StudyPlannerPage: React.FC = () => {
  const adapter = getAdapter();
  const [plan, setPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState(() => buildUserStudyContext());
  const hasPlan = plan.trim().length > 0;

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
        "You will be given a summary of their current classes, upcoming assignments, calendar events, grades, active to-do items, and some basic profile information (like school, program, and timezone). " +
        "Using ONLY that information, create a concrete, realistic plan for how they should study over the next few days. " +
        "Organize the plan with clear headings such as 'Today', 'Tomorrow', and 'This Week'. " +
        "Under each heading, use bullet points with specific tasks that mention the course, topic, and (when relevant) assignment or exam. " +
        "Prefer short, actionable items over long paragraphs. " +
        "Prioritize items that are due soon or that are high impact. " +
        "Do not invent courses or assignments that are not mentioned in the context. " +
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
      <div className="study-planner-layout">
        {/* Left side: compact workload overview */}
        <section className="study-planner-panel study-planner-panel--overview app-card">
          <header className="study-planner-panel__header">
            <div className="study-planner-panel__title-group">
              <h2 className="study-planner-panel__title">Your current workload</h2>
              <p className="study-planner-panel__subtitle">
                Quick snapshot of your classes, calendar, and grades.
              </p>
            </div>
          </header>

          <div className="study-planner-panel__body study-planner-panel__body--overview">
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
          </div>
        </section>

        {/* Right side: main AI study plan panel */}
        <section className="study-planner-panel study-planner-panel--plan app-card app-card--flush">
          <header className="study-planner-panel__header">
            <div className="study-planner-panel__title-group">
              <h2 className="study-planner-panel__title">AI study plan</h2>
              <p className="study-planner-panel__subtitle">
                A step-by-step plan you can follow over the next few days.
              </p>
            </div>
            <div className="study-planner-panel__header-actions">
              <button
                type="button"
                className="app-button-primary"
                onClick={generatePlan}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : hasPlan ? "Regenerate plan" : "Generate plan"}
              </button>
            </div>
          </header>

          <div className="study-planner-panel__body study-planner-panel__body--plan">
            {/* Status / error messages */}
            {error && (
              <div className="study-planner-alert">
                <span>{error}</span>
              </div>
            )}

            {!error && !hasPlan && !isLoading && (
              <div className="study-planner-empty">
                <h3>No plan yet</h3>
                <p>
                  Click "Generate plan" to create a study schedule based on your current workload.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="study-planner-empty">
                <h3>Generating your plan...</h3>
                <p>This usually takes just a moment.</p>
              </div>
            )}

            {/* Existing plan output */}
            {hasPlan && !isLoading && (
              <div className="study-planner-plan-scroll nice-scroll">
                <div>{plan}</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
