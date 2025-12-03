import React from "react";
import { Route, Switch, Redirect, useHistory, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./assets/theme";
import routes from "./routes";
import { useVisionUIController } from "./context";
import "./styles/theme.tokens.css";
import { useUserProfileStore } from "./features/user/userProfile.store";

// Simple sidebar component using standard HTML/CSS instead of complex Vision UI components
function SimpleSidebar({ routes, profile, onNavigate, currentPath }) {
  const greeting = profile?.name ? `Hi, ${profile.name.split(" ")[0]}` : "Let's plan your week";
  return (
    <div
      className="sidenav"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "260px",
        height: "100vh",
        backdropFilter: "blur(var(--blur))",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          color: "var(--ink-0)",
          fontSize: "var(--h2)",
          fontWeight: 600,
          marginBottom: "8px",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
        }}
      >
        OverDue Dashboard
      </div>
      <div style={{ color: "var(--ink-2)", textAlign: "center", marginBottom: 24, fontSize: 13 }}>
        {greeting}
      </div>

      <nav>
        {routes.map((route) => {
          if (route.hideInNav) return null;
          const targetRoute = route.key === "signup" ? "/onboarding" : route.route;
          const isActive = currentPath === targetRoute;
          return (
            <a
              key={route.key}
              href={targetRoute}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(targetRoute);
              }}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                marginBottom: "8px",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--body)",
                backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                borderRadius: 10,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ marginRight: "12px" }}>{route.icon}</span>
              {route.name}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  const [controller] = useVisionUIController();
  const { layout } = controller;
  const history = useHistory();
  const location = useLocation();
  const { profile } = useUserProfileStore();

  React.useEffect(() => {
    const path = location.pathname;
    const isOnboarding = path.startsWith("/onboarding");
    const isAuthRoute = path.startsWith("/signin") || path.startsWith("/signup");
    if (!profile && !isOnboarding && !isAuthRoute) {
      history.replace("/onboarding");
    }
  }, [profile, location.pathname, history]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} component={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-bg" style={{ minHeight: "100vh" }}>
        <SimpleSidebar
          routes={routes}
          profile={profile}
          currentPath={location.pathname}
          onNavigate={(route) => history.push(route)}
        />
        <div style={{ marginLeft: "260px", minHeight: "100vh", position: "relative" }}>
          <div className="mesh-overlay" />
          <Switch>
            {getRoutes(routes)}
            <Redirect from="*" to="/dashboard" />
          </Switch>
        </div>
      </div>
    </ThemeProvider>
  );
}
