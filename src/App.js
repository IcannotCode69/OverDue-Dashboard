import React from "react";
import { Route, Switch, Redirect, useHistory, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./assets/theme";
import routes from "./routes";
import { useVisionUIController } from "./context";
import "./styles/theme.tokens.css";
import { useUserProfileStore } from "./features/user/userProfile.store";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";

// Simple sidebar component using standard HTML/CSS instead of complex Vision UI components
function SimpleSidebar({ routes, profile, onNavigate, currentPath }) {
  const history = useHistory();
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const greetingName = user?.name || user?.email || profile?.name || "there";

  const visibleRoutes = routes.filter((route) => {
    if (route.hideInNav) return false;
    if (!isAuthenticated && (route.key === "dashboard" || route.key === "calendar" || route.key === "notes" || route.key === "study-planner" || route.key === "assistant" || route.key === "grades" || route.key === "profile")) {
      return false;
    }
    if (isAuthenticated && (route.key === "signin" || route.key === "signup")) {
      return false;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    history.push("/signin");
  };

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
        padding: "24px 20px",
        zIndex: 1000,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
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
        {`Hi, ${greetingName}`}
      </div>

      <nav>
        {visibleRoutes.map((route) => {
          const targetRoute = route.route;
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
                borderRadius: 10,
                transition: "background-color 0.2s ease",
              }}
            >
              <span style={{ marginRight: "12px" }}>{route.icon}</span>
              {route.name}
            </a>
          );
        })}
      </nav>

      {isAuthenticated && !isLoading && (
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--ink-1)",
              borderRadius: 10,
              padding: "8px 12px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const [controller] = useVisionUIController();
  const { layout } = controller;
  const history = useHistory();
  const location = useLocation();
  const { profile } = useUserProfileStore();
  const { user, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    const path = location.pathname || "/";
    const isOnboardingRoute = path.startsWith("/onboarding");
    const isAuthRoute =
      path.startsWith("/signin") ||
      path.startsWith("/signup");

    if (user && !profile && !isOnboardingRoute && !isAuthRoute) {
      history.replace("/onboarding");
      return;
    }

    if (user && isAuthRoute) {
      history.replace("/dashboard");
    }
  }, [user, profile, isLoading, location.pathname, history]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        const isPublic = route.key === "signin" || route.key === "signup";
        if (isPublic) {
          return <Route exact path={route.route} component={route.component} key={route.key} />;
        }
        return <ProtectedRoute exact path={route.route} component={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <div className="app-root">
      <div className="app-shell">
        {isAuthenticated && (
          <SimpleSidebar
            routes={routes}
            profile={profile}
            currentPath={location.pathname}
            onNavigate={(route) => history.push(route)}
          />
        )}
          <div className="app-content">
            <div className="mesh-overlay" />
            <main className="app-main">
              <Switch>
                <Route exact path="/">
                  {isAuthenticated ? <Redirect to="/dashboard" /> : <LandingPage />}
                </Route>
                {getRoutes(routes)}
                <Redirect from="*" to="/dashboard" />
              </Switch>
            </main>
          </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
