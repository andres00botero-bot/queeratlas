"use client";

import VibeTagPicker from "@/components/ui/VibeTagPicker";
import PracticalIntelFields from "@/components/city/PracticalIntelFields";
import VenueLocationPicker from "@/components/location/VenueLocationPicker";
import { getVenueIntelGuidance, getVenueIntelLabels } from "@/lib/venueIntel";

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
  city,
  placeLocation,
  setPlaceLocation,
  type,
  setType,
  types,
  placeQueueWait,
  setPlaceQueueWait,
  placeBestNights,
  setPlaceBestNights,
  placeCrowdMix,
  setPlaceCrowdMix,
  placeDressCode,
  setPlaceDressCode,
  placeStaffInclusivity,
  setPlaceStaffInclusivity,
  onSave,
}) {
  const intelLabels = getVenueIntelLabels(type);
  const intelGuidance = getVenueIntelGuidance(type);

  return (
    <div className="mb-6 space-y-3 rounded-[28px] border border-emerald-300/12 bg-[linear-gradient(180deg,rgba(9,36,30,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Place name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (vibe, crowd, energy...)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      {type !== "store" && (
        <VibeTagPicker
          value={vibeTags}
          onChange={setVibeTags}
          excludeTags={["service", "store"]}
          tone="emerald"
          title="Venue vibe tags"
          hint="Choose up to 3 tags for standardized discovery."
        />
      )}
      <input
        value={vibe}
        onChange={(event) => setVibe(event.target.value)}
        placeholder="Legacy vibe label (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input value={placeHours} onChange={(event) => setPlaceHours(event.target.value)} placeholder="Opening hours (for example Thu-Sat 22:00-05:00)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <input value={placeLink} onChange={(event) => setPlaceLink(event.target.value)} placeholder="Official link (website, Instagram, Facebook) - optional" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <VenueLocationPicker
        address={address}
        city={city}
        location={placeLocation}
        onAddressChange={setAddress}
        onLocationChange={setPlaceLocation}
      />
      <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 outline-none">
        {types.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <PracticalIntelFields
        title="Practical venue intelligence"
        description="Optional first-hand details that help people choose when and how to visit. The prompts adapt to the venue type."
        fields={[
          { key: "queue", label: intelLabels.queueWait, value: placeQueueWait, onChange: setPlaceQueueWait, placeholder: intelGuidance.queueWait },
          { key: "best", label: intelLabels.bestNights, value: placeBestNights, onChange: setPlaceBestNights, placeholder: intelGuidance.bestNights },
          { key: "crowd", label: intelLabels.crowdMix, value: placeCrowdMix, onChange: setPlaceCrowdMix, placeholder: intelGuidance.crowdMix },
          { key: "dress", label: intelLabels.dressCode, value: placeDressCode, onChange: setPlaceDressCode, placeholder: intelGuidance.dressCode },
          { key: "inclusion", label: intelLabels.staffInclusivity, value: placeStaffInclusivity, onChange: setPlaceStaffInclusivity, placeholder: intelGuidance.staffInclusivity, wide: true },
        ]}
      />
      <button disabled={!placeLocation} onClick={onSave} className="w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-200 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-45">
        Save
      </button>
    </div>
  );
}
