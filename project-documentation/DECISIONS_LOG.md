# Architectural Decisions Log

## Decision 1: QR Codes for Mobile Submission

**Date:** September 2024
**Status:** Implemented, working well

**Context:**
- Need fast participant input during 3-hour workshop
- Can't slow down for "create account" or "log in"
- Executives use phones, not laptops

**Options considered:**
1. Email links (too slow, people ignore emails)
2. Web app with login (too much friction)
3. Native mobile app (too much setup, app store approval)
4. QR codes → direct to web page (instant, no login)

**Decision:**
Use QR codes that embed workshop context (session_id, activity_type) and link directly to mobile submission pages. No login required.

**Rationale:**
- Universal (every phone has camera)
- Zero setup (no app install, no account)
- Fast (scan → submit → done in <2 minutes)
- High completion rate (100% vs 40-60% for email surveys)

**Trade-offs:**
- No identity verification (anyone with QR can submit)
- Session management harder (can't track "logged in" state)
- QR codes can be shared (security risk if leaked)

**Outcome:**
Worked exceptionally well. 100% participation rate. Executives love it. This is the core differentiator.

---

## Decision 2: Polling vs WebSockets for Real-Time Updates

**Date:** October 2024
**Status:** Implemented, adequate

**Context:**
- Facilitator needs to see participant submissions in real-time
- Dashboard must update without manual refresh
- Workshop lasts 3 hours (short-lived context)

**Options considered:**
1. Manual refresh (too slow, facilitator misses data)
2. WebSockets via Supabase Realtime (complex, connection management)
3. Polling every 3-5 seconds (simple, reliable)

**Decision:**
Use polling with TanStack Query's refetchInterval. Poll every 3-5 seconds for new data.

**Rationale:**
- Simpler than WebSockets (no connection state)
- Sufficient for 3-hour workshop (not chat app)
- Works even if connection drops (auto-retries)
- Easier to debug (just HTTP requests)

**Trade-offs:**
- Not "real-time" (3-5 second delay)
- More API calls (higher costs)
- Battery drain on facilitator device

**Outcome:**
Good enough. 3-5 second delay acceptable. Simpler codebase. Would use WebSockets if scaling to 100+ concurrent workshops.

---

## Decision 3: Unified Profiles (Email-Based Identity)

**Date:** September 2024
**Status:** Implemented, overly complex

**Context:**
- Participants attend multiple workshops
- Want to track history without requiring login
- Need cross-tool identity (assessment tool + workshop tool)

**Options considered:**
1. No identity tracking (anonymous every time)
2. Session-based identity (participant_id per workshop)
3. Unified profiles (email as primary key)

**Decision:**
Create `unified_profiles` table with email as unique identifier. Link all submissions to profile_id.

**Rationale:**
- Track participants across workshops
- See history without login
- Merge data from multiple tools
- Future: personalized reports

**Trade-offs:**
- Email privacy concerns
- Profile matching complexity (case sensitivity, typos)
- More tables, more joins, slower queries

**Outcome:**
Works, but overly complex. Rarely used. Would simplify to just email column on submissions table if rebuilding.

---

## Decision 4: AI Clustering During Workshop

**Date:** October 2024
**Status:** Implemented, high value

**Context:**
- Participants submit 20-50 bottlenecks in Segment 2
- Facilitator can't manually group them during 5-minute break
- Need to show clusters immediately after break

**Options considered:**
1. Manual clustering by facilitator (too slow)
2. Pre-defined categories (too rigid)
3. AI clustering with GPT-4o (fast, flexible)

**Decision:**
Use OpenAI GPT-4o to cluster bottleneck submissions into 3-5 themes during break.

**Rationale:**
- 30 seconds to cluster 50 items
- Flexible (adapts to any inputs)
- Good enough quality (70-80% accuracy)
- Facilitator can adjust if needed

**Trade-offs:**
- Costs $0.03-0.10 per clustering
- Requires OpenAI API key
- AI might miss nuances
- Needs fallback if API fails

**Outcome:**
Huge time saver. Facilitators love it. Clustering quality acceptable. This is a core feature. Worth the cost.

---

## Decision 5: Seven-Segment Workshop Structure

**Date:** August 2024
**Status:** Implemented, validated

**Context:**
- Need structured workshop flow (not freeform brainstorming)
- Must fit in 3 hours
- Each segment builds on previous data

**Options considered:**
1. Freeform facilitation (too unpredictable)
2. Fixed agenda with 3-4 sections (too rigid)
3. Seven segments with flexibility (structured but adaptable)

**Decision:**
Create seven named segments:
1. Mythbuster (15 min)
2. Bottleneck Board (20 min)
3. Effortless Enterprise (25 min)
4. Simulation Lab (30 min)
5. Strategy Addendum (20 min)
6. Pilot Charter (20 min)
7. Provocation (30 min)

**Rationale:**
- Proven sequence from pilot workshops
- Each segment has clear output
- Time-boxed to prevent overruns
- Builds momentum toward decision framework

**Trade-offs:**
- Less flexible (can't skip segments)
- Requires training for facilitators
- Fixed time allocations (might need adjustment)

**Outcome:**
Works well. Facilitators appreciate structure. Participants stay engaged. Would keep this.

---

## Decision 6: Battle Test Through Simulation (Not Self-Reported)

**Date:** November 2024
**Status:** Implemented, core differentiator

**Context:**
- Self-reported assessments don't reveal team dynamics
- Need to observe how teams actually decide
- Must surface disagreements naturally

**Options considered:**
1. Survey questions ("How do you make decisions?")
2. Hypothetical scenarios ("What would you do if...?")
3. Realistic simulations with trade-offs (teams work through actual scenario)

**Decision:**
Present realistic AI transformation scenarios in Segment 4. Teams work through before/after states, surface reactions, capture disagreements.

**Rationale:**
- Reveals actual decision patterns (not self-reported)
- Disagreements surface naturally (not forced)
- Concrete trade-offs (time/cost/risk) make it real
- Facilitator observes process, not just outcomes

**Trade-offs:**
- Requires good simulation scenarios (hard to create)
- Takes 30 minutes (significant time investment)
- Can be uncomfortable (disagreements visible)

**Outcome:**
This is THE differentiator. Teams say "we learned more in this segment than 3 years of meetings." The discomfort is the value.

---

## Decision 7: Decision Framework (Not Readiness Score)

**Date:** January 2025
**Status:** Implemented, validated

**Context:**
- Original output: "You scored 67% ready for AI"
- Executives don't trust scores
- Missing the insight: "This is how you decide"

**Options considered:**
1. Keep readiness score (familiar, easy to explain)
2. Maturity model (industry standard, but generic)
3. Decision framework (unique, harder to explain)

**Decision:**
Generate decision framework showing:
- How you decide (observed patterns)
- Where you agreed vs where you didn't (tension map)
- Mental models you need (key concepts)
- What to do next (concrete actions)

**Rationale:**
- Mirror, not measurement
- Shows team how they work together
- Highlights alignment gaps with specific examples
- Actionable (not just "you're at level 3")

**Trade-offs:**
- Harder to explain upfront ("what's a decision framework?")
- No benchmarking (can't compare to others)
- More complex to generate (AI prompt engineering)
- Less "objective" feeling (no score)

**Outcome:**
This is the breakthrough. Executives love it. "Finally, someone's showing us how we actually work." This is the product.

---

## Decision 8: Plain English (Not Consultant-Speak)

**Date:** January 2025
**Status:** Implemented, continuous

**Context:**
- Original language: "Strategic alignment gaps," "implementation roadmap," "maturity assessment"
- Executives immediately skeptical
- Sounds like every other consulting deck

**Options considered:**
1. Keep formal language (professional, expected)
2. Mix formal + casual (confusing, inconsistent)
3. Plain English throughout (risky, nontraditional)

**Decision:**
Use plain English everywhere:
- "How you decide" (not "decision-making framework")
- "Where you didn't agree" (not "areas of misalignment")
- "What slows you down" (not "organizational bottlenecks")

**Rationale:**
- Builds trust (sounds human, not corporate)
- Easier to understand (no jargon decoding)
- Differentiated (no one else talks like this)
- Matches tone of insight (honest, direct)

**Trade-offs:**
- Less "professional" feeling (might lose some enterprise buyers)
- Requires constant vigilance (jargon creeps back in)
- No industry shortcuts (can't say "synergies")

**Outcome:**
Major credibility boost. Executives say "finally, someone who talks like a human." This is part of the product.

---

## Decision 9: No Participant Authentication

**Date:** September 2024
**Status:** Implemented, working well

**Context:**
- Participants need to submit data via mobile
- Workshop is 3 hours (no time for account setup)
- Security less critical (no sensitive data)

**Options considered:**
1. Email/password login (too slow)
2. Magic link (email lag, UX friction)
3. OAuth (Google sign-in, still friction)
4. No auth (just email for identity)

**Decision:**
No authentication for participants. Collect email for profile matching, but no login required.

**Rationale:**
- Zero friction (scan QR → submit → done)
- Fast (no "forgot password" or "check your email")
- Acceptable risk (workshop data not highly sensitive)
- Matches 3-hour workshop context

**Trade-offs:**
- Anyone with QR can submit (can't verify identity)
- Can't prevent duplicate submissions easily
- No "my account" page for participants
- Privacy concern (email collected without account)

**Outcome:**
Right call. Speed matters more than security here. Rare abuse cases. Would keep this.

---

## Decision 10: Supabase Over Custom Backend

**Date:** August 2024
**Status:** Implemented, working well

**Context:**
- Need database, auth, file storage, serverless functions
- Small team, limited backend expertise
- Want to move fast

**Options considered:**
1. Custom Node.js backend (full control, lots of work)
2. Firebase (fast, but vendor lock-in)
3. Supabase (Postgres, open-source, full-featured)

**Decision:**
Use Supabase for everything: database, auth, storage, edge functions.

**Rationale:**
- One platform, not five services
- Postgres (not NoSQL, better for relational data)
- Open-source (can self-host later)
- Edge functions in Deno (modern, fast)
- Built-in RLS (row-level security)

**Trade-offs:**
- Vendor lock-in (harder to switch)
- Edge functions limited (30s timeout, Deno not Node)
- Pricing unpredictable (usage-based)
- Less control (can't tune Postgres)

**Outcome:**
Right call. Shipping speed > flexibility. Would use Supabase again. Self-hosting possible if needed.

---

## Future Decisions to Make

### Should we add longitudinal tracking?

**Context:** Teams want to know "what happened after the workshop?"

**Question:** Do we track pilot progress, outcomes, follow-up workshops?

**Implications:** More tables, more complexity, different product positioning (from workshop tool to transformation platform)

**Status:** Deferred until proven demand

---

### Should we allow self-serve workshops?

**Context:** Facilitators are bottleneck. Some teams want to run workshops themselves.

**Question:** Can we make the tool usable without a trained facilitator?

**Implications:** Need better UI prompts, segment instructions, AI co-facilitation. Different pricing model.

**Status:** Considering for v2.0

---

### Should we build a pattern library?

**Context:** After 50+ workshops, patterns emerge (teams that prioritize speed, teams that fear risk, etc.)

**Question:** Do we show teams "you're like these other teams" (anonymous benchmarking)?

**Implications:** Need consent, aggregation, privacy protections. Closer to assessment tool again.

**Status:** Exploring feasibility
