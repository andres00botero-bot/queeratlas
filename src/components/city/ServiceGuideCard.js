"use client";

import Image from "next/image";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { normalizeExternalUrl, getEntityAddressLabel } from "@/features/city/adminDrawerFeature";
import { normalizeServiceImageUrls } from "@/features/city/cityPageUtils";

export default function ServiceGuideCard({
  service,
  index,
  serviceId,
  openService,
  setHoveredServiceId,
  serviceTypeStyles,
  serviceTypeLabels,
}) {
  const style = serviceTypeStyles[service.type] || serviceTypeStyles.other;
  const bookingUrl = normalizeExternalUrl(service.booking_link || service.link || "");
  const contact = String(service.contact || "").trim();
  const providerName = String(service.provider_name || "").trim();
  const locationLabel = getEntityAddressLabel(service);
  const priceTier = String(service.price_tier || "").trim();
  const isSelectedService = String(serviceId || "") === String(service.id);
  const serviceImages = normalizeServiceImageUrls(service.image_urls);
  const coverImage = String(serviceImages[0] || "").trim();

  return (
    <article
      key={`service-${service.id}`}
      role="button"
      tabIndex={0}
      style={{ animationDelay: `${Math.min(index * 40, 220)}ms` }}
      className={`qa-cinematic-hover qa-city-card qa-city-copy-left animate-rise-in rounded-[22px] border p-4 sm:p-5 ${style.card} ${
        isSelectedService
          ? "border-emerald-200/40 shadow-[0_16px_42px_rgba(16,185,129,0.14)]"
          : "hover:border-emerald-200/22"
      } cursor-pointer bg-white/[0.065] shadow-[0_18px_46px_rgba(16,185,129,0.10)]`}
      onMouseEnter={() => setHoveredServiceId(String(service.id))}
      onMouseLeave={() => setHoveredServiceId(null)}
      onClick={() => openService(service)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openService(service);
        }
      }}
    >
      {coverImage && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
          <Image
            src={coverImage}
            alt={`${service.name} photo`}
            width={720}
            height={420}
            unoptimized
            className="h-36 w-full object-cover"
          />
        </div>
      )}
      <div className={`mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r ${style.line} shadow-[0_0_22px_rgba(255,255,255,0.18)]`} />
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight tracking-[-0.01em] text-white">
            {service.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${style.label}`}>
              {serviceTypeLabels[service.type] || "Service"}
            </span>
            {priceTier && (
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-amber-100">
                {priceTier}
              </span>
            )}
          </div>
        </div>
      </div>

      {service.description && (
        <div className="mb-3 rounded-2xl border border-white/12 bg-white/[0.055] p-3.5">
          <p className="line-clamp-3 text-sm leading-6 text-white/68">{String(service.description)}</p>
        </div>
      )}

      <VibeTagChips entity={service} tone="cyan" className="mb-3" includeMixedFallback />

      <div className="grid gap-2 text-xs text-white/62">
        {providerName && (
          <p className="rounded-xl border border-emerald-100/18 bg-emerald-300/[0.07] px-3 py-2">
            <span className="text-white/48">Provider:</span> {providerName}
          </p>
        )}
        {locationLabel && (
          <p className="rounded-xl border border-cyan-100/18 bg-cyan-300/[0.07] px-3 py-2">
            <span className="text-white/48">Area:</span> {locationLabel}
          </p>
        )}
        {service.hours && (
          <p className="rounded-xl border border-amber-100/18 bg-amber-300/[0.07] px-3 py-2">
            <span className="text-white/48">Availability:</span> {String(service.hours)}
          </p>
        )}
        {contact && (
          <p className="rounded-xl border border-fuchsia-100/18 bg-fuchsia-300/[0.07] px-3 py-2">
            <span className="text-white/48">Contact:</span> {contact}
          </p>
        )}
      </div>

      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="qa-action qa-action-strong qa-city-cta-primary mt-4 inline-flex rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40"
        >
          Open service
        </a>
      )}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openService(service);
        }}
        className="qa-action qa-city-cta-secondary mt-3 inline-flex rounded-full border border-white/18 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/82 transition hover:border-white/30 hover:text-white"
      >
        View details
      </button>
    </article>
  );
}
