# Admin member access

The admin members panel now enumerates Supabase Authentication accounts through
`/api/admin/members`, then attaches available profile and sharing state. Hidden,
unconfirmed and profile-less accounts are included. The UI loads every backend
page, searches across loaded accounts, and displays 50 rows per page. It does not
use the former 250-profile limit or the owner-only browser profile query.

Every request validates the bearer session with Supabase Auth and checks the
database `qa_is_admin` function. The service-role client stays on the server.
Responses expose an explicit account-management projection, never raw Auth users,
tokens, identities, private memories, messages or travel plans. Reads and publishing
permission attempts are audited; responses are private/no-store. Account changes,
sign-out and hidden tabs clear the displayed account list.

Publishing changes use the same server authorization and support accounts without
a profile. They do not change profile audience. Existing city, editorial and other
admin tools retain their existing authorization. This change does not grant arbitrary
database execution or expose member data through ordinary browser RLS.

No new SQL migration is needed: the privacy migration already installed the audit
table. Deploy these source changes with the existing server-only
`SUPABASE_SERVICE_ROLE_KEY`, public Supabase URL/key and admin RPC configuration.
Do not prefix the service-role key with `NEXT_PUBLIC_`.

Verification: `node scripts/test-admin-members.mjs` exercises 1,205 accounts across
two-digit backend pages, hidden/profile-less/unconfirmed accounts, output minimization,
admin denial, audit failure, origin checks and publishing updates. No real account
permissions are changed by that test.
