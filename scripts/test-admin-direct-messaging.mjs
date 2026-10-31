import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sql = read("supabase/admin-direct-messaging-v1.sql");
const messages = read("src/components/community/PrivateMessages.js");
const directory = read("src/components/community/MemberPrivacy.js");
const adminMembers = read("src/components/admin/AdminMembersPanel.js");
const adminNavigation = read("src/components/admin/AdminOperationsShell.js");
const quickNavigation = read("src/components/ui/FloatingHomeButton.js");

assert.match(sql, /qa_privacy_message_pair_allowed/);
assert.match(sql, /qa_is_admin_user\(a\).*qa_admin_message_member_active\(b\)/s);
assert.match(sql, /qa_is_admin_user\(b\).*qa_admin_message_member_active\(a\)/s);
assert.match(sql, /qa_privacy_contacts\(a, b\)/);
assert.match(sql, /qa_privacy_message_peers/);
assert.match(sql, /member_email/);
assert.match(sql, /member_city/);
assert.match(sql, /public\.qa_is_admin\(\) and not c\.is_admin/);
assert.match(sql, /qa_privacy_dm_read_gate/);
assert.match(sql, /qa_privacy_messages_read_gate/);
assert.match(sql, /grant execute on function public\.qa_privacy_send/);
assert.match(messages, /privacyCall\('message_peers'\)/);
assert.match(messages, /Every active member can also message Queer Atlas Admin without a contact request/);
assert.match(messages, /Sign in to view messages or contact Queer Atlas Admin/);
assert.match(messages, /resolveAdminAccess/);
assert.match(messages, /Start a new message/);
assert.match(messages, /Queer Atlas Admin/);
assert.match(messages, /Start a private conversation/);
assert.match(messages, /qa_mark_thread_read/);
assert.match(messages, /memberDetail/);
assert.match(adminMembers, /\/messages\?user=/);
assert.match(adminNavigation, /href: "\/messages", label: "Messages", hint: "Admin inbox"/);
assert.match(quickNavigation, /href: "\/messages"[\s\S]*icon: MessageCircle[\s\S]*mobile: true/);
assert.match(directory, /Members who have not opened their profile for contact/);

console.log("Admin direct messaging migration and protected directory wiring passed.");
