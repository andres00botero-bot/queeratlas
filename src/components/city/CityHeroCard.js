"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CityHeroCard({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  heroIntro,
  mobileDiscovery = null,
  showOnLargerScreens = true,
}) {
  const { t } = useLocale();
  const introCopy =
    String(heroIntro || "").trim() ||
    t("city.fallbackIntro", "{city}'s queer nightlife, trusted spots, and live city signal in one view.").replace("{city}", cityName);
  const highlights = [
    {
      label: t("city.localMood", "Local mood"),
      value: cityHero?.hook,
      tone: "bg-[#e7c67f]/14 text-[#f2d997]",
    },
    {
      label: t("city.queerStatus", "Queer status"),
      value: cityHero?.status,
      tone: "bg-[#d7c0ff]/14 text-[#e5d9ff]",
    },
    {
      label: t("city.crowd", "Crowd"),
      value: cityHero?.crowd,
      tone: "bg-[#88d9d4]/14 text-[#b8f0ed]",
    },
  ].filter((item) => String(item.value || "").trim());
  const stats = [
    {
      label: t("city.venues", "Venues"),
      value: placesChipLabel,
      dot: "bg-[#e7c67f]",
      accent: "text-[#f2d997]",
    },
    {
      label: t("city.events", "Events"),
      value: eventsChipLabel,
      dot: "bg-[#d7c0ff]",
      accent: "text-[#e5d9ff]",
    },
    {
      label: t("city.signal", "Signal"),
      value: t("city.live", "Live"),
      dot: "bg-[#88d9d4]",
      accent: "text-[#b8f0ed]",
    },
  ];

  return (
    <section className={`animate-cinematic-in relative mb-4 overflow-hidden rounded-[26px] bg-[#181426] p-5 shadow-[0_28px_90px_rgba(5,6,18,0.42)] sm:mb-8 sm:rounded-[32px] sm:p-8 ${showOnLargerScreens ? "" : "sm:hidden"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(215,192,255,0.13),transparent_42%)]" />
      <div className="relative z-10 flex min-h-full flex-col gap-6 sm:gap-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center">
              <Image
                src="/queer-atlas-logo.png"
                alt="Queer Atlas logo"
                width={64}
                height={64}
                className="h-7 w-7 shrink-0"
              />
            </span>
            <span className="leading-none">
              <span className="block whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px] sm:tracking-[0.20em]">
                Queer Atlas
              </span>
            </span>
          </div>
          <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full bg-[#e7c67f]/12 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#f2d997] sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e7c67f]" aria-hidden="true" />
            {t("city.liveCityGuide", "Live city guide")}
          </span>
        </div>

        <div className="max-w-4xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d7c0ff]">
            {t("city.yourQueerGuideTo", "Your queer guide to")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[0.98] tracking-[-0.035em] text-[#f7f2f7] sm:text-5xl lg:text-6xl">
            {cityName}
          </h1>
          <p className="qa-city-copy-left mt-4 h-auto max-w-2xl text-pretty text-sm leading-[1.65] text-[#bdb3c2] sm:mt-5 sm:text-base sm:leading-7">
            {introCopy}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.055] px-3 py-2 text-xs text-white/78"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} aria-hidden="true" />
                <span className="uppercase tracking-[0.13em] text-white/55">{stat.label}</span>
                <span className={`font-semibold ${stat.accent}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {mobileDiscovery ? <div className="sm:hidden">{mobileDiscovery}</div> : null}

        {highlights.length > 0 ? (
          <div className="overflow-hidden rounded-[22px] bg-[#211b33]">
            <div className="border-b border-white/[0.055] px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{t("city.knowBeforeYouGo", "Know before you go")}</p>
            </div>
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] gap-3 border-b border-white/[0.055] p-4 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:px-5 ${
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
                  <p className="qa-city-copy-left text-pretty text-sm leading-[1.6] text-[#d5cbd9] sm:text-[0.95rem] sm:leading-6">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
