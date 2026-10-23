# Member privacy verification and release status

Date: 2026-10-23. Local source implementation complete; Supabase migration applied
and directory activated with separate explicit user approvals. Frontend/API changes
have not been pushed or deployed by this chat.

## Production evidence

- Applied `supabase/member-privacy-v1.sql` through the authenticated SQL Editor;
  editor contents were copied back and compared with the tested file before run.
  SHA-256: `0EB6F6C0CEC02F1185E2B0C8A4DA35EC499E1F2614678C23F1398AB9CF39E060`.
- Supabase reported `Success. No rows returned`. Its additional RLS-enabling option
  was used; the deployed verification confirmed RLS on all seven privacy tables.
- Deployed verification: avatar bucket private; raw profiles owner-only with a
  restrictive owner gate; legacy search and identity RPC execute grants false;
  direct client thread update false; new chat account-ID column present.
- `member-privacy-verify-transaction.sql` passed in the actual project after explicit
  user approval. Three synthetic identities exercised hidden defaults, closed gate,
  raw RLS, explicit projection, approved contacts, messaging, exact-avatar access,
  private-memory denial, both-direction blocking and deletion visibility. An inner
  exception subtransaction restored every fixture and temporary gate change.
- Local verification additionally asserts that this SQL leaves the identity count
  unchanged. No real member profiles were exported for these checks.
- After the test, the user explicitly approved directory activation. The separate
  `update ... directory_open=true where id=true` was run and returned `true`.
  Existing members remain hidden unless they actively opt in. Confirmed email,
  adult attestation and community rules are still required before shared audiences.
- Evidence screenshot: `member-privacy-production-test.png`.

## Requirement evidence

| Requirement | Current evidence | Limit / release dependency |
| --- | --- | --- |
| Hidden default, separate public projection, voluntary sharing | Actual migration executed by `scripts/test-member-privacy.mjs`; model projection assertions; settings preview | Apply and inspect actual deployed policies and grants |
| Email confirmation, adult attestation, consent, closed rollout | PostgreSQL tests exercise denied and accepted consent, eligibility and closed/reapplied gate | Operator approval of adult community policy; confirmation configuration |
| Approved contacts, no following bypass | PostgreSQL tests prove a one-way follower is denied and only recipient approval grants access | Repeat with synthetic staging identities |
| Both-direction blocking | SQL tests deny profiles, image reads, messages, contact requests, event requests and community topic replies after blocking | Public contributions remain public to signed-out readers; new accounts can evade account-level blocks |
| Raw profile and private Atlas isolation | SQL tests execute raw queries, owner writes, denied other-account writes, legacy RPC/view/policy-helper revocation | Fixture cannot enumerate unknown deployed tables, triggers or functions |
| Image isolation | Private bucket migration; tests distinguish exact shared avatar from memories in same folder; denied other-account insert/update/delete | Actual Supabase storage, old public URL/CDN invalidation and old image metadata require staging/production review |
| New image metadata removal | `memberImages.js` decodes/re-encodes accepted images; upload callers refuse original-file fallback | Browser image decoder and existing historical files are outside SQL test scope |
| Open-page revocation and account changes | Profile/directory revalidation; community invalidation without cached-message merge; keyed account views; stale-response generations; auth cache clearing | Browser smoke checks are not a full multi-account revocation test; repeat the runbook matrix before opening |
| Settings, preview and help in English/Spanish | Synthetic browser preview inspected on desktop and mobile; 320/390/430 px; hidden radio removes shared profile preview; Spanish privacy-help disclosure verified | User comprehension testing with relevant lived experience remains an operator research task |
| Report confidentiality and operator access | SQL report read denied to target; admin endpoint requires existing server-verified admin; audit records and bounded retention | Assign real operators, response policy and incident procedure |
| Account deletion | Recent-login server check, hide-first RPC, service-only explicit private-Atlas erasure; SQL tests preserve other user's favorites/plans and deny arbitrary client erasure | Real Auth deletion, every deployed FK/table, backups, public contribution and message retention need staging review |
| Guarded server routes | Local HTTP: deletion without token 401; admin without access 403; cron with spoofed `x-vercel-cron` 401; all `no-store` | Configure CRON_SECRET and verify scheduled pruning after deployment |
| Fail closed before migration | Missing RPC produces unavailable UI; directory has no legacy ranking fallback | Existing production backend is not hardened until SQL/storage rollout |

## Executed checks

- `scripts/test-member-privacy.mjs`: passed against the real migration in isolated
  PostgreSQL/WASM, with synthetic accounts and deliberately broad legacy policies.
  It also executes the deployed rollback-test script and proves no test identities
  remain, plus forces a stalled client dependency to verify the 10-second deadline.
- ESLint: passed on privacy modules, routes, auth, favorites, community and signup
  components during implementation. Re-run after subsequent changes.
- Optimized webpack build: passed, including 189 generated pages and new routes.
  Production-mode HTTP smoke check: `/dev/member-privacy` returned 404 without
  the synthetic alias; `/privacy-settings` returned 200 with noindex metadata.
  The loading-error correction also passed a subsequent optimized build.
- Browser: Spanish help and audience preview verified; 320 px document width 310,
  430 px document width 420; no horizontal overflow. Temporary viewport reset.
- Initial metadata-only external audit: all five new privacy tables unavailable with
  PGRST205; new state RPC unavailable with PGRST202; `member-avatars` PUBLIC.
  The audit uses GET `limit(0)` because HEAD responses hid schema errors. It never
  retrieves member rows. These observations do not prove the full production RLS.
- Initial findings above are historical; they were superseded by the production
  migration and deployed checks recorded at the top of this document.
- Final REST metadata audit: all five checked privacy tables present; avatar bucket
  private; state RPC installed and requires an authenticated user session.

## Remaining external verification and responsibilities

Real storage/CDN cache recall, Auth-service erasure, every project-specific retained
record, backup restoration, DPIA/legal approval, incident ownership and pilot
comprehension review are **not verified** by these checks. See
`member-privacy-rollout.md` and `member-privacy-risk-register.md` for the concrete
sequence. The user-approved database opening is recorded above and is not evidence
that these separate responsibilities are complete. No isolated Supabase staging
project has been configured. Do not claim complete anonymity, guaranteed safety,
instant recall of previously received content or verified erasure of backups.
Do not restore permissive policies as rollback.
