import Link from "next/link";
import { buildEventPath, buildServicePath, buildVenuePath, normalizeCitySlug } from "@/lib/seo/entitySlug";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";

function EntityLinkGroup({ title, items, buildPath }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/48">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={`${title}-${item.id}`}
            href={buildPath(item.city, item)}
            className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-xs text-white/76 transition hover:border-cyan-200/35 hover:bg-cyan-200/10 hover:text-cyan-50"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function CityEntityCrawlSection({ city, cityName, inventory: suppliedInventory }) {
  const normalizedCity = normalizeCitySlug(city);
  const inventory = suppliedInventory || await loadSeoEntityInventory();
  const matchesCity = (item) => normalizeCitySlug(item?.city) === normalizedCity;
  const venues = inventory.venues.filter(matchesCity);
  const events = inventory.events.filter(matchesCity);
  const services = inventory.services.filter(matchesCity);

  if (venues.length + events.length + services.length === 0) return null;

  return (
    <section
      aria-labelledby="city-verified-directory-title"
      className="hidden border-t border-white/10 bg-[#07090f] px-4 py-8 text-white sm:block sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/62">
          Direct city directory
        </p>
        <h2 id="city-verified-directory-title" className="mt-1 text-xl font-semibold tracking-[-0.01em]">
          Explore verified {cityName} listings
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <EntityLinkGroup title="Venues" items={venues} buildPath={buildVenuePath} />
          <EntityLinkGroup title="Events" items={events} buildPath={buildEventPath} />
          <EntityLinkGroup title="Services" items={services} buildPath={buildServicePath} />
        </div>
      </div>
    </section>
  );
}
