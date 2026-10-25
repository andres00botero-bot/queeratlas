"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldAlert, X } from "lucide-react";

export default function RestrictedVenueAccessDialog({ cityName, cityKey, highSurveillance = false, onClose }) {
  const headingRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => headingRef.current?.focus(), 0);
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const contactHref = `/contact?topic=safety&city=${encodeURIComponent(String(cityKey || ""))}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-[#06040d]/80 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        aria-label="Close venue access notice"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="restricted-venue-access-title"
        className="relative w-full max-w-xl rounded-[28px] border border-amber-100/20 bg-[radial-gradient(circle_at_top_left,rgba(245,169,198,0.12),transparent_36%),linear-gradient(155deg,#171221,#0c0a12)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/28 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100/18 bg-amber-100/[0.08] text-amber-100">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/72">Community protection</p>
        <h2 id="restricted-venue-access-title" ref={headingRef} tabIndex={-1} className="mt-2 pr-8 text-2xl font-semibold tracking-[-0.025em] text-white outline-none">
          Venue details are protected in {cityName}
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/72">
          We do not show venue names, addresses, maps or opening details publicly here. This reduces the risk of exposing local communities and places in a high-risk environment.
        </p>
        {highSurveillance ? (
          <p className="mt-3 text-sm leading-6 text-white/54">
            The safety team can offer general safety guidance only. We do not share venue names, addresses or meeting details through this contact channel. Please do not include your full name, address, travel plans or other sensitive details.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-white/54">
            If you need local guidance, contact the Queer Atlas safety team. Please do not include your full name, address, travel plans or other sensitive details in your first message.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={contactHref}
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-100/34 bg-amber-100/[0.12] px-5 text-sm font-semibold text-amber-50 transition hover:border-amber-100/60 hover:bg-amber-100/[0.18]"
          >
            Contact safety team
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white/76 transition hover:border-white/30 hover:text-white"
          >
            Return to city guide
          </button>
        </div>
      </section>
    </div>
  );
}
