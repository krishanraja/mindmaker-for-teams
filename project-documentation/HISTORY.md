# Evolution History

## Phase 1: Assessment Platform (v0.1 - v0.3)

**Original concept:**
- AI readiness assessment tool
- Individual leader assessments with scoring
- Maturity model framework (Emerging → Establishing → Advancing → Leading)
- Benchmarking against industry averages

**Key features built:**
- `leader_assessments` table with benchmark scores
- Dimension scoring (Strategic Vision, Technical Capability, etc.)
- Percentile calculations and tier assignment
- Individual assessment reports with recommendations

**Why this didn't work:**
- Leaders don't trust self-reported assessment scores
- Benchmarking felt artificial ("compared to who?")
- No team component (individual assessments don't reveal team dynamics)
- Output was generic recommendations, not actionable insights

## Phase 2: Pivot to Team Workshops (v0.4 - v0.6)

**Major shift:**
- From individual assessments to team workshops
- From scoring to observation
- From benchmarking to alignment

**New features built:**
- `workshop_sessions` table
- `exec_intakes` and `bootcamp_plans` for workshop setup
- QR code generation for mobile submissions
- Seven-segment workshop structure
- `bottleneck_submissions` and `effortless_map_items` tables

**Architecture decisions:**
- Mobile-first for participants (QR codes, no login)
- Desktop facilitator dashboard
- Real-time polling (not WebSocket) for updates
- AI clustering of inputs during workshop breaks

**What worked:**
- QR codes solved participation friction
- Mobile submission = 100% participation rate
- Real-time aggregation visible to facilitator
- Segments kept workshop moving

**What didn't work:**
- Still too focused on "readiness" and "pilot building"
- Reports still sounded like consulting deliverables
- Missing the "how you decide" insight

## Phase 3: Pilot-Building Focus (v0.7 - v0.9)

**Core concept:**
- Workshops end with a pilot charter
- Segments 4-6 added: Simulation Lab, Strategy Addendum, Pilot Charter
- Final report: "Are you ready to build a pilot?"

**Features built:**
- `simulation_results` table
- `strategy_alignment` table
- `pilot_charters` table
- `provocation_reports` table (AI-generated executive summary)
- `TieredExecutiveReport.tsx` component
- `generate-final-report` edge function

**What worked:**
- Simulation Lab (Segment 4) revealed team dynamics
- Teams loved seeing time/cost savings calculations
- Pilot charter forced concrete commitments
- Strategy alignment captured guardrails

**What didn't work:**
- Output was still "readiness assessment + pilot plan"
- Language was too consulting-speak ("strategic gaps," "implementation roadmap")
- Missed the core insight: **how the team makes decisions together**
- Two architectures started emerging (pilot vs alignment)

## Phase 4: Alignment Sprint (v1.0 - Current)

**Breakthrough insight:**
- The value isn't the pilot plan
- The value is the mirror: "This is how you decide"
- Teams need to see their decision-making patterns BEFORE starting a pilot

**Major architectural cleanup (January 2025):**

**Deleted:**
- `TieredExecutiveReport.tsx` (old report display)
- `generate-final-report` edge function
- `provocation_reports` table usage (kept table for legacy data)
- All "pilot readiness" language
- Consulting jargon everywhere

**Built:**
- `decision_frameworks` table (new core output)
- `DecisionFrameworkDisplay.tsx` (new report component)
- `generate-decision-framework` edge function
- Battle test data capture in Segments 4-6:
  - `team_reactions` (JSON object with reaction data)
  - `disagreement_points` (array of strings)
  - `tension_observations` (text field)
  - `trust_indicators` (JSON)

**Language overhaul:**
- "Alignment Sprint" (not "workshop")
- "Battle Test" (not "simulation exercise")
- "Decision Framework" (not "executive report")
- "How you decide" (not "decision-making framework")
- "Where you agreed vs where you didn't" (not "areas of alignment/misalignment")

**New report structure:**
1. How You Decide (observed process)
2. Where You Agreed vs Where You Didn't (tension map)
3. Mental Models You Need (key concepts)
4. What to Do Next (concrete actions)

**Critical fix:**
- Eliminated dual architectures
- Single data flow: battle test → decision framework
- All new segment data (team_reactions, disagreements) now used in framework generation
- TypeScript types aligned with database schema

## Recurring Architectural Patterns

### Pattern: Dual Architecture Drift

**Symptom:**
- Old edge functions still called by some components
- New tables exist but aren't used
- Data captured but not displayed
- Reports miss recent segment additions

**Root cause:**
- Adding features without removing old ones
- Fear of breaking existing functionality
- Incomplete migrations (build new, don't delete old)

**Solution:**
- Always delete old architecture when adding new
- Search codebase for ALL references to old tables/functions
- Update types to match new schema
- Test data flow end-to-end

### Pattern: "Just Add a Field"

**Symptom:**
- Fields added to database without updating edge functions
- Edge functions generate data but UI doesn't display it
- TypeScript types out of sync with database schema

**Root cause:**
- Database-first changes without considering full stack
- Missing step: "What needs to change in the frontend?"

**Solution:**
- When adding database columns, trace usage:
  1. Which edge function populates this?
  2. Which component displays this?
  3. Do types need updating?
  4. Does the AI prompt need this data?

### Pattern: Consultant-Speak Creep

**Symptom:**
- Language drifts back to jargon over time
- New features use corporate terminology
- Plain English gets replaced with "strategic alignment"

**Root cause:**
- Default to formal language when uncertain
- Copying patterns from old code
- Not referencing BRANDING.md guidelines

**Solution:**
- Review all UI copy against BRANDING.md before shipping
- Test: "Would I say this to a friend?"
- Use terminology standards (see README.md)

## Lessons Learned

### What Works

1. **Mobile QR submissions:** Zero friction = 100% participation
2. **Segment structure:** Proven sequence keeps workshop moving
3. **AI clustering:** Saves facilitator time, surfaces patterns
4. **Battle testing:** Real scenarios reveal real disagreements
5. **Plain language:** Executives respond to "how you decide" not "strategic readiness"

### What Doesn't Work

1. **Self-reported assessments:** People lie (even to themselves)
2. **Benchmarking:** Feels artificial, no one trusts the comparison
3. **Generic recommendations:** "You should do X" misses the point
4. **Complex scoring:** Executives don't care about 73.2% readiness
5. **Consultant jargon:** Immediate credibility loss

### Technical Decisions That Paid Off

1. **Supabase:** Handles auth, DB, storage, edge functions in one platform
2. **QR codes:** Universal, no app install, works on any phone
3. **Polling over WebSockets:** Simpler, fewer bugs, sufficient for 3-hour workshop
4. **Mobile-first participants:** Executives have phones, not laptops
5. **No participant auth:** Removes friction, speeds submission

### Technical Decisions We'd Change

1. **Unified profiles:** Added complexity, should have used simpler email-only identity
2. **TanStack Query:** Overkill for simple polling, could use plain fetch
3. **Multiple AI providers:** Fallback adds complexity, rarely needed
4. **Segment summaries:** Facilitators don't use them, could remove

## Future Evolution

### Short-Term (Next 3 Months)

- Simplify unified profiles (too complex)
- Remove segment summaries (unused feature)
- Add more simulation templates (reusable scenarios)
- Improve tension map visualization

### Medium-Term (6-12 Months)

- Longitudinal tracking: What happened after the workshop?
- Pattern library: Common decision patterns across workshops
- Facilitator training: Best practices for running segments
- Export improvements: CSV, PDF, embeddable reports

### Long-Term Vision

- Self-serve workshop creation (no facilitator needed)
- AI co-facilitation (real-time suggestions during workshop)
- Decision pattern database (anonymous benchmarking)
- Integration with project management tools (Asana, Jira)

## Breaking Changes Log

### January 2025: Alignment Sprint Refactor

**Breaking changes:**
- `generate-final-report` → `generate-decision-framework`
- `provocation_reports` → `decision_frameworks` (schema changed)
- `TieredExecutiveReport.tsx` deleted
- All "pilot readiness" language removed

**Migration path:**
- Old workshops still use provocation_reports (legacy)
- New workshops use decision_frameworks
- No automatic migration of old data

### November 2024: Battle Test Data Capture

**Breaking changes:**
- Added fields to simulation_results, strategy_alignment, pilot_charters
- TypeScript types required manual casting (temporary fix)
- Edge functions updated to generate new fields

**Migration path:**
- Old simulations missing new fields (null values)
- New simulations include full data

### September 2024: Workshop Sessions Table

**Breaking changes:**
- Split leader_assessments into workshop_sessions + exec_intakes
- Moved participant data to unified_profiles
- Changed routing from /assessment/:id to /facilitator/:sessionId

**Migration path:**
- No automatic migration (clean break)
- Old assessments still in DB but not accessible via UI
