# Member privacy v1 — release runbook

Implementation date: 2026-10-23. The migration was explicitly approved and applied
to the Queer Atlas Supabase project on this date. Deployed SQL checks and the
synthetic rollback test passed; the user then explicitly approved opening the
directory. See `member-privacy-verification.md` for evidence and remaining limits.
The frontend/API source changes are local and still require the normal code release.

## What the release implements

- Private raw account/profile rows, separate explicitly shared profile projection.
- Hidden default; accepted contacts; community discovery only by active choice.
- Confirmed email, adult attestation (18+) and versioned community rules before
  directory access. These checks do not verify identity or good intentions.
- Separate alias, introduction, optional interest city/pronouns/photo.
- Directory and direct profile access through gated RPCs, without legacy fallback.
- Account-level blocking, contact removal, private messages with no presence or
  read receipts. Existing private-event requests remain a separate participant flow.
  Authenticated community reads also filter blocked authors, and blocked topics
  cannot receive replies from the blocked account. Public contributions remain
  visible to signed-out visitors: blocking cannot recall public information.
- Private avatar storage access, metadata-free new JPEG/PNG/WebP uploads, and
  short-lived signed URLs. Directory/profile images use 30-second URLs.
- English and Spanish settings/help, public pre-login guidance and profile preview.
- Reports, restricted admin review, access/status audit and daily retention job.
- Self-service deletion with recent authentication; failed deletion remains hidden
  and appears in the admin queue. Never describe pending deletion as erasure.
  A service-only transaction explicitly clears known private Atlas tables, calendar
  reminders/subscriptions, check-ins, memories, presence and legacy following before
  the auth account is deleted. Project-specific tables still require inventory.

Entry points: `/privacy-settings`, Community → People, existing member links in
`/favorites?member=...`, `/messages`, and `/admin/privacy` for authorized operators.
The demo `/dev/member-privacy` contains only synthetic data, never saves changes,
and returns 404 in production.

## Before migration

1. Use a staging copy with synthetic accounts and representative schema first.
   Prerequisites: member profiles/extras, following, direct messaging and storage.
2. Take a recoverable database snapshot under the existing restricted backup policy.
   Do not export member rows into this repo or into an issue/chat.
3. Enumerate actual RLS policies, table/column grants, views, triggers and all
   SECURITY DEFINER functions in every exposed schema. REST schema existence does
   not verify these. Check indirect/dynamic references too.
4. Inventory member images and previously public URLs, including CDN copies.
   Making a bucket private does not recall copies previously downloaded by others.
   Plan cache invalidation and investigate any confirmed unauthorized exposure.
5. Review custom tables and foreign keys pointing to auth.users, member_profiles
   and storage. Exercise account deletion against staging users with plans,
   favorites, check-ins, memories, messages, event requests and published content.
6. Assign named incident/report operators and review age policy, retention,
   international transfers and the DPIA risk register. Do not promise legal
   compliance or a support response time without that operational review.
7. Prepare a private-profile preview for existing members. Legacy members/friends/
   public settings are not valid consent for the new discoverability model.
8. This release clears member browser caches on sign-out/account switch. Cloud
   records remain. Warn pilot users to sync/export unsynced local changes first.

## Apply and verify

Apply `supabase/member-privacy-v1.sql` using an authorized SQL administrator.
It is transactional and re-runnable, with directory rollout **closed by default**.
It revokes old discovery RPC/view access and broad policy-management helpers,
restricts raw profile/Atlas reads to the owner, and makes member image buckets
private. Do not re-run older permissive profile/following migrations afterwards.

The migration does not copy old following into approved contacts and does not
auto-publish existing users. Private saved data is preserved. Old profile display
names are not used by the new directory; a separate sharing alias is required.

Verify the actual database definitions after application, not just the SQL file.
Re-run the access matrix with anon, new member, eligible member, one-way follower,
approved contact, blocked member and operator. Test both directions of blocking.
Check direct RPC/table/storage requests and already-open views, not just UI state.

Then deploy the UI/backend together. Set `CRON_SECRET` in the deployment environment;
`/api/cron/member-privacy` refuses requests if the secret is absent. The daily job
deletes request counters older than 7 days and reports/audits older than 180 days.
This is the implemented maximum for this queue, not a statement about legacy
moderation records, infrastructure logs or backup retention. Those need a separate
documented inventory and policy. Update public privacy information accordingly.

Only after staging, production SQL review, private-storage/CDN verification,
account-erasure checks and operational review pass, open the controlled pilot:

```sql
update public.qa_privacy_rollout set directory_open = true where id = true;
```

This SQL is an explicit operator action, never a browser-controlled field.
The gate also controls private messaging. Private Atlas use does not require it.
Admin review is available with the gate closed.

## Verification commands

From the repository root, using the configured Node.js runtime:

```powershell
node scripts/setup-member-privacy-tests.mjs
node scripts/test-member-privacy.mjs
node --use-system-ca --env-file=.env.local scripts/audit-member-privacy-readiness.mjs
```

The setup script pins PGlite 0.5.11 from the npm registry, verifies its SHA-512
integrity and places it in ignored node_modules cache. It adds no application
dependency. The test executes the actual migration in isolated PostgreSQL/WASM
using synthetic identities. Run the same matrix against Supabase staging because
the local fixture is not a reproduction of every deployed policy, extension or trigger.

Metadata audit prints only table availability, image bucket configuration and RPC
availability. It does not read profiles, prove RLS correctness or apply migration.
The production project needs SQL-administrator access for the complete policy audit.

## Expected failure behavior

- Missing migration/RPC: directory and member profile unavailable; no ranking fallback.
- Privacy save fails/offline: no success message and no optimistic visibility change.
- Image authorization fails: generic avatar, never an old public URL fallback.
- Deletion fails: profile stays hidden/pending; operator queue shows the request.
- A signed image can remain accessible until its short expiry; stored copies cannot
  be revoked. Re-checks of open directory/profile views are every 15 seconds.
- A read-only row is removed when access is revoked on re-check. This is not a
  guarantee that an observer cannot retain text/photos already received.
- Generic unavailable profile response does not reveal whether a user hid, blocked
  or deleted their profile.

## Safe rollback

Close the directory first:

```sql
update public.qa_privacy_rollout set directory_open = false where id = true;
```

Do not restore public buckets, old permissive RLS or legacy discovery grants.
Roll back design independently while keeping backend deny rules. If a previous UI
cannot work with the hardened backend, leave community discovery closed and preserve
private Atlas data. Do not recover availability by broadening read permissions.
Backups must be restored together with later deletion/visibility revocations;
restoring an old snapshot must never silently republish accounts.

## Remaining operator responsibilities

- Actual deployed SQL/grant/trigger and storage/CDN audit, with incident assessment.
- Publish the local frontend/API code and verify its deployed environment and cron.
- Confirm erasure semantics for all project-specific foreign keys and legacy tables.
- Named moderation/incident ownership and tested review procedure.
- Approved legal basis, DPIA, age policy and public retention/backup disclosures.
- External rights/country guidance review; QARI never changes profile visibility.

These responsibilities remain explicit; the successful migration and database test
do not constitute legal sign-off, complete erasure verification or cache recall.
