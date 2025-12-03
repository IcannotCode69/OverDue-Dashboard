import React from "react";
import { useHistory } from "react-router-dom";
import { useUserProfileStore } from "../features/user/userProfile.store";

export default function SignInPage() {
  const history = useHistory();
  const { profile } = useUserProfileStore();

  const goNext = () => {
    if (profile) {
      history.replace("/dashboard");
    } else {
      history.replace("/onboarding");
    }
  };

  return (
    <div style={{ padding: "48px", maxWidth: 640 }}>
      <h1 style={{ fontSize: "var(--h1)", marginBottom: 12 }}>Welcome to OverDue</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        This prototype keeps everything local to your browser—no passwords or servers involved.
        Continue below to jump back into your dashboard or finish onboarding.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="cal-btn cal-btn-primary" onClick={goNext}>
          Continue
        </button>
        {!profile && (
          <button
            className="cal-btn cal-btn-ghost"
            onClick={() => history.push("/onboarding")}
          >
            Start onboarding
          </button>
        )}
      </div>
    </div>
  );
}
