import * as React from "react";
import { useHistory } from "react-router-dom";
import { useUserProfileStore } from "../features/user/userProfile.store";

function fieldStyle() {
  return {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  };
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--ink-0)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
};

export default function OnboardingPage() {
  const history = useHistory();
  const { setProfile } = useUserProfileStore();
  const [name, setName] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [major, setMajor] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [timezone, setTimezone] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  );
  const [isSubmitting, setSubmitting] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const now = Date.now();
    const profile = {
      id: globalThis.crypto?.randomUUID?.() ?? `user-${now}`,
      name: name.trim(),
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      term: term.trim() || undefined,
      timezone: timezone.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setProfile(profile);
    history.replace("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(13,17,23,0.75)",
          padding: 32,
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, fontSize: 12, opacity: 0.7 }}>
            Welcome
          </p>
          <h1 style={{ fontSize: "var(--h2)", margin: 0 }}>Tell us about yourself</h1>
          <p style={{ opacity: 0.7, marginTop: 8 }}>
            OverDue keeps your data on this device only. Add a few details so widgets can tailor
            study suggestions.
          </p>
        </div>

        <form style={{ display: "grid", gap: 16 }} onSubmit={handleSubmit}>
          <div style={fieldStyle()}>
            <label style={{ fontSize: 13, opacity: 0.8 }}>Name*</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
            <div style={fieldStyle()}>
              <label style={{ fontSize: 13, opacity: 0.8 }}>School</label>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g., University of OverDue"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle()}>
              <label style={{ fontSize: 13, opacity: 0.8 }}>Major / Focus</label>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
            <div style={fieldStyle()}>
              <label style={{ fontSize: 13, opacity: 0.8 }}>Current Term</label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g., Fall 2025"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle()}>
              <label style={{ fontSize: 13, opacity: 0.8 }}>Timezone</label>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., America/Denver"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="cal-btn cal-btn-primary"
            style={{
              marginTop: 12,
              padding: "12px 18px",
              fontSize: 15,
            }}
          >
            {isSubmitting ? "Saving..." : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
