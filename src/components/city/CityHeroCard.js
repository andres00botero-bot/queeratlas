"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Map } from "lucide-react";

export default function CityHeroCard({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  heroIntro,
  onOpenMap,
}) {
  const [showCityContext, setShowCityContext] = useState(false);
  const introCopy =
    String(heroIntro || "").trim() ||
    `${cityName}'s queer nightlife, trusted spots, and live city signal in one view.`;
  const highlights = [
    {
      label: "Local mood",
      value: cityHero?.hook,
      tone: "border-fuchsia-100/30 bg-fuchsia-300/[0.12]",
      accent: "from-fuchsia-300 to-pink-200",
    },
    {
      label: "Queer status",
      value: cityHero?.status,
      tone: "border-cyan-100/30 bg-cyan-300/[0.12]",
      accent: "from-cyan-300 to-sky-200",
    },
    {
      label: "Crowd",
      value: cityHero?.crowd,
      tone: "border-amber-100/30 bg-amber-300/[0.12]",
      accent: "from-amber-200 to-orange-200",
    },
  ].filter((item) => String(item.value || "").trim());
  const stats = [
    { label: "Venues", value: placesChipLabel, tone: "text-cyan-50 border-cyan-100/42 bg-cyan-300/18" },
    { label: "Events", value: eventsChipLabel, tone: "text-fuchsia-50 border-fuchsia-100/42 bg-fuchsia-300/18" },
    { label: "Signal", value: "Live", tone: "text-amber-50 border-amber-100/42 bg-amber-200/18" },
  ];

  return (
    <section className="animate-cinematic-in relative mb-3 overflow-hidden rounded-[22px] border border-white/18 bg-[#120b1d] p-3.5 shadow-[0_18px_56px_rgba(91,33,182,0.20)] sm:mb-8 sm:rounded-[32px] sm:p-7 xl:min-h-[calc(100vh-3rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/queer-city-guide-neon-orbit-background.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,92,178,0.40),rgba(255,207,64,0.22)_28%,rgba(31,211,255,0.32)_58%,rgba(123,92,255,0.44))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,6,18,0.18),rgba(12,6,18,0.36)_48%,rgba(10,6,14,0.70))]" />
      <div className="pointer-events-none absolute inset-x-5 top-5 h-1 rounded-full bg-[linear-gradient(90deg,#ff4fa3,#ffd166,#4de1ff,#8b5cf6)] opacity-95" />
      <div className="relative z-10 flex min-h-full flex-col gap-3.5 sm:gap-12">
        <div className="mt-3 flex items-center justify-between gap-4 sm:mt-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/36 bg-white/18 px-2.5 py-1.5 shadow-[0_12px_34px_rgba(255,79,163,0.15)] ring-1 ring-white/10 backdrop-blur-md sm:gap-3 sm:px-3.5 sm:py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/18 shadow-[0_10px_28px_rgba(0,0,0,0.20)] sm:h-11 sm:w-11">
              <Image
                src="/queer-atlas-logo.png"
                alt="Queer Atlas logo"
                width={64}
                height={64}
                className="h-6 w-6 shrink-0 sm:h-9 sm:w-9"
              />
            </span>
            <span className="leading-none">
              <span className="block text-[11px] font-bold uppercase tracking-[0.20em] text-white">
                Queer Atlas
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-white/62">
                City guide
              </span>
            </span>
          </div>
          <span className="hidden rounded-full border border-white/34 bg-white/16 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/84 shadow-[0_10px_26px_rgba(255,79,163,0.16)] backdrop-blur sm:inline-flex">
            City guide
          </span>
        </div>

        <div className="max-w-4xl">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/82 sm:mb-3 sm:text-[11px]">
            Queer city guide
          </p>
          <h1 className="max-w-3xl text-[2rem] font-bold leading-[0.98] tracking-[-0.02em] text-white drop-shadow-[0_8px_34px_rgba(0,0,0,0.34)] sm:text-5xl lg:text-6xl">
            {cityName}
          </h1>
          <p className="qa-clamp-2 mt-2.5 max-w-2xl text-sm leading-5 text-white/84 sm:mt-6 sm:rounded-[22px] sm:border sm:border-white/22 sm:bg-white/14 sm:p-4 sm:text-base sm:leading-6 sm:shadow-[0_18px_44px_rgba(0,0,0,0.16)] sm:backdrop-blur sm:[display:block]">
            {introCopy}
          </p>

          <button
            type="button"
            onClick={onOpenMap}
            className="relative mt-3 flex min-h-[5.25rem] w-full items-center gap-3 overflow-hidden rounded-2xl border border-cyan-100/32 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.13),rgba(244,114,182,0.14))] px-3.5 py-3 text-left shadow-[0_14px_36px_rgba(34,211,238,0.14)] sm:hidden"
          >
            <span className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:22px_22px]" />
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100/28 bg-cyan-200/14 text-cyan-50">
              <Map className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">Explore {cityName} on the map</span>
              <span className="mt-1 block text-xs text-white/62">See venues, events and services by area</span>
            </span>
            <ArrowUpRight className="relative h-4 w-4 shrink-0 text-cyan-100/76" aria-hidden="true" />
          </button>

          <div className="mt-3 hidden grid-cols-3 gap-1.5 sm:mt-7 sm:grid sm:gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl border px-2 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur sm:rounded-2xl sm:px-3.5 sm:py-3 ${stat.tone}`}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {highlights.length > 0 ? (
          <div className="rounded-2xl border border-white/16 bg-black/16 p-2.5 sm:contents">
            <button
              type="button"
              aria-expanded={showCityContext}
              onClick={() => setShowCityContext((current) => !current)}
              className="flex min-h-11 w-full items-center justify-between px-1 text-left text-xs font-semibold text-white/86 sm:hidden"
            >
              Know {cityName}
              <span className={`text-white/55 transition ${showCityContext ? "rotate-45" : ""}`}>+</span>
            </button>
          <div className={`${showCityContext ? "grid" : "hidden"} mt-2 items-stretch gap-2.5 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-5`}>
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`flex h-full flex-col rounded-[16px] border p-3.5 shadow-[0_16px_42px_rgba(0,0,0,0.14)] backdrop-blur sm:min-h-[11rem] sm:rounded-[24px] sm:p-5 ${item.tone}`}
              >
                <div className={`mb-2.5 h-1 w-10 rounded-full bg-gradient-to-r sm:mb-4 sm:h-1.5 sm:w-14 ${item.accent}`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/66">
                  {String(index + 1).padStart(2, "0")} / {item.label}
                </p>
                <p className="mt-2.5 text-pretty text-sm font-medium leading-[1.55] text-white/92 sm:mt-3 sm:text-[0.95rem] sm:leading-6">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
