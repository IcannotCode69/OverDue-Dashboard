import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function SignUpPage() {
  const history = useHistory();
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await signUp({
        email,
        password,
        name,
      });
      setSuccess("Account created. Check your email to confirm, then sign in.");
      history.replace("/signin");
    } catch (err) {
      const message = (err && err.message) || "Unable to sign up.";
      setError(message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--stroke-inner, rgba(255,255,255,0.1))",
    borderRadius: 12,
    background: "var(--bg-2, rgba(15,23,42,0.8))",
    color: "var(--ink-0)",
    boxSizing: "border-box",
  };

  return (
    <div className="auth-shell auth-shell--form">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          We’ll save your profile so you can start using the dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="name" style={{ fontWeight: 600 }}>Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Your name"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="password" style={{ fontWeight: 600 }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Choose a password"
            />
            {error && (
              <div style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ color: "#4ade80", fontSize: 12, marginTop: 4 }}>
                {success}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="cal-btn cal-btn-primary"
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => history.push("/signin")}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
