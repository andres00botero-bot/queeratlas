"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cityPath } from "@/lib/cityRouting";

export default function HomeDeferredSections({
  topLaneCards = [],
  bottomLaneCards = [],
  livePulseCards = [],
  topCities = [],
  onOpenCities,
  contactSlot = null,
}) {
  return (
    <>
      <section className="mt-12 qa-defer-render">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
              Move through the atlas
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {topLaneCards.map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={item.onClick}
              className={`group qa-premium-card relative h-full w-full cursor-pointer overflow-hidden rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(16,19,30,0.94),rgba(9,9,12,0.98))] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur transition duration-[170ms] hover:-translate-y-[2px] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow}`}
            >
              <div className={`absolute inset-0 opacity-0 transition duration-[170ms] group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
              <div className="absolute inset-[1px] rounded-[23px] bg-[#0b0b0b]/96" />

              <div className="relative z-10 flex h-full flex-col">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                  {item.subtitle}
                </p>
                <h3 className="mt-2 text-[2rem] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between pt-2">
                  <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r transition-[width] duration-[170ms] group-hover:w-32 ${item.accent}`} />
                  <span className="qa-lane-cta">
                    Enter lane
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {bottomLaneCards.map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={item.onClick}
              className={`group qa-premium-card relative h-full w-full cursor-pointer overflow-hidden rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(16,19,30,0.94),rgba(9,9,12,0.98))] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur transition duration-[170ms] hover:-translate-y-[2px] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow}`}
            >
              <div className={`absolute inset-0 opacity-0 transition duration-[170ms] group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
              <div className="absolute inset-[1px] rounded-[23px] bg-[#0b0b0b]/96" />

              <div className="relative z-10 flex h-full flex-col">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                  {item.subtitle}
                </p>
                <h3 className="mt-3 text-[1.72rem] font-semibold leading-[1.08] tracking-[-0.016em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/64">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between pt-2">
                  <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r transition-[width] duration-[170ms] group-hover:w-32 ${item.accent}`} />
                  <span className="qa-lane-cta">
                    Open lane
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </section>

      {livePulseCards.length > 0 && (
        <section className="mt-8 qa-defer-render">
          <div className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,18,22,0.92),rgba(10,10,14,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/52">Live Atlas Pulse</p>
              <span className="text-[11px] text-white/42">Choose your next move</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {livePulseCards.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={item.onClick}
                  className={`qa-list-card qa-premium-card w-full rounded-[22px] border border-white/14 bg-[linear-gradient(180deg,rgba(14,14,18,0.94),rgba(10,10,14,0.98))] p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition duration-[170ms] hover:-translate-y-[1px] hover:border-white/28 ${item.cardClass}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/86">{item.subtitle}</p>
                    {item.badge ? (
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[15px] font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/60">{item.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/44">
                    {item.ctaLabel} <ArrowUpRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mt-12 qa-defer-render">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">
            City gravity
          </p>
          <h2 className="qa-h2 mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
            Where signal is strongest
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {topCities.map((city, index) => (
              <Link
                key={city.city}
                href={cityPath(city.city)}
                className="qa-premium-card w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:border-white/16 hover:bg-white/6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/6 text-sm font-semibold text-white/75">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{city.city}</p>
                    <p className="mt-1 text-xs text-white/42">
                      {city.count} places | {city.reviews} reviews
                    </p>
                  </div>
                </div>
                <span className="mt-3 inline-flex text-xs uppercase tracking-[0.16em] text-white/35">open city</span>
              </Link>
            ))}
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

      <section className="mt-10 pb-4 opacity-70 qa-defer-render">
        <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
          <span className="mr-1 uppercase tracking-[0.18em] text-white/32">Search guides</span>
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
