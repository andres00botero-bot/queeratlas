"use client";

import VibeTagPicker from "@/components/ui/VibeTagPicker";
import { normalizeServicePriceTierOptions } from "@/features/city/serviceFormUtils";

export default function AddServiceInlineForm({
  addServiceFormRef,
  serviceName,
  setServiceName,
  serviceDescription,
  setServiceDescription,
  serviceVibeTags,
  setServiceVibeTags,
  serviceVibe,
  setServiceVibe,
  serviceAddress,
  setServiceAddress,
  serviceType,
  setServiceType,
  serviceTypes,
  servicePriceTier,
  setServicePriceTier,
  servicePriceTierOptions,
  serviceHours,
  setServiceHours,
  serviceProviderName,
  setServiceProviderName,
  serviceContact,
  setServiceContact,
  serviceBookingLink,
  setServiceBookingLink,
  serviceLink,
  setServiceLink,
  serviceImageUrlsInput,
  setServiceImageUrlsInput,
  onSaveService,
}) {
  const priceTierOptions = normalizeServicePriceTierOptions(servicePriceTierOptions);

  return (
    <div
      ref={addServiceFormRef}
      className="mb-6 space-y-3 rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(14,49,66,0.90),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(34,211,238,0.10)]"
    >
      <input
        value={serviceName}
        onChange={(event) => setServiceName(event.target.value)}
        placeholder="Service name"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <textarea
        value={serviceDescription}
        onChange={(event) => setServiceDescription(event.target.value)}
        placeholder="Description (offer, vibe, experience...)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={serviceType}
          onChange={(event) => setServiceType(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 outline-none"
        >
          {serviceTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={servicePriceTier}
          onChange={(event) => setServicePriceTier(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 outline-none"
        >
          {priceTierOptions.map((item) => (
            <option key={item.key} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <input
        value={serviceAddress}
        onChange={(event) => setServiceAddress(event.target.value)}
        placeholder="Address"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceHours}
        onChange={(event) => setServiceHours(event.target.value)}
        placeholder="Availability (for example Daily 11:00-22:00)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceProviderName}
        onChange={(event) => setServiceProviderName(event.target.value)}
        placeholder="Service announcer (provider name)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceContact}
        onChange={(event) => setServiceContact(event.target.value)}
        placeholder="Contact (WhatsApp, Telegram, phone, etc.)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceBookingLink}
        onChange={(event) => setServiceBookingLink(event.target.value)}
        placeholder="Booking link (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceLink}
        onChange={(event) => setServiceLink(event.target.value)}
        placeholder="Official website / Instagram / Facebook (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input
        value={serviceImageUrlsInput}
        onChange={(event) => setServiceImageUrlsInput(event.target.value)}
        placeholder="Image URLs, comma separated (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <VibeTagPicker
        value={serviceVibeTags}
        onChange={setServiceVibeTags}
        tone="cyan"
        title="Service vibe tags"
        hint="Choose up to 3 tags for standardized discovery."
      />
      <input
        value={serviceVibe}
        onChange={(event) => setServiceVibe(event.target.value)}
        placeholder="Legacy vibe label (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <button
        onClick={onSaveService}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-sky-200 py-3 font-semibold text-black"
      >
        Save service
      </button>
    </div>
  );
}
