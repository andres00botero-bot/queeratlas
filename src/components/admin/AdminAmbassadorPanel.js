"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cityPath } from "@/lib/cityRouting";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";

const control = "mt-1 min-h-11 w-full rounded-xl border border-white/20 bg-[#191724] px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-violet-300";
const action = "qa-action min-h-11 rounded-xl border border-violet-200/30 bg-violet-300/10 px-4 text-sm font-semibold text-violet-100 disabled:opacity-50";
const termsLabels = { pilot: "Pilot · no payment", founding: "Founding · one-time support", annual: "Annual membership" };

function localTime(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function nextYear(start) {
  const date = new Date(start);
  date.setFullYear(date.getFullYear() + 1);
  return localTime(date);
}

function initialForm(grant) {
  return {
    role: grant?.role || "city",
    city: grant?.city || "",
    venue: grant?.venue_id == null ? "" : String(grant.venue_id),
    amount: grant?.paid_eur_cents == null ? "" : String(grant.paid_eur_cents / 100),
    received: grant?.received_on || "",
    terms: grant?.terms || "pilot",
    starts: localTime(grant?.starts_at || Date.now()),
    ends: grant?.ends_at ? localTime(grant.ends_at) : "",
  };
}

function assignmentStatus(grant) {
  if (grant.status === "paused") return "Paused";
  if (grant.ends_at && new Date(grant.ends_at) <= new Date()) return "Expired";
  if (new Date(grant.starts_at) > new Date()) return "Scheduled";
  return "Active";
}

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

async function checked(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function loadVenues(city, signal) {
  const rows = [];
  const size = 200;
  for (let offset = 0; ; offset += size) {
    const page = await checked(supabase.from("places").select("id,name").eq("city", city)
      .order("name").order("id").range(offset, offset + size - 1).abortSignal(signal));
    rows.push(...page);
    if (page.length < size) return rows;
  }
}

function grantArgs(memberId, form, status) {
  return {
    p_user_id: memberId, p_role: form.role, p_city: form.city,
    p_venue_id: form.role === "venue" ? form.venue : null, p_terms: form.terms,
    p_paid_eur_cents: form.terms === "annual" ? Math.round(Number(form.amount) * 100) : null,
    p_received_on: form.terms === "annual" ? form.received || null : null,
    p_starts_at: new Date(form.starts).toISOString(),
    p_ends_at: form.ends ? new Date(form.ends).toISOString() : null, p_status: status,
  };
}

async function refreshPublicPages(entry) {
  const { data } = await supabase.auth.getSession();
  if (!data?.session?.access_token) throw new Error("No session");
  const isEvent = entry.entity_type === "event";
  const city = entry.before_data.city;
  const base = cityPath(city);
  const detailPath = isEvent ? buildEventPath : buildVenuePath;
  const paths = [base, base + (isEvent ? "/events" : "/directory"),
    detailPath(city, entry.before_data), detailPath(city, entry.after_data)];
  const requests = [["/api/admin/editorial/revalidate", { paths }]];
  if (isEvent) requests.push(["/api/admin/events/revalidate", { city }]);
  await Promise.all(requests.map(async ([url, body]) => {
    const response = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Public cache refresh failed");
  }));
}

function GrantForm({ member, grant, assignments, cities, busy, save, cancel }) {
  const [form, setForm] = useState(() => initialForm(grant));
  const [venues, setVenues] = useState([]);
  const [venueError, setVenueError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!form.city || form.role !== "venue" || grant) return;
    const controller = new AbortController();
    loadVenues(form.city, controller.signal).then((data) => {
      if (!controller.signal.aborted) setVenues(data);
    }).catch(() => { if (!controller.signal.aborted) setVenueError(true); });
    return () => controller.abort();
  }, [form.city, form.role, grant, retry]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const duplicate = !grant && assignments.some((entry) => entry.city === form.city && entry.role === form.role &&
    (entry.role === "city" || String(entry.venue_id) === form.venue));
  const invalidDates = form.ends && new Date(form.ends) <= new Date(form.starts);
  function submit(event) {
    event.preventDefault();
    if (duplicate || invalidDates || busy) return;
    const args = grantArgs(member.user_id, form, grant?.status || "active");
    if (grant && form.starts === localTime(grant.starts_at)) args.p_starts_at = grant.starts_at;
    if (grant?.ends_at && form.ends === localTime(grant.ends_at)) args.p_ends_at = grant.ends_at;
    save(args);
  }
  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-violet-200/15 bg-black/20 p-4">
      <h4 className="font-semibold">{grant ? "Edit assignment" : "New assignment"}</h4>
      <fieldset disabled={busy} className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <label>Role<select aria-label="Role" className={control} value={form.role} disabled={Boolean(grant)} onChange={(e) => update("role", e.target.value)}>
          <option value="city">City Ambassador</option><option value="venue">Venue Ambassador</option>
        </select></label>
        <label>City<select aria-label="City" className={control} required disabled={Boolean(grant)} value={form.city} onChange={(e) => {
          setVenues([]); setVenueError(false); setForm({ ...form, city: e.target.value, venue: "" });
        }}>
          <option value="">Choose a city</option>
          {grant && !cities.some((city) => city.key === grant.city) && <option value={grant.city}>{grant.city}</option>}
          {cities.map((city) => <option key={city.key} value={city.key}>{city.name}</option>)}
        </select></label>
        {form.role === "venue" && <label className="sm:col-span-2">Venue<select aria-label="Venue" className={control} required value={form.venue} disabled={!form.city || Boolean(grant)} onChange={(e) => update("venue", e.target.value)}>
          <option value="">Choose a venue</option>
          {grant ? <option value={form.venue}>{grant.venue_name || form.venue}</option> : venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} · #{venue.id}</option>)}
        </select></label>}
        {form.role === "venue" && venueError && <button type="button" className={action} onClick={() => { setVenueError(false); setRetry(retry + 1); }}>Retry loading venues</button>}
        <label className="sm:col-span-2">Membership terms<select aria-label="Membership terms" className={control} value={form.terms} onChange={(e) => {
          const terms = e.target.value;
          setForm({ ...form, terms, ends: terms === "annual" && !form.ends && form.starts ? nextYear(form.starts) : form.ends });
        }}>{Object.entries(termsLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Starts at<input className={control} type="datetime-local" required value={form.starts} onChange={(e) => update("starts", e.target.value)} /></label>
        {form.terms === "annual" && <>
          <label>Payment received (EUR)<input className={control} type="number" required min="10" step="0.01" value={form.amount} onChange={e => update("amount", e.target.value)} /></label>
          <label>Date received<input className={control} type="date" required max={localTime(Date.now()).slice(0, 10)} value={form.received} onChange={e => update("received", e.target.value)} /></label>
        </>}
        <label>Ends at {form.terms !== "annual" && "(optional)"}<input className={control} type="datetime-local" required={form.terms === "annual"} value={form.ends} onChange={(e) => update("ends", e.target.value)} /></label>
        <p className="text-xs text-white/65 sm:col-span-2">Dates use your local time zone, {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
        {duplicate && <p className="text-amber-100 sm:col-span-2">This member already has this assignment. Edit the existing assignment above.</p>}
        {invalidDates && <p className="text-amber-100 sm:col-span-2">Choose an end time after the start time.</p>}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className={action} disabled={Boolean(duplicate || invalidDates)}>{grant ? "Save changes" : "Grant ambassador access"}</button>
          <button type="button" className={action} onClick={cancel}>Cancel</button>
        </div>
      </fieldset>
    </form>
  );
}

function EventLinker({ grant, busy, run }) {
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  async function search(event) {
    event.preventDefault();
    setSearching(true); setError(false); setRows(null); setSelected("");
    try {
      const needle = query.trim().replace(/[\\%_]/g, "\\$&");
      const data = await checked(supabase.from("events").select("id,name,date,location").eq("city", grant.city)
        .is("ambassador_venue_id", null).ilike("name", "%" + needle + "%").order("date", { ascending: false }).order("id").limit(25));
      setRows(data);
    } catch { setError(true); } finally { setSearching(false); }
  }
  return <details className="mt-3 text-sm">
    <summary className="cursor-pointer py-2 font-semibold text-violet-100">Link an existing event to this venue</summary>
    <form onSubmit={search} className="mt-1 flex flex-wrap items-end gap-2">
      <label className="grow">Event name<input required className={control} value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <button className={action} disabled={searching || busy}>{searching ? "Searching…" : "Search events"}</button>
    </form>
    {error && <p role="alert">Event search failed. Try searching again.</p>}
    {rows?.length === 0 && <p role="status" className="mt-2">No unlinked events match in this city.</p>}
    {rows?.length > 0 && <div className="mt-2">
      <label>Select an event<select aria-label="Select an event" className={control} value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Choose a matching event</option>
        {rows.map((event) => <option key={event.id} value={event.id}>{[event.name, event.date, event.location].filter(Boolean).join(" · ")}</option>)}
      </select></label>
      <button type="button" className={action + " mt-2"} disabled={busy || !selected || searching} onClick={async () => {
        if (await run("qa_admin_link_ambassador_event", { p_event_id: selected, p_venue_id: grant.venue_id }, "Event linked to this venue.")) {
          setRows(null); setSelected(""); setQuery("");
        }
      }}>Link event to {grant.venue_name || "this venue"}</button>
    </div>}
  </details>;
}

function HistoryEntry({ entry, member, run, busy }) {
  const [confirm, setConfirm] = useState(false);
  const previous = entry.before_data;
  const after = entry.after_data;
  const fields = Object.keys(previous || {}).filter((key) => !["updated_at", "created_at", "ambassador_revision"].includes(key) &&
    JSON.stringify(previous[key]) !== JSON.stringify(after?.[key]));
  const valueText = (value) => value == null || value === "" ? "Empty" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return <li className="border-t border-white/10 py-3">
    <p className="font-medium">{after?.name || previous?.name || entry.entity_type + " #" + entry.entity_id}</p>
    <p className="text-xs text-white/70">{entry.restored_from ? "Restored" : previous ? "Edited" : "Created"} · {entry.entity_type} · {formatTime(entry.created_at)}</p>
    {entry.actor_id && <p className="mt-1 break-words text-xs text-white/70">{entry.actor_id === member.user_id
      ? "Changed by " + (member.alias || member.display_name || member.email || "this member")
      : "Changed by account " + entry.actor_id}</p>}
    {previous && <details className="mt-2">
      <summary className="cursor-pointer py-1 text-violet-100">Review change</summary>
      <dl className="mt-2 space-y-3">
        {fields.map((key) => <div key={key}>
          <dt className="font-semibold">{key.replaceAll("_", " ")}</dt>
          <dd className="break-words text-white/65">Before · {valueText(previous[key])}</dd>
          <dd className="break-words">After · {valueText(after?.[key])}</dd>
        </div>)}
      </dl>
      {confirm ? <div className="mt-3">
        <p>Restore the values this change replaced?</p>
        <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={action} disabled={busy} onClick={async () => {
          if (await run("qa_admin_restore_ambassador", { p_history_id: entry.id }, "Previous version restored.", entry)) setConfirm(false);
        }}>Confirm restore</button><button type="button" className={action} onClick={() => setConfirm(false)}>Cancel</button></div>
      </div> : <button type="button" className={action + " mt-3"} disabled={busy} onClick={() => setConfirm(true)}>Restore previous version</button>}
    </details>}
  </li>;
}

export default function AdminAmbassadorPanel({ member }) {
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const [limit, setLimit] = useState(20);
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingRefresh, setPendingRefresh] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function load() {
      const [grants, registry] = await Promise.all([
        checked(supabase.from("qa_ambassador_assignments")
          .select("id,user_id,role,city,venue_id,status,terms,starts_at,ends_at,paid_eur_cents,received_on")
          .eq("user_id", member.user_id).order("created_at", { ascending: false }).abortSignal(signal)),
        fetch("/api/cities/registry", { signal }).then(async (response) => {
          if (!response.ok) throw new Error("City directory unavailable");
          return response.json();
        }),
      ]);
      const venueIds = grants.filter((grant) => grant.venue_id != null).map((grant) => grant.venue_id);
      const [venues, history] = await Promise.all([
        venueIds.length ? checked(supabase.from("places").select("id,name").in("id", venueIds).abortSignal(signal)) : [],
        grants.length ? checked(supabase.from("qa_ambassador_history")
          .select("id,assignment_id,actor_id,entity_type,entity_id,before_data,after_data,created_at,restored_from")
          .in("assignment_id", grants.map((grant) => grant.id)).order("id", { ascending: false }).limit(limit + 1).abortSignal(signal)) : [],
      ]);
      const cityNames = new Map(registry.cities.map((city) => [city.key, city.name]));
      const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]));
      if (!signal.aborted) {
        setResult({
          assignments: grants.map((grant) => ({
            ...grant, city_name: cityNames.get(grant.city) || grant.city,
            venue_name: venueNames.get(grant.venue_id),
          })),
          cities: registry.cities.filter((city) => !isVenueAccessRestricted(city.key)).sort((a, b) => a.name.localeCompare(b.name)),
          history: history.slice(0, limit), hasMore: history.length > limit,
        });
        setFailed(false);
      }
    }
    load().catch(() => { if (!signal.aborted) { setResult(null); setFailed(true); } });
    return () => controller.abort();
  }, [member.user_id, revision, limit]);

  async function refresh(entry) {
    try {
      await refreshPublicPages(entry);
      setPendingRefresh(null);
    } catch {
      setPendingRefresh(entry);
    }
  }
  async function run(name, args, message, restoredEntry) {
    if (busy) return false;
    setBusy(true); setNotice(""); setActionError("");
    try {
      await checked(supabase.rpc(name, args));
      setNotice(message); setRevision((n) => n + 1);
      if (restoredEntry) await refresh(restoredEntry);
      return true;
    } catch (error) {
      if (error?.code === "40001") setActionError("A newer edit exists. Refresh and review the latest change before restoring.");
      else if (error?.message === "Choose a public venue in this city") setActionError("Choose a published venue that can accept ambassador edits.");
      else if (name === "qa_admin_link_ambassador_event") setActionError("Could not link this event. Search again and check the city and current venue.");
      else setActionError("The change could not be confirmed. Refresh to see the current assignment and content history.");
      return false;
    } finally { setBusy(false); }
  }
  const editable = member.email_confirmed && !member.deletion_pending;
  return <section className="mt-4 rounded-2xl border border-violet-200/20 bg-[#151220] p-4 text-white sm:p-5" aria-label="Ambassador access">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-semibold">Ambassador access</h3>
      <button type="button" className={action} onClick={() => { setRevision((n) => n + 1); setActionError(""); }}>Refresh</button>
    </header>
    {notice && <p role="status" className="mt-3 text-sm text-emerald-100">{notice}</p>}
    {actionError && <p role="alert" className="mt-3 text-sm text-amber-100">{actionError}</p>}
    {pendingRefresh && <div className="mt-3 text-sm text-amber-100"><p role="status">The previous version was restored. Public pages may still show the earlier copy.</p>
      <button type="button" className={action + " mt-2"} disabled={busy} onClick={() => refresh(pendingRefresh)}>Retry public refresh</button></div>}
    {failed && <p role="alert" className="mt-3 text-sm text-amber-100">Could not load this member’s assignments. Check database access and refresh.</p>}
    {!result && !failed && <p role="status" className="mt-3 text-sm">Loading assignments…</p>}
    {result && <>
      {!editable && <p className="mt-3 text-sm text-amber-100">{member.deletion_pending ? "Deletion is pending for this member." : "This member needs to verify their email before receiving an assignment."}</p>}
      {member.trusted_contributor && <p className="mt-3 text-sm text-amber-100">This member has the separate publisher setting. An ambassador assignment limits direct city publishing to its assigned scope.</p>}
      {result.assignments.length === 0 && <p className="mt-3 text-sm text-white/70">This member has no ambassador assignments.</p>}
      {result.assignments.map((grant) => <div key={grant.id} className="mt-3 rounded-xl border border-white/15 p-3 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="font-semibold">{grant.role === "city" ? "City Ambassador" : "Venue Ambassador"} · {grant.venue_name || (grant.venue_id ? "Venue #" + grant.venue_id + " · " + grant.city_name : grant.city_name)}</h4>
          <span className="text-violet-100">{assignmentStatus(grant)}</span>
        </div>
        <p className="mt-1 text-white/70">{termsLabels[grant.terms]} · Starts {formatTime(grant.starts_at)}{grant.ends_at ? " · Ends " + formatTime(grant.ends_at) : ""}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={action} disabled={busy || !editable} onClick={() => setEditor(grant)}>Edit dates and terms</button>
          <button type="button" className={action} disabled={busy || (grant.status === "paused" && !editable)} onClick={() => {
            const status = grant.status === "paused" ? "active" : "paused";
            run("qa_admin_set_ambassador", {
              p_user_id: member.user_id, p_role: grant.role, p_city: grant.city, p_venue_id: grant.venue_id,
              p_starts_at: grant.starts_at, p_ends_at: grant.ends_at, p_status: status, p_terms: grant.terms,
              p_paid_eur_cents: grant.paid_eur_cents, p_received_on: grant.received_on,
            }, status === "paused" ? "Assignment paused." : "Assignment resumed for its scheduled dates.");
          }}>{grant.status === "paused" ? "Resume assignment" : "Pause assignment"}</button>
        </div>
        {grant.role === "venue" && editable && <EventLinker grant={grant} busy={busy} run={run} />}
      </div>)}
      {editable && !editor && <button type="button" disabled={busy} className={action + " mt-4"} onClick={() => setEditor("new")}>Add assignment</button>}
      {editable && editor && <GrantForm key={editor.id || "new"} member={member} grant={editor === "new" ? null : editor} assignments={result.assignments} cities={result.cities} busy={busy} cancel={() => setEditor(null)} save={async (args) => {
        if (await run("qa_admin_set_ambassador", args, "Assignment saved.")) setEditor(null);
      }} />}
      <h4 className="mt-5 text-sm font-semibold">Content history</h4>
      {result.history.length ? <ul className="mt-2 text-sm">{result.history.map((entry) => <HistoryEntry key={entry.id} entry={entry} member={member} run={run} busy={busy} />)}</ul>
        : <p className="mt-1 text-sm text-white/70">No changes recorded for these assignments.</p>}
      {result.hasMore && <button type="button" className={action} onClick={() => setLimit((n) => n + 20)}>Show older changes</button>}
    </>}
  </section>;
}
