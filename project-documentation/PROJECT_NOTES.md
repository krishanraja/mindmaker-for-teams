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

## MASTER INSTRUCTIONS Compliance Status

### ✅ WORLD-CLASS (Fully Compliant)

| Standard | Implementation |
|----------|----------------|
| AI Fallback Chain | 3-tier: OpenAI → Lovable → Gemini RAG with 5s timeouts |
| Error Boundaries | React ErrorBoundary with structured logging |
| Retry Logic | Exponential backoff (1s, 2s, 4s), max 3 retries |
| CORS Handling | All edge functions have corsHeaders + OPTIONS |
| LLM Logging | Provider, model, tokens, timestamp logged |
| Edge Function Errors | Specific error codes (RATE_LIMIT, PAYMENT_REQUIRED) |
| Fallback Data | Sensible defaults on parse/API failures |
| Structured Logging | `src/lib/logger.ts` with session/trace IDs |
| API Response Types | `src/types/api-response.ts` with helpers |

### ⚠️ IN PROGRESS

| Item | Status |
|------|--------|
| Logger integration | Integrated in hooks, error-boundary |
| Session tracing | Available via `getSessionId()` |
| Edge function format | Partial - needs standardization |

### 📋 BACKLOG

| Item | Priority |
|------|----------|
| Unit tests for utilities | MEDIUM |
| Performance logging | LOW |
| Pre-deploy automation | LOW |

---

## Known Technical Debt

1. **Edge function logging format**: Mixed formats, should standardize
2. **Missing unit tests**: No testing infrastructure currently in place
3. **Some hooks inconsistent**: Most now use logger, but some older hooks don't

---

## Upcoming Considerations

- [ ] Add unit testing infrastructure (Vitest recommended)
- [ ] Standardize edge function logging format
- [ ] Add performance metrics for critical paths
