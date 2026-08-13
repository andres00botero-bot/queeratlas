"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  MapPinPlus,
  MessageCircleHeart,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";

const TASKS = [
  {
    id: "add",
    number: "01",
    title: "Add something new",
    description: "Put a missing venue, event or queer service on the Atlas.",
    time: "4–6 min",
    Icon: MapPinPlus,
    tone: "border-fuchsia-200/30 bg-fuchsia-300/[0.11] text-fuchsia-50",
    glow: "from-fuchsia-400/35 via-rose-400/10 to-transparent",
  },
  {
    id: "update",
    number: "02",
    title: "Update what changed",
    description: "Correct hours, links, addresses or details that are no longer right.",
    time: "2 min",
    Icon: Wrench,
    tone: "border-cyan-200/30 bg-cyan-300/[0.11] text-cyan-50",
    glow: "from-cyan-300/35 via-sky-400/10 to-transparent",
  },
  {
    id: "intel",
    number: "03",
    title: "Complete an existing venue",
    description: "Add missing queue, best-night, crowd, dress or inclusion details.",
    time: "2–3 min",
    Icon: MessageCircleHeart,
    tone: "border-violet-200/30 bg-violet-300/[0.11] text-violet-50",
    glow: "from-violet-300/35 via-indigo-400/10 to-transparent",
  },
  {
    id: "experience",
    number: "04",
    title: "Share lived experience",
    description: "Turn what you know into a city story or a useful local guide.",
    time: "3–5 min",
    Icon: BookOpenText,
    tone: "border-amber-200/30 bg-amber-300/[0.11] text-amber-50",
    glow: "from-amber-300/35 via-orange-400/10 to-transparent",
  },
  {
    id: "verify",
    number: "05",
    title: "Help verify the Atlas",
    description: "Confirm that a place is open and its key information still checks out.",
    time: "30 sec",
    Icon: SearchCheck,
    tone: "border-emerald-200/30 bg-emerald-300/[0.11] text-emerald-50",
    glow: "from-emerald-300/35 via-teal-400/10 to-transparent",
  },
];

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-white/14 bg-black/42 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/48 focus:ring-2 focus:ring-cyan-200/14";

function FieldLabel({ children, hint = "" }) {
  return (
    <span className="block">
      <span className="block text-xs font-semibold text-white/82">{children}</span>
      {hint ? <span className="mt-1 block text-[11px] leading-4 text-white/42">{hint}</span> : null}
    </span>
  );
}

function SubmitButton({ busy, children }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/45 bg-[linear-gradient(100deg,#f9a8d4_0%,#c4b5fd_36%,#67e8f9_68%,#fde68a_100%)] px-5 text-sm font-bold text-[#09090b] shadow-[0_14px_38px_rgba(217,70,239,0.18),0_0_28px_rgba(103,232,249,0.10)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {busy ? "Sending…" : children}
      {!busy ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  );
}

function VenueSearch({ places, value, onChange, label = "Venue" }) {
  const selected = places.find((place) => String(place?.id || "") === String(value || ""));
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const token = query.trim().toLowerCase();
    if (!token) return [];
    return places
      .filter((place) => `${place?.name || ""} ${place?.city || ""}`.toLowerCase().includes(token))
      .slice(0, 12);
  }, [places, query]);

  return (
    <div>
      <FieldLabel hint="Search by venue or city. The city follows automatically.">{label}</FieldLabel>
      {selected ? (
        <div className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-cyan-200/24 bg-cyan-200/[0.08] px-3.5 py-2.5">
          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{selected.name}</span><span className="block text-xs text-white/46">{selected.city || "Unknown city"}</span></span>
          <button type="button" onClick={() => { onChange?.(""); setQuery(""); }} className="shrink-0 rounded-lg border border-white/14 bg-white/[0.05] px-3 py-1.5 text-xs text-white/72">Change</button>
        </div>
      ) : (
        <>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={inputClass} placeholder="Start typing a venue or city" autoComplete="off" />
          {query.trim() ? (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/12 bg-[#090a0f] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.42)]">
              {matches.length ? matches.map((place) => (
                <button key={String(place.id)} type="button" onClick={() => { onChange?.(String(place.id)); setQuery(""); }} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.07]">
                  <span className="truncate text-sm font-medium text-white/88">{place.name}</span><span className="shrink-0 text-xs text-white/42">{place.city || "Unknown city"}</span>
                </button>
              )) : <p className="px-3 py-4 text-sm text-white/46">No matching venue. Use “Add something new” if it is missing.</p>}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function MemberContributionWorkspace({
  activeTask,
  onTaskChange,
  places = [],
  onOpenAdd,
  onOpenCommunity,
  onSubmitSignal,
}) {
  const workflowRef = useRef(null);
  const [updateForm, setUpdateForm] = useState({ placeId: "", field: "hours", value: "", source: "", note: "" });
  const [intelForm, setIntelForm] = useState({
    placeId: "",
    queue_wait: "",
    best_nights: "",
    crowd_mix: "",
    dress_code: "",
    staff_inclusivity: "",
    source: "",
    visitedAt: "",
  });
  const [verifyForm, setVerifyForm] = useState({ placeId: "", stillOpen: "yes", checked: "official", source: "", note: "" });
  const [busyTask, setBusyTask] = useState("");
  const [notice, setNotice] = useState("");

  const venueOptions = useMemo(() => {
    return [...places]
      .filter((place) => place?.id && place?.name)
      .sort((a, b) => {
        const cityOrder = String(a?.city || "").localeCompare(String(b?.city || ""));
        return cityOrder || String(a?.name || "").localeCompare(String(b?.name || ""));
      });
  }, [places]);

  useEffect(() => {
    if (!activeTask) return;
    requestAnimationFrame(() => {
      workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [activeTask]);

  const submit = async (kind, values) => {
    setBusyTask(kind);
    setNotice("");
    const result = await onSubmitSignal?.(kind, values);
    setBusyTask("");
    if (result?.ok) {
      setNotice(result.message || "Thank you. Your contribution is waiting for review.");
      if (kind === "update") setUpdateForm({ placeId: "", field: "hours", value: "", source: "", note: "" });
      if (kind === "intel") setIntelForm({ placeId: "", queue_wait: "", best_nights: "", crowd_mix: "", dress_code: "", staff_inclusivity: "", source: "", visitedAt: "" });
      if (kind === "verify") setVerifyForm({ placeId: "", stillOpen: "yes", checked: "official", source: "", note: "" });
    } else if (result?.message) {
      setNotice(result.message);
    }
  };

  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/15 bg-[radial-gradient(circle_at_4%_0%,rgba(244,114,182,0.20),transparent_28%),radial-gradient(circle_at_96%_4%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_54%_110%,rgba(139,92,246,0.13),transparent_38%),linear-gradient(180deg,rgba(15,17,28,0.99),rgba(5,6,10,0.99))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.025)_inset] sm:rounded-[34px] sm:p-6">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-200/75 to-transparent" />
      <div className="max-w-3xl">
        <p className="inline-flex rounded-full border border-cyan-100/18 bg-cyan-200/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-50/80">Choose one contribution</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">What would you like to contribute?</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">Add something new, update a detail or share practical local knowledge.</p>
      </div>

      <div className="-mx-1 mt-5 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-5 xl:overflow-visible xl:pb-0">
        {TASKS.map((task) => {
          const Icon = task.Icon;
          const active = activeTask === task.id;
          return (
            <button
              key={task.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setNotice("");
                onTaskChange?.(task.id);
              }}
              className={`group relative min-h-[11.5rem] w-[78vw] max-w-[18rem] shrink-0 snap-start overflow-hidden rounded-[22px] border p-4 text-left backdrop-blur-sm transition duration-300 sm:w-[19rem] xl:w-auto xl:max-w-none ${task.tone} ${active ? "-translate-y-1 ring-1 ring-white/45 shadow-[0_20px_56px_rgba(0,0,0,0.38),0_0_30px_rgba(217,70,239,0.10)]" : "hover:-translate-y-1 hover:border-white/45 hover:shadow-[0_18px_42px_rgba(0,0,0,0.28)]"}`}
            >
              <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${task.glow}`} />
              <span className="relative flex h-full flex-col">
                <span className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-black/25 shadow-[0_8px_24px_rgba(0,0,0,0.20)] transition group-hover:scale-105"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-white/38">{task.number}</span>
                </span>
                <span className="mt-4 block text-sm font-semibold leading-5 text-white">{task.title}</span>
                <span className="mt-2 block text-xs leading-5 text-white/53">{task.description}</span>
                <span className="mt-auto flex items-center gap-1.5 pt-4 text-[10px] uppercase tracking-[0.12em] text-white/46"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{task.time}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div ref={workflowRef} className="scroll-mt-24">
      {!activeTask ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/[0.025] px-4 py-5 text-sm text-white/48">Choose one card to open the right contribution flow.</div>
      ) : null}

      {activeTask === "add" ? (
        <div className="mt-4 grid gap-3 rounded-[22px] border border-fuchsia-200/18 bg-fuchsia-300/[0.055] p-4 sm:grid-cols-3">
          {[
            { id: "place", label: "Add venue", text: "Bar, club, sauna, café, hotel or another place", Icon: Store },
            { id: "event", label: "Add event", text: "Party, gathering, festival or recurring night", Icon: CalendarPlus },
            { id: "service", label: "Add service", text: "Queer-owned or member-provided local service", Icon: Sparkles },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => onOpenAdd?.(item.id)} className="min-h-[7.5rem] rounded-2xl border border-white/12 bg-black/24 p-4 text-left transition hover:border-fuchsia-100/34 hover:bg-white/[0.055]">
              <item.Icon className="h-5 w-5 text-fuchsia-100/80" aria-hidden="true" />
              <span className="mt-3 block text-sm font-semibold text-white">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/46">{item.text}</span>
            </button>
          ))}
        </div>
      ) : null}

      {activeTask === "update" ? (
        <form onSubmit={(event) => { event.preventDefault(); submit("update", updateForm); }} className="mt-4 rounded-[22px] border border-cyan-200/18 bg-cyan-300/[0.055] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <VenueSearch places={venueOptions} value={updateForm.placeId} onChange={(placeId) => setUpdateForm((current) => ({ ...current, placeId }))} />
            <label><FieldLabel>What changed?</FieldLabel><select value={updateForm.field} onChange={(event) => setUpdateForm((current) => ({ ...current, field: event.target.value }))} className={inputClass}><option value="hours">Opening hours</option><option value="link">Official link</option><option value="location">Address</option><option value="description">Venue details</option><option value="status_report">Open or closed status</option></select></label>
            <label className="md:col-span-2"><FieldLabel>Correct information</FieldLabel><textarea value={updateForm.value} onChange={(event) => setUpdateForm((current) => ({ ...current, value: event.target.value }))} className={`${inputClass} min-h-24`} placeholder="Write the current information" /></label>
            <label><FieldLabel>Source link <span className="font-normal text-white/38">(recommended)</span></FieldLabel><input type="url" value={updateForm.source} onChange={(event) => setUpdateForm((current) => ({ ...current, source: event.target.value }))} className={inputClass} placeholder="https://…" /></label>
            <label><FieldLabel>What did you notice? <span className="font-normal text-white/38">(optional)</span></FieldLabel><input value={updateForm.note} onChange={(event) => setUpdateForm((current) => ({ ...current, note: event.target.value }))} className={inputClass} placeholder="Short context for the editor" /></label>
          </div>
          <div className="mt-4"><SubmitButton busy={busyTask === "update"}>Send update</SubmitButton></div>
        </form>
      ) : null}

      {activeTask === "intel" ? (
        <form onSubmit={(event) => { event.preventDefault(); submit("intel", intelForm); }} className="mt-4 rounded-[22px] border border-violet-200/18 bg-violet-300/[0.055] p-4 sm:p-5">
          <VenueSearch places={venueOptions} value={intelForm.placeId} onChange={(placeId) => setIntelForm((current) => ({ ...current, placeId }))} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["queue_wait", "Typical queue", "How long is the wait and when does it build?"],
              ["best_nights", "Best night", "Which night or event format works best?"],
              ["crowd_mix", "Locals vs visitors", "Who actually comes here?"],
              ["dress_code", "Dress code in practice", "What do people really wear?"],
              ["staff_inclusivity", "Staff inclusion", "What inclusion signal did you personally notice?"],
            ].map(([key, label, hint]) => (
              <label key={key} className={key === "staff_inclusivity" ? "md:col-span-2" : ""}><FieldLabel hint={hint}>{label}</FieldLabel><textarea value={intelForm[key]} onChange={(event) => setIntelForm((current) => ({ ...current, [key]: event.target.value }))} className={`${inputClass} min-h-24`} /></label>
            ))}
            <label><FieldLabel>Source or official link <span className="font-normal text-white/38">(optional)</span></FieldLabel><input type="url" value={intelForm.source} onChange={(event) => setIntelForm((current) => ({ ...current, source: event.target.value }))} className={inputClass} placeholder="https://…" /></label>
            <label><FieldLabel>When did you visit?</FieldLabel><input type="date" value={intelForm.visitedAt} onChange={(event) => setIntelForm((current) => ({ ...current, visitedAt: event.target.value }))} className={inputClass} /></label>
          </div>
          <div className="mt-4"><SubmitButton busy={busyTask === "intel"}>Share venue intelligence</SubmitButton></div>
        </form>
      ) : null}

      {activeTask === "experience" ? (
        <div className="mt-4 grid gap-3 rounded-[22px] border border-amber-200/18 bg-amber-300/[0.055] p-4 sm:grid-cols-2">
          <button type="button" onClick={() => onOpenCommunity?.("story")} className="min-h-[8rem] rounded-2xl border border-white/12 bg-black/24 p-4 text-left transition hover:border-amber-100/34 hover:bg-white/[0.055]"><MessageCircleHeart className="h-5 w-5 text-amber-100/80" aria-hidden="true" /><span className="mt-3 block text-sm font-semibold text-white">Write a story</span><span className="mt-1 block text-xs leading-5 text-white/48">Share a personal experience. A city or venue is optional.</span></button>
          <button type="button" onClick={() => onOpenCommunity?.("guide")} className="min-h-[8rem] rounded-2xl border border-white/12 bg-black/24 p-4 text-left transition hover:border-amber-100/34 hover:bg-white/[0.055]"><BookOpenText className="h-5 w-5 text-amber-100/80" aria-hidden="true" /><span className="mt-3 block text-sm font-semibold text-white">Create a guide</span><span className="mt-1 block text-xs leading-5 text-white/48">Create a local, multi-city or thematic guide.</span></button>
        </div>
      ) : null}

      {activeTask === "verify" ? (
        <form onSubmit={(event) => { event.preventDefault(); submit("verify", verifyForm); }} className="mt-4 rounded-[22px] border border-emerald-200/18 bg-emerald-300/[0.055] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <VenueSearch places={venueOptions} value={verifyForm.placeId} onChange={(placeId) => setVerifyForm((current) => ({ ...current, placeId }))} />
            <label><FieldLabel>Is it still operating?</FieldLabel><select value={verifyForm.stillOpen} onChange={(event) => setVerifyForm((current) => ({ ...current, stillOpen: event.target.value }))} className={inputClass}><option value="yes">Yes</option><option value="unsure">I could not confirm</option><option value="no">No / appears closed</option></select></label>
            <label><FieldLabel>What did you check?</FieldLabel><select value={verifyForm.checked} onChange={(event) => setVerifyForm((current) => ({ ...current, checked: event.target.value }))} className={inputClass}><option value="official">Official website or social account</option><option value="visited">I visited recently</option><option value="contacted">I contacted the venue</option><option value="multiple">Several current sources</option></select></label>
            <label><FieldLabel>Evidence link <span className="font-normal text-white/38">(optional)</span></FieldLabel><input type="url" value={verifyForm.source} onChange={(event) => setVerifyForm((current) => ({ ...current, source: event.target.value }))} className={inputClass} placeholder="https://…" /></label>
            <label className="md:col-span-2"><FieldLabel>Anything the editor should know? <span className="font-normal text-white/38">(optional)</span></FieldLabel><textarea value={verifyForm.note} onChange={(event) => setVerifyForm((current) => ({ ...current, note: event.target.value }))} className={`${inputClass} min-h-24`} /></label>
          </div>
          <div className="mt-4"><SubmitButton busy={busyTask === "verify"}><ShieldCheck className="h-4 w-4" aria-hidden="true" />Send verification</SubmitButton></div>
        </form>
      ) : null}

      {notice ? <div role="status" className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.08] px-4 py-3 text-sm text-emerald-50/88"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{notice}</div> : null}
      </div>
    </section>
  );
}
