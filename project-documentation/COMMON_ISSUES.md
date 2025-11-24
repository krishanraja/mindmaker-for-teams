# Common Issues & Solutions

## Build & Deployment Issues

### TypeScript Type Mismatches After Database Changes

**Symptom:**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Root cause:**
- Database schema changed (added columns)
- `src/integrations/supabase/types.ts` regenerated
- Frontend code expects old schema

**Solution:**
```typescript
// Temporary: Cast to `any` until types sync
const { data } = await supabase
  .from('table')
  .select('*')
  .single();

setData(data as any); // Cast to bypass type check
```

**Long-term fix:**
1. Run database migration
2. Supabase regenerates types automatically
3. Update frontend code to use new fields
4. Remove `as any` casts

### Edge Function Deployment Failures

**Symptom:**
- Edge function doesn't deploy
- Old version still running
- Logs show outdated code

**Solution:**
1. Check `supabase/config.toml` has function listed
2. Verify `supabase/functions/{function-name}/index.ts` exists
3. Check for syntax errors in function code
4. Wait 2-3 minutes for deployment (not instant)
5. Check Supabase dashboard → Functions for deployment status

**Common mistake:**
```toml
# WRONG: Forgot to add new function
[functions.old-function]
verify_jwt = false

# RIGHT: Add new function
[functions.new-function]
verify_jwt = false
```

### "Cannot find module" Errors in Edge Functions

**Symptom:**
```
Error: Cannot find module '@supabase/supabase-js'
```

**Root cause:**
- Edge functions run in Deno, not Node
- Different import syntax
- Can't use npm packages directly

**Solution:**
```typescript
// WRONG: Node-style import
import { supabase } from "@/integrations/supabase/client";

// RIGHT: Deno-compatible
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

## Runtime Issues

### QR Code Scan Doesn't Load Data

**Symptom:**
- User scans QR code
- Mobile page loads but shows "Workshop not found"
- Console error: "No data returned from database"

**Root cause:**
- workshop_session_id in QR is invalid
- Workshop was deleted
- RLS policy blocking read

**Debug steps:**
1. Check QR code data: `console.log('Workshop ID:', sessionId)`
2. Query database directly: `SELECT * FROM workshop_sessions WHERE id = '...'`
3. Check RLS policies: Do participants have read access?
4. Verify activity_sessions expiry: Is QR expired?

**Solution:**
```sql
-- Check RLS policy allows public reads for active workshops
CREATE POLICY "workshop_sessions_select_policy" ON workshop_sessions
  FOR SELECT USING (status = 'active' OR status = 'draft');
```

### Mobile Submission Not Appearing in Dashboard

**Symptom:**
- Participant submits data
- Success toast shows
- Facilitator dashboard doesn't update

**Root cause:**
- Polling not running (dashboard closed)
- Data saved to wrong workshop_session_id
- Frontend filtering out submission

**Debug steps:**
1. Check database: `SELECT * FROM bottleneck_submissions WHERE workshop_session_id = '...'`
2. Verify polling: Look for network requests every 3-5 seconds
3. Check filters: Is facilitator viewing correct segment?

**Solution:**
```typescript
// Ensure polling is active
const { data } = useQuery({
  queryKey: ['bottlenecks', sessionId],
  queryFn: fetchBottlenecks,
  refetchInterval: 3000, // 3 seconds
  enabled: !!sessionId, // Only poll if sessionId exists
});
```

### AI Generation Hangs or Times Out

**Symptom:**
- Click "Generate Decision Framework"
- Loading spinner forever
- Eventually times out (30+ seconds)

**Root cause:**
- OpenAI API slow or down
- Prompt too long (hitting token limits)
- Edge function timeout (30 second max)

**Solution:**
1. Check OpenAI status: https://status.openai.com
2. Reduce prompt size: Remove unnecessary data
3. Use streaming responses for long generations
4. Add fallback to Gemini if OpenAI fails

**Edge function pattern:**
```typescript
// Add timeout handling
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    signal: controller.signal,
    // ... other options
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Try fallback provider
    return fallbackToGemini();
  }
  throw error;
} finally {
  clearTimeout(timeoutId);
}
```

## Data Consistency Issues

### Duplicate Submissions

**Symptom:**
- Participant submits once
- Multiple rows appear in database
- Facilitator sees duplicate items

**Root cause:**
- Double-click on submit button
- Network retry logic
- No duplicate checking

**Solution:**
```typescript
// Add debounce to submit button
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return; // Prevent double-click
  
  setIsSubmitting(true);
  try {
    await submitData();
  } finally {
    setIsSubmitting(false);
  }
};

// Disable button while submitting
<Button disabled={isSubmitting} onClick={handleSubmit}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### Cluster IDs Not Matching

**Symptom:**
- AI clusters bottlenecks
- Some items not assigned to clusters
- Cluster names inconsistent

**Root cause:**
- AI response missing some items
- JSON parsing error
- Cluster IDs not persisted properly

**Solution:**
```typescript
// Validate AI response before saving
const validateClusters = (items, clusters) => {
  const allItemsClustered = items.every(item => 
    clusters.some(cluster => cluster.items.includes(item.id))
  );
  
  if (!allItemsClustered) {
    console.error('Some items not clustered');
    // Assign unclustered items to "Other"
  }
  
  return clusters;
};
```

### Profile Matching Failures

**Symptom:**
- Same participant appears multiple times
- Email matches but different profile_id
- Participant history not showing

**Root cause:**
- Email case sensitivity (john@co vs John@co)
- Whitespace in email
- Multiple profiles created

**Solution:**
```typescript
// Normalize email before lookup
const normalizeEmail = (email: string) => 
  email.trim().toLowerCase();

// Use normalized email in queries
const { data: profile } = await supabase
  .from('unified_profiles')
  .select('*')
  .eq('email', normalizeEmail(email))
  .single();
```

## Performance Issues

### Dashboard Loading Slowly

**Symptom:**
- Facilitator dashboard takes 5+ seconds to load
- Network tab shows many requests
- UI feels sluggish

**Root cause:**
- Fetching too much data at once
- No pagination on large tables
- Complex joins in queries

**Solution:**
1. Add pagination: Fetch 50 items at a time
2. Use select() to limit columns: `select('id, name, created_at')`
3. Add indexes to frequently queried columns
4. Cache results with TanStack Query

```typescript
// Add pagination
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['bottlenecks'],
  queryFn: ({ pageParam = 0 }) => 
    supabase
      .from('bottleneck_submissions')
      .select('*')
      .range(pageParam, pageParam + 49), // 50 per page
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === 50 ? pages.length * 50 : undefined,
});
```

### Mobile Page Not Responsive

**Symptom:**
- Submit button off-screen
- Text too small to read
- Horizontal scroll on mobile

**Root cause:**
- Fixed widths instead of responsive units
- Missing viewport meta tag
- Desktop-first CSS

**Solution:**
1. Use Tailwind responsive classes:
```tsx
<div className="w-full max-w-md mx-auto px-4">
  {/* Content */}
</div>
```

2. Test on real device (not just browser DevTools)
3. Check viewport meta tag in index.html:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Authentication Issues

### Facilitator Can't Log In

**Symptom:**
- Correct email/password
- Login fails with "Invalid credentials"
- No error in console

**Root cause:**
- User exists but no role assigned
- RLS policy blocking access
- Auth session expired

**Solution:**
```sql
-- Check if user has facilitator role
SELECT * FROM user_roles WHERE user_id = 'user_uuid';

-- Add role if missing
INSERT INTO user_roles (user_id, role) VALUES ('user_uuid', 'facilitator');
```

### Protected Routes Not Working

**Symptom:**
- Logged in but redirected to login
- Dashboard not accessible
- "Access denied" message

**Root cause:**
- Auth state not persisted
- ProtectedRoute component not checking auth correctly
- Session expired

**Solution:**
```typescript
// Check auth state in ProtectedRoute
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/facilitator/login" />;
  
  return children;
};
```

## Edge Function Debugging

### How to Read Edge Function Logs

1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Select function name
4. Click "Logs" tab
5. Look for console.log() output

**Add logging:**
```typescript
console.log('Input:', JSON.stringify(requestData));
console.log('AI Response:', aiResponse);
console.log('Saved to DB:', savedData);
```

### Testing Edge Functions Locally

Can't test locally easily. Instead:

1. Deploy to Supabase
2. Call from frontend
3. Check logs in dashboard
4. Iterate and redeploy

**Quick test:**
```bash
# Call edge function from terminal
curl -X POST https://bkyuxvschuwngtcdhsyg.supabase.co/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Database Issues

### RLS Policies Blocking Queries

**Symptom:**
- Query returns empty array
- Database has data (checked in SQL editor)
- No error, just no results

**Root cause:**
- RLS policy too restrictive
- Missing policy for operation
- Wrong auth context

**Solution:**
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Add missing policy
CREATE POLICY "allow_select" ON your_table
  FOR SELECT USING (true); -- Adjust as needed
```

### Foreign Key Constraint Violations

**Symptom:**
- Insert fails with "violates foreign key constraint"
- Workshop session ID doesn't exist
- Profile ID not found

**Solution:**
1. Verify parent record exists:
```sql
SELECT * FROM workshop_sessions WHERE id = 'session_uuid';
```

2. Create parent record first, then child
3. Use transactions to ensure atomicity

## Quick Fixes Checklist

When something breaks:

1. **Check console logs** (browser DevTools)
2. **Check edge function logs** (Supabase dashboard)
3. **Check database** (SQL editor)
4. **Check RLS policies** (Are they blocking?)
5. **Check types** (TypeScript errors?)
6. **Check network tab** (Is request failing?)
7. **Check auth state** (Is user logged in?)
8. **Check data flow** (Is data saving/loading?)

**Most common fix:** Refresh the page. Seriously.
