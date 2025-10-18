import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./assets/theme";
import routes from "./routes";
import { useVisionUIController } from "./context";
import "./styles/theme.tokens.css";

// Simple sidebar component using standard HTML/CSS instead of complex Vision UI components
function SimpleSidebar({ routes }) {
  return (
    <div className="sidenav" style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "260px",
      height: "100vh",
      backdropFilter: "blur(var(--blur))",
      padding: "20px",
      zIndex: 1000
    }}>
      <div style={{ 
        color: "var(--ink-0)", 
        fontSize: "var(--h2)", 
        fontWeight: 600, 
        marginBottom: "30px",
        textAlign: "center",
        fontFamily: "var(--font-sans)"
      }}>
        OverDue Dashboard
      </div>
      
      <nav>
        {routes.map((route) => (
          <a
            key={route.key}
            href={route.route}
            onClick={(e) => {
              e.preventDefault();
              window.location.pathname = route.route;
            }}
            className={`nav-item ${window.location.pathname === route.route ? 'active' : ''}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              marginBottom: "8px",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--body)"
            }}
            onMouseEnter={(e) => {
              if (window.location.pathname !== route.route) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (window.location.pathname !== route.route) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ marginRight: "12px" }}>{route.icon}</span>
            {route.name}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const [controller] = useVisionUIController();
  const { layout } = controller;
  

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
        <SimpleSidebar routes={routes} />
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
