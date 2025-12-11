import React from "react";
import { useHistory } from "react-router-dom";
import TypewriterText from "../components/TypewriterText";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const history = useHistory();

  return (
    <div className="auth-shell landing-shell">
      <div className="landing-content">
        <div className="landing-glow" />
        <TypewriterText
          className="landing-title"
          text="OverDue"
          typingSpeed={120}
          deletingSpeed={80}
          pauseDuration={3000}
          loop={true}
        />

        <p className="landing-tagline">Do it. Done.</p>

        <div className="landing-actions">
          <button
            className="cal-btn cal-btn-primary"
            onClick={() => history.push("/signup")}
          >
            Sign Up
          </button>
          <button
            className="cal-btn cal-btn-ghost"
            onClick={() => history.push("/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
