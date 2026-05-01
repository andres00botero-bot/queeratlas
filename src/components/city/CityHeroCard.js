"use client";

import Image from "next/image";

export default function CityHeroCard({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
}) {
  return (
    <div className="animate-cinematic-in relative mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(244,114,182,0.11),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(135deg,rgba(22,22,22,0.97),rgba(10,10,10,0.99),rgba(18,18,18,0.97))] p-6 shadow-[0_28px_96px_rgba(0,0,0,0.40)] sm:p-7">
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div>
        <div className="mb-2 flex items-center gap-4">
          <Image
            src="/queer-atlas-heart-logo-progress.png"
            alt="Queer Atlas heart"
            width={64}
            height={64}
            className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          />
          <h1 className="text-4xl font-bold tracking-[-0.03em]">{`Queer ${cityName} Guide`}</h1>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-7 text-white/76 sm:text-[15px]">
          Gay clubs, queer bars, LGBT nightlife, and gay sauna signal in {cityName}.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/90">
            {placesChipLabel}
          </span>
          <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100/90">
            {eventsChipLabel}
          </span>
          <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
            Queer signal live
          </span>
        </div>
        <div className="max-w-4xl rounded-2xl border border-white/10 bg-black/28 p-4 sm:p-5">
          <div className="space-y-3">
            {cityHero.hook && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
                <p className="text-sm leading-7 text-white/86 sm:text-[15px]">
                  <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/90">Hook</span>
                  {cityHero.hook}
                </p>
              </div>
            )}
            {cityHero.status && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                <p className="text-sm leading-7 text-white/82 sm:text-[15px]">
                  <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">Queer Status</span>
                  {cityHero.status}
                </p>
              </div>
            )}
            {cityHero.crowd && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]" />
                <p className="text-sm leading-7 text-white/82 sm:text-[15px]">
                  <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-amber-200/90">Crowd</span>
                  {cityHero.crowd}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
