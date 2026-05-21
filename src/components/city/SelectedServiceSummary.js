"use client";

import Image from "next/image";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel, normalizeExternalUrl, qualityPillClass } from "@/features/city/adminDrawerFeature";

export default function SelectedServiceSummary({
  selectedService,
  selectedServiceImages,
  cityLabel,
  serviceTypeLabels,
  selectedServiceQuality,
  selectedServiceQualityStatus,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
}) {
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-100">
          {selectedService.city || cityLabel}
        </span>
        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
          {serviceTypeLabels[selectedService.type] || "Service"}
        </span>
        {selectedService.price_tier && (
          <span className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100">
            {String(selectedService.price_tier)}
          </span>
        )}
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedService.name}</h2>
      <VibeTagChips entity={selectedService} tone="cyan" className="mb-2" includeMixedFallback />
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/68">
        Area: {getEntityAddressLabel(selectedService) || "City-wide"}
      </p>
      <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300" />

      {selectedServiceImages.length > 0 && (
        <div className="mb-3 rounded-xl border border-white/10 bg-black/25 p-2.5">
          <div className="overflow-hidden rounded-xl border border-white/12 bg-black/30">
            <Image
              src={selectedServiceImages[0]}
              alt={`${selectedService.name} photo`}
              width={920}
              height={540}
              unoptimized
              className="h-52 w-full object-cover"
            />
          </div>
          {selectedServiceImages.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {selectedServiceImages.slice(1, 5).map((imageUrl) => (
                <div key={`service-panel-image-${imageUrl}`} className="overflow-hidden rounded-lg border border-white/12 bg-black/35">
                  <Image
                    src={imageUrl}
                    alt={`${selectedService.name} gallery`}
                    width={240}
                    height={160}
                    unoptimized
                    className="h-16 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedService.description && (
        <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-white/45">About service</p>
          <p className="qa-copy-justify text-sm leading-7 text-white/82">{String(selectedService.description)}</p>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {selectedService.provider_name && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Provider</p>
            <p className="mt-1 text-xs text-white/82">{String(selectedService.provider_name)}</p>
          </div>
        )}
        {selectedService.contact && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Contact</p>
            <p className="mt-1 text-xs text-white/82">{String(selectedService.contact)}</p>
          </div>
        )}
        {selectedService.hours && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Availability</p>
            <p className="mt-1 text-xs text-white/82">{String(selectedService.hours)}</p>
          </div>
        )}
      </div>

      {selectedServiceQuality && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canRefreshQuality ? (
            <button
              onClick={(clickEvent) =>
                refreshEntityQuality(
                  { targetType: "service", targetId: selectedService.id, fallbackSource: selectedServiceQuality.source || selectedService.link || "" },
                  clickEvent
                )
              }
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 ${qualityPillClass(selectedServiceQualityStatus?.tone || "community")}`}
            >
              {selectedServiceQualityStatus?.label || "Community"}
            </button>
          ) : (
            <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${qualityPillClass(selectedServiceQualityStatus?.tone || "community")}`}>
              {selectedServiceQualityStatus?.label || "Community"}
            </span>
          )}
          {selectedServiceQuality.lastChecked && (
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
              Checked {formatDate(selectedServiceQuality.lastChecked)}
            </span>
          )}
        </div>
      )}
    </>
  );
}
