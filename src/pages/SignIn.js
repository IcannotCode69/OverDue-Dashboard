import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function SignInPage() {
  const history = useHistory();
  const location = useLocation();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signIn({ email, password });
      history.replace("/dashboard");
    } catch (err) {
      const message = (err && err.message) || "Unable to sign in.";
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
    <div style={{ padding: "48px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: "var(--h1)", marginBottom: 12 }}>Welcome back</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Sign in to continue to your dashboard.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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
            placeholder="Your password"
          />
          {error && (
            <div style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="cal-btn cal-btn-primary"
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: 13 }}>
        Need an account?{" "}
        <a href="/signup" onClick={(e) => { e.preventDefault(); history.push("/signup"); }}>
          Create one
        </a>
      </div>
    </div>
  );
}
