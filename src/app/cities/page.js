"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cityConfig } from "@/lib/cities";
import { usePlaces } from "@/lib/usePlaces";
import EmptyState from "@/components/ui/EmptyState";

export default function CitiesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const countrySectionRefs = useRef({});
  const { places } = usePlaces();

  const scrollToCountrySection = (country) => {
    if (!country || country === "All") return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        countrySectionRefs.current[country]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const countries = useMemo(() => {
    return ["All", ...new Set(Object.values(cityConfig).map((city) => city.country || "Other"))].sort();
  }, []);

  const allCities = useMemo(() => {
    return Object.entries(cityConfig).map(([key, city]) => {
      const cityPlaces = places.filter((place) => place.city?.toLowerCase() === key);
      const reviewCount = cityPlaces.reduce(
        (sum, place) => sum + (place.reviewCount || 0),
        0
      );
      const avgRating =
        cityPlaces.reduce((sum, place) => sum + (place.avgRating || 0), 0) /
        (cityPlaces.length || 1);
      const topPlace = cityPlaces
        .slice()
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];

      return {
        key,
        ...city,
        placeCount: cityPlaces.length,
        reviewCount,
        avgRating: cityPlaces.length ? avgRating : null,
        topPlace: topPlace?.name || null,
      };
    });
  }, [places]);

  const filteredCities = useMemo(() => {
    return allCities
      .filter((city) => {
        if (selectedCountry !== "All" && city.country !== selectedCountry) return false;

        if (!query) return true;

        const search = query.toLowerCase();
        return (
          city.title.toLowerCase().includes(search) ||
          city.country?.toLowerCase().includes(search) ||
          city.vibe?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if ((b.reviewCount || 0) !== (a.reviewCount || 0)) {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }

        return a.title.localeCompare(b.title);
      });
  }, [allCities, query, selectedCountry]);

  const groupedCities = useMemo(() => {
    return filteredCities.reduce((acc, city) => {
      const country = city.country || "Other";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(city);
      return acc;
    }, {});
  }, [filteredCities]);

  const visibleCountries = Object.keys(groupedCities).sort();
  const totalCities = Object.keys(cityConfig).length;
  const totalCountries = countries.length - 1;
  const totalPlaces = places.length;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_20%),radial-gradient(circle_at_76%_14%,rgba(96,165,250,0.08),transparent_20%),radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

        <section className="relative mb-8 overflow-hidden rounded-[36px] border border-amber-300/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.10),transparent_24%),linear-gradient(135deg,rgba(29,23,18,0.98),rgba(10,10,10,0.99),rgba(19,24,27,0.97))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Global discovery
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl">
              Cities
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Browse queer cities by country, scan signal quickly, and jump straight
              into the local atlas. Built to scale globally without turning into chaos.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-amber-200/10 bg-amber-200/[0.06] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCities}</p>
            </div>
            <div className="rounded-3xl border border-sky-200/10 bg-sky-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Countries</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCountries}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200/10 bg-emerald-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Places</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPlaces}</p>
            </div>
          </div>
        </section>

        <section className="relative mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                Search atlas
              </p>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, country, or vibe"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-4 text-sm outline-none transition focus:border-fuchsia-300/35"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                Country filter
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {countries.map((country) => {
                  const active = selectedCountry === country;

                  return (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        scrollToCountrySection(country);
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-fuchsia-300/28 bg-fuchsia-300/12 text-white shadow-[0_10px_30px_rgba(217,70,239,0.10)]"
                          : "border-white/8 bg-white/4 text-white/58 hover:border-white/14 hover:text-white/80"
                      }`}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="relative space-y-8">
          {visibleCountries.length === 0 && (
            <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
              <EmptyState
                title="No cities match this filter yet."
                description="Try resetting search and country to reopen the atlas."
              >
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCountry("All");
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                >
                  Reset filters
                </button>
              </EmptyState>
            </section>
          )}

          {visibleCountries.map((country) => (
            <section
              key={country}
              ref={(node) => {
                if (node) {
                  countrySectionRefs.current[country] = node;
                } else {
                  delete countrySectionRefs.current[country];
                }
              }}
              className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.06] px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100/65">
                  {country}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <div className="text-xs text-white/35">
                  {groupedCities[country].length} cities
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {groupedCities[country].map((city) => (
                  <button
                    key={city.key}
                    onClick={() => router.push(`/${city.key}`)}
                    className="group overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.06),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 text-left transition duration-300 hover:-translate-y-[2px] hover:border-fuchsia-200/18 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                          {city.country}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                          {city.title}
                        </h2>
                      </div>

                      <div className="rounded-full border border-fuchsia-200/10 bg-fuchsia-200/[0.06] px-3 py-1 text-xs text-white/60">
                        {city.placeCount} places
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-amber-200/10 bg-amber-200/[0.05] p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/36">
                          Avg rating
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {city.avgRating ? city.avgRating.toFixed(1) : "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/36">
                          Reviews
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {city.reviewCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/34">
                        Signal
                      </p>
                      <p className="mt-2 text-sm capitalize text-white/62">
                        {String(city.vibe || "mixed").replaceAll("_", " ")} atmosphere
                      </p>
                      <p className="mt-2 text-sm text-white/45">
                        {city.topPlace
                          ? `Top place: ${city.topPlace}`
                          : "This city is ready for more local signal."}
                      </p>
                    </div>

                    <div className="mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-200 via-fuchsia-300 to-cyan-300 opacity-80 transition-all duration-300 group-hover:w-36" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
