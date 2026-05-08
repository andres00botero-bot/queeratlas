# Avatar System - Step 1 + Step 2 (No App Code)

This document locks the avatar contract before implementation changes in UI/app logic.

## Step 1: Contract (Source of Truth)

### Identity rules
- Canonical user identity is `auth.users.id` (UUID).
- Public profile row is `public.member_profiles.user_id = auth.users.id`.
- Display name comes from `member_profiles.display_name`.
- Admin account is identified by email `andres00botero@gmail.com` and should have display name `Admin`.

### Avatar rules
- Avatar storage source of truth will be path-based in DB:
  - `member_profiles.avatar_path` (relative storage object path).
- Public URL remains supported for backward compatibility:
  - `member_profiles.avatar_url` (legacy compatibility field).
- Versioning for cache-busting and deterministic refresh:
  - `member_profiles.avatar_version` (monotonic integer).
  - `member_profiles.avatar_updated_at` (timestamp).

### Data consistency target
- If avatar changes:
  - `avatar_updated_at` must update.
  - `avatar_version` must increment.
- Existing data must keep working during migration window.

## Step 2: DB migration scope (no app code)

This step only introduces schema + safe backfill + trigger consistency.

Included:
- Add missing columns (`avatar_path`, `avatar_version`, `avatar_updated_at`).
- Backfill `avatar_path` from existing Supabase public `avatar_url` when possible.
- Add trigger to maintain `avatar_version` and `avatar_updated_at` on avatar field changes.
- Normalize admin display name to `Admin`.

Not included in Step 2:
- Storage bucket policy changes (Step 3).
- Upload pipeline changes in app code.
- UI/component refactor.

## Execution order
1. Run `supabase/avatar-system-step2-schema-v1.sql`.
2. Run verification queries from `supabase/avatar-system-step2-verify.sql`.
3. Confirm results before any app-code edits.
