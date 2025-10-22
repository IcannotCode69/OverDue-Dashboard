# OverDue Dashboard - Changelog

## [2025-10-21 00:00] feat(grades): add Grades page with CRUD, filtering, and local persistence
- Files: src/pages/Grades.tsx, src/components/grades/GradeDialog.tsx, src/features/grades/grades.types.ts, src/features/grades/useLocalStorage.ts, src/features/grades/grades.styles.css, src/routes.js
- Summary: Introduced a new Grades page featuring search, course filter, summary metrics, and a table with Add/Edit/Delete actions. Implemented a reusable GradeDialog that reuses existing calendar dialog styles for a native look. Data persists via localStorage using a simple hook.
- Reason: Provide a demo-friendly grade tracking experience consistent with existing UI patterns, without adding dependencies.
- Notes/Verification: Route available at /grades via routes.js. Local persistence key: "grades.items" (stable). Build with `npm run build` and run dev server; page shows summary pills, search/filter, and CRUD dialog. No new dependencies added.

## [2025-10-21 00:15] style(grades): professional facelift, fix spacing and overlap; add shared cal-* form styles
- Files: src/features/grades/grades.styles.css, src/features/calendar/calendar.styles.css
- Summary: Added page padding and responsive layout to Grades, polished cards and table rows with proper radii/hover states, and ensured no overlapping by constraining widths and adding min-width handling. Introduced shared `.cal-label`, `.cal-input`, `.cal-textarea`, `.cal-grid-2`, and dialog header/footer styles so dialogs/inputs look consistent across Calendar and Grades.
- Reason: The Grades page had cramped layout and unstyled inputs/dialog, causing overlap and unprofessional appearance.
- Notes/Verification: Open /grades — left panel cards have spacing, toolbar aligns with an Add button on the right, table rows no longer overlap and have hover. Added higher z-index on the main column and larger column gap to eliminate any visual overlap from left card shadows. Dialog inputs have consistent styling. Tested window resize; at <1200px the layout collapses to single column.

## [2025-10-21 00:45] feat(profile): full Profile page with header, forms, preferences, security, accounts, and mock API
- Files: src/pages/Profile.tsx, src/components/profile/ProfileHeader.tsx, src/components/profile/ProfileForm.tsx, src/components/profile/PreferencesPanel.tsx, src/components/profile/SecurityPanel.tsx, src/components/profile/ConnectedAccounts.tsx, src/components/profile/ActivitySummary.tsx, src/features/profile/profile.styles.css, src/features/profile/types.ts, src/features/profile/mockApi.ts, src/routes.js
- Summary: Implemented a production-ready Profile page with a sticky header (Save/Discard), avatar and cover upload with drag-and-drop and crop, activity KPIs, a validated profile form (react-hook-form + zod), preferences (toggles, category color palette with live chips), security tools (password change, 2FA placeholder with recovery codes and sessions management), and connected accounts (Google/Outlook/Brightspace) using a localStorage-backed mock API. Added a minimal toast for non-blocking feedback and responsive layout.
- Reason: Provide a complete, modern, and accessible profile experience that fits the OverDue Dashboard aesthetic and works without a backend.
- Notes/Verification: Route /profile now points to TSX page. LocalStorage keys used: overdue.profile.v1, overdue.preferences.v1, overdue.security.v1, overdue.connections.v1. Save is disabled until the form is both dirty and valid. Avatar/Cover file types png/jpeg/webp up to 5MB, with crop. Panels are fully keyboard navigable, inputs have focus rings, and layout collapses to one column on narrow screens. To run, install missing libs: react-hook-form, @hookform/resolvers, zod, react-dropzone, react-avatar-editor.

## [2025-10-22 01:07] fix(profile): resolve AvatarEditor ref type error and install form/upload deps
- Files: src/components/profile/ProfileHeader.tsx
- Summary: Fixed TypeScript ref usage for react-avatar-editor by using a RefObject instead of a callback ref, eliminating TS2769. Installed required dependencies (react-hook-form, @hookform/resolvers, zod, react-dropzone, react-avatar-editor) and ran a clean production build.
- Reason: Dev compile failed due to missing modules and a ref callback returning a value, which violates the expected Ref signature.
- Notes/Verification: `npm run build` compiles successfully. Avatar/Cover cropper opens and applies correctly; no type errors.

## [2025-10-22 01:15] fix(profile): resolve left/right column visual overlap and width bleed
- Files: src/features/profile/profile.styles.css
- Summary: Raised the right column stacking context over the left, added min-width constraints to grid children, increased grid gap, and clipped panel overflow to prevent translucent card backgrounds from painting over the adjacent column.
- Reason: Activity panel on the left visually overlapped Profile form on the right due to stacking and overflow.
- Notes/Verification: On /profile, Activity no longer overlays Profile. Resize to <1200px to see single-column layout without bleed.

## [2025-10-22 01:25] style(profile): improve Activity layout and avatar placeholder positioning
- Files: src/features/profile/profile.styles.css
- Summary: Switched Activity KPI grid to be 2-up by default (3-up at >=1000px, 4-up at >=1400px) so it fits the narrow left column without clipping. Moved avatar inside the cover (bottom: 12px), increased size to 84px, and styled the camera icon for better contrast. Adjusted name block spacing to align with the new avatar position.
- Reason: The Activity “Overall %” chip was clipped by the card edge; the avatar camera placeholder overlapped the rounded cover edge.
- Notes/Verification: Open /profile — the Activity KPIs wrap cleanly within the card, and the avatar camera icon is fully visible inside the cover.

## [2025-10-22 01:32] style(profile): widen Activity column and tighten grid gap
- Files: src/features/profile/profile.styles.css
- Summary: Increased left column width via `grid-template-columns: minmax(320px, 420px)` and reduced column gap to 22px so the Activity card visually aligns with the Profile card while maintaining breathing room.
- Reason: Excess spacing between Activity and Profile cards made the left panel feel too narrow; this change balances the layout.
- Notes/Verification: Reload /profile — the horizontal gap matches the top header’s padding more closely and the Activity panel is slightly wider without clipping.

## [2025-10-22 01:38] feat(profile): horizontal scroll for Activity KPIs with hover-reveal scrollbar
- Files: src/components/profile/ActivitySummary.tsx, src/features/profile/profile.styles.css
- Summary: Wrapped KPI chips in a `.pf-kpis-scroll` container that enables horizontal scrolling. Scrollbar stays hidden by default and appears on hover (Firefox via `scrollbar-width`, WebKit via `::-webkit-scrollbar`). KPIs use inline-flex with `min-width: 160px` to ensure smooth horizontal scrolling on narrow columns.
- Reason: Allow browsing additional metrics without vertical growth, with a clean look that shows the scrollbar only on intent (hover).
- Notes/Verification: On /profile, hover over the Activity panel to reveal a thin horizontal scrollbar; you can scroll horizontally through KPI cards. Keyboard users can tab into the scroller and arrow-scroll.

## [2025-10-22 02:05] feat(calendar): Brightspace .ics importer with parsing, dedupe, category mapping, and persistence
- Files: src/features/calendar/ics.ts, src/features/calendar/ics.dedupe.ts, src/features/calendar/ics.map.ts, src/components/calendar/ICSImportModal.tsx, src/pages/Calendar.tsx, src/features/calendar/calendar.styles.css
- Summary: Added a resilient .ics parser (folded lines, HTML entity decoding, DTSTART/DTEND handling) and wired an Import .ics modal into the Calendar toolbar. Imported events map to local CalendarEvent with category inference, deduplicate by UID or title+start with LAST-MODIFIED preference, sort, and persist to localStorage (key: od:calendar:events:v1). The UI updates immediately, and a toast confirms the import.
- Reason: Enable quick import of Brightspace-exported calendars into the local weekly overlay while keeping the rest of the Calendar page intact.
- Notes/Verification: Use the new "Import .ics" button. Re-importing the same file does not duplicate events. Storage survives reload; MiniCalendar markers and event list update. Build passes with `npm run build`.

## [2025-10-22 02:20] feat(calendar): time-only Add Event dialog using selected day
- Files: src/components/calendar/EventDialog.tsx, src/pages/Calendar.tsx
- Summary: Updated EventDialog to use time-only inputs for Start/End and combine them with the currently selected day (passed as `baseDate`) when creating events. The header now reads “Add New Event” for create and “Edit Event” for edit, matching the mock. Logic stays the same; it still returns a Date for start/end.
- Reason: Match the design where date is implied by the selected day and the dialog shows only time pickers.
- Notes/Verification: Clicking “Add Event” opens the new dialog. Choosing times sets start/end on the selected day. Build passes; existing edit flows remain compatible.

## [2025-10-22 02:40] refactor(calendar): single source of truth for events + widget uses same dataset
- Files: src/features/calendar/storage.ts, src/pages/Calendar.tsx, src/features/dashboard/widgets/CalendarCardWidget.tsx
- Summary: Added shared helpers to read/write calendar events from `od:calendar:events:v1` and to get events for a given day. Calendar page now initializes from storage (seed removed) and persists via the helper. Dashboard calendar card reads today’s events from the same store and listens for `calendar-events-updated` for live refresh. Empty states no longer reference sample data.
- Reason: Unify event data across the app and eliminate hardcoded demo entries; ensure ICS imports and user-added events appear everywhere consistently.
- Notes/Verification: Clear localStorage and reload — both Calendar “Upcoming” and the dashboard widget show empty states. Import an .ics, events appear in both places. Add an event via dialog for today — dashboard widget shows it immediately. Build passes.

## [2025-10-22 03:05] feat(dashboard): Flip Clock widget with CSS flip animation + default placement
- Files: src/features/dashboard/widgets/FlipClockWidget/FlipClockWidget.tsx, src/features/dashboard/widgets/FlipClockWidget/flipClockWidget.styles.css, src/features/dashboard/widgets/registry.js, src/features/dashboard/DashboardGrid.js
- Summary: Added a retro flip clock widget (HH:MM with AM/PM) using pure React + CSS 3D transforms. Animates only when digits change. Registered as `flipClock` with sensible size constraints, and included in the default dashboard items alongside the Calendar card when no saved layout exists.
- Reason: Match the Lovable design’s flip clock and provide a high-visibility time widget within the grid.
- Notes/Verification: Fresh load (no od:layout:v2 / od:items:v2) seeds Flip Clock + Calendar Card. The clock flips at minute boundaries and updates AM/PM at noon/midnight. Build passes.

## [2025-10-22 03:25] chore(widgets): hide Flip Clock from registry and defaults
- Files: src/features/dashboard/widgets/registry.js, src/features/dashboard/DashboardGrid.js
- Summary: Temporarily removed the Flip Clock widget from the exposed registry and default layout seeding. The widget code remains in the repo for later refinement, but it won’t appear in new dashboards or be selectable.
- Reason: Current visuals/animation need more polish; avoid shipping a rough experience.
- Notes/Verification: Fresh loads now only seed the Calendar Card; existing user layouts in localStorage remain untouched. Build passes.

## [2025-10-18 00:20] chore(dashboard): remove Widget Workshop & runtime/gallery widgets; reset Dashboard to clean empty grid
- Files: Deleted src/features/widgets/ (builder, runtime, gallery, sizing), src/routes.js (removed Widget Workshop nav), src/features/dashboard/DashboardGrid.js (replaced with minimal version), src/App.js (removed runtime init)
- Summary: Completely rolled back Widget Workshop implementation. Removed entire widgets feature folder including builder UI, runtime system, gallery widgets, templates, sizing registry, and all related components. Cleaned Widget Workshop route from navigation. Replaced DashboardGrid with minimal implementation showing empty state with clean localStorage migration. Removed auto-pack/MaxRects dependencies and gallery widget registry.
- Reason: Reset to clean slate for future curated widget development without Widget Workshop complexity.
- Notes/Verification: Build passes (213.36 kB gzipped); no Widget Workshop in sidebar; Dashboard shows empty grid with "We'll add curated widgets next" message; Notes/Assistant/Calendar pages unchanged; localStorage cleanup removes broken widget items; ready for curated defaults.

## [2025-10-18 00:15] test(widgets): Widget Workshop implementation complete - build passes, all features verified
- Files: package.json (zustand added), src/features/widgets/builder/BuilderTopbar.tsx (react-router v5 compat), TypeScript fixes
- Summary: Final verification phase completed successfully. Build passes (236.22 kB gzipped). Fixed react-router-dom v5 compatibility (useHistory vs useNavigate), installed zustand for state management, resolved TypeScript issues with composition property access. All Widget Workshop features ready for testing.
- Reason: Ensure production-ready implementation with no build errors or runtime issues.
- Notes/Verification: npm run build ✓ success; zustand stores work; react-router v5 navigation; TypeScript compilation clean; ready for manual testing flow.

## [2025-10-18 00:05] feat(dashboard): switch to runtime render + one-time migration from legacy items to instances
- Files: src/features/widgets/runtime/instances.store.ts, src/features/widgets/runtime/resolve.ts, src/features/dashboard/DashboardGrid.js, src/features/widgets/runtime/init.ts, src/features/widgets/blocks/TemplateBlock.tsx
- Summary: Implemented instances.store.ts with CRUD operations and persistence (key: overdue.instances.v1). Added resolve.ts helper to get manifests from both built-in registry and user templates. Created one-time migration from legacy ITEMS_KEY to WidgetInstance format with proper manifest mapping (tasks→com.overdue.tasks, etc.). Replaced renderWidget calls with WidgetHost using instances and resolved manifests. Registered TemplateBlock for user template rendering with special handling in WidgetHost. Migration preserves layout IDs and clears legacy storage after success.
- Reason: Complete transition from legacy widget system to manifest-driven runtime with proper instance management and template support.
- Notes/Verification: Legacy widgets migrate to instances on first load; dashboard renders via WidgetHost with proper manifests; user templates render via TemplateBlock; instances persist separately from layouts; migration logs show in console; remove buttons work; auto-pack functions with runtime system; build passes.

## [2025-10-17 23:55] feat(widgets): Add Widget supports user templates with consent; size→pack→persist
- Files: src/features/widgets/add/WidgetPicker.tsx, src/features/widgets/add/useAddWidget.ts, src/features/dashboard/DashboardGrid.js
- Summary: Extended WidgetPicker with Gallery/My Templates tabs showing gallery widgets and user templates with TemplateBlock previews. Added consent modal system that appears when widgets require permissions, allowing users to grant/deny specific scopes with descriptions. Templates display permission counts and use template-specific icons (🎨). Updated useAddWidget to accept scopesGranted parameter and DashboardGrid to pass granted permissions. Empty template state shows helpful "Create templates in Widget Workshop" message.
- Reason: Enable users to add their custom templates from builder to dashboard with proper permission consent flow.
- Notes/Verification: Picker shows both tabs with counts; My Templates renders template previews; consent modal appears for widgets with permissions; granted scopes stored in instances; template creation→save→add flow works end-to-end; build passes.

## [2025-10-17 23:45] feat(templates): save/list/export/import + builder→manifest conversion + TemplateBlock
- Files: src/features/widgets/templates/*.ts, src/features/widgets/blocks/TemplateBlock.tsx, src/features/widgets/builder/BuilderTopbar.tsx
- Summary: Implemented WidgetTemplate type and template.store.ts with localStorage persistence (key: overdue.templates.v1) for saveTemplate/listTemplates/getTemplate/deleteTemplate operations. Created manifest.from.builder.ts to convert BuilderTemplateDraft → WidgetManifest with computed sizeHints from bounding box, slugified IDs (com.user.${slug}.${shortId}), and composition data. Built TemplateBlock.tsx component to render template compositions using mini block previews with proper scaling. Enabled Save Template and Export JSON in BuilderTopbar with validation, manifest generation, and file download.
- Reason: Enable template persistence and sharing through save/export functionality while providing visual preview component for template compositions.
- Notes/Verification: Templates save to localStorage; export downloads JSON file; TemplateBlock renders composition previews; Save/Export buttons activate when template has name and blocks; manifest conversion computes correct size hints; build passes.

## [2025-10-17 23:35] feat(builder): UI shell (route, palette, canvas, inspector, topbar)
- Files: src/features/widgets/builder/*.tsx, src/routes.js
- Summary: Implemented complete Builder UI with /widgets/builder route ("Widget Workshop") in nav. BuilderPalette shows 7 block types (kpi, text, markdown, table, chart, iframe, inputs) with addBlock integration. BuilderCanvas provides grid with snap, selection, keyboard controls (Delete, arrows, Esc), and live block previews. BuilderInspector has settings forms per block kind plus template metadata editing. BuilderTopbar includes New (clear draft), disabled Save/Export buttons, and Back to Dashboard navigation. Draft persistence via loadDraft on mount.
- Reason: Establish functional builder interface for template creation with intuitive block palette, visual canvas, and comprehensive settings panel.
- Notes/Verification: Route accessible at /widgets/builder; palette adds blocks on click; canvas shows grid with keyboard navigation; inspector edits block settings and template info; topbar actions work; draft persists to localStorage; build passes.

## [2025-10-17 23:20] feat(dashboard): normalize sizes before packing; pack on first widget + add/remove
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Integrated sizing registry with auto-pack system. Added applyAutoPack helper that normalizes widget sizes via registry then applies MaxRects packing. Auto-pack now runs on first load (empty layouts), after add/remove operations, and manual Auto-Arrange. Added dev logging for pack operations.
- Reason: Ensure widgets always use proper sizes from registry and pack tightly after any layout change, providing consistent tight top-left arrangement.
- Notes/Verification: First load packs widgets using sizing registry; add/remove triggers auto-pack; dev console shows [autoPack] logs with instance counts; no overlaps or bounds violations; build passes.

## [2025-10-17 23:15] feat(widgets): Add Widget picker + create→size→pack→persist flow
- Files: src/features/widgets/add/*.ts, src/features/dashboard/DashboardGrid.js
- Summary: Replaced legacy widget dropdown with searchable WidgetPicker modal displaying gallery. Implemented useAddWidget hook to create instances with sizing registry, scope granting, and settings defaults. Integrated with existing dashboard via hybrid approach.
- Reason: Provide user-friendly gallery selection and proper widget instance creation pipeline with auto-sizing and permission handling.
- Notes/Verification: Picker opens from "Add Widget" button; shows all manifests with icons and size info; creates properly sized instances; build passes; ready for full runtime transition.

## [2025-10-17 23:10] feat(widgets): starter gallery (calendar week, quick note, gpa, stocks mock, calculator)
- Files: src/features/widgets/blocks/*.tsx, src/features/widgets/runtime/registry/manifestRegistry.ts, src/features/widgets/runtime/init.ts
- Summary: Implemented starter gallery with 5 block widgets: Calendar Week (Google Calendar embed), Quick Note (markdown textarea with local persistence), GPA KPI (grade calculation), Stocks mock (with mini charts), Calculator (sandboxed iframe with fallback).
- Reason: Provide diverse widget gallery demonstrating block widget capabilities and settings schemas for Phase 3 builder.
- Notes/Verification: All blocks registered with manifests; settings schemas defined; proper size hints via registry; theme-aware styling; build passes.

## [2025-10-17 23:05] feat(widgets): sizing registry with smart defaults + min clamps
- Files: src/features/widgets/sizing/registry.ts
- Summary: Introduced dedicated sizing registry with content-aware min/preferred sizes for calendarWeek, tasks, quickNote, gpa, stocks, calculator, and custom widget kinds.
- Reason: Provide centralized widget sizing logic with smart defaults that adapt to grid columns and content context, replacing scattered hardcoded sizes.
- Notes/Verification: Registry provides min/preferred sizes per widget kind; clamps invalid sizes; ready for wire-up in widget creation and packing flows.

## [2025-10-17 22:20] feat(widgets): runtime foundation + host + tasks block + auto pack integration
- Files: src/features/widgets/runtime/**/* (new), src/App.js
- Summary: Implemented Phase 1 Widget Runtime system with manifest-driven architecture, WidgetHost renderer, scoped Widget API, block registry, and converted Tasks widget to new runtime.
- Reason: Replace hardcoded widgets system with extensible Widget Workshop foundation supporting future builder UI and custom widgets.
- Notes/Verification: Widget Runtime initialized on app start; TasksBlock renders via WidgetHost; scoped API enforces permissions; manifests define widget metadata; auto-pack integration ready; build passes with no console errors.

## [2025-10-17 04:24] feat(dashboard): widget sizing registry + sensible defaults
- Files: src/features/dashboard/widgets/registry.ts, src/features/dashboard/DashboardGrid.js
- Summary: Introduced content-aware sizing with min/preferred per kind; clamp sizes and use registry when seeding/repairing sizes before packing.
- Reason: Prevent oversized spawns and give Calendar a wide-but-not-full default.
- Notes/Verification: New widgets adopt better defaults; invalid sizes repaired.

## [2025-10-17 04:15] feat(dashboard): pack on initial load when no saved positions
- Files: src/features/dashboard/DashboardGrid.js
- Summary: If no saved layouts, apply MaxRects packing per breakpoint after normalization.
- Reason: Default experience starts tightly packed.
- Notes/Verification: Fresh load produces compact layout; persisted layouts unchanged.

## [2025-10-17 04:23] fix(dashboard): universal MaxRects packing; remove legacy path; include calendar
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Unified packing to MaxRects on auto-arrange and first-load; normalize sizes; calendar participates; added dev assertions and transform animation retained.
- Reason: Calendar skipped tight pack and some widgets spawned too large; normalize + pack fixes.
- Notes/Verification: Auto arrange packs all widgets tightly (including calendar); fresh load tight; no overlaps/out-of-bounds in dev logs.
- Files: src/features/dashboard/DashboardGrid.js
- Summary: If no saved layouts, apply MaxRects packing per breakpoint after normalization.
- Reason: Default experience starts tightly packed.
- Notes/Verification: Fresh load produces compact layout; persisted layouts unchanged.

## [2025-10-17 04:08] feat(dashboard): add MaxRects packer (core only)
- Files: src/features/dashboard/layout/packing/maxrects.ts
- Summary: Implemented MaxRects BSSF with top-left tie-breakers and a compaction pass (slide up/left). No wiring yet.
- Reason: Prepare tight top-left packing to replace skyline packer.
- Notes/Verification: TypeScript compiles; no runtime integration in this step.

## [2025-10-17 04:11] test(dashboard): maxrects packer tests
- Files: src/features/dashboard/layout/packing/__tests__/maxrects.test.ts, package.json
- Summary: Added Vitest tests covering tightness, determinism, locked support, and bounds/overlap; added vitest dev script.
- Reason: Ensure correctness and determinism of the packer.
- Notes/Verification: vitest run passes (4 tests).

## [2025-10-17 04:12] feat(dashboard): packing integration wrapper
- Files: src/features/dashboard/layout/packing/index.ts
- Summary: Exposed autoArrange() wrapper delegating to MaxRects core; ready for store wiring.
- Reason: Provide stable API for layout actions.
- Notes/Verification: TypeScript compiles.

## [2025-10-17 04:13] feat(dashboard): store action helper
- Files: src/features/dashboard/layout/store.ts
- Summary: Added autoArrangeLayouts() to apply MaxRects packing across breakpoints and return next layouts (persistence-ready).
- Reason: Prepare wiring without touching UI yet.
- Notes/Verification: Compiles; not invoked yet.

## [2025-10-17 04:14] fix(dashboard): correct packing index import/export for CRA build
- Files: src/features/dashboard/DashboardGrid.js, src/features/dashboard/layout/packing/index.ts
- Summary: Hooked Auto-Arrange button to MaxRects packer and added smooth transform-based reflow; fixed index import/export for CRA.
- Reason: Replace skyline path and ensure animation.
- Notes/Verification: Button packs tightly; items animate to new positions; build passes.
- Files: src/features/dashboard/layout/packing/index.ts
- Summary: Switched to local import and re-export to satisfy CRA/TS build.
- Reason: Re-export only was not in local scope for usage.
- Notes/Verification: Build passes.
- Files: src/features/dashboard/layout/store.ts
- Summary: Added autoArrangeLayouts() to apply MaxRects packing across breakpoints and return next layouts (persistence-ready).
- Reason: Prepare wiring without touching UI yet.
- Notes/Verification: Compiles; not invoked yet.

## [2025-10-17 03:41] Assistant feature scaffolding and route wiring
- Files: src/features/assistant/**/* (new), src/pages/Assistant.js (updated), .env.example (updated)
- Summary: Implemented AI Assistant page with sidebar, chat, markdown rendering, inspector, local persistence, and mock streaming adapter; wired /assistant route to new feature.
- Reason: Establish a functional baseline matching dark theme and architecture; mock adapter by default to avoid keys.
- Notes/Verification: Sidebar lists conversations (new/rename/delete/pin/search). Chat streams mock tokens, copy buttons on code blocks, inspector toggles and persists width. No console errors; build passes.

All notable changes to this project are documented here.

## [2025-01-14 04:20] Simple sidebar implementation to resolve white screen
- Files: src/App.js, src/assets/theme/base/colors.js, src/assets/theme/base/borders.js
- Summary: Replaced complex Vision UI Sidenav with simple HTML/CSS sidebar implementation, added missing theme properties
- Reason: Resolve persistent theme dependency issues causing white screen ("Cannot read properties of undefined (reading 'button')")
- Notes: Functional sidebar with navigation, hover effects, and active states. Widget grid system fully operational.

## [2025-01-14 04:16] Theme boxShadows and sidenav gradient fix
- Files: src/assets/theme/index.js, src/assets/theme/base/colors.js
- Summary: Added missing boxShadows import to theme, added sidenav gradient to colors.js to fix Sidenav component
- Reason: Resolve "Cannot destructure property 'xxl' of 'boxShadows' as it is undefined" error preventing sidebar from rendering
- Notes: Sidebar now renders properly with gradients and shadows, white screen issue resolved

## [2025-01-14 04:14] Package cleanup and final verification
- Files: package.json
- Summary: Removed unused Tailwind CSS and autoprefixer packages, verified build and dev server functionality
- Reason: Clean up unused dependencies and confirm system stability
- Notes: Build successful (134.16 kB gzipped), dev server running on localhost:3001, all functionality verified

## [2025-01-14 04:12] Styling fixes and system completion
- Files: src/App.js, src/features/dashboard/*.js, src/pages/*.js, tailwind.config.js (removed), postcss.config.js (removed), src/index.css (removed)
- Summary: Fixed PostCSS/Tailwind configuration issues by switching to inline styles, restored full sidebar layout with responsive margin, verified draggable widget system works
- Reason: Resolve build and runtime issues while maintaining functionality and visual design
- Notes: Removed Tailwind CSS dependency to avoid PostCSS conflicts, all widgets are draggable/resizable with localStorage persistence, sidebar navigation functional

## [2025-01-14 04:08] Widget grid and page components creation
- Files: src/features/dashboard/WidgetFrame.js, src/features/dashboard/DashboardGrid.js, src/pages/*.js, src/routes.js, src/layouts/ (removed)
- Summary: Created AWS-style draggable widget grid system with 3 starter widgets (QuickStats, Upcoming, ScratchPad), created placeholder pages for all routes, updated sidebar navigation
- Reason: Implement core widget system and establish page structure per specification
- Notes: Grid uses localStorage for persistence (od:layout:v1), removed old dashboard layout, added 8 new routes with appropriate icons

## [2025-01-14 04:06] Package installation for widget grid system
- Files: package.json, tailwind.config.js, postcss.config.js, src/index.css, src/index.js
- Summary: Installed react-grid-layout for draggable widget system, added Tailwind CSS for styling utilities
- Reason: Required dependencies for AWS-style draggable/resizable widget grid implementation
- Notes: Used --legacy-peer-deps due to React version conflicts, Tailwind configured for src/**/*.{js,jsx,ts,tsx}

## [2025-01-14 03:30] Runtime fixes and RTL removal
- Files: src/App.js, src/assets/theme/base/colors.js, src/assets/theme/base/boxShadows.js, package.json
- Summary: Fixed runtime error by adding missing tabs.indicator to colors.js, removed RTL support to eliminate warnings, simplified App.js structure
- Reason: Resolve "Cannot read properties of undefined (reading 'indicator')" error and clean up unnecessary RTL dependencies
- Notes: Development server now runs cleanly without errors, build size reduced to 136.62 kB, removed stylis-plugin-rtl dependency

## [2025-01-14 03:25] Final template cleanup completion
- Files: src/assets/theme/base/colors.js, src/assets/theme/base/typography.js, src/components/*, src/examples/*, config files
- Summary: Neutralized color palette to modern neutral theme, updated fonts to Inter/system fonts, removed non-essential Vui components, cleaned Configurator and unused examples, removed template config files
- Reason: Complete the systematic template stripping process
- Notes: Build verified successful, removed 5 Vui components, Configurator, Icons, Charts, Cards, Timeline, Tables, Lists, Items directories. Kept essential VuiBox, VuiTypography, VuiButton, VuiInput, VuiProgress

## [2025-01-14 03:15] Documentation and final verification
- Files: README.md, CONTRIBUTING.md, build verification
- Summary: Replaced README.md with neutral OverDue Dashboard content, created CONTRIBUTING.md with development guidelines, verified build and dev server functionality
- Reason: Complete the template neutralization with proper documentation
- Notes: Application builds successfully and runs in development mode with clean welcome dashboard

## [2025-01-14 02:50] Template demo pages and assets removal
- Files: src/layouts/*, src/assets/images/, src/layouts/dashboard/index.js
- Summary: Deleted unused layout directories (tables, billing, rtl, profile, authentication), removed branded asset images, simplified dashboard to welcome message
- Reason: Remove all template demo content and excessive visual assets
- Notes: Dashboard now shows clean welcome message with next steps, all demo charts/widgets removed

## [2025-01-14 02:45] Initial source code cleanup and routing simplification
- Files: src/App.js, src/routes.js, src/index.js
- Summary: Removed copyright headers from core files, simplified routes to only Dashboard, updated branding to "OverDue Dashboard"
- Reason: Begin systematic removal of template branding from source code
- Notes: Removed demo routes (Tables, Billing, RTL, Profile, Auth), 180+ files still need header cleanup

## [2025-01-14 02:38] Public assets and manifest cleanup
- Files: public/index.html, public/manifest.json, public/favicon.ico, public/apple-icon.png
- Summary: Updated HTML title to "OverDue Dashboard", removed Creative Tim copyright header, neutralized manifest branding
- Reason: Remove all template branding from public-facing assets
- Notes: Switched to Inter font, created placeholder favicon, removed leaflet CSS dependency

## [2025-01-14 02:35] Package metadata cleanup
- Files: package.json
- Summary: Updated name to "overdue-dashboard", version to "1.0.0", author to "Aki", license to "MIT", neutralized description
- Reason: Remove all Creative Tim branding and URLs from package metadata
- Notes: Added serve dependency, cleaned scripts to dev/build/preview/test/lint

## [2025-01-14 02:32] Branch creation and repository setup
- Files: .git/, CHANGELOG.md
- Summary: Created chore/template-stripping branch and initialized CHANGELOG.md structure  
- Reason: Safety branch for template cleanup process
- Notes: Starting point for systematic template removal

---

# Next Steps

The template stripping process is complete. The OverDue Dashboard foundation is now ready for custom development. Here are the recommended next steps:

## Phase 1: Authentication Infrastructure
- **Add AWS Cognito integration** - Set up user authentication and registration
- **Implement protected routes** - Secure dashboard areas behind authentication
- **Create user profile management** - Basic user settings and account management

## Phase 2: API and Data Layer
- **Set up API scaffold** - Design RESTful API structure for data operations
- **Configure database connection** - Choose and integrate database solution (DynamoDB for AWS Free Tier)
- **Implement data models** - Define schemas for tasks, grades, and notes

## Phase 3: Core Feature Development
- **Add task management features** - Create, edit, complete, and organize tasks
- **Implement grade tracking** - Input, calculate, and display academic progress
- **Build note-taking capabilities** - Rich text editor with organization and search
- **Create data synchronization** - Ensure real-time updates across features

## Phase 4: Polish and Deployment
- **AWS Free Tier deployment** - Set up hosting infrastructure
- **Performance optimization** - Code splitting, lazy loading, caching strategies
- **Mobile responsiveness** - Ensure full functionality on all device sizes
- **Testing coverage** - Unit tests, integration tests, and E2E testing

## [2025-10-14 04:28] WidgetFrame replaced with card UI and drag handle
- Files: src/features/dashboard/WidgetFrame.js
- Summary: Replaced widget frame with a solid card (rounded, bordered, dark background), added a clear ≡ drag handle and a Remove button in the header.
- Reason: Improve widget clarity and provide explicit handle for dragging without interfering with content.
- Notes: Uses react-grid-layout's ".react-grid-dragHandle" for handle-only dragging; inline styles maintain dark theme without Tailwind.

## [2025-10-14 04:28] DashboardGrid improved: sizing, compaction, persistence
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Set rowHeight=36, enforced minW/minH, enabled vertical compacting, preserved layout to localStorage (od:layout:v1), and restricted dragging to handle.
- Reason: Make drag/resize behavior predictable and persistent.
- Notes: react-grid-layout and react-resizable CSS are imported here (single location). Added "Add Widget" buttons.

## [2025-10-14 04:28] Widget registry added
- Files: src/features/dashboard/widgets/registry.js
- Summary: Centralized widget defaults (size/title) and renderers (quick, upcoming, scratch) so new widgets can be added from one place.
- Reason: Simplify adding widgets and keep defaults coherent.
- Notes: Scratch Pad uses a styled textarea; registry consumed by DashboardGrid add flow.

## [2025-10-14 04:28] Subtle grid background utility added
- Files: src/index.css, src/index.js
- Summary: Added .grid-bg utility for a checker background and imported global CSS so grid placement is visually obvious.
- Reason: Provide spatial cues for positioning and resizing widgets.
- Notes: Applied to the grid container in DashboardGrid; no additional dependencies required.

## [2025-10-14 04:34] Make widget area fill from header to bottom and grow with content
- Files: src/pages/Dashboard.js, src/features/dashboard/DashboardGrid.js
- Summary: Converted the dashboard page to a flex column layout where the grid container flexes to fill remaining viewport height; grid wrapper now flex:1 with minHeight:0 so it stretches to the bottom and expands as widgets are added.
- Reason: Ensure the dedicated widget space uses the entire page below the header and increases naturally as content grows.
- Notes: Top header unchanged; no visual regressions. react-grid-layout still controls internal height based on rows; wrapper guarantees full-page area.

## [2025-10-14 04:40] Fix new widgets starting too small by seeding layouts across breakpoints
- Files: src/features/dashboard/DashboardGrid.js
- Summary: When adding a widget, insert its layout into all breakpoints with reasonable defaults (using widgetDefaults and cols) and update layouts before rendering items to avoid a 1x1 fallback.
- Reason: ResponsiveGridLayout would briefly infer missing keys as 1x1 causing tiny widgets; seeding prevents the race and ensures default size.
- Notes: Centralized COLS and BREAKPOINTS constants to reuse for both layout prop and default seeding.

## [2025-10-14 04:43] Persist reasonable sizes across refresh by normalizing layouts
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Added normalizeLayouts() to ensure all breakpoints contain entries for every widget with sane defaults. Applied during initial load and on every save, and defaultLayouts now seeds all breakpoints.
- Reason: On refresh, missing breakpoint arrays caused RGL to fallback to 1x1; normalization prevents the fallback by seeding sizes in all breakpoints.
- Notes: Parses kind from id (e.g., "quick-abc") to derive defaults when needed.

## [2025-10-14 04:47] Persist widgets (ids/kinds) and clamp saved sizes to min constraints
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Added od:items:v1 persistence and restored items from storage or layouts. normalizeLayouts now clamps w/h to at least minW/minH (default 3x3) and to widget defaults when missing.
- Reason: After refresh, missing items and too-small persisted sizes caused tiny widgets; persisting items and clamping dimensions fixes it.
- Notes: addWidget/removeItem now persist items; initial items derived from saved layouts when present.

## [2025-10-14 04:50] Elegant dark scrollbar for widgets
- Files: src/index.css, src/features/dashboard/WidgetFrame.js, src/features/dashboard/widgets/registry.js
- Summary: Implemented a slim, rounded, gradient scrollbar (with hover) and applied it to widget content areas and the scratch pad textarea.
- Reason: Improve aesthetics and match the dark theme.
- Notes: Works in Chrome/Edge/Safari via ::-webkit-scrollbar and Firefox via scrollbar-* properties.

## [2025-10-14 20:25] Switch to minimal overlay-style, auto-hide scrollbar
- Files: src/index.css
- Summary: Updated .nice-scroll to hide by default and appear on hover (thin, pill thumb) for a macOS-like overlay effect.
- Reason: Further polish per request; reduce visual noise until user interacts with scroll areas.
- Notes: Firefox uses scrollbar-width: none->thin on hover; WebKit uses transparent thumb until hover. Easy to revert by restoring the previous CSS block.

## [2025-10-14 20:28] Distribute new widgets uniformly across columns
- Files: src/features/dashboard/DashboardGrid.js
- Summary: New widgets now pick an x based on a simple per-row slot calculation (computeX) so they spread left-to-right across the available columns instead of stacking in the first column.
- Reason: Improve initial placement for a more balanced grid.
- Notes: Respects each breakpoint’s column count and the widget’s default width.

## [2025-10-14 20:32] Adjust initial widget placement logic to fill rows left-to-right at the top
- Files: src/features/dashboard/DashboardGrid.js
- Summary: New widgets compute position from current visible count per breakpoint; they start at the top row, fill left-to-right, then wrap to the next row. RGL handles collisions/compaction.
- Reason: Ensure efficient use of space: first widget top-left, second to its right, then wrap to a new row.
- Notes: Existing layouts unaffected; respects widget width and breakpoint cols.

## [2025-10-14 21:28] Extend widget registry and defaults; export WIDGET_KINDS
- Files: src/features/dashboard/widgets/registry.js
- Summary: Added new kinds (tasks, calendar, quickNote, gpa, aiQueue) with defaults and a central WIDGET_KINDS array for menus.
- Reason: Introduce real widgets and a single source of truth for menu options.
- Notes: Kept legacy kinds (quick, upcoming, scratch) for backward compatibility.

## [2025-10-14 21:28] Local data layer with seeding and CRUD (localStorage)
- Files: src/features/data/local.js
- Summary: Implemented simple CRUD helpers for tasks, notes, grades, and AI jobs. Seeds sample data if empty.
- Reason: Enable widgets to function without external services.
- Notes: Uses keys od:tasks, od:notes, od:grades, od:aijobs; includes convenience helpers for date filters.

## [2025-10-14 21:28] TasksWidget
- Files: src/features/dashboard/widgets/TasksWidget.js
- Summary: Shows tasks due in 7 days, supports checkbox toggle and quick add (title + due date). Listens to calendar filter events.
- Reason: Provide actionable task list in the dashboard.
- Notes: Persists via local data layer; includes accessible labels and focus styles.

## [2025-10-14 21:28] CalendarWidget
- Files: src/features/dashboard/widgets/CalendarWidget.js
- Summary: Lightweight month view with markers for dates having tasks; clicking a day emits od:filterDate to filter tasks.
- Reason: Offer quick temporal navigation for tasks.
- Notes: Minimal grid UI; no heavy dependencies.

## [2025-10-14 21:28] QuickNoteWidget
- Files: src/features/dashboard/widgets/QuickNoteWidget.js
- Summary: Create quick notes (title/body) and show last 3 notes; link to /notes.
- Reason: Fast capture from dashboard.
- Notes: Persists immediately; simple inputs with focus ring for accessibility.

## [2025-10-14 21:28] GpaWidget
- Files: src/features/dashboard/widgets/GpaWidget.js
- Summary: Computes weighted average and displays a GPA-like number; shows CTA when empty.
- Reason: Snapshot of academic standing.
- Notes: Uses sample grades; converts percent to GPA-ish by /25 for demo.

## [2025-10-14 21:28] AiQueueWidget
- Files: src/features/dashboard/widgets/AiQueueWidget.js
- Summary: Shows last 5 AI jobs with status chips; link to /assistant.
- Reason: Visibility into assistant tasks.
- Notes: Uses local data layer; simple chip styling.

## [2025-10-14 21:28] Update grid Add Widget control to dropdown using WIDGET_KINDS
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Replaced three fixed buttons with a select + Add button fed by WIDGET_KINDS.
- Reason: Centralize available widgets and make the grid extensible.
- Notes: Preserves accessibility (labels, aria attributes).

## [2025-10-14 21:40] Add resetSampleData, updateTask; enhance TasksWidget with edit modal and bulk complete
- Files: src/features/data/local.js, src/features/dashboard/widgets/TasksWidget.js
- Summary: Refactored seed into seedAll() and exported resetSampleData() to wipe and reseed. Added updateTask(). In TasksWidget, added "Complete all", a dev-friendly "Reset" action, and an edit modal for title/due.
- Reason: Improve productivity and allow quick demos with fresh data; allow editing without leaving the dashboard.
- Notes: All actions persist to localStorage; accessible controls and dialog semantics included.

## [2025-10-14 21:40] Per-breakpoint widget size defaults
- Files: src/features/dashboard/widgets/registry.js, src/features/dashboard/DashboardGrid.js
- Summary: Introduced optional sizes per breakpoint in registry and updated default/add logic to use sizes[bp] with clamping.
- Reason: Better initial layout across responsive breakpoints.
- Notes: Falls back to w when a breakpoint size is not specified.

## [2025-10-14 21:49] Snap sizes and Auto-Arrange to eliminate gaps
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Added snapSize to normalize w/h to allowed sets and hooked into onResizeStop, addWidget, and a one-time migration. Implemented packTight skyline packer and an "Auto-Arrange" button to tighten layouts.
- Reason: Prevent odd fractional sizes and reduce visual gaps for a cleaner grid.
- Notes: Kept compactType="vertical" and preventCollision={false}; migration snaps existing stored sizes without moving items unless Auto-Arrange is triggered.

## [2025-10-14 21:49] Update widget defaults for cleaner grid
- Files: src/features/dashboard/widgets/registry.js
- Summary: Set defaults per request (Calendar 6x6, AI Queue 6x4, GPA 3x3, Tasks 6x6, Quick Stats 3x3, Quick Note 3x4) and retained per-breakpoint sizes.
- Reason: Harmonize widget footprints with packing algorithm.
- Notes: Existing layouts remain; new adds use snapped defaults.

## [2025-10-14 21:58] Fix white screen due to missing ITEMS_KEY constant
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Reintroduced ITEMS_KEY = "od:items:v1" after refactor so items persistence works at runtime.
- Reason: Prevent ReferenceError causing the app to crash on mount.
- Notes: No behavior changes beyond restoring expected localStorage usage.

## [2025-10-14 22:02] Replace native select with custom dropdown menu
- Files: src/features/dashboard/DashboardGrid.js
- Summary: Implemented an accessible custom dropdown (button + popover listbox) for selecting widget types; supports mouse and keyboard, outside-click/Escape to close, and dark styling.
- Reason: Improve aesthetics and UX over the default browser select.
- Notes: No new dependencies; uses inline styles and existing .nice-scroll for the menu.

## [2025-10-14 23:18] Calendar foundation (local, dependency-free fallback week view)
- Files: src/pages/Calendar.js, src/features/calendar/{CalendarPage.js,CalendarHeader.js,CalendarView.js,CalendarSidebar.js,EventComposer.js,useCalendarStore.js,types.js}
- Summary: Implemented a full Calendar page with a Google Calendar-like week grid (custom fallback) plus productivity features: quick-add (naive NL parse), time-blocking for tasks, focus block shortcuts, basic composer modal, and smart slot suggestions using a skyline-like scan. All data persists to localStorage (od:cal:events).
- Reason: Provide a working Calendar experience without adding new packages, keeping the build green; can later switch to react-big-calendar/date-fns when desired.
- Notes: Features implemented now: create/edit via composer, quick-add, scheduling buttons, simple legend, week grid with hour lines, click-to-add (double-click), click event to edit, keyboard shortcuts (N/T/M/W/A/←/→). Future: wire DnD, advanced RRULE, chrono-node parse, ICS export.

## [2025-10-14 23:36] Make Calendar fully functional with local store and UI wiring
- Files: src/features/calendar/{CalendarView.js,CalendarSidebar.js,CalendarPage.js}
- Summary: Wired filters, focus mode (day/week views), quick-add to store, scheduling buttons to add time blocks, and interactive slot/event editing. Calendar height now fills viewport; filters hide/show types live and state persists across interaction.
- Reason: The initial UI existed but interactions weren’t connected; this connects the page-level state and store to make the Calendar usable end-to-end.
- Notes: Verification: double-click empty slot opens composer; clicking event opens edit; quick-add creates an event; sidebar Focus buttons and Task schedule create blocks; filters work; focus mode toggles to Day view; data persists (localStorage).

## [2025-10-14 23:47] Replace Calendar with minimal Google Calendar embed
- Files: src/features/calendar/CalendarPage.js (replaced), .env.example (added)
- Summary: Removed custom calendar UI in favor of a lightweight Google Calendar embed. Reads URL from env (REACT_APP_GCAL_EMBED_URL or VITE_GCAL_EMBED_URL), auto-appends timezone (ctz). Shows an instruction panel when URL is missing.
- Reason: Provide a reliable, low‑maintenance calendar view that mirrors Google Calendar while keeping build simple.
- Notes: Route stays the same (/calendar). If we later reintroduce a custom calendar, we can restore previous files. Optional deps (react-big-calendar, chrono-node, rrule, ics) were not installed in this repo, so no removal needed. Verification: without env → instructions; with valid embed URL → iframe renders, height calc(100vh - 160px), no console errors.

## [2025-10-15 00:02] Add user's Google Calendar embed URL as fallback and 'Open in Google Calendar' button
- Files: src/features/calendar/CalendarPage.js
- Summary: Added a fallback embed URL (provided by user) used when env vars are missing; added a header button to open the calendar in a new tab.
- Reason: Convenience; works out-of-the-box and offers quick access to the Google Calendar site.
- Notes: You can still override with REACT_APP_GCAL_EMBED_URL/VITE_GCAL_EMBED_URL in .env.

## [2025-10-15 00:19] Calendar embed store
- Files: src/features/calendar/useCalendarEmbed.js
- Summary: Added localStorage-backed helpers to get/set the embed URL and to append params (ensuring timezone ctz).
- Reason: Persist user-provided embed link and allow mode toggling without hardcoding.
- Notes: Uses REACT_APP_GCAL_EMBED_URL/VITE_GCAL_EMBED_URL as a fallback; then adds ctz param.

## [2025-10-15 00:19] Calendar page controls + settings modal
- Files: src/features/calendar/CalendarPage.js, src/features/calendar/CalendarSettingsModal.js
- Summary: Added Week/Month/Agenda toggle (mode=...), “Open in Google Calendar” button, and a Settings modal to update the embed URL in-app.
- Reason: Improve UX and configurability without leaving the app.
- Notes: The iframe keeps height calc(100vh - 160px). If ?mode= is present in URL, it becomes the default.

## [2025-10-15 00:19] Dashboard widget: Calendar Peek
- Files: src/features/calendar/CalendarPeekWidget.js, src/features/dashboard/widgets/registry.js
- Summary: Small widget showing current month and an “Open Calendar →” link to /calendar?mode=week. Registered with default size 3x3.
- Reason: Quick access to Calendar from dashboard.
- Notes: Added calendarPeek to widget registry and defaults.

## [2025-10-15 00:28] Remove legacy calendar widgets from dashboard
- Files: src/features/dashboard/widgets/registry.js (cleanup)
- Summary: Removed "calendar" and "calendarPeek" widget kinds and their menu options; deprecated CalendarPeekWidget file remains unreferenced.
- Reason: Consolidate to a single Google Calendar widget.
- Notes: No user-facing breakage; old widgets are no longer offered nor rendered.

## [2025-10-15 00:28] Add Google Calendar (Week) dashboard widget
- Files: src/features/dashboard/widgets/GCalWidget.js, src/features/dashboard/widgets/registry.js
- Summary: New widget renders the Google Calendar embed in Week view inside a resizable card; CTA appears when no embed URL is configured.
- Reason: Provide at-a-glance calendar access directly from the dashboard, aligned with the page embed.
- Notes: Default size 6x6 (compatible with grid snapping). The card includes a link to open /calendar?mode=week.

## [2025-10-15 01:20] Notes types + store
- Files: src/features/notes/types.js, src/features/notes/store.js
- Summary: Added Note model and a localStorage-backed store (list/get/listByCourse/create/update/remove/seedIfEmpty) under key od:notes:guest with demo notes.
- Reason: Provide a single source of truth for the Notes feature, API-ready later.
- Notes: Seed creates 3 notes across 2 courses.

## [2025-10-15 01:20] Notes list panel
- Files: src/features/notes/NoteList.js
- Summary: Implemented “My Classes” sidebar with search, collapsible course groups (state persisted), and active note highlighting.
- Reason: Match the mock’s left column and improve navigation.
- Notes: Dark theme (rounded-2xl, borders, subtle hover) matching other pages.

## [2025-10-15 01:20] Note editor
- Files: src/features/notes/NoteEditor.js
- Summary: Title + markdown textarea, icons (Undo/Redo/History/Save), debounced autosave (500ms), history drawer (last 10), and saved timestamp.
- Reason: Core editing experience aligned to the mock.
- Notes: Local undo/redo stacks (20+ interactions), dark theme styling.

## [2025-10-15 01:20] Notes chat (stub)
- Files: src/features/notes/NotesChat.js
- Summary: Right chat panel with AI/user bubbles and input; stubbed response (no API).
- Reason: Complete the 3-column layout per mock while staying offline-friendly.
- Notes: Dark theme bubbles; echoes a canned reply.

## [2025-10-15 01:20] Hotkeys + routing
- Files: src/features/notes/useNotesHotkeys.js, src/pages/Notes.js
- Summary: Added shortcut hook (Cmd/Ctrl+S/K/B/I) scaffolding and wired the Notes route to render the new page.
- Reason: Productivity and keyboard support.
- Notes: The page respects ?id=<noteId> and selects the note accordingly; responsive layout collapses chat below 1280px.

## [2025-10-16 00:15] Notes layout density + full-height grid
- Files: src/features/notes/NotesPage.js
- Summary: Removed the H1 title, tightened outer paddings, and switched to a full-viewport grid (height calc(100vh - 80px)).
- Reason: Reclaim vertical space and make the page feel roomier.
- Notes: Grid columns now use CSS var --notesSidebar for left width.

## [2025-10-16 00:15] Resizable sidebar with persisted width
- Files: src/features/notes/NotesPage.js
- Summary: Added an east-side drag handle; width stored in od:notes:sidebarW and applied via --notesSidebar.
- Reason: Improve ergonomics by letting users adjust the list width.
- Notes: Bounds 240–520px; persists across reloads.

## [2025-10-16 00:15] Sticky editor toolbar + full-height editor
- Files: src/features/notes/NoteEditor.js
- Summary: Made the action bar sticky with subtle backdrop and border; editor column fills height; content area scrolls.
- Reason: Keep actions visible while editing long notes.
- Notes: Compact paddings for better density.

## [2025-10-16 00:15] Collapsible chat panel with persisted state
- Files: src/features/notes/NotesPage.js
- Summary: Added chat toggle (“Show/Hide Chat”); state stored in od:notes:chatOpen and applied to grid width.
- Reason: Allow focusing on editing area when chat isn’t needed.
- Notes: Panel hides completely when closed; no space taken.

## [2025-10-16 00:26] Design tokens and typography
- Files: src/styles/tokens.css, src/index.css
- Summary: Introduced a small type/token system (fonts, text scales, panel colors, radii) and imported globally.
- Reason: Unify typography and panel styling across the Notes page.
- Notes: Uses system stack/Inter if available; no impact on other pages beyond consistent base font.

## [2025-10-16 00:26] UI primitives (Buttons, IconButton, Menu)
- Files: src/components/ui/{Button.js,IconButton.js,Menu.js}
- Summary: Added reusable UI primitives for consistent styles and interactions; used throughout Notes.
- Reason: Remove inconsistent inline buttons and unify look/feel.
- Notes: Minimal, dependency-free menu implementation with outside-click close.

## [2025-10-16 00:15] Compact list density + hover actions
- Files: src/features/notes/NoteList.js
- Summary: Reduced vertical gaps and paddings; left only + New Class and + New Note in the top row; tuned row styling.
- Reason: Improve information density without feeling cramped.
- Notes: Hover actions (rename/delete) remain visible as buttons; can refine to true hover-only later.

## [2025-10-15 01:33] Notes hierarchy + CRUD
- Files: src/features/notes/types.js, src/features/notes/store.js, src/features/notes/NoteList.js, src/features/notes/NoteEditor.js
- Summary: Implemented Classes → Chapters → Notes structure with full CRUD, inline note rename, note delete, and move between Class/Chapter. Added class/chapter create/rename/delete actions in the sidebar.
- Reason: Bring the Notes UI to parity with the requested hierarchy and actions.
- Notes: Migration from legacy single-list notes to classes runs on first load. URL filters (?class, ?chapter) are updated when clicking headers; data persists across reload. Verification: create/rename/delete class/chapter/note; move note across class/chapter; search filters list; ?id works.

## [2025-10-15 00:35] Unify fallback embed URL so widget detects it too
- Files: src/features/calendar/useCalendarEmbed.js
- Summary: Added the same fallback embed URL (provided by user) to getEmbedUrl so both the calendar page and dashboard widget resolve it when no env/local setting is present.
- Reason: The page had a fallback but the widget read from the embed store; this aligns behavior and removes the “No URL configured” message.
- Notes: You can still override via Settings or .env; ctz param is ensured.

## [2025-10-15 00:02] Remove old calendar implementation (deprecated stubs)
- Files: src/features/calendar/{CalendarHeader.js,CalendarView.js,CalendarSidebar.js,EventComposer.js,useCalendarStore.js,types.js}
- Summary: Replaced contents with minimal stubs and removed all imports/usages so they are effectively deleted from the app.
- Reason: Code cleanup to avoid confusion and reduce maintenance surface.
- Notes: Files are no longer imported; safe to delete physically if desired. Build remains green.

## [2025-10-15 00:16] TODO: Google OAuth + Calendar API overlay (do not implement yet)
- Files: (planning only)
- Summary: Integrate Google OAuth and Calendar API to fetch events as a secondary source; render as a toggleable overlay layer on top of the embed.
- Reason: Allow richer interactions (read-only at first), enable filtering and merging with local widgets.
- Notes: Scope: OAuth flow, token storage, Calendar list fetch, events list for visible range, overlay rendering, on/off toggle.

## [2025-10-15 00:16] TODO: Multiple Calendar embeds (do not implement yet)
- Files: (planning only)
- Summary: Support multiple embed URLs persisted in settings; add dropdown to switch active calendar.
- Reason: Users with personal/academic/work calendars can switch contexts easily.
- Notes: Scope: settings store for multiple URLs, UI dropdown, remember last selection.

## [2025-10-16 00:45] Packages for Notes refresh
- Files: package.json, package-lock.json
- Summary: Installed Radix UI (dropdown, dialog, context-menu), @tanstack/react-virtual, react-markdown, remark-gfm, and @fontsource/inter.
- Reason: Foundations for accessible menus/dialogs, performant lists, and markdown preview.
- Notes: Used --legacy-peer-deps to resolve peer conflicts; no runtime changes yet.

## [2025-10-16 00:48] Notes reset: new structure and components
- Files: src/features/notes/{NotesPage.js,SidebarTree.js,Editor.js,ChatPanel.js,components/{Kebab.js,Confirm.js,InlineRename.js,MoveNote.js}}
- Summary: Replaced previous Notes implementation with a fresh, accessible design using Radix primitives and a clean file structure. Kept the existing localStorage store.
- Reason: Resolve visual inconsistencies and cramped UI; establish a maintainable foundation.
- Notes: Routes unchanged; old NoteList/NoteEditor/NotesChat are no longer imported.

## [2025-10-16 00:49] Notes design tokens (scoped)
- Files: src/styles/notes.tokens.css
- Summary: Added Notes-specific CSS variables (radii, panel, borders, rail, shadows, font stacks, typography) and imported only on the Notes page.
- Reason: Unify styling for Notes without affecting other pages.
- Notes: Optional Inter font loaded locally via @fontsource/inter.

## [2025-10-16 00:50] Notes layout: full-height grid, resizable sidebar, collapsible chat
- Files: src/features/notes/NotesPage.js
- Summary: Implemented 3-column grid (sidebar • editor • chat) with height calc(100vh - 80px). Sidebar resizes (persist od:notes:sidebarW), chat toggles (persist od:notes:chatOpen).
- Reason: Improve ergonomics and persistence of user preferences.
- Notes: Tokens applied; no overlap; chat content unmounts when closed.

## [2025-10-16 00:55] Sidebar interactions + accessibility
- Files: src/features/notes/SidebarTree.js, src/features/notes/components/{Kebab.js,Confirm.js,InlineRename.js,MoveNote.js}
- Summary: Added Radix menus and dialog, inline rename, move note dialog, persisted collapse state (od:notes:collapsed), and keyboard navigation (↑/↓, ←/→, Enter, F2, Delete).
- Reason: Calm, efficient navigation with full keyboard support.
- Notes: Selected rows show a thin left rail and subtle background; counts displayed; long titles truncate.

## [2025-10-16 01:00] Editor preview + autosave
- Files: src/features/notes/Editor.js
- Summary: Sticky toolbar, class/chapter selects, preview with react-markdown + remark-gfm, autosave after 500ms idle, Save button and "Saved ✓" toast, footer timestamp.
- Reason: Comfortable editing with immediate feedback and markdown support.
- Notes: Textarea uses monospace font; toolbar controls never overlap at ≥1280px.

## [2025-10-16 01:05] Verification (Notes)
- Files: (manual QA)
- Summary: Verified layout fills viewport; sidebar resizes and persists; chat toggles and persists; CRUD for Class/Chapter/Note works with confirmations; inline rename Enter/Esc; keyboard navigation; autosave updates updatedAt and footer; truncation works; no console errors.
- Reason: Ensure the feature meets UX and stability requirements.
- Notes: Right-click context menu is reserved for a later pass using @radix-ui/react-context-menu.

## [2025-10-16 01:06] Remove Inter variable font import (fallback to system)
- Files: src/features/notes/NotesPage.js
- Summary: Dropped import of '@fontsource/inter/variable.css' to fix module resolution build error.
- Reason: Optional font; keep build green using system stack if Inter is unavailable.
- Notes: To enable Inter later, install and import '@fontsource/inter' or specific weights (e.g., '@fontsource/inter/400.css', '/600.css').

## [2025-10-16 01:27] Add TS + motion + icons for Notes middle-pane
- Files: tsconfig.json, package.json (deps), src/components/ui/IconGhostButton.tsx, src/features/notes/NotesPage.tsx, src/features/notes/middle/{NotePreviewList.tsx,NotePreviewCard.tsx,FocusEditor.tsx,EditorHeader.tsx,useNoteViewState.ts}
- Summary: Implemented Preview list and Focus Editor per spec with framer-motion transitions and Radix icon-only header; state persists per class; chat auto-hides in editor.
- Reason: Deliver the clean previews→editor experience without touching left/right panels.
- Notes: New deps: @radix-ui/react-icons, framer-motion, typescript/@types. Left sidebar unchanged.

## [2025-10-16 01:28] Remove jsconfig.json for CRA TypeScript
- Files: jsconfig.json (removed), src/index.js, src/App.js, src/assets/theme/index.js, src/assets/theme/base/{borders.js,boxShadows.js,typography.js}, src/assets/theme/functions/{boxShadow.js,rgba.js}, src/routes.js
- Summary: Deleted jsconfig.json to satisfy CRA when using tsconfig.json; fixed imports to be relative (./App, ./context, ./assets/theme/*, ./routes, ./pages/*).
- Reason: CRA requires either JS or TS config, not both; baseUrl alias removed.
- Notes: App boot now resolves correctly.
