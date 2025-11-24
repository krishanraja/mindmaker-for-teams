# Core Features

## 1. Workshop Session Management

**Facilitator creates workshop:**
- Set company name, date, participant count
- Auto-generate unique workshop ID
- Track current segment (1-7)
- Timer controls for each segment

**Status tracking:**
- Draft → Active → Completed workflow
- Segment completion checkpoints
- Data validation before moving to next segment

## 2. QR Code Mobile Submission System

**Activity-specific QR codes:**
- Generate QR for bottleneck submission
- Generate QR for effortless map submission  
- Generate QR for dot voting
- Generate QR for working group assignments
- Generate QR for post-session feedback

**Mobile submission pages:**
- Scan QR → Auto-load workshop context
- Submit without login or account
- Real-time sync to facilitator view
- Works on any mobile device

## 3. Seven Workshop Segments

### Segment 1: Mythbuster
- Pre-work: Participants submit AI myths/concerns before workshop
- Facilitator reviews and clusters myths
- AI generates myth-busting insights
- Display aggregated concerns with explanations

### Segment 2: Bottleneck Board
- Participants scan QR and submit their top bottlenecks
- AI clusters similar bottlenecks into themes
- Facilitator reviews clusters and adjusts groupings
- Visual display of bottleneck themes

### Segment 3: Effortless Enterprise
- Participants submit items to three swimlanes:
  - "Automate" (tasks they'd delegate to AI)
  - "Constraints" (blockers preventing automation)
  - "Never Automate" (tasks that must stay human)
- Dot voting on submitted items (3 votes per person)
- Priority ranking based on votes
- Sponsor assignment for top items

### Segment 4: Simulation Lab
- Load two pre-configured simulations (from bootcamp plan)
- Present realistic AI transformation scenario
- Team works through simulation together
- Capture before/after states, team reactions, disagreement points
- AI calculates potential time/cost savings
- Record trust levels and friction observations

### Segment 5: Strategy Addendum
- Capture strategic goals and initiatives
- Map AI opportunities to business objectives
- Document guardrails and constraints
- Identify quick wins vs long-term plays

### Segment 6: Pilot Charter
- Define pilot scope (30/60/90 day goals)
- Set success metrics and kill criteria
- Assign executive sponsor and team roles
- Document resource requirements (budget, headcount, tech)
- Capture calendar commitments

### Segment 7: Provocation (Decision Framework Report)
- AI generates decision framework showing:
  - How this team makes decisions (observed patterns)
  - Where they agreed (consensus areas)
  - Where they disagreed (tension points with quotes)
  - Mental models they need (key concepts)
  - What to do next (concrete actions)
- Display as interactive report
- Generate QR code for participant feedback
- Download/share capability

## 4. Real-Time Data Aggregation

**Facilitator dashboard shows:**
- Live submission count
- Latest submissions from participants
- AI-generated insights and clusters
- Voting results and rankings
- Simulation outcomes

**Auto-refresh:**
- Poll every 3-5 seconds for new data
- Update counts and displays instantly
- No manual refresh needed

## 5. AI Integration

**Edge functions for AI processing:**
- `analyze-prework-myths`: Cluster and analyze pre-workshop submissions
- `cluster-bottleneck-inputs`: Group bottlenecks by theme
- `generate-ai-insights`: Create contextual insights for segments
- `generate-strategy-insights`: Synthesize strategy alignment
- `generate-guardrails`: Suggest implementation guardrails
- `generate-decision-framework`: Create final decision framework report
- `generate-huddle-synthesis`: Summarize working group discussions

**AI models used:**
- OpenAI GPT-4o/GPT-4o-mini for text generation
- Gemini as fallback provider
- Structured JSON outputs for reliability

## 6. Pre-Workshop Setup

**Intake form:**
- Company details, participants, strategic context
- Simulation configuration (2 scenarios)
- Pre-work requirements sent via email

**Pre-work QR codes:**
- Individual QR codes sent to each participant
- Submit myths/concerns before workshop
- No login required, just scan and submit

## 7. Working Groups (Mobile)

**Group assignment:**
- Facilitator assigns participants to groups (e.g., "Finance AI Pilot")
- Generate QR code for group
- Participants scan and join group discussion

**Group capture:**
- Structured prompts for huddle discussions
- Submit group consensus and disagreements
- AI synthesizes across all groups

## 8. Unified Profile System

**Cross-tool identity:**
- Email-based profile matching
- Track participant across workshops
- No login required for participants
- Facilitator sees participant history

## 9. Data Export

**Post-workshop artifacts:**
- Decision framework report (PDF/web view)
- Raw data exports (CSV)
- Simulation results
- Strategy alignment maps

## 10. Facilitator Authentication

**Secure facilitator access:**
- Email/password login
- Role-based access (only facilitators can create/manage workshops)
- Protected routes for dashboard
- No public access to workshop data without authentication

## Technical Features

- **Offline-first mobile submission** (queued saves with retry)
- **Optimistic UI updates** (instant feedback, background sync)
- **Toast notifications** for success/error states
- **Responsive design** (desktop facilitator, mobile participants)
- **QR code generation** with expiry tracking
- **Real-time updates** via Supabase subscriptions
