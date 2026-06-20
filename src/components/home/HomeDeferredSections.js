"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Compass,
  Map,
  Megaphone,
  Newspaper,
  UsersRound,
} from "lucide-react";
import { cityPath } from "@/lib/cityRouting";

const LANE_ICONS = {
  Cities: Map,
  Events: CalendarDays,
  News: Newspaper,
  Community: UsersRound,
  Contribute: Megaphone,
};

const PULSE_ICONS = {
  "next-event": CalendarDays,
  "latest-news": Newspaper,
  "top-city": Map,
};

function formatCityLabel(value) {
  return String(value || "Global")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LaneCard({ item, size = "standard", ctaLabel }) {
  const Icon = LANE_ICONS[item.icon] || Compass;
  const isFeature = size === "feature";

  return (
    <button
      type="button"
      key={item.title}
      onClick={item.onClick}
      className={`group qa-premium-card relative h-full w-full cursor-pointer overflow-hidden rounded-[26px] border border-white/14 bg-[linear-gradient(180deg,rgba(16,19,30,0.94),rgba(9,9,12,0.98))] text-left shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur transition duration-[170ms] hover:-translate-y-[2px] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${isFeature ? "min-h-[15.5rem] p-6 sm:p-7" : "min-h-[14.25rem] p-5 sm:p-6"} ${item.glow}`}
    >
      <div className={`absolute inset-0 opacity-0 transition duration-[170ms] group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
      <div className="absolute inset-[1px] rounded-[25px] bg-[#0b0b0b]/95" />
      <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br opacity-[0.18] blur-2xl ${item.accent}`} />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">
              {item.subtitle}
            </p>
            <h3 className={`${isFeature ? "mt-3 text-[2.05rem]" : "mt-3 text-[1.64rem]"} font-semibold leading-[1.04] tracking-[-0.02em] text-white`}>
              {item.title}
            </h3>
          </div>
          <div className={`shrink-0 rounded-2xl border border-white/14 bg-gradient-to-br p-3 text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] ${item.accent}`}>
            <Icon size={isFeature ? 24 : 22} strokeWidth={1.8} />
          </div>
        </div>

        <p className={`${isFeature ? "max-w-xl" : "max-w-sm"} mt-3 text-sm leading-6 text-white/66`}>
          {item.description}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/78">
            {item.metric}
          </span>
          <span className="min-w-0 truncate text-xs text-white/48">
            {item.signal}
          </span>
        </div>

        {item.preview?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.preview.map((previewItem) => (
              <span
                key={previewItem}
                className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/46"
              >
                {previewItem}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r transition-[width] duration-[170ms] group-hover:w-36 ${item.accent}`} />
          <span className="qa-lane-cta border-white/20 bg-white/[0.08] text-white/84 group-hover:bg-white/[0.13]">
            {ctaLabel}
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function PulseCard({ item }) {
  const Icon = PULSE_ICONS[item.key] || Activity;

  return (
    <button
      type="button"
      key={item.key}
      onClick={item.onClick}
      className={`qa-list-card qa-premium-card group relative min-h-[11rem] w-full rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(14,14,18,0.94),rgba(10,10,14,0.98))] p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition duration-[170ms] hover:-translate-y-[1px] hover:border-white/28 sm:p-5 ${item.cardClass}`}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent opacity-70" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/86 shadow-[0_14px_34px_rgba(0,0,0,0.26)]">
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/82">{item.subtitle}</p>
              {item.meta ? (
                <p className="mt-1 truncate text-[11px] text-white/43">{item.meta}</p>
              ) : null}
            </div>
          </div>
          {item.badge ? (
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${item.badgeClass}`}>
              {item.badge}
            </span>
          ) : null}
        </div>

        <p className="text-base font-semibold leading-snug tracking-[-0.01em] text-white sm:text-[17px]">
          {item.title}
        </p>
        <p className="mt-2 text-xs leading-5 text-white/62">{item.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.14em] text-white/34">{item.signalLabel}</p>
            {item.signalValue ? (
              <p className="mt-1 truncate text-xs font-medium text-white/72">{item.signalValue}</p>
            ) : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.13em] text-white/58 transition group-hover:border-white/24 group-hover:text-white/82">
            {item.ctaLabel} <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

export default function HomeDeferredSections({
  topLaneCards = [],
  bottomLaneCards = [],
  livePulseCards = [],
  topCities = [],
  onOpenCities,
  contactSlot = null,
}) {
  const topCityReviewMax = Math.max(...topCities.map((city) => Number(city.reviews) || 0), 1);

  return (
    <>
      <section className="mt-12 qa-defer-render qa-atlas-section">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
              Move through the atlas
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {topLaneCards.map((item) => (
            <LaneCard
              key={item.title}
              item={item}
              size="feature"
              ctaLabel="Enter lane"
            />
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {bottomLaneCards.map((item) => (
            <LaneCard
              key={item.title}
              item={item}
              ctaLabel="Open lane"
            />
          ))}
        </div>

      </section>

      {livePulseCards.length > 0 && (
        <section className="mt-8 qa-defer-render">
          <div className="qa-atlas-section">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/16 bg-cyan-200/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/78">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(125,211,252,0.85)]" />
                  Live Atlas Pulse
                </div>
                <h2 className="qa-h2 mt-3 text-2xl font-semibold tracking-[-0.02em] text-white">
                  What is moving right now
                </h2>
              </div>
              <span className="text-[11px] text-white/46">Choose your next move</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {livePulseCards.map((item) => (
                <PulseCard
                  key={item.key}
                  item={item}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mt-12 qa-defer-render">
        <div className="qa-atlas-section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                City gravity
              </p>
              <h2 className="qa-h2 mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
                Where signal is strongest
              </h2>
            </div>
            <span className="w-fit rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
              Ranked by community pull
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {topCities.map((city, index) => {
              const reviews = Number(city.reviews) || 0;
              const progress = Math.max(8, Math.min(100, Math.round((reviews / topCityReviewMax) * 100)));

              return (
                <Link
                  key={city.city}
                  href={cityPath(city.city)}
                  className="qa-premium-card group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_12%_8%,rgba(56,189,248,0.09),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] px-4 py-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition hover:border-cyan-200/24 hover:bg-white/[0.075] sm:px-5 sm:py-5"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/28 to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.065] text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-[-0.01em] text-white">
                          {formatCityLabel(city.city)}
                        </p>
                        <p className="mt-1 text-xs text-white/46">
                          {city.count} places | {reviews} reviews
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-cyan-200/18 bg-cyan-200/[0.07] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100/72">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.13em] text-white/35">
                      <span>Signal strength</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-300 shadow-[0_0_18px_rgba(56,189,248,0.35)] transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-white/42 transition group-hover:text-white/72">
                    Open city <ArrowUpRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onOpenCities}
              className="qa-action qa-cta-secondary rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/65 transition hover:border-white/20 hover:text-white"
            >
              Explore all cities
            </button>
          </div>
        </div>
      </section>

      {contactSlot}

      <section className="mt-10 pb-4 qa-defer-render">
        <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3.5 opacity-75">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
            <span className="mr-1 uppercase tracking-[0.18em] text-white/32">Discover paths</span>
            <Link
              href="/gay-guide"
              className="rounded-full border border-fuchsia-200/14 bg-fuchsia-200/[0.05] px-2.5 py-1 text-[11px] text-fuchsia-100/70 transition hover:border-fuchsia-200/30 hover:text-fuchsia-100"
            >
              Gay Guide
            </Link>
            <Link
              href="/queer-guide"
              className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-[11px] text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100"
            >
              Queer Guide
            </Link>
            <Link
              href="/hbtq-guide"
              className="rounded-full border border-amber-200/14 bg-amber-200/[0.05] px-2.5 py-1 text-[11px] text-amber-100/70 transition hover:border-amber-200/30 hover:text-amber-100"
            >
              HBTQ Guide
            </Link>
            <Link
              href="/topics/nightlife"
              className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-[11px] text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100"
            >
              Nightlife hub
            </Link>
            <Link
              href="/topics/safety"
              className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-[11px] text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100"
            >
              Safety hub
            </Link>
            <Link
              href="/berlin/discover/queer-techno-clubs"
              className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70 transition hover:border-white/24 hover:text-white/90"
            >
              Berlin techno
            </Link>
            <Link
              href="/new_york/discover/events-tonight"
              className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70 transition hover:border-white/24 hover:text-white/90"
            >
              New York tonight
            </Link>
            <Link
              href="/bangkok/discover/queer-cafes"
              className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70 transition hover:border-white/24 hover:text-white/90"
            >
              Bangkok cafes
            </Link>
            <Link
              href="/madrid/discover/lesbian-nightlife"
              className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70 transition hover:border-white/24 hover:text-white/90"
            >
              Madrid community
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/45">
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition hover:text-white"
          >
            Privacy Policy
          </Link>
          <span className="text-white/25">|</span>
          <Link
            href="/terms"
            className="underline underline-offset-2 transition hover:text-white"
          >
            Terms
          </Link>
        </div>
      </section>
    </>
  );
}
