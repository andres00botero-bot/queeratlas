"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cityPath } from "@/lib/cityRouting";

export default function HomeDeferredSections({
  topLaneCards = [],
  bottomLaneCards = [],
  topCities = [],
  onOpenCities,
}) {
  return (
    <>
      <section className="mt-12 qa-defer-render">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
              Discovery lanes
            </p>
            <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
              Move through the atlas
            </h2>
            <p className="mt-1.5 text-sm text-white/56">One clear path per intent. No noise, just flow.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {topLaneCards.map((item, index) => (
            <button
              type="button"
              key={item.title}
              onClick={item.onClick}
              className={`group qa-premium-card relative h-full w-full cursor-pointer overflow-hidden ${
                index % 2 === 0 ? "rounded-[30px]" : "rounded-[24px]"
              } border ${
                index % 2 === 0 ? "border-cyan-200/20" : "border-fuchsia-200/20"
              } ${
                index % 2 === 0
                  ? "bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(9,9,11,0.98))]"
                  : "bg-[linear-gradient(180deg,rgba(35,20,48,0.92),rgba(9,9,11,0.98))]"
              } p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow}`}
            >
              <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
              <div className="absolute inset-[1px] rounded-[25px] bg-[#0b0b0b]/96" />

              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                  {item.subtitle}
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r transition-all duration-300 group-hover:w-32 ${item.accent}`} />
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
          {bottomLaneCards.map((item, index) => (
            <button
              type="button"
              key={item.title}
              onClick={item.onClick}
              className={`group qa-premium-card relative h-full w-full cursor-pointer overflow-hidden ${
                index === 1 ? "rounded-[30px]" : "rounded-[24px]"
              } border ${
                index === 0
                  ? "border-cyan-200/18"
                  : index === 1
                    ? "border-fuchsia-200/18"
                    : "border-emerald-200/18"
              } ${
                index % 3 === 0
                  ? "bg-[linear-gradient(180deg,rgba(12,26,47,0.92),rgba(9,9,11,0.98))]"
                  : index % 3 === 1
                    ? "bg-[linear-gradient(180deg,rgba(28,18,44,0.92),rgba(9,9,11,0.98))]"
                    : "bg-[linear-gradient(180deg,rgba(12,32,30,0.92),rgba(9,9,11,0.98))]"
              } p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow}`}
            >
              <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
              <div className="absolute inset-[1px] rounded-[25px] bg-[#0b0b0b]/96" />

              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                  {item.subtitle}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/64">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r transition-all duration-300 group-hover:w-32 ${item.accent}`} />
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
