import DateInput from "@/components/ui/DateInput";

export default function GlobalEventForm({
  open,
  editingGlobalEventId,
  globalForm,
  setGlobalForm,
  isSavingGlobal,
  onSubmit,
  onCancelEdit,
}) {
  if (!open) return null;

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
      {editingGlobalEventId && (
        <p className="rounded-2xl border border-emerald-200/24 bg-emerald-200/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-emerald-100 md:col-span-2">
          Editing off-grid event
        </p>
      )}
      <input
        value={globalForm.name}
        onChange={(event) => setGlobalForm((current) => ({ ...current, name: event.target.value }))}
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30"
        placeholder="Event name *"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
          <DateInput
            value={globalForm.startDate}
            onChange={(event) => setGlobalForm((current) => ({ ...current, startDate: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
            required
            tone="cyan"
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
          <DateInput
            value={globalForm.endDate}
            onChange={(event) => setGlobalForm((current) => ({ ...current, endDate: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
            tone="cyan"
          />
        </div>
      </div>
      <p className="text-[11px] text-white/50 md:col-span-2">
        Use a single-day event by leaving <span className="font-medium text-white/70">To</span> empty.
      </p>
      <input
        value={globalForm.location}
        onChange={(event) => setGlobalForm((current) => ({ ...current, location: event.target.value }))}
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
        placeholder="Location (e.g. Mediterranean Sea, Alps, Desert Camp) *"
        required
      />
      <input
        value={globalForm.vibe}
        onChange={(event) => setGlobalForm((current) => ({ ...current, vibe: event.target.value }))}
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
        placeholder="Vibe (e.g. circuit, beach, queer arts, cozy social)"
      />
      <textarea
        value={globalForm.description}
        onChange={(event) => setGlobalForm((current) => ({ ...current, description: event.target.value }))}
        className="min-h-[110px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
        placeholder="Description (vibe, crowd, format, what makes it special)"
      />
      <input
        value={globalForm.link}
        onChange={(event) => setGlobalForm((current) => ({ ...current, link: event.target.value }))}
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
        placeholder="External link (optional)"
      />
      <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
        <input
          value={globalForm.source}
          onChange={(event) => setGlobalForm((current) => ({ ...current, source: event.target.value }))}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30"
          placeholder="Source URL or name (optional)"
        />
        <DateInput
          value={globalForm.lastChecked}
          onChange={(event) => setGlobalForm((current) => ({ ...current, lastChecked: event.target.value }))}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
          tone="cyan"
        />
      </div>
      <button
        type="submit"
        disabled={isSavingGlobal}
        className="rounded-2xl bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 md:col-span-2"
      >
        {isSavingGlobal ? "Saving..." : editingGlobalEventId ? "Save changes" : "Save to calendar"}
      </button>
      {editingGlobalEventId && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="rounded-2xl border border-white/16 bg-white/7 px-4 py-3 text-sm text-white/82 transition hover:border-white/28 md:col-span-2"
        >
          Cancel edit
        </button>
      )}
    </form>
  );
}
