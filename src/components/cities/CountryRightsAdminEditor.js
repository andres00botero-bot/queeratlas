"use client";

const LEVEL_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "mixed", label: "Mixed" },
  { value: "risk", label: "Risk" },
  { value: "unknown", label: "Unknown" },
];

const RELATION_OPTIONS = [
  { value: "legal", label: "Legal" },
  { value: "restricted", label: "Restricted" },
  { value: "criminalized", label: "Criminalized" },
  { value: "unknown", label: "Unknown" },
];

const UNION_OPTIONS = [
  { value: "marriage", label: "Marriage" },
  { value: "civil_union_or_partnership", label: "Civil union / partnership" },
  { value: "no_protection", label: "No protection" },
  { value: "unknown", label: "Unknown" },
];

const GENDER_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "restricted", label: "Restricted" },
  { value: "impossible", label: "Impossible" },
  { value: "unknown", label: "Unknown" },
];

const ANTI_DISCRIMINATION_OPTIONS = [
  { value: "full_coverage", label: "Full coverage" },
  { value: "partial_coverage", label: "Partial coverage" },
  { value: "limited_or_none", label: "Limited / none" },
  { value: "unknown", label: "Unknown" },
];

const CONFIDENCE_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.12em] text-white/58">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-white/14 bg-black/35 px-2.5 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
      >
        {options.map((item) => (
          <option key={`${label}-${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CountryRightsAdminEditor({
  country,
  draft,
  setDraft,
  isSaving,
  onSave,
  onCancel,
  saveError = "",
  saveSuccess = "",
}) {
  if (!draft) return null;

  return (
    <div className="mt-3 rounded-2xl border border-cyan-200/24 bg-[linear-gradient(145deg,rgba(34,211,238,0.1),rgba(12,12,12,0.82))] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/75">Admin editing</p>
          <p className="text-sm text-white/84">{country} rights profile</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/16 bg-white/6 px-3 py-1 text-xs text-white/72 transition hover:border-white/24 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SelectField
          label="Legal level"
          value={draft.legal_level}
          onChange={(value) => setDraft((current) => ({ ...current, legal_level: value }))}
          options={LEVEL_OPTIONS}
        />
        <SelectField
          label="Rights level"
          value={draft.rights_level}
          onChange={(value) => setDraft((current) => ({ ...current, rights_level: value }))}
          options={LEVEL_OPTIONS}
        />
        <SelectField
          label="Safety level"
          value={draft.safety_level}
          onChange={(value) => setDraft((current) => ({ ...current, safety_level: value }))}
          options={LEVEL_OPTIONS}
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <SelectField
          label="Same-sex relations"
          value={draft.same_sex_relations_status}
          onChange={(value) => setDraft((current) => ({ ...current, same_sex_relations_status: value }))}
          options={RELATION_OPTIONS}
        />
        <SelectField
          label="Union status"
          value={draft.union_status}
          onChange={(value) => setDraft((current) => ({ ...current, union_status: value }))}
          options={UNION_OPTIONS}
        />
        <SelectField
          label="Gender recognition"
          value={draft.legal_gender_recognition_status}
          onChange={(value) =>
            setDraft((current) => ({ ...current, legal_gender_recognition_status: value }))
          }
          options={GENDER_OPTIONS}
        />
        <SelectField
          label="Anti-discrimination"
          value={draft.anti_discrimination_status}
          onChange={(value) =>
            setDraft((current) => ({ ...current, anti_discrimination_status: value }))
          }
          options={ANTI_DISCRIMINATION_OPTIONS}
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <SelectField
          label="Confidence"
          value={draft.confidence}
          onChange={(value) => setDraft((current) => ({ ...current, confidence: value }))}
          options={CONFIDENCE_OPTIONS}
        />
        <label className="flex items-center gap-2 self-end pb-1 text-sm text-white/80">
          <input
            type="checkbox"
            checked={Boolean(draft.needs_manual_review)}
            onChange={(event) =>
              setDraft((current) => ({ ...current, needs_manual_review: event.target.checked }))
            }
            className="h-4 w-4 rounded border-white/25 bg-black/40"
          />
          Needs manual review
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.12em] text-white/58">What this means</span>
        <textarea
          value={draft.what_this_means}
          onChange={(event) => setDraft((current) => ({ ...current, what_this_means: event.target.value }))}
          rows={3}
          className="rounded-lg border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
        />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-white/58">Legal source URL</span>
          <input
            value={draft.source_legal_url}
            onChange={(event) => setDraft((current) => ({ ...current, source_legal_url: event.target.value }))}
            className="rounded-lg border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-white/58">Rights source URL</span>
          <input
            value={draft.source_rights_url}
            onChange={(event) => setDraft((current) => ({ ...current, source_rights_url: event.target.value }))}
            className="rounded-lg border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-white/58">Safety source URL</span>
          <input
            value={draft.source_safety_url}
            onChange={(event) => setDraft((current) => ({ ...current, source_safety_url: event.target.value }))}
            className="rounded-lg border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
      </div>

      {(saveError || saveSuccess) && (
        <p className={`mt-3 text-xs ${saveError ? "text-rose-200/90" : "text-emerald-200/90"}`}>
          {saveError || saveSuccess}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="rounded-full border border-cyan-200/30 bg-cyan-300/14 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100/90 transition hover:border-cyan-200/46 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save country rights"}
        </button>
      </div>
    </div>
  );
}
