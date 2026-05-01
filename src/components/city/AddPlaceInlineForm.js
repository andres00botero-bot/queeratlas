"use client";

import VibeTagPicker from "@/components/ui/VibeTagPicker";

export default function AddPlaceInlineForm({
  name,
  setName,
  description,
  setDescription,
  vibeTags,
  setVibeTags,
  vibe,
  setVibe,
  placeHours,
  setPlaceHours,
  placeLink,
  setPlaceLink,
  address,
  setAddress,
  type,
  setType,
  types,
  onSave,
}) {
  return (
    <div className="mb-6 space-y-3 rounded-[28px] border border-emerald-300/12 bg-[linear-gradient(180deg,rgba(9,36,30,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Place name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (vibe, crowd, energy...)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <VibeTagPicker
        value={vibeTags}
        onChange={setVibeTags}
        tone="emerald"
        title="Venue vibe tags"
        hint="Choose up to 3 tags for standardized discovery."
      />
      <input
        value={vibe}
        onChange={(event) => setVibe(event.target.value)}
        placeholder="Legacy vibe label (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input value={placeHours} onChange={(event) => setPlaceHours(event.target.value)} placeholder="Opening hours (for example Thu-Sat 22:00-05:00)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <input value={placeLink} onChange={(event) => setPlaceLink(event.target.value)} placeholder="Official link (website, Instagram, Facebook) - optional" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 outline-none">
        {types.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button onClick={onSave} className="w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-200 py-3 font-semibold text-black">
        Save
      </button>
    </div>
  );
}
