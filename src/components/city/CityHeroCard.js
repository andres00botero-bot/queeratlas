"use client";

import Image from "next/image";

export default function CityHeroCard({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  heroIntro,
}) {
  const introCopy =
    String(heroIntro || "").trim() ||
    `${cityName}'s queer nightlife, trusted spots, and live city signal in one view.`;

  return (
    <div className="animate-cinematic-in relative mb-6 overflow-hidden rounded-[32px] border border-white/10 p-6 shadow-[0_28px_96px_rgba(0,0,0,0.40)] sm:p-7 xl:mb-0 xl:h-[calc(100vh-3rem)] xl:min-h-[460px]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bgc.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(4,6,20,0.88),rgba(19,7,38,0.74),rgba(5,10,26,0.88))]" />
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-[calc(1.75rem+0.5cm)] flex items-center gap-4">
          <Image
            src="/queer-atlas-logo.png"
            alt="Queer Atlas logo"
            width={64}
            height={64}
            className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          />
          <h1 className="text-4xl font-bold tracking-[-0.03em]">{`Queer ${cityName}`}</h1>
        </div>
        <p className="mb-5 max-w-3xl text-[15px] leading-8 text-white/84 sm:text-base">{introCopy}</p>
        <div className="mb-6 flex flex-wrap gap-2.5">
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
        <div className="max-w-4xl rounded-2xl border border-white/16 p-4 sm:p-5">
          <div className="space-y-3">
            {cityHero.hook ? (
              <div className="rounded-xl border border-fuchsia-200/20 bg-fuchsia-300/[0.06] px-3 py-2.5">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">Hook</p>
                <p className="text-[13px] leading-6 text-white/90 sm:text-sm">{cityHero.hook}</p>
              </div>
            ) : null}
            {cityHero.status ? (
              <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/[0.06] px-3 py-2.5">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-cyan-100">Queer Status</p>
                <p className="text-[13px] leading-6 text-white/90 sm:text-sm">{cityHero.status}</p>
              </div>
            ) : null}
            {cityHero.crowd ? (
              <div className="rounded-xl border border-amber-200/20 bg-amber-300/[0.06] px-3 py-2.5">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-amber-100">Crowd</p>
                <p className="text-[13px] leading-6 text-white/90 sm:text-sm">{cityHero.crowd}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
