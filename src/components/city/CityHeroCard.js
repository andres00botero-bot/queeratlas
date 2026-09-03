"use client";

import Image from "next/image";

export default function CityHeroCard({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  heroIntro,
  mobileDiscovery = null,
  showOnLargerScreens = true,
}) {
  const introCopy =
    String(heroIntro || "").trim() ||
    `${cityName}'s queer nightlife, trusted spots, and live city signal in one view.`;
  const highlights = [
    {
      label: "Local mood",
      value: cityHero?.hook,
      tone: "bg-[#f5a9c6]/10 text-[#f5a9c6]",
    },
    {
      label: "Queer status",
      value: cityHero?.status,
      tone: "bg-[#88d9d4]/10 text-[#88d9d4]",
    },
    {
      label: "Crowd",
      value: cityHero?.crowd,
      tone: "bg-[#d8b678]/10 text-[#d8b678]",
    },
  ].filter((item) => String(item.value || "").trim());
  const stats = [
    { label: "Venues", value: placesChipLabel, dot: "bg-[#88d9d4]" },
    { label: "Events", value: eventsChipLabel, dot: "bg-[#b7a0f7]" },
    { label: "Signal", value: "Live", dot: "bg-[#d8b678]" },
  ];

  return (
    <section className={`animate-cinematic-in relative mb-4 overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#17121c]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:mb-8 sm:rounded-[32px] sm:p-8 ${showOnLargerScreens ? "" : "sm:hidden"}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.13] mix-blend-luminosity"
        style={{ backgroundImage: "url('/queer-city-guide-neon-orbit-background.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(245,169,198,0.15),transparent_38%,rgba(136,217,212,0.07)_72%,transparent)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,#f5a9c6,#88d9d4,transparent)] opacity-75" />
      <div className="relative z-10 flex min-h-full flex-col gap-6 sm:gap-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.11] bg-white/[0.055] px-2.5 py-2 backdrop-blur-md">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07]">
              <Image
                src="/queer-atlas-logo.png"
                alt="Queer Atlas logo"
                width={64}
                height={64}
                className="h-7 w-7 shrink-0"
              />
            </span>
            <span className="leading-none">
              <span className="block text-[11px] font-bold uppercase tracking-[0.20em] text-white">
                Queer Atlas
              </span>
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d8b678]/20 bg-[#d8b678]/[0.07] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#ead09b] sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8b678] shadow-[0_0_12px_rgba(216,182,120,0.8)]" aria-hidden="true" />
            Live city guide
          </span>
        </div>

        <div className="max-w-4xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5a9c6]">
            Your queer guide to
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[0.98] tracking-[-0.035em] text-[#fff8fc] sm:text-5xl lg:text-6xl">
            {cityName}
          </h1>
          <p className="qa-city-copy-left mt-4 h-auto max-w-2xl text-pretty text-sm leading-[1.65] text-[#d8ccd5] sm:mt-5 sm:text-base sm:leading-7">
            {introCopy}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs text-white/78"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} aria-hidden="true" />
                <span className="uppercase tracking-[0.13em] text-white/55">{stat.label}</span>
                <span className="font-semibold text-[#fff8fc]">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {mobileDiscovery ? <div className="sm:hidden">{mobileDiscovery}</div> : null}

        {highlights.length > 0 ? (
          <div className="overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.035]">
            <div className="border-b border-white/[0.07] px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Know before you go</p>
            </div>
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] gap-3 border-b border-white/[0.07] p-4 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:px-5 ${
                  index % 2 === 0 ? "bg-white/[0.018]" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.tone}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="hidden pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58 sm:block">{item.label}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/58 sm:hidden">{item.label}</p>
                  <p className="qa-city-copy-left text-pretty text-sm leading-[1.6] text-[#ddd1da] sm:text-[0.95rem] sm:leading-6">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
