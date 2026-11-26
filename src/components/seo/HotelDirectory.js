import { ArrowRight, ChevronDown, MapPin, BedDouble, CalendarDays } from "lucide-react";

import { hotelGuide } from "@/lib/i18n/hotelGuide";

const steps = [
  [MapPin, "area", "areaText"],
  [BedDouble, "stay", "stayText"],
  [CalendarDays, "dates", "datesText"],
];

export default function HotelDirectory({ routes, locale }) {
  const t = hotelGuide[locale];
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_80%_0%,#302043_0%,transparent_48%),linear-gradient(160deg,#131626,#090b13_65%)] px-5 py-12 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="max-w-3xl">
          <h1 className="qa-display text-4xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">{t.heading} <span className="text-cyan-100">{t.subtitle}</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">{t.intro}</p>
        </header>
        {routes.length > 0 ? <form method="get" className="my-8 max-w-2xl rounded-2xl border border-white/15 bg-white/[.045] p-5 sm:my-10 sm:p-6">
          <label htmlFor="hotel-city" className="mb-2 block text-sm font-semibold text-cyan-100">{t.choose}</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <select id="hotel-city" name="city" required defaultValue="" className="h-12 w-full appearance-none rounded-xl border border-white/25 bg-[#181b2a] pl-4 pr-10 text-base text-white focus-visible:outline-2 focus-visible:outline-cyan-200">
                <option disabled value="">{t.select}</option>
                {routes.map(route => <option key={route.city} value={route.city}>{route.label} ({route.count})</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={18} className="pointer-events-none absolute top-4 right-3 text-cyan-100" />
            </div>
            <button className="qa-action flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e7c67f] px-6 font-semibold text-[#211b33] hover:bg-[#f2d997] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{t.view} <ArrowRight aria-hidden="true" size={17} /></button>
          </div>
        </form> : <p className="my-8">{t.offline}</p>}
        <noscript><ul>{routes.map(route => <li key={route.city}><a href={route.href}>{t.city.replace("{city}", route.label)}</a></li>)}</ul></noscript>
        <section aria-label={t.how} className="grid gap-6 border-t border-white/15 py-7 sm:grid-cols-3 sm:gap-8">
          {steps.map(([Icon, heading, copy]) => <article key={heading}>
            <Icon aria-hidden="true" size={20} strokeWidth={1.5} className="mb-3 text-cyan-200" />
            <h2 className="qa-display text-lg font-semibold">{t[heading]}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{t[copy]}</p>
          </article>)}
        </section>
        <p className="max-w-xl text-xs leading-5 text-slate-400">{t.support}</p>
      </div>
    </main>
  );
}
