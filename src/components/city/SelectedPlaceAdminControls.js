"use client";

import VibeTagPicker from "@/components/ui/VibeTagPicker";
import PracticalIntelFields from "@/components/city/PracticalIntelFields";
import { getVenueIntelLabels } from "@/lib/venueIntel";

export default function SelectedPlaceAdminControls({
  isAdmin,
  isOpen,
  onToggleOpen,
  draft,
  setDraft,
  onSaveAddressOnly,
  isSavingAddressOnly,
  onSave,
  isSaving,
  onDelete,
  isDeleting,
  placeTypes,
}) {
  if (!isAdmin) return null;
  const intelLabels = getVenueIntelLabels(draft.type);

  return (
    <div className="mt-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.08] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/82">Admin controls</p>
        <button
          type="button"
          onClick={onToggleOpen}
          className="rounded-full border border-amber-100/30 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/50"
        >
          {isOpen ? "Close editor" : "Edit venue"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Venue name"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          >
            {placeTypes.map((item) => (
              <option key={`admin-place-type-${item.value}`} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            className="min-h-[95px] w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <VibeTagPicker
            value={draft.vibe_tags}
            onChange={(nextTags) => setDraft((current) => ({ ...current, vibe_tags: nextTags }))}
            tone="amber"
            title="Venue vibe tags"
            hint="Choose up to 3 tags."
          />
          <input
            value={draft.vibe}
            onChange={(event) => setDraft((current) => ({ ...current, vibe: event.target.value }))}
            placeholder="Legacy vibe label (optional)"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.location}
            onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
            placeholder="Address / location (updates map pin)"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <button
            type="button"
            onClick={onSaveAddressOnly}
            disabled={isSavingAddressOnly}
            className="w-full rounded-xl border border-cyan-200/30 bg-cyan-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/55 disabled:opacity-60"
          >
            {isSavingAddressOnly ? "Saving address..." : "Save address only"}
          </button>
          <input
            value={draft.hours}
            onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))}
            placeholder="Opening hours"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.link}
            onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))}
            placeholder="Official link"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <PracticalIntelFields
            title="Practical venue intelligence"
            description="The prompts adapt to the selected venue type. Use observed, current wording."
            fields={[
              { key: "queue", label: intelLabels.queueWait, value: draft.queue_wait, onChange: (value) => setDraft((current) => ({ ...current, queue_wait: value })), placeholder: "Typical wait or arrival pattern" },
              { key: "best", label: intelLabels.bestNights, value: draft.best_nights, onChange: (value) => setDraft((current) => ({ ...current, best_nights: value })), placeholder: "Best day or time" },
              { key: "crowd", label: intelLabels.crowdMix, value: draft.crowd_mix, onChange: (value) => setDraft((current) => ({ ...current, crowd_mix: value })), placeholder: "Describe the crowd mix" },
              { key: "dress", label: intelLabels.dressCode, value: draft.dress_code, onChange: (value) => setDraft((current) => ({ ...current, dress_code: value })), placeholder: "What people actually wear or bring" },
              { key: "inclusion", label: intelLabels.staffInclusivity, value: draft.staff_inclusivity, onChange: (value) => setDraft((current) => ({ ...current, staff_inclusivity: value })), placeholder: "Factual community experience", wide: true },
            ]}
          />
          <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/58">Research provenance</p>
            <p className="mt-1 text-xs leading-5 text-white/48">Keep one credible source URL per line. These links are shown to visitors.</p>
            <textarea
              value={draft.source_urls}
              onChange={(event) => setDraft((current) => ({ ...current, source_urls: event.target.value }))}
              placeholder={"https://official-site.example/\nhttps://review-site.example/venue"}
              className="mt-2 min-h-[92px] w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
            />
            <input
              value={draft.research_status}
              onChange={(event) => setDraft((current) => ({ ...current, research_status: event.target.value }))}
              placeholder="Research status, for example researched"
              className="mt-2 w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setDraft((current) => ({
              ...current,
              queue_wait: "",
              best_nights: "",
              crowd_mix: "",
              dress_code: "",
              staff_inclusivity: "",
              source_urls: "",
              research_status: "",
            }))}
            className="w-full rounded-xl border border-white/14 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.12em] text-white/62 transition hover:border-white/28 hover:text-white"
          >
            Clear venue intelligence
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-xl border border-emerald-200/30 bg-emerald-200/16 px-3 py-2 text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/55 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save all changes"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-xl border border-rose-200/30 bg-rose-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/55 disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete venue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
