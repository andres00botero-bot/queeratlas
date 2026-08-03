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

  return (
    <section className={compact ? "mt-4" : "rounded-[24px] border border-violet-200/16 bg-white/[0.035] p-6"}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/68">
        {isService ? "Service intelligence" : "Event intelligence"}
      </p>
      <Heading className={`${compact ? "mt-1 text-base" : "mt-1 text-lg"} font-semibold text-white`}>Know before you go</Heading>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {fields.map(({ key, label }) => {
          const value = intel[key];
          return (
            <div key={key} className={`rounded-2xl border px-3.5 py-3 ${value ? "border-white/14 bg-white/[0.065]" : "border-white/10 bg-black/20"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/48">{label}</p>
              <p className={`mt-1.5 text-sm leading-5 ${value ? "text-white/90" : "text-white/48"}`}>{value || emptyValues[key]}</p>
            </div>
          );
        })}
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/48">Community rating</p>
          <p className="mt-1.5 text-sm leading-5 text-white/48">Member rating not available yet</p>
          <p className="mt-1 text-[11px] text-white/46">Built automatically from verified feedback</p>
        </div>
      </div>
    </section>
  );
}
