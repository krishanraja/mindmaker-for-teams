# Deploy Checklist

Use this checklist before and after every deployment.

---

## Pre-Deploy Checklist

### Build Verification
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors (`npm run typecheck` if available)
- [ ] No ESLint errors (`npm run lint`)

### Environment Variables
- [ ] All required secrets configured in Supabase dashboard
- [ ] No hardcoded API keys or secrets in code
- [ ] Edge function secrets verified in Supabase Functions settings

### Database
- [ ] All migrations applied and successful
- [ ] RLS policies verified for new tables
- [ ] No breaking schema changes without migration

### Edge Functions
- [ ] All functions listed in `supabase/config.toml`
- [ ] CORS headers configured for web-accessible functions
- [ ] JWT verification settings correct (enabled/disabled as needed)

### Assets
- [ ] Brand assets unchanged unless explicitly updated
- [ ] No auto-generated images replacing real assets
- [ ] All image paths valid and accessible

---

## Post-Deploy Checklist

### Health Check
- [ ] App loads without console errors
- [ ] Main routes accessible (/, /facilitator, /create-workshop)
- [ ] Authentication flow works (login/logout)

### Regression Check
- [ ] Facilitator dashboard loads and shows workshops
- [ ] Mobile flows accessible via QR codes
- [ ] AI features respond (insights generation)
- [ ] PDF generation works

### Log Scan
- [ ] Check Supabase Edge Function logs for errors
- [ ] Check browser console for runtime errors
- [ ] Verify no 500 errors in network tab

---

## Rollback Plan

If critical issues are found post-deploy:

1. **Immediate**: Revert to previous commit in Lovable
2. **Database**: If migration caused issues, apply reverse migration
3. **Edge Functions**: Previous versions auto-deployed on revert
4. **Notify**: Document issue in COMMON_ISSUES.md

---

## Verification Commands

```bash
# Build check
npm run build

# Type check (if configured)
npm run typecheck

# Lint check
npm run lint

# Local preview
npm run dev
```

---

## Critical Paths to Test

1. **Workshop Creation**: Create → Configure → Generate QR
2. **Participant Flow**: Scan QR → Register → Submit responses
3. **AI Insights**: Generate insights → View in dashboard
4. **Report Generation**: Complete workshop → Generate PDF
