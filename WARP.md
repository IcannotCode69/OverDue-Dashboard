# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Overview
- This is a React 18 single-page application built with Create React App (react-scripts) and Material-UI (MUI), using a neutralized Vision UI theme.
- Routing is configured via react-router-dom v5 using a central routes definition (src/routes.js).
- Global UI state (layout, navbar, etc.) is managed through a small context provider (src/context/index.js).
- The primary feature in this foundation is a modular dashboard grid (src/features/dashboard) using react-grid-layout with layouts persisted to localStorage.

Commands
- Prerequisites: Node.js 16+ and npm.

- Install dependencies
  - Windows PowerShell
    ```powershell
    npm install
    ```

- Start development server
  - Aliased to CRA’s start
    ```powershell
    npm run dev
    ```

- Build for production
    ```powershell
    npm run build
    ```

- Preview production build locally
  - Serves the contents of the build/ directory
    ```powershell
    npm run preview
    ```

- Lint source code (with autofix)
  - Uses eslint over src/ with .js and .jsx extensions
    ```powershell
    npm run lint
    ```

- Run tests (Jest via react-scripts)
  - All tests (interactive watch by default)
    ```powershell
    npm test
    ```
  - Single test file/pattern
    ```powershell
    npm test -- <pattern>
    # example: run tests matching "Dashboard"
    npm test -- Dashboard
    ```
  - One-off, non-interactive (useful for CI or quick local check on Windows PowerShell)
    ```powershell
    $env:CI = "true"; npm test -- --watchAll=false
    ```

Code architecture and structure
- Entry point and bootstrapping
  - src/index.js creates the React root (createRoot), wraps the app with BrowserRouter and VisionUIControllerProvider.
  - The app renders to the element with id="root" (public/index.html).

- Application shell and routing
  - src/App.js applies the MUI ThemeProvider (assets/theme) and CssBaseline, renders a lightweight sidebar for navigation, and sets up Routes via Switch/Route from react-router-dom v5.
  - There is a default Redirect to /dashboard.
  - Route configuration lives in src/routes.js as a data structure that maps route metadata (name, key, path, icon) to page components. Icons are from react-icons.
  - To add a new page, create it under src/pages/, export the component, then add a new object to the routes array with the route, key, name, and component.

- Theming
  - src/assets/theme/index.js composes a Material-UI theme using Vision UI base tokens (colors, typography, shadows, borders) and provides minimal component overrides.
  - CssBaseline sets a dark background and default text color.

- Global UI state
  - src/context/index.js provides VisionUIControllerProvider with a reducer managing layout-oriented flags (e.g., miniSidenav, transparentNavbar, layout, direction).
  - The useVisionUIController hook exposes [controller, dispatch] for components that need to read or change UI state.

- Dashboard feature module
  - src/features/dashboard/DashboardGrid.js renders a responsive grid (react-grid-layout) of widget items, with add/remove actions and persisted layouts via localStorage (key: "od:layout:v1").
  - src/features/dashboard/WidgetFrame.js provides a simple, styled container with a title bar and a remove button used by individual widgets.
  - The default dashboard page (src/pages/Dashboard.js) hosts the DashboardGrid and simple page scaffolding.

- Pages
  - src/pages/ contains high-level route targets (Dashboard, Calendar, Notes, Assistant, Grades, Profile, SignIn, SignUp). These are mapped in src/routes.js and can be extended as features evolve.

Repository notes
- The README includes Quick Start, scripts, and a high-level roadmap; use it for additional context on planned features.
- No project-specific AI rules files (CLAUDE.md, Cursor rules, or Copilot instructions) were found at the time of writing.
