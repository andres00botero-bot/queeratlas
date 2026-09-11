import Link from "next/link";

function cityName(city) {
  return String(city?.title || city?.name || city?.key || "")
    .replace(/^Queer\s+/i, "")
    .trim();
}

function cityCoordinates(city) {
  const center = Array.isArray(city?.center) ? city.center : [];
  const longitude = Number(center[0]);
  const latitude = Number(center[1]);
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? { latitude, longitude }
    : null;
}

function distanceKm(from, to) {
  const start = cityCoordinates(from);
  const end = cityCoordinates(to);
  if (!start || !end) return Number.POSITIVE_INFINITY;

  const radians = (degrees) => degrees * (Math.PI / 180);
  const latitudeDelta = radians(end.latitude - start.latitude);
  const longitudeDelta = radians(end.longitude - start.longitude);
  const startLatitude = radians(start.latitude);
  const endLatitude = radians(end.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function selectRelatedCityGuides(currentCity, cities = [], limit = 6) {
  const currentKey = String(currentCity?.key || "").trim();
  const country = String(currentCity?.country || "").trim();

  return cities
    .filter((city) => city?.key && city.key !== currentKey && city.seoIndexable !== false)
    .map((city) => ({
      ...city,
      sameCountry: country && String(city.country || "").trim() === country,
      distance: distanceKm(currentCity, city),
    }))
    .sort((left, right) => {
      if (left.sameCountry !== right.sameCountry) return left.sameCountry ? -1 : 1;
      if (left.distance !== right.distance) return left.distance - right.distance;
      return cityName(left).localeCompare(cityName(right), "en");
    })
    .slice(0, limit);
}

export function CityRelatedGuides({ currentCity, cities = [] }) {
  const relatedCities = selectRelatedCityGuides(currentCity, cities);
  if (relatedCities.length === 0) return null;

  return (
    <nav
      aria-labelledby="related-city-guides-title"
      className="border-t border-white/10 bg-[#08090f] px-4 py-8 text-white sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/62">
              Continue exploring
            </p>
            <h2 id="related-city-guides-title" className="mt-1 text-xl font-semibold tracking-[-0.01em]">
              More queer city guides
            </h2>
          </div>
          <Link
            href="/cities"
            className="rounded-full border border-cyan-100/20 bg-cyan-100/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 transition hover:border-cyan-100/40 hover:bg-cyan-100/10"
          >
            Browse all cities <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCities.map((city) => (
            <Link
              key={city.key}
              href={`/${city.key}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition hover:border-cyan-100/25 hover:bg-cyan-100/[0.07]"
            >
              <span className="block font-medium text-white/90 transition group-hover:text-cyan-50">
                {cityName(city)}
              </span>
              <span className="mt-0.5 block text-xs text-white/45">{city.country}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function CityIndexDirectory({ cities = [] }) {
  const indexableCities = cities
    .filter((city) => city?.key && city.seoIndexable !== false)
    .sort((left, right) => cityName(left).localeCompare(cityName(right), "en"));

  if (indexableCities.length === 0) return null;

  const groups = Object.groupBy(indexableCities, (city) => cityName(city).charAt(0).toUpperCase() || "#");

  return (
    <section
      aria-labelledby="all-city-guides-title"
      className="border-t border-white/10 bg-[#07080d] px-4 py-8 text-white sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <details className="group rounded-[24px] border border-white/10 bg-white/[0.035] px-5 py-5 sm:px-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/62">
                Complete directory
              </p>
              <h2 id="all-city-guides-title" className="mt-1 text-xl font-semibold tracking-[-0.01em]">
                Browse all {indexableCities.length} queer city guides A–Z
              </h2>
            </div>
            <span aria-hidden="true" className="text-xl text-cyan-100 transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(groups).map(([letter, letterCities]) => (
              <div key={letter}>
                <h3 className="text-sm font-semibold text-cyan-100">{letter}</h3>
                <ul className="mt-2 space-y-1.5">
                  {letterCities.map((city) => (
                    <li key={city.key}>
                      <Link
                        href={`/${city.key}`}
                        prefetch={false}
                        className="text-sm text-white/65 transition hover:text-white hover:underline hover:underline-offset-4"
                      >
                        {cityName(city)} <span className="text-white/35">· {city.country}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
