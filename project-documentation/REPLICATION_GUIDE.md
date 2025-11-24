# Replication Guide

Complete step-by-step instructions to replicate this project from scratch.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier works)
- OpenAI API key (for AI features)
- Resend API key (for emails)
- Code editor (VS Code recommended)

## Part 1: Initial Setup (15 minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd mindmaker-leaders
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: "mindmaker-leaders"
4. Set database password (save this!)
5. Select region closest to you
6. Wait 2-3 minutes for provisioning

### 4. Configure Environment

Get your Supabase credentials:
- Go to Project Settings → API
- Copy "Project URL" and "anon public" key

Update `src/integrations/supabase/client.ts`:
```typescript
const SUPABASE_URL = "YOUR_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_ANON_KEY";
```

Update `supabase/config.toml`:
```toml
project_id = "YOUR_PROJECT_ID"
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to verify it loads.

## Part 2: Database Setup (30 minutes)

### 1. Enable Required Extensions

Go to Supabase Dashboard → Database → Extensions, enable:
- `uuid-ossp` (for UUID generation)
- `pg_crypto` (for hashing functions)

### 2. Run All Migrations

Supabase Dashboard → SQL Editor

Copy and execute all files from `supabase/migrations/` in order (by timestamp).

**Critical migrations:**
- Initial schema setup
- RLS policies
- Functions and triggers
- Indexes

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see: workshop_sessions, unified_profiles, bottleneck_submissions, effortless_map_items, simulation_results, strategy_alignment, pilot_charters, decision_frameworks, and more.

### 3. Set Up RLS Policies

All policies should be created by migrations. Verify:

```sql
SELECT tablename, policyname FROM pg_policies;
```

**Key policies:**
- workshop_sessions: Facilitator can read/write their workshops
- unified_profiles: Public read, authenticated write
- submissions tables: Public insert (for QR codes), facilitator read

### 4. Create Storage Buckets

Supabase Dashboard → Storage → Create bucket:

1. **pre-workshop-qr**
   - Public: Yes
   - Allowed file types: image/*
   - Max file size: 5MB

2. **post-session-qr**
   - Public: Yes
   - Allowed file types: image/*
   - Max file size: 5MB

### 5. Set Up Authentication

Supabase Dashboard → Authentication → Providers:

1. Enable Email provider (default)
2. Disable email confirmation (optional, for faster testing)
3. Set Site URL: http://localhost:5173

**Create test facilitator:**

Supabase Dashboard → Authentication → Users → Add User:
- Email: test@facilitator.com
- Password: testpass123
- Auto-confirm: Yes

Then assign role:
```sql
-- Get user ID from auth.users
SELECT id FROM auth.users WHERE email = 'test@facilitator.com';

-- Insert role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_FROM_ABOVE', 'facilitator');
```

## Part 3: Edge Functions Setup (20 minutes)

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Enter database password from Part 1.

### 3. Set Secrets

Go to Supabase Dashboard → Edge Functions → Manage Secrets

Add these secrets:
- `OPENAI_API_KEY`: Your OpenAI API key
- `RESEND_API_KEY`: Your Resend API key (for emails)
- `GEMINI_API_KEY`: (Optional) Gemini fallback key
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: From Project Settings → API

### 4. Deploy Edge Functions

Deploy all functions at once:

```bash
supabase functions deploy generate-decision-framework
supabase functions deploy cluster-bottleneck-inputs
supabase functions deploy generate-strategy-insights
supabase functions deploy generate-guardrails
supabase functions deploy generate-huddle-synthesis
supabase functions deploy generate-prework-qr
supabase functions deploy generate-activity-qr
supabase functions deploy generate-post-session-qr
supabase functions deploy send-prework-emails
supabase functions deploy send-exec-summary-email
```

**Verify deployment:**

Supabase Dashboard → Edge Functions → Check each function status

### 5. Test Edge Function

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-activity-qr \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"workshop_session_id": "test-id", "activity_type": "bottleneck"}'
```

Should return QR code data URL.

## Part 4: Test Complete Flow (30 minutes)

### 1. Create Test Workshop

1. Log in: http://localhost:5173/facilitator/login
2. Email: test@facilitator.com, Password: testpass123
3. Navigate to "Create Workshop"
4. Fill intake form:
   - Company: Test Company
   - Participants: 5
   - Date: Tomorrow
5. Click "Create Workshop"

**Verify in database:**
```sql
SELECT * FROM workshop_sessions ORDER BY created_at DESC LIMIT 1;
```

### 2. Test QR Code Generation

1. In facilitator dashboard, find your workshop
2. Click "Start Workshop" → Navigate to Segment 2
3. Click "Generate QR Code"
4. QR code should appear

**Verify:**
```sql
SELECT * FROM activity_sessions ORDER BY created_at DESC LIMIT 1;
```

### 3. Test Mobile Submission

1. Scan QR code with phone (or manually visit URL)
2. Should load mobile submission page
3. Submit test bottleneck: "Too many manual reports"
4. Should see success toast

**Verify in database:**
```sql
SELECT * FROM bottleneck_submissions ORDER BY created_at DESC LIMIT 1;
```

**Verify in facilitator dashboard:**
- Should see new submission within 3-5 seconds
- Count should update

### 4. Test AI Clustering

1. Submit 5+ bottlenecks (different texts)
2. In facilitator dashboard, click "Cluster Bottlenecks"
3. Loading spinner should show
4. After 10-30 seconds, clusters should appear

**Verify:**
```sql
SELECT DISTINCT cluster_name FROM bottleneck_submissions 
WHERE workshop_session_id = 'YOUR_SESSION_ID';
```

### 5. Test Decision Framework Generation

1. Complete all segments (add dummy data if needed)
2. Navigate to Segment 7
3. Click "Generate Decision Framework"
4. Should take 20-60 seconds
5. Framework should display with sections

**Verify:**
```sql
SELECT * FROM decision_frameworks WHERE workshop_session_id = 'YOUR_SESSION_ID';
```

## Part 5: Production Deployment (15 minutes)

### 1. Build for Production

```bash
npm run build
```

Should create `dist/` folder with optimized assets.

### 2. Deploy to Lovable (or other host)

**Option A: Lovable**
1. Push to GitHub
2. Connect repo to Lovable
3. Auto-deploys on push

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: Netlify**
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### 3. Update Supabase Site URL

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: https://your-production-domain.com
- Redirect URLs: https://your-production-domain.com/**

### 4. Update CORS

Supabase Dashboard → API Settings → Add production domain to allowed origins.

### 5. Test Production

1. Visit production URL
2. Create account and test facilitator login
3. Create workshop end-to-end
4. Submit via mobile QR code
5. Generate decision framework

## Part 6: Monitoring & Maintenance (Ongoing)

### Monitor Edge Functions

Supabase Dashboard → Edge Functions → Logs

Check for:
- Failed invocations
- Timeout errors
- API rate limits

### Monitor Database

```sql
-- Check active workshops
SELECT COUNT(*) FROM workshop_sessions WHERE status = 'active';

-- Check submission volume
SELECT COUNT(*) FROM bottleneck_submissions WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check AI function calls
SELECT COUNT(*) FROM decision_frameworks WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Backup Database

Supabase Dashboard → Database → Backups

- Daily backups automatic (free tier: 7 days retention)
- Manual backup: Export via pg_dump

### Update Dependencies

```bash
npm outdated
npm update
```

Test thoroughly after updates.

## Troubleshooting Replication

### "Database connection failed"

- Check project_id in config files matches Supabase
- Verify database is online (Supabase dashboard)
- Check RLS policies aren't blocking access

### "Edge function not found"

- Verify function deployed: `supabase functions list`
- Check function name in code matches deployed name
- Redeploy: `supabase functions deploy function-name`

### "QR code doesn't load workshop"

- Check workshop_session_id is valid
- Verify RLS policies allow public read
- Check activity_session hasn't expired

### "AI generation fails"

- Verify OPENAI_API_KEY is set in edge function secrets
- Check OpenAI API quota/billing
- Look at edge function logs for error details

### "Mobile submission doesn't appear"

- Check polling is running (network tab, requests every 3s)
- Verify data saved to database (SQL query)
- Refresh facilitator dashboard

## Replication Checklist

- [ ] Repository cloned and dependencies installed
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] All database migrations run
- [ ] RLS policies active
- [ ] Storage buckets created
- [ ] Authentication configured
- [ ] Test facilitator account created
- [ ] Edge functions deployed
- [ ] Secrets configured
- [ ] Test workshop created successfully
- [ ] QR code generation working
- [ ] Mobile submission working
- [ ] AI clustering working
- [ ] Decision framework generation working
- [ ] Production deployment complete
- [ ] Monitoring set up

## Estimated Total Time

- Setup: 15 minutes
- Database: 30 minutes
- Edge Functions: 20 minutes
- Testing: 30 minutes
- Deployment: 15 minutes
- **Total: ~2 hours**

(Assumes no errors. Add 30-60 minutes buffer for troubleshooting.)

## Next Steps After Replication

1. Review [COMMON_ISSUES.md](./COMMON_ISSUES.md) for known problems
2. Customize branding (logo, colors) per [BRANDING.md](./BRANDING.md)
3. Add simulation scenarios (template in code)
4. Invite real facilitators to test
5. Monitor edge function costs (OpenAI API usage)
6. Set up analytics (Posthog, Plausible, or similar)

## Support

If you get stuck:
1. Check [COMMON_ISSUES.md](./COMMON_ISSUES.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
3. Check Supabase edge function logs
4. Review browser console errors
5. Verify database schema matches migrations
