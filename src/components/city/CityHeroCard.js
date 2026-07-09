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
    <section className="animate-cinematic-in relative mb-8 overflow-hidden rounded-[32px] border border-white/18 bg-[#120b1d] p-5 shadow-[0_30px_90px_rgba(91,33,182,0.28)] sm:p-7 xl:mb-8 xl:min-h-[calc(100vh-3rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bgc.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,92,178,0.40),rgba(255,207,64,0.22)_28%,rgba(31,211,255,0.32)_58%,rgba(123,92,255,0.44))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,6,18,0.18),rgba(12,6,18,0.36)_48%,rgba(10,6,14,0.70))]" />
      <div className="pointer-events-none absolute inset-x-5 top-5 h-1 rounded-full bg-[linear-gradient(90deg,#ff4fa3,#ffd166,#4de1ff,#8b5cf6)] opacity-95" />
      <div className="relative z-10 flex min-h-full flex-col gap-12">
        <div className="mt-4 flex items-center justify-between gap-4 sm:mt-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/44 bg-white/22 px-3.5 py-2.5 shadow-[0_16px_44px_rgba(255,79,163,0.18)] ring-1 ring-white/10 backdrop-blur-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/18 shadow-[0_10px_28px_rgba(0,0,0,0.20)]">
              <Image
                src="/queer-atlas-logo.png"
                alt="Queer Atlas logo"
                width={64}
                height={64}
                className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82">
            Queer city guide
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[0.98] tracking-[-0.02em] text-white drop-shadow-[0_8px_34px_rgba(0,0,0,0.34)] sm:text-5xl lg:text-6xl">
            {cityName}
          </h1>
          <p className="mt-6 max-w-2xl rounded-[22px] border border-white/22 bg-white/14 p-4 text-[15px] leading-7 text-white/92 shadow-[0_18px_44px_rgba(0,0,0,0.16)] backdrop-blur sm:text-base">
            {introCopy}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border px-3.5 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)] backdrop-blur ${stat.tone}`}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {highlights.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-3">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`min-h-[10.5rem] rounded-[24px] border p-4 shadow-[0_20px_54px_rgba(0,0,0,0.16)] backdrop-blur sm:p-5 ${item.tone}`}
              >
                <div className={`mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r ${item.accent}`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/66">
                  {String(index + 1).padStart(2, "0")} / {item.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/92">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
