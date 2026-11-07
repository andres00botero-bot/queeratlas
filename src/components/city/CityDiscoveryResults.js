import Link from "next/link";
import { ArrowUpRight, CalendarDays, ExternalLink, MapPin, Star } from "lucide-react";
import { cityPath } from "@/lib/cityRouting";

function formatEventDate(startDate = "", endDate = "", locale = "en") {
  if (!startDate) return locale === "fr" ? "Date à confirmer" : "Date to be confirmed";
  const start = new Date(`${startDate}T12:00:00Z`);
  const end = endDate ? new Date(`${endDate}T12:00:00Z`) : null;
  if (Number.isNaN(start.getTime())) return startDate;
  const dateLocale = locale === "fr" ? "fr-FR" : "en-GB";
  const startLabel = start.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  if (!end || Number.isNaN(end.getTime()) || endDate === startDate) return startLabel;
  return `${startLabel} – ${end.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
}

function externalUrl(value = "") {
  const url = String(value || "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function CityDiscoveryResults({ city, cityName, discovery, narrative, locale = "en", topicTitle = "" }) {
  const isFrench = locale === "fr";
  const results = Array.isArray(discovery?.results) ? discovery.results : [];
  const rule = discovery?.rule || {};

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.10),transparent_34%),radial-gradient(circle_at_92%_4%,rgba(244,114,182,0.09),transparent_34%),linear-gradient(160deg,rgba(15,20,32,0.98),rgba(7,8,13,0.99))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.30)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70">{isFrench ? "Sélection locale Atlas" : "Local Atlas edit"}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">{topicTitle || rule.listTitle || (isFrench ? `Sélection locale à ${cityName}` : `Local picks in ${cityName}`)}</h2>
          <p className="mt-3 text-sm leading-7 text-white/72">{narrative?.intro}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <span className="rounded-full border border-cyan-100/24 bg-cyan-200/[0.08] px-3 py-1.5 text-cyan-50/82">
            {discovery?.exactCount || 0} {isFrench ? "résultats exacts" : "exact matches"}
          </span>
          <span className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-white/58">
            {isFrench ? "Vérifié" : "Checked"} {discovery?.todayIso || (isFrench ? "aujourd’hui" : "today")}
          </span>
        </div>
      </div>

      {results.length > 0 ? (
        <ol className="mt-6 grid gap-3 lg:grid-cols-2">
          {results.map((entry, index) => (
            <li
              key={entry.id}
              className={`group relative overflow-hidden rounded-[22px] border p-4 transition hover:-translate-y-0.5 ${
                entry.exact
                  ? "border-cyan-100/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.09),rgba(255,255,255,0.035))] hover:border-cyan-100/38"
                  : "border-amber-100/16 bg-[linear-gradient(145deg,rgba(251,191,36,0.06),rgba(255,255,255,0.03))] hover:border-amber-100/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${entry.exact ? "border-cyan-100/28 bg-cyan-200/10 text-cyan-50" : "border-amber-100/24 bg-amber-200/[0.08] text-amber-50"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {entry.matchLabel && <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${entry.exact ? "text-cyan-100/72" : "text-amber-100/68"}`}>
                    {entry.matchLabel}
                  </p>}
                  <h3 className="mt-1 text-lg font-semibold leading-tight text-white">{entry.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">{entry.reason}</p>
                </div>
              </div>

              {entry.startDate && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-100/18 bg-fuchsia-200/[0.07] px-3 py-1.5 text-xs text-fuchsia-50/78">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatEventDate(entry.startDate, entry.endDate, locale)}
                </p>
              )}

              {entry.description && (
                <p className="qa-copy-justify mt-3 line-clamp-3 text-sm leading-6 text-white/70">{entry.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={entry.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100/28 bg-cyan-200/[0.09] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-50 transition hover:border-cyan-100/48 hover:bg-cyan-200/[0.14]"
                >
                  {isFrench ? "Voir les détails" : "View details"}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {entry.officialUrl && (
                  <a
                    href={externalUrl(entry.officialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-white/60 transition hover:border-white/26 hover:text-white/84"
                  >
                    {isFrench ? "Site officiel" : "Official"}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {entry.kind !== "place" && entry.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2 text-xs text-white/54">
                    <Star className="h-3.5 w-3.5 text-amber-200" fill="currentColor" aria-hidden="true" />
                    {entry.rating.toFixed(1)}{entry.reviewCount ? ` · ${entry.reviewCount}` : ""}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-white/16 bg-black/20 p-5">
          <p className="text-sm font-semibold text-white">{isFrench ? `Aucun résultat exact vérifié n’est encore publié à ${cityName}.` : `No verified exact match is published for ${cityName} yet.`}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/62">
            {isFrench ? "Nous préférons laisser cette sélection honnête plutôt que de présenter un lieu généraliste comme une recommandation spécialisée. Le guide de ville et les parcours associés apportent tout de même du contexte pendant la vérification des données." : "We leave this edit honest instead of turning a general venue into a specialist recommendation. The city guide and related paths below still provide local context while the listing is researched."}
          </p>
          <Link href={cityPath(city)} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/[0.05] px-3 py-2 text-xs text-white/72">
            {isFrench ? `Ouvrir le guide complet de ${cityName}` : `Open the full ${cityName} guide`}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {discovery?.fallbackUsed && results.length > 0 && (
        <p className="mt-4 rounded-2xl border border-amber-100/14 bg-amber-200/[0.045] px-4 py-3 text-xs leading-6 text-amber-50/64">
          {isFrench ? "Des alternatives sont proposées uniquement lorsque la catégorie locale exacte est peu fournie. Elles sont signalées séparément et ne comptent pas comme résultats exacts." : "Related options are included only where the exact local category is thin. They are labelled separately and are not counted as exact matches."}
        </p>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {narrative?.districtRead && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/68">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {isFrench ? "Repères de quartier" : "District read"}
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/64">{narrative.districtRead}</p>
          </div>
        )}
        {narrative?.safetyRead && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/68">{isFrench ? "Repères pratiques de sécurité" : "Practical safety read"}</p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/64">{narrative.safetyRead}</p>
          </div>
        )}
      </div>
    </section>
  );
}
