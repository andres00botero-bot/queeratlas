import { getHotelIntel } from "@/lib/hotelIntel";

const LABELS = {
  checkInCheckOut: "checkInCheckOut",
  guestPolicy: "guestPolicy",
  transport: "hotelTransport",
  breakfast: "hotelBreakfast",
  facilities: "hotelFacilities",
  accessibility: "hotelAccessibility",
};

function formatCheckedAt(value = "") {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function HotelKnowBeforeYouGo({ place, t, className = "" }) {
  const intel = getHotelIntel(place);
  if (!intel?.facts?.length) return null;

  const checkedAt = formatCheckedAt(intel.checkedAt);
  return (
    <section className={`border-t border-white/[0.08] pt-5 ${className}`} aria-label={t("city.knowBeforeYouGo", "Know before you go")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e7c67f]/90">{t("city.hotelDetails", "Hotel details")}</p>
      <h3 className="mt-1 text-base font-semibold text-[#f7f2f7]">{t("city.knowBeforeYouGo", "Know before you go")}</h3>
      <dl className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {intel.facts.map((fact) => (
          <div key={fact.key} className="py-3.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#d7c0ff]">
              {t(`city.${LABELS[fact.key]}`, fact.key)}
            </dt>
            <dd className="mt-1 text-left text-sm leading-6 text-white/82">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {intel.sourceUrls.length || checkedAt ? (
        <p className="mt-3 text-[11px] leading-5 text-white/58">
          {checkedAt ? `${t("city.hotelFactsChecked", "Hotel details checked")} ${checkedAt}` : ""}
          {checkedAt && intel.sourceUrls.length ? " · " : ""}
          {intel.sourceUrls.length ? (
            <a href={intel.sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="text-[#d7c0ff] underline decoration-[#d7c0ff]/45 underline-offset-2">
              {t("city.hotelSource", "Source")}
            </a>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
