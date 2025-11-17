# MindMaker Workshop Platform - Data Architecture Audit (CP4)

## Executive Summary

This document provides a comprehensive audit of the workshop participant data flow, identifies critical security and data leakage risks, and proposes architectural improvements.

**Critical Finding**: Participants are currently stored at the **intake level**, not the **workshop level**, creating a risk of data leakage between multiple workshops sharing the same intake.

---

## Current Data Architecture

### Data Flow Diagram

```
Executive Intake (exec_intakes)
    ├── participants (JSON array) - stored on intake
    ├── preferred_dates (JSON array)
    └── company/organizer info
    
Bootcamp Plan (bootcamp_plans)
    ├── intake_id → exec_intakes.id
    ├── cognitive_baseline (JSON)
    ├── strategic_goals_2026 (JSON)
    └── simulation snapshots
    
Workshop Session (workshop_sessions)
    ├── intake_id → exec_intakes.id
    ├── bootcamp_plan_id → bootcamp_plans.id
    ├── facilitator_name/email
    ├── current_segment
    └── workshop_date
    
Pre-Workshop Inputs (pre_workshop_inputs)
    ├── intake_id → exec_intakes.id  ⚠️ RISK
    ├── participant_name
    ├── participant_email
    └── pre_work_responses (JSON)
    
Executive Pulse (exec_pulses)
    ├── intake_id → exec_intakes.id  ⚠️ RISK
    ├── participant_email
    └── pulse scores (awareness, application, trust, governance)
```

### Data Relationships

**intake → workshop**: One-to-Many (1 intake can have multiple workshops)
**intake → bootcamp_plan**: One-to-Many
**bootcamp_plan → workshop**: One-to-Many
**intake → pre_workshop_inputs**: One-to-Many ⚠️
**intake → exec_pulses**: One-to-Many ⚠️

---

## Critical Issues Identified

### 🚨 Issue #1: Data Leakage Between Workshops

**Problem**: Multiple workshops can share the same `intake_id`, but participants are associated with the intake, not individual workshops.

**Scenario**:
1. Company "Meliora" books Workshop A on March 15, 2025
2. Participants register and submit pre-work for Workshop A
3. Company "Meliora" books Workshop B on June 20, 2025
4. Facilitator for Workshop B can see pre-work submissions from Workshop A participants

**Impact**:
- **Privacy Violation**: Participants from different workshops see each other's data
- **Confusion**: Facilitators see participants who aren't attending their workshop
- **Data Integrity**: No way to distinguish which participants belong to which workshop

**Current Code Example** (`MobileRegistration.tsx` line 187):
```typescript
const { error: preWorkError } = await supabase
  .from('pre_workshop_inputs')
  .insert({
    intake_id: intakeId,  // ⚠️ Only links to intake, not workshop
    participant_email: formData.participantEmail,
    participant_name: formData.participantName,
    pre_work_responses: responses,
  });
```

### 🚨 Issue #2: Participant Data Stored in JSON

**Problem**: `exec_intakes.participants` is a JSON array, making it difficult to:
- Query individual participants
- Update participant information
- Track which participants completed pre-work
- Associate participants with specific workshops

**Current Structure**:
```json
{
  "participants": [
    {"name": "John Doe", "email": "john@company.com", "role": "CTO"},
    {"name": "Jane Smith", "email": "jane@company.com", "role": "CFO"}
  ]
}
```

**Impact**:
- No referential integrity
- No ability to track participant-specific actions across tables
- Difficult to query "all workshops this participant attended"

### 🚨 Issue #3: Missing Workshop-Specific Participant Tracking

**Problem**: No table exists to track which participants are registered for which workshop.

**Current Gap**: 
- Pre-work submissions (`pre_workshop_inputs`) link to `intake_id`
- Pulse submissions (`exec_pulses`) link to `intake_id`  
- No link to `workshop_session_id`

**Impact**:
- Cannot determine which workshop a participant is actually attending
- Cannot send workshop-specific communications
- Cannot track attendance or completion rates per workshop

### 🚨 Issue #4: QR Code Registration Flow

**Current Flow**:
1. Facilitator generates QR code for pre-work (`/exec-teams/:intakeId`)
2. Participants scan and register via `/mobile-registration/:intakeId`
3. Submission links to `intake_id` only

**Missing**: Workshop-specific registration links
**Should be**: `/mobile-registration/:intakeId/:workshopId`

---

## Architectural Recommendations

### Option A: Add Workshop Session ID to Existing Tables (Minimal Change)

**Changes Required**:
1. Add `workshop_session_id` column to `pre_workshop_inputs`
2. Add `workshop_session_id` column to `exec_pulses`
3. Update registration flow to capture workshop ID
4. Update facilitator queries to filter by `workshop_session_id`

**Pros**:
- Minimal schema changes
- Backward compatible (can keep intake_id for legacy data)
- Quick to implement

**Cons**:
- Still leaves participants in JSON array
- Doesn't fully solve queryability issues
- Maintains some data duplication

### Option B: Create Workshop Participants Junction Table (Recommended)

**New Table**: `workshop_participants`
```sql
CREATE TABLE workshop_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES exec_intakes(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_role TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pre_work_completed BOOLEAN DEFAULT false,
  pulse_completed BOOLEAN DEFAULT false,
  UNIQUE(workshop_session_id, participant_email)
);
```

**Changes Required**:
1. Create `workshop_participants` table
2. Update `pre_workshop_inputs` to reference `workshop_participants.id`
3. Update `exec_pulses` to reference `workshop_participants.id`
4. Migrate existing participants from JSON to table
5. Update registration flow to create `workshop_participants` record
6. Update facilitator dashboard to query from `workshop_participants`

**Pros**:
- Clean data model with proper referential integrity
- Easy to query participants per workshop
- Prevents data leakage between workshops
- Enables per-participant tracking across tables

**Cons**:
- Requires schema migration
- More complex initial setup
- Requires data migration for existing intakes

### Option C: Hybrid Approach (Pragmatic)

**Combine both options**:
1. Add `workshop_session_id` to existing tables (immediate fix)
2. Gradually migrate to `workshop_participants` table
3. Keep JSON array for backward compatibility during transition

---

## Implementation Priority

### Phase 1: Immediate Fixes (Option A - 1-2 days)
- Add `workshop_session_id` to `pre_workshop_inputs`
- Add `workshop_session_id` to `exec_pulses`
- Update mobile registration to accept workshop ID
- Update facilitator queries to filter by workshop

### Phase 2: Structural Improvements (Option B - 3-5 days)
- Create `workshop_participants` table
- Migrate existing data
- Update all references
- Add RLS policies

### Phase 3: Enhanced Features (Optional)
- Participant dashboard
- Attendance tracking
- Cross-workshop participant history
- Automated reminders per workshop

---

## Security & RLS Considerations

### Current RLS Policies Review

**exec_intakes**: ✅ Anyone can create/view (intentional for public intake)
**workshop_sessions**: ✅ Facilitators can manage their own workshops
**pre_workshop_inputs**: ⚠️ Allows public INSERT (necessary for registration)
**exec_pulses**: ⚠️ Allows public INSERT (necessary for pulse surveys)

### Recommended RLS Updates (if implementing Option B)

```sql
-- workshop_participants: Participants can view their own data
CREATE POLICY "Participants can view own data" ON workshop_participants
FOR SELECT USING (participant_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Facilitators can manage participants for their workshops
CREATE POLICY "Facilitators can manage workshop participants" ON workshop_participants
FOR ALL USING (
  workshop_session_id IN (
    SELECT id FROM workshop_sessions WHERE facilitator_email = auth.email()
  )
);

-- Public can insert during registration
CREATE POLICY "Public can register for workshops" ON workshop_participants
FOR INSERT WITH CHECK (true);
```

---

## Migration Plan (if user approves Option B)

### Step 1: Create New Table
```sql
CREATE TABLE workshop_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES exec_intakes(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_role TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pre_work_completed BOOLEAN DEFAULT false,
  pulse_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workshop_session_id, participant_email)
);

CREATE INDEX idx_workshop_participants_workshop ON workshop_participants(workshop_session_id);
CREATE INDEX idx_workshop_participants_email ON workshop_participants(participant_email);
```

### Step 2: Migrate Existing Data
```sql
-- For each exec_intake with participants JSON array
-- Create workshop_participants entries for the associated workshop(s)
INSERT INTO workshop_participants (workshop_session_id, intake_id, participant_name, participant_email, participant_role)
SELECT 
  ws.id as workshop_session_id,
  ei.id as intake_id,
  p->> 'name' as participant_name,
  p->>'email' as participant_email,
  p->>'role' as participant_role
FROM exec_intakes ei
CROSS JOIN jsonb_array_elements(ei.participants::jsonb) as p
JOIN workshop_sessions ws ON ws.intake_id = ei.id
WHERE ei.participants IS NOT NULL AND jsonb_array_length(ei.participants::jsonb) > 0;
```

### Step 3: Update Foreign Keys
```sql
-- Add workshop_participant_id to pre_workshop_inputs
ALTER TABLE pre_workshop_inputs 
ADD COLUMN workshop_participant_id UUID REFERENCES workshop_participants(id) ON DELETE CASCADE;

-- Add workshop_participant_id to exec_pulses
ALTER TABLE exec_pulses 
ADD COLUMN workshop_participant_id UUID REFERENCES workshop_participants(id) ON DELETE CASCADE;
```

### Step 4: Update Application Code
- Update `MobileRegistration.tsx` to create `workshop_participants` record first
- Update `FacilitatorDashboard.tsx` to query from `workshop_participants`
- Update `PreWorkProgressCard.tsx` to show workshop-specific participants
- Update QR code generation to include `workshop_session_id`

### Step 5: Deprecate Old Structure (Optional)
- Keep `exec_intakes.participants` for reference
- Add migration date column
- Eventually drop after all workshops migrated

---

## Unused Route Audit

### `/exec-pulse/:intakeId/:emailHash`

**Status**: ✅ **IN USE**

**File**: `src/components/exec-teams/ExecutivePulse.tsx`

**Purpose**: Allows participants to complete AI readiness pulse survey before workshop

**Flow**:
1. Facilitator sends email with link: `/exec-pulse/{intakeId}/{emailHash}`
2. Participant opens link
3. Component loads participant info from `exec_intakes.participants` JSON array
4. Participant completes 4-dimension assessment
5. Scores saved to `exec_pulses` table

**Current Issue**: Uses `emailHash` to look up participant, but the lookup is failing (see console error in provided screenshot)

**Error**: `invalid input syntax for type uuid: ":intakeId"`

**Root Cause**: URL parameter not being parsed correctly in `ExecutivePulse.tsx` line 120

---

## Conclusion & Recommendations

### Immediate Actions Required:
1. ✅ Fix workshop visibility UI (CP1 - COMPLETED)
2. ✅ Fix calendar checkmark display (CP2 - COMPLETED)  
3. ✅ Fix Previous button navigation (CP3 - COMPLETED)
4. ⚠️ Fix `/exec-pulse/:intakeId/:emailHash` parameter parsing

### Strategic Decision Needed:
**Should we implement Option A (quick fix) or Option B (proper architecture)?**

**Recommendation**: **Option C (Hybrid Approach)**
- Implement Option A immediately (add `workshop_session_id` columns)
- Plan Option B migration for next sprint
- Prevents data leakage NOW while allowing proper long-term architecture

### Estimated Effort:
- **Option A**: 4-6 hours
- **Option B**: 2-3 days  
- **Option C**: Option A immediately + Option B in 1-2 weeks

---

## Next Steps

1. **User Decision**: Choose Option A, B, or C
2. **If Option A/C**: Proceed with adding `workshop_session_id` columns
3. **If Option B/C**: Plan data migration timeline
4. **Fix ExecutivePulse URL parsing issue** (separate from architecture decision)

---

**Document Version**: 1.0  
**Date**: 2025-11-17  
**Author**: MindMaker AI Development Team
