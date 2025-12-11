import React from "react";
import { useHistory } from "react-router-dom";
import "../styles/landing-page.css";

function LandingPage() {
  const history = useHistory();

  const handleGetStarted = () => {
    history.push("/signup");
  };

  const handleSignIn = () => {
    history.push("/signin");
  };

  return (
    <div className="landing-root">
      <div className="landing-gradient" />
      <div className="landing-content">
        <header className="landing-header">
          <h1 className="landing-title">OverDue Dashboard</h1>
          <p className="landing-subtitle">
            Turn your classes, notes, calendar, and AI into one focused study workspace.
          </p>
        </header>

        <div className="landing-actions">
          <button
            type="button"
            className="landing-primary-button"
            onClick={handleGetStarted}
          >
            Get started
          </button>
          <button
            type="button"
            className="landing-secondary-button"
            onClick={handleSignIn}
          >
            Sign in
          </button>
        </div>

        <div className="landing-footnote">
          <p>
            No clutter, no ads. Just your schedule, tasks, notes, and study plan in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
