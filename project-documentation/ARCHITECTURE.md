# Architecture

## System Overview

MindMaker Leaders is a full-stack React + Supabase application with AI-powered edge functions for real-time workshop facilitation.

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite
- UI: shadcn/ui, Tailwind CSS, Radix UI
- Backend: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- AI: OpenAI GPT-4o/GPT-4o-mini, Gemini (fallback)
- QR: qrcode.react library
- State: React Context API, TanStack Query
- Routing: React Router v6

## Architecture Layers

```
┌─────────────────────────────────────┐
│   React Frontend (Vite)             │
│   - Facilitator Dashboard           │
│   - Mobile Submission Pages         │
│   - Decision Framework Display      │
└──────────┬──────────────────────────┘
           │
           │ Supabase Client SDK
           │
┌──────────▼──────────────────────────┐
│   Supabase Backend                  │
│   - PostgreSQL Database             │
│   - Row Level Security (RLS)        │
│   - Edge Functions (Deno)           │
│   - Storage Buckets                 │
└──────────┬──────────────────────────┘
           │
           │ OpenAI API / Gemini API
           │
┌──────────▼──────────────────────────┐
│   AI Services                       │
│   - Text generation                 │
│   - Clustering                      │
│   - Synthesis                       │
└─────────────────────────────────────┘
```

## Data Flow

### Workshop Creation Flow

1. Facilitator logs in via Supabase Auth
2. Navigates to "Create Workshop" page
3. Submits intake form (company, participants, dates)
4. System creates:
   - `exec_intakes` record
   - `bootcamp_plans` record
   - `workshop_sessions` record
5. Generates pre-work QR codes for participants
6. Emails sent with QR codes (via edge function)

### Mobile Submission Flow

1. Participant scans QR code (contains workshop_session_id + activity_type)
2. Opens mobile submission page (no login required)
3. System fetches workshop context from database
4. Participant submits data (bottleneck, map item, vote)
5. Data saved to appropriate table with profile_id
6. Real-time update triggers facilitator dashboard refresh

### AI Generation Flow

1. Facilitator clicks "Generate" button (e.g., "Cluster Bottlenecks")
2. Frontend calls Supabase edge function
3. Edge function:
   - Fetches workshop data from database
   - Constructs AI prompt with context
   - Calls OpenAI API (or Gemini fallback)
   - Parses JSON response
   - Saves results to database
4. Frontend receives response
5. UI updates with generated content

## Database Schema

### Core Tables

**workshop_sessions:**
- Primary entity for a workshop run
- Links to: exec_intakes, bootcamp_plans
- Tracks: status, current_segment, participant_count
- Stores: cognitive_baseline_data, segment_timers

**unified_profiles:**
- Cross-tool participant identity
- Unique by email (no login required)
- Tracks: name, role, company, total_interactions
- Links to: bottleneck_submissions, effortless_map_items, exec_pulses

**bottleneck_submissions:**
- Segment 2 data
- Fields: bottleneck_text, participant_name, cluster_id, cluster_name
- Links to: workshop_session_id, profile_id

**effortless_map_items:**
- Segment 3 data
- Fields: item_text, lane (automate/constraints/never), vote_count, sponsor_name
- Links to: workshop_session_id, profile_id

**simulation_results:**
- Segment 4 data
- Fields: scenario_context, before_snapshot, after_snapshot, team_reactions, disagreement_points, time_saved_hours, cost_savings_usd
- Links to: workshop_session_id, simulation_id

**strategy_alignment:**
- Segment 5 data
- Fields: strategic_goals, ai_opportunities, guardrails, quick_wins
- Links to: workshop_session_id

**pilot_charters:**
- Segment 6 data
- Fields: pilot_scope, success_metrics, kill_criteria, executive_sponsor, budget, team_roles, calendar_events
- Links to: workshop_session_id

**decision_frameworks:**
- Segment 7 output
- Fields: decision_process, decision_criteria, major_tensions, key_concepts, next_steps, tension_map
- Links to: workshop_session_id

### Supporting Tables

**exec_intakes:** Intake form data
**bootcamp_plans:** Workshop configuration and simulation snapshots
**exec_pulses:** Pre-workshop pulse survey responses
**activity_sessions:** QR code sessions with expiry
**huddle_synthesis:** Working group discussion summaries
**segment_summaries:** Facilitator-written segment summaries

## Edge Functions

### AI Generation Functions

**generate-decision-framework:**
- Input: workshop_session_id
- Fetches: workshop data, simulation results, strategy, pilot charter, effortless map
- AI Output: Decision framework JSON (decision_process, tensions, concepts, next_steps)
- Saves to: decision_frameworks table

**cluster-bottleneck-inputs:**
- Input: workshop_session_id
- Fetches: All bottleneck submissions
- AI Output: Clustered bottlenecks by theme
- Updates: bottleneck_submissions.cluster_id, cluster_name

**generate-strategy-insights:**
- Input: workshop_session_id, strategic goals, guardrails
- AI Output: AI opportunities, strategic alignment insights
- Saves to: strategy_alignment table

**generate-guardrails:**
- Input: workshop_session_id, simulation results
- AI Output: Suggested implementation guardrails
- Returns: JSON array of guardrail objects

**generate-huddle-synthesis:**
- Input: workshop_session_id, working group submissions
- AI Output: Cross-group synthesis
- Saves to: huddle_synthesis table

### QR Code Functions

**generate-prework-qr:**
- Input: intake_id, participants array
- Generates: Individual QR codes per participant
- Uploads: PNG images to Supabase Storage
- Returns: Array of {participant, qr_url}

**generate-activity-qr:**
- Input: workshop_session_id, activity_type
- Generates: QR code with embedded session ID
- Creates: activity_sessions record
- Returns: QR code data URL

**generate-post-session-qr:**
- Input: workshop_session_id
- Generates: QR for participant feedback
- Returns: QR code data URL

### Email Functions

**send-prework-emails:**
- Input: intake data, participant list, QR codes
- Sends: Personalized emails via Resend API
- Contains: Workshop details, pre-work QR code

**send-exec-summary-email:**
- Input: workshop_session_id, recipient emails
- Generates: Decision framework summary
- Sends: Email with report link

## Context Providers

### AuthContext
- Manages: User authentication state
- Supabase: Auth session handling
- Provides: user, signIn, signOut, loading

### ExecTeamsContext
- Manages: Workshop creation flow state
- State: intakeData, bootcampPlan, participants
- Methods: updateIntake, updateBootcamp

### FacilitatorContext
- Manages: Workshop session state during facilitation
- State: currentSession, currentSegment, participants
- Methods: updateSegment, saveData, generateAI

## Routing Structure

```
/ - Landing page
/exec-teams - Workshop setup wizard
/create-workshop - Facilitator creates new workshop
/facilitator - Facilitator dashboard (protected)
/facilitator/:sessionId - Workshop facilitation view (protected)

/mobile/register/:intakeId/:participantId - Pre-workshop registration
/mobile/prework/:intakeId/:participantId - Pre-work submission
/mobile/bottleneck/:sessionId/:activityId - Bottleneck submission
/mobile/effortless/:sessionId/:activityId - Effortless map submission
/mobile/voting/:sessionId/:activityId - Dot voting
/mobile/working-group/:sessionId/:groupId - Working group huddle
/mobile/post-session/:sessionId - Post-workshop feedback
```

## Real-Time Updates

**Polling pattern:**
- Dashboard polls every 3-5 seconds for new submissions
- Uses TanStack Query with refetch intervals
- Optimistic updates on submission
- Toast notifications on new data

**Why not Supabase Realtime:**
- Workshop context is short-lived (3 hours)
- Polling is sufficient for facilitator needs
- Avoids WebSocket connection management
- Simpler error handling

## Authentication

**Facilitators:**
- Email/password via Supabase Auth
- Protected routes require authentication
- Role check via user_roles table

**Participants:**
- No authentication required
- Email collected for profile matching
- unified_profiles created/updated on submission
- No login, no accounts, no passwords

## File Storage

**Supabase Storage buckets:**
- `pre-workshop-qr`: QR code images (public)
- `post-session-qr`: Feedback QR codes (public)

**File naming:**
- QR codes: `{workshop_session_id}_{activity_type}_{timestamp}.png`
- Pre-work: `{intake_id}_{participant_id}.png`

## AI Integration

### OpenAI Configuration

**Models used:**
- GPT-4o: Complex synthesis (decision frameworks, strategy)
- GPT-4o-mini: Simple tasks (clustering, guardrails)

**Fallback chain:**
1. Try OpenAI with OPENAI_API_KEY
2. If fails, try Gemini with GEMINI_API_KEY
3. If fails, return error to user

**Prompt structure:**
- System prompt: Role, constraints, output format
- User prompt: Specific data + instructions
- Response: JSON object (parsed and validated)

### AI Function Pattern

```typescript
// Edge function pattern
const systemPrompt = `You are an AI analyst...`;
const userPrompt = `Data: ${JSON.stringify(data)}\n\nTask: ...`;

const response = await callWithFallback(
  systemPrompt,
  userPrompt,
  openAIApiKey,
  lovableApiKey
);

const parsed = JSON.parse(response);
// Validate and save to database
```

## Mobile Optimization

**QR-driven flow:**
- QR embeds: workshop_session_id + activity_type + timestamp
- Mobile page auto-loads context (no manual entry)
- Single-screen submission forms
- Auto-save on submit with retry logic

**Offline handling:**
- useSaveQueue hook queues failed saves
- Retries on reconnection
- Toast shows save status
- Prevents duplicate submissions

## Performance Considerations

**Database:**
- Indexes on foreign keys
- RLS policies for security
- Batch inserts for bulk data

**Frontend:**
- Code splitting per route
- Lazy loading of components
- TanStack Query for caching
- Debounced search inputs

**Edge Functions:**
- Timeout: 30 seconds
- Streaming responses for long AI calls
- Error handling with fallback

## Security

**Row Level Security (RLS):**
- workshop_sessions: Only facilitator can read/write their workshops
- unified_profiles: Participants can only read/update their own profile
- submissions: Public insert (for anonymous QR submissions), facilitator read

**API Keys:**
- Stored in Supabase secrets (OPENAI_API_KEY, GEMINI_API_KEY, RESEND_API_KEY)
- Never exposed to frontend
- Edge functions access via Deno.env

**Authentication:**
- Facilitator auth via Supabase (JWT tokens)
- Participants: No auth (anonymous submissions)
- Email-only identity for participants

## Error Handling

**Frontend:**
- Toast notifications for user-facing errors
- Error boundaries for component crashes
- Retry logic for failed API calls
- Loading skeletons for async data

**Edge Functions:**
- Try/catch with structured error responses
- Fallback to alternative AI provider
- Logging to Supabase function logs
- 500 status with error message in JSON

**Database:**
- Transaction rollbacks on constraint violations
- Unique constraints on email (profiles)
- Foreign key cascades for cleanup
