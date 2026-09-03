"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronDown, MapPinned, Pencil, Plus, RotateCcw, Save, Sparkles, Trash2, X } from "lucide-react";

function parsePlanDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPlanDate(value) {
  const date = parsePlanDate(value);
  if (!date) return "Dates undecided";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupPlans(plans = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const groups = { upcoming: [], ideas: [], past: [] };

  plans.forEach((plan) => {
    const date = parsePlanDate(plan?.date);
    if (!date) groups.ideas.push(plan);
    else if (date.getTime() >= today.getTime()) groups.upcoming.push(plan);
    else groups.past.push(plan);
  });

  groups.upcoming.sort((a, b) => parsePlanDate(a.date) - parsePlanDate(b.date));
  groups.past.sort((a, b) => parsePlanDate(b.date) - parsePlanDate(a.date));
  groups.ideas.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return groups;
}

function planStopCount(plan) {
  return Array.isArray(plan?.stops) ? plan.stops.length : 0;
}

function TripCard({ plan, featured = false, expanded, onToggle, onOpenStop, onRemove, onUpdate }) {
  const stops = Array.isArray(plan?.stops) ? plan.stops : [];
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removedStop, setRemovedStop] = useState(null);
  const [draft, setDraft] = useState({ title: plan.title || "", date: plan.date || "", note: plan.note || "", stops });

  const cancelEditing = () => {
    setDraft({ title: plan.title || "", date: plan.date || "", note: plan.note || "", stops });
    setRemovedStop(null);
    setIsEditing(false);
  };

  const removeStop = (index) => {
    setDraft((current) => {
      const nextStops = [...current.stops];
      const [stop] = nextStops.splice(index, 1);
      setRemovedStop({ stop, index });
      return { ...current, stops: nextStops };
    });
  };

  const undoRemoveStop = () => {
    if (!removedStop?.stop) return;
    setDraft((current) => {
      const nextStops = [...current.stops];
      nextStops.splice(removedStop.index, 0, removedStop.stop);
      return { ...current, stops: nextStops };
    });
    setRemovedStop(null);
  };

  const moveStop = (index, offset) => {
    setDraft((current) => {
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= current.stops.length) return current;
      const nextStops = [...current.stops];
      [nextStops[index], nextStops[targetIndex]] = [nextStops[targetIndex], nextStops[index]];
      return { ...current, stops: nextStops };
    });
  };

  const updateStopTime = (index, time) => {
    setDraft((current) => ({
      ...current,
      stops: current.stops.map((stop, stopIndex) => stopIndex === index ? { ...stop, time: time || null } : stop),
    }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    const didSave = await onUpdate?.(plan.id, draft);
    setIsSaving(false);
    if (didSave !== false) {
      setRemovedStop(null);
      setIsEditing(false);
    }
  };

  return (
    <article
      className={`overflow-hidden border transition ${
        featured
          ? "rounded-[24px] border-[#88d9d4]/22 bg-[linear-gradient(145deg,rgba(136,217,212,0.12),rgba(255,255,255,0.025)_48%,rgba(245,169,198,0.07))] shadow-[0_22px_60px_rgba(0,0,0,0.24)]"
          : "rounded-[20px] border-white/9 bg-white/[0.028] hover:border-white/16 hover:bg-white/[0.042]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-h-20 w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f5a9c6] sm:px-5"
      >
        <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-[15px] ${featured ? "bg-[#88d9d4]/14 text-[#c7fff9]" : "bg-white/[0.055] text-white/70"}`}>
          <MapPinned size={19} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/42">
            {featured ? <span className="text-[#9ce9e3]">Up next</span> : null}
            <span>{plan.city || "City undecided"}</span>
          </span>
          <span className="mt-1 block truncate text-base font-semibold text-[#fff8fc] sm:text-lg">{plan.title || "Untitled trip"}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#bcaeb9]">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} aria-hidden="true" />{formatPlanDate(plan.date)}</span>
            <span>{planStopCount(plan)} {planStopCount(plan) === 1 ? "stop" : "stops"}</span>
          </span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className={`flex-none text-white/42 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded ? (
        <div className="border-t border-white/8 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          {isEditing ? (
            <div className="mb-4 space-y-3 rounded-[18px] border border-[#f5a9c6]/14 bg-black/20 p-3.5 sm:p-4">
              <label className="block text-xs font-medium text-white/62">
                Trip name
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1.5 min-h-11 w-full rounded-[13px] border border-white/12 bg-[#17121b] px-3 text-sm text-white outline-none transition focus:border-[#f5a9c6]/50 focus:ring-2 focus:ring-[#f5a9c6]/12"
                />
              </label>
              <label className="block text-xs font-medium text-white/62">
                Start date
                <input
                  type="date"
                  value={draft.date || ""}
                  onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1.5 min-h-11 w-full rounded-[13px] border border-white/12 bg-[#17121b] px-3 text-sm text-white [color-scheme:dark] outline-none transition focus:border-[#88d9d4]/50 focus:ring-2 focus:ring-[#88d9d4]/12"
                />
              </label>
              <label className="block text-xs font-medium text-white/62">
                Note
                <textarea
                  value={draft.note}
                  onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                  rows={3}
                  placeholder="What do you want to remember?"
                  className="mt-1.5 w-full resize-y rounded-[13px] border border-white/12 bg-[#17121b] px-3 py-2.5 text-sm leading-5 text-white outline-none transition placeholder:text-white/28 focus:border-[#88d9d4]/50 focus:ring-2 focus:ring-[#88d9d4]/12"
                />
              </label>
            </div>
          ) : null}

          {(isEditing ? draft.stops : stops).length > 0 ? (
            <div className="space-y-1.5">
              {(isEditing ? draft.stops : stops).map((stop, index) => (
                <div
                  key={`${stop.type || "stop"}-${stop.id || index}-${index}`}
                  className="group flex min-h-12 w-full items-center gap-2 rounded-[14px] px-2.5 py-2 transition hover:bg-white/[0.055]"
                >
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-white/10 bg-black/20 text-[10px] font-semibold text-white/58">{index + 1}</span>
                  <button type="button" disabled={isEditing} onClick={() => onOpenStop?.({ ...stop, itemType: stop.type === "event" ? "event" : "place" })} className="min-w-0 flex-1 text-left disabled:cursor-default focus-visible:outline-2 focus-visible:outline-[#88d9d4]">
                    <span className="block truncate text-sm font-medium text-white/86">{stop.name || "Saved stop"}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/42">{stop.time ? `${stop.time} · ` : ""}{stop.dayLabel || stop.slotLabel || stop.type || "Trip stop"}</span>
                  </button>
                  {isEditing ? (
                    <div className="flex flex-none items-center gap-0.5">
                      <input type="time" value={stop.time || ""} onChange={(event) => updateStopTime(index, event.target.value)} aria-label={`Time for ${stop.name || "stop"}`} className="h-10 w-[5.35rem] rounded-xl border border-white/10 bg-[#17121b] px-2 text-xs text-white [color-scheme:dark] outline-none focus:border-[#88d9d4]/50" />
                      <button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} aria-label={`Move ${stop.name || "stop"} earlier`} className="flex h-10 w-8 items-center justify-center rounded-full text-white/52 hover:bg-white/[0.06] disabled:opacity-20"><ArrowUp size={14} aria-hidden="true" /></button>
                      <button type="button" onClick={() => moveStop(index, 1)} disabled={index === draft.stops.length - 1} aria-label={`Move ${stop.name || "stop"} later`} className="flex h-10 w-8 items-center justify-center rounded-full text-white/52 hover:bg-white/[0.06] disabled:opacity-20"><ArrowDown size={14} aria-hidden="true" /></button>
                      <button type="button" onClick={() => removeStop(index)} aria-label={`Remove ${stop.name || "stop"}`} className="flex h-10 w-8 items-center justify-center rounded-full text-rose-100/60 transition hover:bg-rose-200/[0.08] hover:text-rose-100 focus-visible:outline-2 focus-visible:outline-rose-200"><X size={15} aria-hidden="true" /></button>
                    </div>
                  ) : <span className="text-[10px] font-semibold text-[#9ce9e3] opacity-70 transition group-hover:opacity-100">Open</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 px-4 py-5 text-sm text-white/46">This trip is ready for its first venue or event.</div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/7 pt-3">
            {removedStop ? <button type="button" onClick={undoRemoveStop} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-[#bff5ef] transition hover:bg-[#88d9d4]/8 focus-visible:outline-2 focus-visible:outline-[#88d9d4]"><RotateCcw size={14} aria-hidden="true" />Undo remove</button> : <p className="text-[11px] text-white/36">Private by default</p>}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button type="button" onClick={cancelEditing} className="min-h-11 rounded-full px-3 text-xs text-white/58 transition hover:bg-white/[0.055] hover:text-white">Cancel</button>
                  <button type="button" onClick={saveChanges} disabled={isSaving || !draft.title.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f5a9c6] px-4 text-xs font-semibold text-[#24131d] transition hover:bg-[#ffc0d7] disabled:cursor-not-allowed disabled:opacity-45"><Save size={14} aria-hidden="true" />{isSaving ? "Saving…" : "Save changes"}</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setDraft({ title: plan.title || "", date: plan.date || "", note: plan.note || "", stops }); setRemovedStop(null); setIsEditing(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-white/68 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline-2 focus-visible:outline-white/50"><Pencil size={14} aria-hidden="true" />Edit trip</button>
                  <button type="button" onClick={() => onRemove?.(plan.id)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-rose-100/66 transition hover:bg-rose-200/[0.08] hover:text-rose-100 focus-visible:outline-2 focus-visible:outline-rose-200"><Trash2 size={14} aria-hidden="true" />Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function TripPlansHome({ plans = [], expandedPlanId, onExpandedPlanChange, onCreateTrip, onOpenStop, onRemovePlan, onUpdatePlan }) {
  const groups = groupPlans(plans);
  const featured = groups.upcoming[0] || groups.ideas[0] || null;
  const remainingUpcoming = featured && groups.upcoming[0]?.id === featured.id ? groups.upcoming.slice(1) : groups.upcoming;
  const remainingIdeas = featured && groups.ideas[0]?.id === featured.id ? groups.ideas.slice(1) : groups.ideas;
  const sections = [
    { id: "upcoming", label: "Upcoming", plans: remainingUpcoming },
    { id: "ideas", label: "Ideas", plans: remainingIdeas },
    { id: "past", label: "Past", plans: groups.past },
  ].filter((section) => section.plans.length > 0);

  const removeWithConfirmation = (planId) => {
    const plan = plans.find((item) => String(item.id) === String(planId));
    if (typeof window !== "undefined" && !window.confirm(`Delete ${plan?.title || "this trip"}?`)) return;
    onRemovePlan?.(planId);
  };

  if (plans.length === 0) {
    return (
      <div className="mx-auto flex min-h-[30rem] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#f5a9c6]/18 bg-[#f5a9c6]/8 text-[#ffd8e7] shadow-[0_20px_50px_rgba(0,0,0,0.24)]"><Sparkles size={25} aria-hidden="true" /></span>
        <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-[#fff8fc]">Your next queer trip starts here</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#bcaeb9]">Turn places and events you already love into one calm, usable route.</p>
        <button type="button" onClick={onCreateTrip} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#f5a9c6] px-5 text-sm font-semibold text-[#24131d] shadow-[0_14px_34px_rgba(245,169,198,0.20)] transition hover:bg-[#ffc0d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5a9c6]">
          <Plus size={17} aria-hidden="true" />
          New trip
        </button>
        <p className="mt-3 text-xs text-white/36">You can start with saved places or choose a city.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#fff8fc]">Your trips</h3>
          <p className="mt-1 text-sm text-[#bcaeb9]">Open a plan or start somewhere new.</p>
        </div>
        <button type="button" onClick={onCreateTrip} className="inline-flex min-h-11 flex-none items-center gap-2 rounded-full bg-[#f5a9c6] px-4 text-sm font-semibold text-[#24131d] transition hover:bg-[#ffc0d7] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f5a9c6]">
          <Plus size={16} aria-hidden="true" />
          New trip
        </button>
      </div>

      {featured ? (
        <TripCard
          plan={featured}
          featured
          expanded={String(expandedPlanId) === String(featured.id)}
          onToggle={() => onExpandedPlanChange?.(String(expandedPlanId) === String(featured.id) ? null : featured.id)}
          onOpenStop={onOpenStop}
          onRemove={removeWithConfirmation}
          onUpdate={onUpdatePlan}
        />
      ) : null}

      <div className="mt-7 space-y-7">
        {sections.map((section) => (
          <section key={section.id}>
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/48">{section.label}</h4>
              <span className="text-xs text-white/30">{section.plans.length}</span>
            </div>
            <div className="space-y-2">
              {section.plans.map((plan) => (
                <TripCard
                  key={plan.id}
                  plan={plan}
                  expanded={String(expandedPlanId) === String(plan.id)}
                  onToggle={() => onExpandedPlanChange?.(String(expandedPlanId) === String(plan.id) ? null : plan.id)}
                  onOpenStop={onOpenStop}
                  onRemove={removeWithConfirmation}
                  onUpdate={onUpdatePlan}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
