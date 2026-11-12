import { getServiceIntelLabels, normalizeEventIntel, normalizeServiceIntel } from "@/lib/entityIntel";

const EVENT_EMPTY = {
  entryWait: "No reliable entry pattern yet",
  bestArrival: "Best arrival time not confirmed yet",
  crowdMix: "Not enough attendee signal yet",
  dressCode: "No practical dress-code notes yet",
  hostInclusivity: "Not enough community feedback yet",
};

const SERVICE_EMPTY = {
  bookingLeadTime: "No reliable booking pattern yet",
  bestTime: "Best time not confirmed yet",
  clientMix: "Not enough client signal yet",
  preparation: "No preparation notes yet",
  providerInclusivity: "Not enough community feedback yet",
};

export default function EntityPracticalIntel({ entity, kind = "event", compact = true }) {
  const isService = kind === "service";
  const intel = isService ? normalizeServiceIntel(entity) : normalizeEventIntel(entity);
  const labels = isService ? getServiceIntelLabels(entity?.type) : null;
  const emptyValues = isService ? SERVICE_EMPTY : EVENT_EMPTY;
  const fields = isService
    ? [
        { key: "bookingLeadTime", label: labels.bookingLeadTime },
        { key: "bestTime", label: labels.bestTime },
        { key: "clientMix", label: labels.clientMix },
        { key: "preparation", label: labels.preparation },
        { key: "providerInclusivity", label: labels.providerInclusivity },
      ]
    : [
        { key: "entryWait", label: "Entry wait" },
        { key: "bestArrival", label: "Best arrival time" },
        { key: "crowdMix", label: "Attendee mix" },
        { key: "dressCode", label: "Dress code in practice" },
        { key: "hostInclusivity", label: "Host and security inclusion" },
      ];
  const Heading = compact ? "h3" : "h2";
  const intelligenceFields = [
    ...fields.map(({ key, label }) => ({ key, label, value: intel[key] || emptyValues[key] })),
    {
      key: "communityRating",
      label: "Community rating",
      value: "Member rating not available yet",
      detail: "Built automatically from verified feedback",
    },
  ];

  return (
    <section className={compact ? "mt-6 border-t border-white/[0.08] pt-5" : "rounded-[20px] border border-fuchsia-200/16 bg-[linear-gradient(145deg,rgba(244,114,182,0.08),rgba(34,211,238,0.05),rgba(10,10,10,0.96))] p-4 sm:rounded-[24px] sm:p-6"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e7c67f]/82">
            {isService ? "Service intelligence" : "Event intelligence"}
          </p>
          <Heading className={`${compact ? "mt-1 text-base" : "mt-1 text-lg"} font-semibold text-[#f7f2f7]`}>Know before you go</Heading>
        </div>
        <span className="hidden rounded-full border border-cyan-100/18 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-50/72 sm:inline-flex">
          Community + editorial
        </span>
      </div>

      <div className="mt-5 grid gap-0">
        {intelligenceFields.map((field) => {
          const hasSourceValue = field.key !== "communityRating" && Boolean(intel[field.key]);
          return (
            <div key={field.key} className={compact ? "grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] gap-5 border-b border-white/[0.06] py-4 last:border-b-0" : `rounded-2xl border px-3.5 py-3 ${hasSourceValue ? "border-white/14 bg-white/[0.065]" : "border-white/10 bg-black/20"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#d7c0ff]/86">{field.label}</p>
              <div>
                <p className={`mt-0 text-sm leading-6 ${hasSourceValue ? "text-white/90" : "text-white/54"}`}>{field.value}</p>
                {field.detail ? <p className="mt-1 text-[11px] text-white/46">{field.detail}</p> : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 hidden text-[11px] leading-5 text-white/46 sm:block">
        Patterns can change by event, season and provider. Recent community reports should outweigh older notes.
      </p>
    </section>
  );
}
