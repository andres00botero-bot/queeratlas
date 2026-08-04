import { Languages, MapPin, Sparkles } from "lucide-react";
import { listPublishedEditorialPeople } from "@/lib/editorialData";
import { QA_SITE_URL } from "@/lib/seo/entityAuthority";

function initials(name = "") {
  return String(name || "QA")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "QA";
}

export default async function ContributorDirectory() {
  const people = (await listPublishedEditorialPeople()).filter(
    (person) => person.id !== "queer-atlas-editorial-team",
  );

  if (people.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Queer Atlas editors and contributors",
    numberOfItems: people.length,
    itemListElement: people.map((person, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": person.type,
        "@id": `${QA_SITE_URL}/contributors#${person.id}`,
        name: person.name,
        jobTitle: person.role || undefined,
        description: person.bio || undefined,
        knowsLanguage: person.languages,
        knowsAbout: person.expertise,
      },
    })),
  };

  return (
    <section className="rounded-[26px] border border-violet-200/16 bg-[radial-gradient(circle_at_0%_0%,rgba(167,139,250,0.13),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-200/24 bg-violet-200/10 text-violet-100">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-violet-100/62">Public directory</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Named editors and contributors</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <article id={person.id} key={person.id} className="scroll-mt-24 rounded-[22px] border border-white/10 bg-black/24 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/22 bg-violet-200/10 text-sm font-bold text-violet-100">
                {initials(person.name)}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white">{person.name}</h3>
                <p className="mt-0.5 text-xs text-violet-100/66">{person.role || "Contributor"}</p>
              </div>
            </div>
            {person.bio ? <p className="mt-3 text-sm leading-6 text-white/66">{person.bio}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/52">
              {(person.city || person.country) ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  <MapPin size={11} aria-hidden="true" /> {[person.city, person.country].filter(Boolean).join(", ")}
                </span>
              ) : null}
              {person.languages.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  <Languages size={11} aria-hidden="true" /> {person.languages.join(", ")}
                </span>
              ) : null}
            </div>
            {person.expertise.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.expertise.map((item) => (
                  <span key={item} className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.06] px-2.5 py-1 text-[10px] text-cyan-100/68">{item}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
