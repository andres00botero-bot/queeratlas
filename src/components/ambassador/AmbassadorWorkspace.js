"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AmbassadorBadge from "./AmbassadorBadge";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, MapPin, PencilLine, Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";
import { resolveCityGeocodingContext } from "@/lib/cityGeocodingContext";
import { isEventStatusDiscoverable } from "@/features/events/eventStatus";
import AmbassadorEditor from "./AmbassadorEditor";
import { loadAssignments, loadInventory } from "./assignmentData";

const secondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-[#f0e9fa] hover:bg-white/10";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#cfbaff] px-4 text-sm font-semibold text-[#211634] hover:bg-[#e1d4ff]";
const prettyCity = city => resolveCityGeocodingContext(city)?.city || city;

function Inventory({ assignment, initialKind, initialId, onEditing }) {
  const [records, setRecords] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [kind, setKind] = useState(initialKind);
  const [editor, setEditor] = useState(initialId ? { kind: initialKind, id: initialId } : null);
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [filterLimit, setFilterLimit] = useState(30);

  useEffect(() => {
    let active = true;
    Promise.all([loadInventory(assignment, "event"), loadInventory(assignment, "venue")])
      .then(([event, venue]) => { if (active) { setFailed(false); setRecords({ event, venue }); } })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [assignment, attempt]);

  const [busy, setBusy] = useState(false);
  const isScoped = assignment.role === "venue";
  const ownedVenue = records?.venue.find(item => String(item.id) === String(assignment.venue_id));
  const title = isScoped ? ownedVenue?.name || "Venue workspace" : prettyCity(assignment.city);
  const rows = (records?.[kind] || []).filter(item => item.name.toLowerCase().includes(search.toLowerCase().trim()));
  const edited = editor?.id && records?.[editor.kind]?.find(item => String(item.id) === String(editor.id));
  const open = (type, id = null) => { setReceipt(null); setEditor({ kind: type, id }); onEditing(true); };
  const close = () => { setEditor(null); onEditing(false); };
  const saved = async (type, data) => {
    setRecords(prev => ({ ...prev, [type]: [...prev[type].filter(item => String(item.id) !== String(data.id)), data].sort((a,b) => a.name.localeCompare(b.name)) }));
    let refreshed = false;
    try {
      const { data: auth } = await supabase.auth.getSession();
      if (auth?.session?.access_token) {
        const response = await fetch("/api/ambassador/revalidate", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.session.access_token}` },
          body: JSON.stringify({ assignmentId: assignment.id, entityId: data.id, entityType: type }),
        });
        refreshed = response.ok;
      }
    } catch { /* The database transaction has already succeeded. */ }
    const discoverable = type === "venue" || isEventStatusDiscoverable(data);
    const href = type === "venue" ? buildVenuePath(data.city, data) : buildEventPath(data.city, data);
    setReceipt({ title: data.name, href: discoverable ? href : "", type, refreshed, cancelled: data.event_status === "cancelled" });
    setKind(type); setSearch(""); close();
  };

  return <>
    <div className="border-b border-[#574464] pb-6">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[#d0b7ed]"><AmbassadorBadge role={assignment.role} />{isScoped && ` · ${prettyCity(assignment.city)}`}</p>
      <h1 className="break-words text-4xl font-semibold tracking-tight text-[#fbf4ff] sm:text-6xl">{title}</h1>
      {!editor && records && !failed && <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => open("event")} className={primary}><Plus size={17} /> Create event</button>
        {isScoped ? <button type="button" disabled={!ownedVenue} onClick={() => open("venue", ownedVenue.id)} className={secondary}><PencilLine size={16} /> Edit venue</button>
          : <button type="button" onClick={() => open("venue")} className={secondary}><Plus size={17} /> Add venue</button>}
      </div>}
    </div>

    {failed ? <div role="alert" className="mt-6"><p>City content could not be loaded.</p><button className={secondary + " mt-3"} onClick={() => { setFailed(false); setAttempt(n => n+1); }}>Try again</button></div>
      : !records ? <p role="status" className="mt-6">Loading your content…</p>
      : editor ? editor.id && !edited ? <div role="alert" className="mt-6"><p>This entry is unavailable in this assignment.</p><button className={secondary + " mt-3"} onClick={close}>Back to content</button></div>
        : <AmbassadorEditor key={`${editor.kind}-${editor.id || "new"}`} assignment={assignment} venues={records.venue} row={edited || null}
            kind={editor.kind} onClose={() => { if (!busy) { close(); setAttempt(n => n+1); } }} onSaved={saved} onBusyChange={setBusy} />
      : <>
        {receipt && <div role="status" className="mt-5 rounded-2xl border border-[#90c8b0]/40 bg-[#172922] p-4">
          <p className="flex items-center gap-2 font-semibold text-[#c1f6db]"><CheckCircle2 size={18} /> {receipt.title} · {receipt.cancelled ? "Cancellation saved" : "Published"}</p>
          {!receipt.refreshed && <p className="mt-2 text-sm text-[#e7e4da]">Your changes are saved. Public pages may take a few minutes to refresh.</p>}
          {receipt.href && <Link href={receipt.href} prefetch={false} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline">View published {receipt.type} <ArrowUpRight size={15} /></Link>}
        </div>}
        <section aria-labelledby="amb-content" className="mt-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="amb-content" className="text-2xl font-semibold tracking-tight">Manage content</h2>
            <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-[#171420] p-1">
              {["event","venue"].map(type => <button key={type} type="button" aria-pressed={type===kind}
                onClick={() => { setKind(type); setSearch(""); setFilterLimit(30); }}
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold ${type===kind ? "bg-[#463551] text-white" : "text-[#c4bacc]"}`}>
                {type === "event" ? "Events" : "Venues"}</button>)}
            </div>
          </div>
          <label className="my-5 flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-[#15131e] px-3 focus-within:border-[#cfbaff]"><Search size={17} className="text-[#b9a8c6]" />
            <input aria-label={`Search ${kind}s by name`} placeholder={`Search ${kind}s by name`} value={search} onChange={e => { setSearch(e.target.value); setFilterLimit(30); }}
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#b9a8c6]" /></label>
          <ul className="divide-y divide-white/10">
            {rows.slice(0, filterLimit).map(item => {
              const Icon = kind === "event" ? CalendarDays : MapPin;
              const info = kind === "event" ? [item.start_date || item.date, item.hours, item.event_status === "cancelled" ? "Cancelled" : ""].filter(Boolean).join(" · ") : item.location;
              return <li key={item.id}><button onClick={() => open(kind, item.id)} className="group flex min-h-16 w-full items-center gap-3 rounded-lg px-1 py-3 text-left hover:bg-white/5">
                <Icon size={19} className="shrink-0 text-[#ccaddb]" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block break-words font-semibold">{item.name}</span>
                {info && <span className="mt-1 block text-sm text-[#c4bacc]">{info}</span>}</span><PencilLine size={16} className="mr-2 shrink-0 text-[#ccaddb]" aria-hidden="true" /></button></li>;
            })}
          </ul>
          {rows.length === 0 && <p className="py-5 text-sm text-[#d4c8db]">{search ? "No matching entries." : `No ${kind}s in this assignment yet.`}</p>}
          {rows.length > filterLimit && <button className={secondary + " mt-4"} onClick={() => setFilterLimit(n => n + 30)}>Show more</button>}
        </section>
      </>}
  </>;
}

function MemberAssignments({ userId, initialAssignment, initialKind, initialId }) {
  const [assignments, setAssignments] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(initialAssignment);
  const [editing, setEditing] = useState(Boolean(initialId));
  useEffect(() => {
    let active = true;
    loadAssignments(userId).then(result => { if (active) { setAssignments(result); setFailed(false); } })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [userId, attempt]);
  if (failed) return <div role="alert"><h1 className="text-3xl font-semibold">Assignment unavailable</h1><p className="my-4">We could not load your ambassador assignment.</p><button className={secondary} onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Try again</button></div>;
  if (!assignments) return <p role="status">Loading your assignment…</p>;
  if (!assignments.length) return <><h1 className="text-3xl font-semibold">Your ambassador workspace</h1><p className="my-4">You have no active ambassador assignment.</p><Link href="/contribute" className={secondary}>Suggest a contribution</Link></>;
  const assignment = assignments.find(item => item.id === selected) || assignments[0];
  return <>
    {assignments.length > 1 && <label className="mb-6 block text-sm font-semibold">My assignment<select aria-label="My assignment" disabled={editing}
      value={assignment.id} onChange={e => setSelected(e.target.value)} className="ml-3 min-h-11 max-w-full rounded-xl border border-white/25 bg-[#18131e] px-3">
      {assignments.map(item => <option key={item.id} value={item.id}>{prettyCity(item.city)} · {item.role === "city" ? "City ambassador" : `Venue #${item.venue_id}`}</option>)}
    </select></label>}
    <Inventory key={assignment.id} assignment={assignment} initialKind={initialKind} initialId={assignment.id === initialAssignment ? initialId : ""} onEditing={setEditing} />
  </>;
}

export default function AmbassadorWorkspace(props) {
  const { user, isLoading } = useAuth();
  return <main className="min-h-screen bg-[radial-gradient(ellipse_at_78%_0%,#382442_0%,#15111c_44%,#0e0c12_80%)] px-4 pb-36 pt-6 text-[#f6eef9] sm:px-8">
    <div className="mx-auto max-w-3xl"><Link href="/contribute" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-[#d0c3db]"><ArrowLeft size={16} /> Contributions</Link>
      {isLoading ? <p role="status">Loading your workspace…</p> : user ? <MemberAssignments key={user.id} userId={user.id} {...props} />
        : <><h1 className="text-3xl font-semibold">Ambassador workspace</h1><p className="my-4">Sign in with the member account assigned to your city or venue.</p><Link href="/?ambassador=signin" className={primary}>Sign in</Link></>}
    </div>
  </main>;
}
