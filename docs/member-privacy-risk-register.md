# Member privacy — initial impact assessment and risk register

Draft, 2026-10-23. Requires the data controller's review; not legal sign-off.
Use the implementation plan and rollout runbook together with this document.

Purpose: optional community discovery and approved-contact communication alongside
private travel planning. Do not infer a member's sexual orientation from use of
Queer Atlas, require identity documents, or automatically classify personal risk.

Data separation: auth identity/email; owner-only Atlas/profile; explicitly shared
alias/bio/optional fields; contact approvals; account blocks; sent messages;
restricted reports and operator audit. No phone, birthday, home coordinates,
presence or private saves are part of the new directory projection.

| Threat | Implemented mitigation | Residual risk / required validation |
| --- | --- | --- |
| Outing via catalogue | Hidden default, separate opt-in, minimal projection, no anonymous discovery | Authorized recipients can copy information; published posts have separate audiences |
| Fake accounts / scraping | Confirmed email, adult/rules attestation, closed rollout, search/contact/message limits | These do not verify identity; additional abuse controls may be needed during pilot |
| One-way following bypass | Accepted contact relationship, no migration of old follows | Audit indirect RPCs and every exposed schema in deployment |
| Stalking through activity/location | No directory presence/last-seen, no GPS/member map, voluntary interest city | Text and images can still reveal identity or places |
| Raw table or RPC bypass | Owner-only raw profiles, gated RPCs, revoked legacy projections and policy helpers | Verify actual grants, functions, views and permissive policies; local fixture is incomplete |
| Avatar or memory disclosure | Private bucket, authorized signed avatar, memories owner-only, metadata-free new uploads | Old public CDN copies and metadata in older uploads need separate remediation |
| Revocation while page is open | Re-check profiles and directory, clear on hidden/offline/sign-out; 30s image URLs | Previously received information cannot be recalled; short revocation window remains |
| Shared device / account switch | Private cache reset and suppression of stale session responses | Browser history, downloaded media, OS and third-party logs remain outside this control |
| Block bypass | Both-direction checks on profile, contacts, DMs and private-event requests | A new account can circumvent account-level blocks; abuse handling remains necessary |
| Disclosure in a report | Restricted operator endpoint, audit, no product analytics, separate reporter identity | Operators can access sensitive details; operational access reviews required |
| Failed deletion / old backups | Hide first, recent authentication, pending state and operator queue | Staging must validate all FKs, logs and backup restoration against revocation/deletion records |
| Minors in adult social discovery | 18+ attestation and email confirmation for directory | Not age verification; policy and proportional additional safeguards require review |

Implemented maintenance defaults: request counters 7 days; new privacy reports and
their operator audit 180 days, daily pruning after deployment with CRON_SECRET.
Legacy moderation records, messages, hosting/auth logs and backups are not covered
by these defaults. Inventory their actual retention before publishing a full policy.

Release decision must record: responsible controller/operator, lawful basis and
special-category condition where applicable, processor/transfer inventory, residual
risks, incident escalation, age-policy decision and approval of public explanations.

Initial evidence: repository code review, metadata-only Supabase audit and isolated
PostgreSQL tests. No real member profiles were read for this work. Metadata audit
found a public member-avatar bucket and no exposed qa_privacy_state RPC initially.
The subsequent explicitly approved SQL migration made the bucket private, hardened
raw/profile/RPC access and passed a synthetic rollback test in the actual project.
See `member-privacy-verification.md`; legal, operational and historical exposure
assessment is still separate from those verified technical controls.
