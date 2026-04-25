import DateInput from "@/components/ui/DateInput";
import VibeTagPicker from "@/components/ui/VibeTagPicker";

export default function CityEventEditModal({
  open,
  draft,
  setDraft,
  error,
  isSaving,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-emerald-200/22 bg-[linear-gradient(165deg,rgba(8,44,30,0.9),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/75">Admin edit</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Edit event</h3>
            <p className="mt-1 text-sm text-white/70">{draft.city || "City event"}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
              placeholder="Event name *"
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
                <DateInput
                  value={draft.startDate}
                  onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/30"
                  required
                  tone="cyan"
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
                <DateInput
                  value={draft.endDate}
                  onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/30"
                  tone="cyan"
                />
              </div>
            </div>

            <input
              value={draft.location}
              onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
              placeholder="Location (optional)"
            />
            <VibeTagPicker
              value={draft.vibe_tags}
              onChange={(nextTags) => setDraft((current) => ({ ...current, vibe_tags: nextTags }))}
              tone="emerald"
              title="Event vibe tags"
              hint="Pick up to 3 tags. These power filters and discovery."
            />
            <input
              value={draft.vibe}
              onChange={(event) => setDraft((current) => ({ ...current, vibe: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
              placeholder="Legacy vibe label (optional)"
            />
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
              placeholder="Description"
            />
            <input
              value={draft.link}
              onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
              placeholder="External link (optional)"
            />

            {error && (
              <p className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full border border-emerald-200/34 bg-emerald-200/16 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/55 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
