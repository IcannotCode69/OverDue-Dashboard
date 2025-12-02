# OverDue Dashboard

Modern, local-first dashboard for personal productivity. Built with React 18, Create React App (react-scripts), Material-UI (dark theme), and react-grid-layout. Data is stored in the browser via localStorage: calendar events (with .ics import), notes/grades/tasks, and a mock Assistant.

## Quickstart

Prerequisites
- Node.js 16+
- npm

Install & run
```bash
npm install
npm run start   # starts CRA dev server
```

Build
```bash
npm run build   # outputs to ./build
```

Lint (optional)
```bash
npm run lint
```

## Routes & Features
- Dashboard: grid of curated widgets persisted via localStorage
- Calendar: week/day grid, Google Calendar embed, .ics importer (local persistence key: `od:calendar:events:v1`)
- Notes: classes ? chapters ? notes, autosave, optional helper panel
- Grades: simple tracker with summary and CRUD
- Assistant: local mock chat with streaming adapter and conversation persistence

## Project Structure
```
src/
  assets/        # images, theme tokens
  components/    # shared UI components
  features/      # feature modules (calendar, dashboard, notes, assistant, ...)
  pages/         # top-level routes
```

Key files
- `src/routes.js` – central route/side-nav config
- `src/features/calendar/` – calendar page + styles + .ics parser and modal
- `src/features/dashboard/` – widget registry + grid host
- `src/features/assistant/` – local-first assistant (store, adapters, UI)

## Architecture at a glance
- CRA + React 18 + MUI dark theme
- LocalStorage as primary persistence (no backend)
- Pluggable adapters pattern (e.g., assistant providers)
- React-Grid-Layout dashboard with per-breakpoint sizes and persisted layouts


## AI Assistant Providers
The Assistant feature uses a pluggable adapter system so you can swap providers without touching the UI. Supported providers:
- `mock` (default, no network calls)
- `openai`
- `groq` (Llama 3.1 8B via Groq's OpenAI-compatible API)

Configure the provider via `.env`:
```bash
VITE_AI_PROVIDER=groq
VITE_GROQ_API_KEY=your_key
VITE_GROQ_MODEL=llama-3.1-8b-instant
# optional override (defaults to https://api.groq.com/openai/v1)
VITE_GROQ_API_BASE=https://api.groq.com/openai/v1
```

Leaving the key empty falls back to the mock adapter so local development still works.
Both the Assistant page and Notes AI panel use the same provider setting, so once Groq is enabled you get the same answers everywhere.

## Scripts
- `start` – CRA dev server
- `build` – production build
- `lint` – eslint over `src`
- `preview` – `serve -s build` (optional for local preview)

## License
MIT — see LICENSE

## Contributing
See CONTRIBUTING.md for guidelines.
