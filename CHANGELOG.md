# Changelog

All notable changes to the MindMaker Leaders project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- `project-documentation/MASTER_INSTRUCTIONS.md` - Full vibe-coding standards
- `project-documentation/PROJECT_NOTES.md` - Running decisions and architectural state
- `CHANGELOG.md` - This changelog file
- `DEPLOY_CHECKLIST.md` - Pre and post-deploy verification steps
- `src/types/api-response.ts` - Standardized API response types
- `src/lib/logger.ts` - Structured logging utility with session tracing

### Changed
- Updated `supabase/config.toml` to include all edge functions
- Updated `project-documentation/README.md` with links to new documentation

### Fixed
- Logo asset now correctly using user-uploaded green logo

---

## [1.0.0] - 2024-12-09

### Added
- Initial MindMaker Leaders platform
- Facilitator dashboard with 7-segment workshop flow
- Mobile submission flows (bottleneck, effortless map, dot voting)
- AI-powered insights generation
- QR code activity session management
- Executive reporting and PDF generation
- Pre-workshop participant intake
- Real-time collaboration features

### Infrastructure
- Supabase backend with PostgreSQL
- 30+ Edge Functions for AI and business logic
- RLS policies for data security
- Design system with semantic tokens
