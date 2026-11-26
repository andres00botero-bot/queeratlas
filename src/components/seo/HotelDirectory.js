"use client";

import Link from "next/link";
import { useState } from "react";

export default function HotelDirectory({ routes }) {
  const [query, setQuery] = useState("");
  const normalize = value => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const cities = routes.filter(route => normalize(route.label).includes(normalize(query)));

  return (
    <main className="min-h-screen bg-[#121917] px-5 py-10 text-[#f8f4e9] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#becbb8]/30 pb-8 sm:pb-12">
          <p className="text-xs uppercase tracking-[.24em] text-[#b7d6bd]">Queer Atlas · Places to stay</p>
          <h1 className="my-5 max-w-3xl font-serif text-5xl leading-[1.04] sm:text-7xl">Gay hotels &amp; queer accommodation</h1>
          <p className="max-w-2xl leading-7 text-[#d5dcd2]">Where do you want to wake up? Choose a city to explore its hotels, get a feel for the neighbourhood and find a stay that fits your trip.</p>
        </header>
        <section className="py-8">
          <label htmlFor="hotel-city" className="mb-3 block font-serif text-3xl">Choose your city</label>
          <input id="hotel-city" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search cities, e.g. Berlin" className="w-full rounded-lg bg-[#f8f4e9] px-5 py-4 text-lg text-[#17221b] placeholder:text-[#556159] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b7d6bd]" />
          <p aria-live="polite" className="my-3 text-sm text-[#bdcbbc]">{cities.length ? `${cities.length} destinations` : "No matching cities. Try another name."}</p>
          <ul className="grid max-h-[26rem] gap-x-6 overflow-y-auto overscroll-y-contain rounded-lg bg-[#202c25] p-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map(city => <li key={city.city}><Link prefetch={false} href={city.href} className="flex min-h-14 items-center justify-between gap-2 border-b border-white/15 px-2 py-3 hover:bg-white/10 focus-visible:outline-offset-[-3px]"><strong>{city.label}</strong><span className="text-sm text-[#cbdacb]">{city.count} {city.count === 1 ? "hotel" : "hotels"} →</span></Link></li>)}
          </ul>
        </section>
        <section className="grid gap-6 border-t border-white/20 py-8 sm:grid-cols-2">
          <article><h2 className="font-serif text-2xl">What kind of welcome?</h2><p className="mt-3 leading-7 text-[#d5dcd2]">Looking for a queer-owned guesthouse, a social hotel or a quiet room near the scene? Read the individual hotel guide for its local context. If a men-only policy, accessible shower or guest policy matters for your stay, confirm it directly with the property before paying.</p></article>
          <article><h2 className="font-serif text-2xl">Before you reserve</h2><p className="mt-3 leading-7 text-[#d5dcd2]">Check the journey back from the neighbourhood where you’ll spend your evenings. Then compare the total for your dates, including taxes and cancellation terms. Where a hotel guide includes a Booking.com partner link, Queer Atlas may earn a commission on a qualifying reservation.</p></article>
        </section>
      </div>
    </main>
  );
}
