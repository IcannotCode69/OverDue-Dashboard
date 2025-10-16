import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./assets/theme";
import routes from "./routes";
import { useVisionUIController } from "./context";

// Simple sidebar component using standard HTML/CSS instead of complex Vision UI components
function SimpleSidebar({ routes }) {
  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "260px",
      height: "100vh",
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      backdropFilter: "blur(10px)",
      borderRight: "1px solid rgba(255,255,255,0.1)",
      padding: "20px",
      zIndex: 1000
    }}>
      <div style={{ 
        color: "white", 
        fontSize: "20px", 
        fontWeight: "bold", 
        marginBottom: "30px",
        textAlign: "center"
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
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              marginBottom: "8px",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              backgroundColor: window.location.pathname === route.route ? "rgba(59, 130, 246, 0.2)" : "transparent",
              border: window.location.pathname === route.route ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (window.location.pathname !== route.route) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (window.location.pathname !== route.route) {
                e.target.style.backgroundColor = "transparent";
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
      <div style={{ backgroundColor: "#0f0f23", minHeight: "100vh" }}>
        <SimpleSidebar routes={routes} />
        <div style={{ marginLeft: "260px", minHeight: "100vh" }}>
          <Switch>
            {getRoutes(routes)}
            <Redirect from="*" to="/dashboard" />
          </Switch>
        </div>
      </div>
    </ThemeProvider>
  );
}
