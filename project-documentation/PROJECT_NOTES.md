# PROJECT NOTES: MindMaker Leaders

Running decisions log and architectural state for the MindMaker Leaders platform.

---

## Current Architectural State

### Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom design tokens
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6

### Project ID
- Supabase: `bkyuxvschuwngtcdhsyg`

---

## Key Decisions Log

### 2024-12-09: Branding Update
- **Decision**: Updated logo and favicon to new green-themed assets
- **Files affected**: `public/lovable-uploads/mindmaker-logo-green.png`, `public/lovable-uploads/mindmaker-favicon-green.png`
- **Rationale**: Brand refresh for MindMaker Leaders identity

### 2024-12-09: MASTER INSTRUCTIONS Compliance
- **Decision**: Implemented full compliance with MASTER INSTRUCTIONS for vibe-coded projects
- **Files created**: 
  - `project-documentation/MASTER_INSTRUCTIONS.md`
  - `project-documentation/PROJECT_NOTES.md`
  - `CHANGELOG.md`
  - `DEPLOY_CHECKLIST.md`
  - `src/types/api-response.ts`
  - `src/lib/logger.ts`
- **Rationale**: Ensure consistent quality, debugging, and maintainability standards

---

## Current Constraints & Invariants

### Database
- All user-related data anchored to `profile_id` or `user_id`
- Workshop data linked via `workshop_session_id`
- All tables have RLS policies enabled

### Edge Functions
- All edge functions in `supabase/functions/`
- JWT verification disabled for public endpoints (configured in `config.toml`)
- CORS headers required for all web-accessible functions

### Design System
- Colors defined as HSL in `src/index.css`
- All components use semantic tokens (never raw hex/rgb)
- Responsive breakpoints: mobile-first approach

### Assets
- Brand assets in `public/lovable-uploads/`
- Never overwrite uploaded assets with generated ones
- Preserve aspect ratios at all times

---

## Active Features

1. **Facilitator Dashboard**: Workshop management and segment navigation
2. **Mobile Flows**: Pre-workshop, bottleneck submission, effortless map, dot voting
3. **AI Insights**: LLM-powered analysis across workshop segments
4. **QR Code Generation**: Activity session management
5. **Executive Reporting**: Provocation report and PDF generation

---

## Known Technical Debt

1. **Inconsistent async return types**: Some functions return raw data, others return `{ data, error }`
2. **Missing unit tests**: No testing infrastructure currently in place
3. **Logging format**: Mixed formats across edge functions
4. **Session tracing**: No consistent trace IDs for debugging chains

---

## Upcoming Considerations

- [ ] Standardize all async returns to `ApiResponse<T>` type
- [ ] Add session/trace ID generation for debugging
- [ ] Implement basic unit testing for utilities
- [ ] Add performance logging for critical paths
