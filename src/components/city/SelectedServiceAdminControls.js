"use client";

import DateInput from "@/components/ui/DateInput";
import VibeTagPicker from "@/components/ui/VibeTagPicker";

export default function SelectedServiceAdminControls({
  canEdit,
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
  serviceTypes,
  priceTierOptions,
}) {
  if (!canEdit) return null;

  return (
    <div className="mt-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.08] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/82">Service controls</p>
        <button
          type="button"
          onClick={onToggleOpen}
          className="rounded-full border border-amber-100/30 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/50"
        >
          {isOpen ? "Close editor" : "Edit service"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Service name"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          >
            {serviceTypes.map((item) => (
              <option key={`admin-service-type-${item.value}`} value={item.value}>
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
            title="Service vibe tags"
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
            placeholder="Availability / opening hours"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.provider_name}
            onChange={(event) => setDraft((current) => ({ ...current, provider_name: event.target.value }))}
            placeholder="Provider name"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.contact}
            onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))}
            placeholder="Contact (phone / email / handle)"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.booking_link}
            onChange={(event) => setDraft((current) => ({ ...current, booking_link: event.target.value }))}
            placeholder="Booking link"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <input
            value={draft.link}
            onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))}
            placeholder="Official link"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <select
            value={draft.price_tier}
            onChange={(event) => setDraft((current) => ({ ...current, price_tier: event.target.value }))}
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          >
            {priceTierOptions.map((value) => (
              <option key={`admin-service-price-${value || "none"}`} value={value}>
                {value || "Price tier (optional)"}
              </option>
            ))}
          </select>
          <input
            value={draft.source}
            onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
            placeholder="Source (optional)"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
          />
          <DateInput
            value={draft.lastChecked}
            onChange={(event) => setDraft((current) => ({ ...current, lastChecked: event.target.value }))}
            placeholder="Last checked (optional)"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-xl border border-emerald-200/30 bg-emerald-200/16 px-3 py-2 text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/55 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-xl border border-rose-200/30 bg-rose-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/55 disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete service"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
