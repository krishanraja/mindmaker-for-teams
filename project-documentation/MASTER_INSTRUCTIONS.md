# MASTER INSTRUCTIONS: VIBE-CODED PROJECTS

## 0. PURPOSE

This project must behave like a world-class engineer, UX designer, and operator in one:

- Fix issues first time, not via endless trial-and-error.
- Model the entire pipeline, not single functions.
- Produce 10/10 diagnostics and logging before edits.
- Never break working flows or overwrite real assets.
- Stay general enough to work for any codebase in Lovable.

---

## 1. GLOBAL RULES OF ENGAGEMENT

### No edits before scope
- Always do a scope pass first: map the pipeline, list all related files, and call sites.
- Output a short plan before changing code.

### No unverified assumptions
- If something is unclear, log it, inspect it, or surface it to the user instead of guessing.

### No silent breakages
- Any failure must be visible in logs, UI, or both.
- Never swallow errors. Wrap them with context and rethrow or return a safe, flagged result.

### No asset vandalism
- Never overwrite real images, logos, fonts or brand files with generated ones.
- Never resize or crop assets unless explicitly instructed. If you must, preserve aspect ratio.

### No "probably fixed" outcomes
Every fix must be proven through:
- logs,
- screenshots / screen recordings, or
- clearly verifiable behavior in the UI.

---

## 2. THINK IN SYSTEMS, NOT SINGLE BUGS

### 2.1 Model the pipeline end-to-end

For any feature or error, always map:
- **Trigger**: what starts the flow (click, route change, cron, webhook, etc).
- **Frontend path(s)**: components, hooks, global state, routing.
- **Network layer**: edge functions / APIs, request/response shapes.
- **Business logic**: orchestrators, helpers, compute_ functions, branching logic.
- **Data**: DB queries, inserts, updates, external APIs.
- **Aggregation & UI**: how everything is stitched together and rendered.

**Deliverable**: A short call graph: `Trigger → Component → Hook/Util → API → Orchestrator → DB/External → Aggregator → UI`.

### 2.2 Enumerate all failure points

For each step in the flow, enumerate:
- What can be null, undefined, empty array, or empty object?
- What can throw? (network, schema mismatch, parsing, LLM failure, rate limit, missing env)
- What can be out of date vs deployed code?

Guard all of these:
- Strong type checks where possible.
- Runtime defensive checks where necessary.
- Default values and fallbacks for every branch.

### 2.3 Anti-fragile design rules

Every function that participates in a user-facing flow must:
- Accept defined, well-typed inputs (or validate and fail fast with clear errors).
- Return a predictable shape, even on failure: `{ success: false, error: "...", fallbackUsed: true }`
- Have safe defaults for empty lists, missing sub-fields, partial records.
- Never assume downstream objects are populated. Always use safe access and guard clauses.

---

## 3. DATA & CONTEXT PRINCIPLES

### 3.1 Profiles as the anchor
- Anchor all meaningful data off stable IDs: `profile_id`, `organization_id`, `session_id`.
- Any event, insight, or output should link back to at least: `profile_id`, `session_id`, `tool/flow name`.
- Never create duplicate profiles if you can match on stable keys (e.g. email + name).
- Prefer "lookup then upsert", not blind insert.

### 3.2 Events, not blobs
For any interaction, store a raw event row with at minimum:
- `id`, `profile_id`, `session_id`, `question_id`, `raw_input`, `structured_values`, `created_at`, `tool_name`

LLM summaries are never the source of truth. Raw input and structured fields are the primary record.

### 3.3 Meaning layer (insights & scores)
For any analysis flow, add an "insights/scores" layer with:
- `profile_id`, `source_event_id`, `dimension_name`, `score`, `label`, `llm_summary`, `context_snapshot`

### 3.4 Context linking across tools
- Always link: `tool_name`, `question_block` or `section`.
- Store question metadata in a separate questions table or config.

### 3.5 Persistence & safety
- Use proper migrations. Avoid ad-hoc shape changes.
- Validate writes: If an insert or update fails, log and surface an error.
- Use foreign keys and constraints. Prefer soft deletes over hard deletes.

---

## 4. LLM BEHAVIOR: DATA → INSIGHT → ACTION

### 4.1 Always read before you think
Any function that calls an LLM should read relevant data first and build a structured context object.

### 4.2 Standard output schema
LLM responses should include: `summary`, `key_actions`, `surprise_or_tension`, `scores`, `data_updates`.

### 4.3 "10/10" quality checks inside prompts
- Is the answer grounded in provided data?
- At least one concrete "do this next" step.
- `surprise_or_tension` must say something non-trivial.

### 4.4 Reuse modes, don't reinvent prompts
Define a small set of LLM "modes": `assessment_analyzer`, `portfolio_analyzer`, `session_synthesizer`.

### 4.5 Guardrails against fluff
- No generic advice. Tie every recommendation to specific data.
- When uncertain, offer scenarios rather than hand-wavy guesses.

---

## 5. FAILURE PATTERNS & HOW TO TREAT THEM

| Pattern | Problem | Approach |
|---------|---------|----------|
| Deployment desync | Dev/preview/production not aligned | Log runtime values, maintain backward-compatible payloads |
| Shallow error diagnosis | Taking error messages at face value | Log payloads at each hop, fix root cause |
| Partial logic updates | Fixing one path, breaking others | Build input→output matrix, verify all paths |
| UX/business blindspots | Technically correct but ruins UX | Walk the flow like a real user |
| Structural layout failures | Tweaking margins when structure is wrong | Think in layers, use consistent spacing |
| Asset mismanagement | Random logos, stretched images | Treat uploaded assets as source of truth |

---

## 6. MASTER DIAGNOSTIC PROTOCOL

### PHASE 1: Scope & mapping
- Search for all related functions, hooks, classNames, env vars.
- Map architecture: `trigger → component → util → API → orchestrator → DB → UI`.
- Capture console errors, network traces, screenshots.

### PHASE 2: Root cause confirmation
- Trace payloads at each step.
- Compare expected schema vs actual payloads.
- Validate file paths, imports, actual files.

### PHASE 3: Implementation plan with checkpoints
- CP0: Plan sanity
- CP1: Environment & config
- CP2: Core fix
- CP3: Secondary impacts
- CP4: Regression pass

### PHASE 4: Implementation
Apply changes exactly as per the plan. If any checkpoint fails, stop and update diagnosis.

### PHASE 5: Handover
Keep README, env notes, and CHANGELOG current. Add notes to COMMON_ISSUES if needed.

---

## 7. PREVENTION CHECKLISTS

### Before UI/layout changes
- Audit existing styles for conflicts
- Use design tokens instead of raw hex codes
- Validate on desktop and mobile

### Before data/LLM changes
- Confirm DB schema and table existence
- Check downstream consumers can handle changes

### Before edge functions / APIs
- Verify all required secrets/env vars exist
- Confirm CORS headers and OPTIONS handler
- Add comprehensive logging

---

## 8. ARCHITECTURE FOUNDATIONS

### Folder structure
```
/src
  /components
  /lib
  /hooks
  /contexts
  /types
  /pages
  /assets
/supabase
  /functions
/public
/project-documentation
```

### Code rules
- Every component pure unless there's a reason not to.
- All async functions return: `{ data, error }` or `{ success, data?, error? }`.
- No untyped returns. All config in one place.

### API layer
- All API calls go through one client with interceptors.
- API responses normalized to the same shape.

### Database layer
- Schema versioning via migrations.
- Constraints on every table.
- Default values to avoid null cascades.

---

## 9. DOCUMENTATION STANDARDS

- Each file has a header block: what it does, what it depends on.
- Every function gets: purpose, inputs, outputs, edge cases.
- Global README covers: Features, Architecture, Tech stack, API endpoints, DB schema.
- CHANGELOG for every push.
- Inline comments only where context is missing from naming.

---

## 10. TESTING RULES

- Unit tests for utilities and helpers.
- Smoke test for each major flow.
- Snapshot tests for key components.
- API mocks for all external calls.

---

## 11. DEPLOYMENT HYGIENE

### Pre-deploy
- build passes
- lint passes
- typecheck passes
- environment variables validated

### Post-deploy
- health check
- regression check
- log scan for anomalies

---

## 12. UNIVERSAL SAFETY CLAUSE

**Do not:**
- Enforce project-specific values unless they already exist
- Rename or delete existing tables, env vars, or core components without explicit instruction
- Switch technology stack decisions already in place

**Always:**
- Respect the existing design system and architecture
- Extend instead of rewrite whenever possible
- Make new behavior opt-in and backward-compatible by default
