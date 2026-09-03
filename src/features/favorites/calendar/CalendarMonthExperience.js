"use client";

import { useMemo, useState } from "react";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Map, MapPin, Navigation, Plus, Sparkles, X } from "lucide-react";

function entryTone(kind) {
  if (kind === "event") return { dot: "bg-[#ff78ad]", rail: "bg-[#ff78ad]", label: "Saved event", text: "text-[#ffd8e7]" };
  if (kind === "plan") return { dot: "bg-[#88d9d4]", rail: "bg-[#88d9d4]", label: "Trip plan", text: "text-[#bff5ef]" };
  return { dot: "bg-[#d8b678]", rail: "bg-[#d8b678]", label: "Personal", text: "text-[#f4dfb4]" };
}

function Sheet({ title, eyebrow, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/68 px-0 backdrop-blur-sm sm:items-center sm:px-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] border border-white/12 bg-[radial-gradient(circle_at_85%_0%,rgba(245,169,198,0.12),transparent_28%),linear-gradient(180deg,#241827_0%,#151019_100%)] p-5 shadow-[0_-24px_80px_rgba(0,0,0,0.52)] sm:max-w-xl sm:rounded-[30px] sm:p-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/18 sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? <p className="text-[10px] uppercase tracking-[0px] text-[#f5a9c6]/72 sm:tracking-[0.18em]">{eyebrow}</p> : null}
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#fff7fb]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/64 transition hover:bg-white/[0.08] hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function CalendarMonthExperience({
  monthKey,
  monthCells,
  entriesByDate,
  selectedDateKey,
  todayDateKey,
  selectedEntries,
  itemForm,
  setItemForm,
  onMoveMonth,
  onToday,
  onSelectDate,
  onSaveItem,
  onRemovePersonal,
  onSetEventReminder,
  onSetPersonalReminder,
  onToggleGoing,
  onShowOnMap,
  onDirections,
  onAddToTrip,
  onEnablePush,
  pushState,
  onOpenEvent,
  onOpenTrip,
}) {
  const [activeEntry, setActiveEntry] = useState(null);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const monthLabel = useMemo(
    () => new Date(`${monthKey}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [monthKey]
  );

  function selectDay(dateKey) {
    onSelectDate(dateKey);
    setIsDayOpen(true);
  }

  function openAdd() {
    setItemForm((current) => ({ ...current, date: selectedDateKey || todayDateKey }));
    setIsDayOpen(false);
    setIsAddOpen(true);
  }

  function submitItem(event) {
    onSaveItem(event);
    setIsAddOpen(false);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(245,169,198,0.09),transparent_31%),linear-gradient(180deg,#19131f_0%,#120e17_100%)] shadow-[0_28px_82px_rgba(0,0,0,0.32)]">
        <header className="flex flex-col gap-4 border-b border-white/8 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.19em] text-[#f5a9c6]/68">Month overview</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#fff7fb] sm:text-3xl">{monthLabel}</h3>
          </div>
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
            <div className="flex min-w-0 items-center justify-between rounded-full border border-white/9 bg-white/[0.03] p-1 sm:justify-start">
              <button type="button" onClick={() => onMoveMonth(-1)} aria-label="Previous month" className="flex h-10 w-10 items-center justify-center rounded-full text-white/58 transition hover:bg-white/[0.07] hover:text-white"><ChevronLeft size={18} /></button>
              <button type="button" onClick={onToday} className="min-h-10 rounded-full px-3 text-xs font-semibold text-[#ffd8e7] transition hover:bg-[#f5a9c6]/9">Today</button>
              <button type="button" onClick={() => onMoveMonth(1)} aria-label="Next month" className="flex h-10 w-10 items-center justify-center rounded-full text-white/58 transition hover:bg-white/[0.07] hover:text-white"><ChevronRight size={18} /></button>
            </div>
            <button type="button" onClick={onEnablePush} disabled={pushState === "loading" || pushState === "enabled"} className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/62 disabled:opacity-60"><Bell size={15} /> {pushState === "enabled" ? "On" : "Reminders"}</button>
            <button type="button" onClick={openAdd} className="col-span-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f5a9c6] px-4 text-xs font-semibold text-[#24131d] shadow-[0_10px_28px_rgba(245,169,198,0.18)] transition hover:bg-[#ffc0d7] sm:w-auto"><Plus size={16} /> Add plan</button>
          </div>
        </header>

        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-7 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-white/34 sm:text-[10px]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[22px] border border-white/8 bg-white/8">
            {monthCells.map((day) => {
              const entries = entriesByDate.get(day.dateKey) || [];
              const isSelected = day.dateKey === selectedDateKey;
              const isToday = day.dateKey === todayDateKey;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => selectDay(day.dateKey)}
                  aria-label={`${day.dateKey}, ${entries.length} ${entries.length === 1 ? "plan" : "plans"}`}
                  className={`relative min-h-[4.35rem] bg-[#17121d] p-1.5 text-left transition sm:min-h-[7.25rem] sm:p-2.5 ${day.isCurrentMonth ? "opacity-100" : "opacity-38"} ${isSelected ? "z-10 ring-1 ring-inset ring-[#f5a9c6]/62" : "hover:bg-[#211725]"}`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-[#f5a9c6] text-[#24131d]" : isSelected ? "border border-[#f5a9c6]/60 text-[#fff7fb]" : "text-white/66"}`}>{day.dayNumber}</span>
                  <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                    {entries.slice(0, 3).map((entry) => <span key={`${day.dateKey}-${entry.id}`} className={`h-1.5 w-1.5 rounded-full ${entryTone(entry.kind).dot}`} />)}
                  </div>
                  <div className="mt-2 hidden space-y-1 sm:block">
                    {entries.slice(0, 2).map((entry) => {
                      const tone = entryTone(entry.kind);
                      return <span key={`${day.dateKey}-${entry.id}`} className="relative block truncate rounded-md bg-white/[0.045] py-1 pl-2.5 pr-1 text-[10px] text-white/64"><span className={`absolute inset-y-1 left-0 w-0.5 rounded-full ${tone.rail}`} />{entry.time ? `${entry.time} ` : ""}{entry.title}</span>;
                    })}
                    {entries.length > 2 ? <span className="block pl-1 text-[9px] text-white/34">+{entries.length - 2} more</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 px-1 text-[10px] text-white/42">
            {[{ label: "Events", tone: "bg-[#ff78ad]" }, { label: "Trips", tone: "bg-[#88d9d4]" }, { label: "Personal", tone: "bg-[#d8b678]" }].map((item) => <span key={item.label} className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />{item.label}</span>)}
          </div>
        </div>
      </div>

      {isDayOpen ? (
        <Sheet title={new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} eyebrow="Your day" onClose={() => setIsDayOpen(false)}>
          <div className="mt-6 space-y-2">
            {selectedEntries.length ? selectedEntries.map((entry) => {
              const tone = entryTone(entry.kind);
              return (
                <button key={entry.id} type="button" onClick={() => { setActiveEntry(entry); setIsDayOpen(false); }} className="relative flex min-h-[4.75rem] w-full items-center gap-3 overflow-hidden rounded-[18px] border border-white/9 bg-white/[0.035] px-4 py-3 text-left transition hover:border-white/16 hover:bg-white/[0.055]">
                  <span className={`absolute inset-y-0 left-0 w-[3px] ${tone.rail}`} />
                  <span className="w-12 flex-none text-center text-xs font-semibold text-white/66">{entry.time || "All day"}</span>
                  <span className="min-w-0 flex-1 border-l border-white/8 pl-3"><span className={`block text-[9px] uppercase tracking-[0.13em] ${tone.text}`}>{entry.status === "going" ? "Going" : tone.label}</span><span className="mt-1 block truncate text-sm font-semibold text-[#fff7fb]">{entry.title}</span><span className="mt-1 block truncate text-xs text-[#bcaeb9]">{entry.city || "Location not set"}</span></span>
                </button>
              );
            }) : <div className="rounded-[20px] border border-dashed border-white/12 px-5 py-9 text-center"><CalendarDays className="mx-auto text-[#f5a9c6]/58" size={26} /><p className="mt-3 text-sm text-[#bcaeb9]">Nothing planned yet.</p></div>}
          </div>
          <button type="button" onClick={openAdd} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f5a9c6] text-sm font-semibold text-[#24131d]"><Plus size={16} /> Add something to this day</button>
        </Sheet>
      ) : null}

      {activeEntry ? (
        <Sheet title={activeEntry.title} eyebrow={entryTone(activeEntry.kind).label} onClose={() => setActiveEntry(null)}>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#bcaeb9]">
            <span className="flex items-center gap-1.5 rounded-full border border-white/9 bg-white/[0.035] px-3 py-2"><CalendarDays size={14} /> {activeEntry.dateKey}{activeEntry.time ? ` · ${activeEntry.time}` : ""}</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/9 bg-white/[0.035] px-3 py-2"><MapPin size={14} /> {activeEntry.city || "Location not set"}</span>
            {activeEntry.reminderMode && activeEntry.reminderMode !== "off" ? <span className="flex items-center gap-1.5 rounded-full border border-white/9 bg-white/[0.035] px-3 py-2"><Bell size={14} /> Reminder set</span> : null}
          </div>
          {activeEntry.notes ? <p className="mt-5 text-sm leading-6 text-white/62">{activeEntry.notes}</p> : null}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {activeEntry.kind === "event" ? <>
              <button type="button" onClick={() => { onToggleGoing(activeEntry.sourceId); setActiveEntry((current) => ({ ...current, status: current.status === "going" ? "saved" : "going" })); }} className={`flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold ${activeEntry.status === "going" ? "border border-[#f5a9c6]/28 bg-[#f5a9c6]/12 text-[#ffd8e7]" : "bg-[#f5a9c6] text-[#24131d]"}`}><Sparkles size={15} /> {activeEntry.status === "going" ? "Going" : "Mark as going"}</button>
              <button type="button" onClick={() => onOpenEvent(activeEntry)} className="min-h-12 rounded-full border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-white/76">Open event</button>
              <button type="button" onClick={() => onDirections(activeEntry)} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-white/76"><Navigation size={15} /> Directions</button>
              <button type="button" onClick={() => onShowOnMap(activeEntry)} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-white/76"><Map size={15} /> Show on map</button>
              <button type="button" onClick={() => onAddToTrip(activeEntry)} className="min-h-12 rounded-full border border-[#88d9d4]/20 bg-[#88d9d4]/9 px-4 text-sm font-semibold text-[#bff5ef]">Add to trip</button>
              <button type="button" onClick={() => { onSetEventReminder(activeEntry.sourceId, activeEntry.reminderMode === "day_before" ? "off" : "day_before"); setActiveEntry((current) => ({ ...current, reminderMode: current.reminderMode === "day_before" ? "off" : "day_before" })); }} className="min-h-12 rounded-full border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-white/76">{activeEntry.reminderMode === "day_before" ? "Remove reminder" : "Remind day before"}</button>
            </> : null}
            {activeEntry.kind === "plan" ? <button type="button" onClick={() => onOpenTrip(activeEntry)} className="min-h-12 rounded-full bg-[#88d9d4] px-4 text-sm font-semibold text-[#10211f] sm:col-span-2">Open trip</button> : null}
            {activeEntry.kind === "personal" ? <><button type="button" onClick={() => onSetPersonalReminder(activeEntry.sourceId, activeEntry.reminderMode === "hour_before" ? "off" : "hour_before")} className="min-h-12 rounded-full border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-white/76">{activeEntry.reminderMode === "hour_before" ? "Remove reminder" : "Remind 1 hour before"}</button><button type="button" onClick={() => { onRemovePersonal(activeEntry.sourceId); setActiveEntry(null); }} className="min-h-12 rounded-full border border-[#ff8b82]/18 bg-[#ff8b82]/8 px-4 text-sm font-semibold text-[#ffc5bf]">Remove</button></> : null}
          </div>
        </Sheet>
      ) : null}

      {isAddOpen ? (
        <Sheet title="Add a plan" eyebrow="A little something to look forward to" onClose={() => setIsAddOpen(false)}>
          <form onSubmit={submitItem} className="mt-6 grid gap-3">
            <label className="grid gap-1.5 text-xs text-white/54">Title<input required autoFocus value={itemForm.title} onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))} placeholder="Dinner, meetup, show…" className="min-h-12 rounded-[16px] border border-white/11 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f5a9c6]/44" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-white/54">Date<input required type="date" value={itemForm.date} onChange={(event) => setItemForm((current) => ({ ...current, date: event.target.value }))} className="min-h-12 rounded-[16px] border border-white/11 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#f5a9c6]/44" /></label>
              <label className="grid gap-1.5 text-xs text-white/54">Time <span className="sr-only">optional</span><input type="time" value={itemForm.time} onChange={(event) => setItemForm((current) => ({ ...current, time: event.target.value }))} className="min-h-12 rounded-[16px] border border-white/11 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#f5a9c6]/44" /></label>
            </div>
            <label className="grid gap-1.5 text-xs text-white/54">City <span className="text-white/28">optional</span><input value={itemForm.city} onChange={(event) => setItemForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="min-h-12 rounded-[16px] border border-white/11 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f5a9c6]/44" /></label>
            <label className="grid gap-1.5 text-xs text-white/54">Notes <span className="text-white/28">optional</span><textarea value={itemForm.notes} onChange={(event) => setItemForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Anything worth remembering" className="min-h-24 resize-none rounded-[16px] border border-white/11 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f5a9c6]/44" /></label>
            <button type="submit" className="mt-2 min-h-12 rounded-full bg-[#f5a9c6] px-5 text-sm font-semibold text-[#24131d] shadow-[0_12px_30px_rgba(245,169,198,0.18)]">Save plan</button>
          </form>
        </Sheet>
      ) : null}
    </>
  );
}
