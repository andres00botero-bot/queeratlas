import Link from "next/link";

const ACCENTS = {
  cyan: "border-cyan-100/24 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.20),transparent_45%),linear-gradient(145deg,rgba(34,211,238,0.10),rgba(10,12,18,0.94))] hover:border-cyan-100/48",
  fuchsia: "border-fuchsia-100/24 bg-[radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.20),transparent_45%),linear-gradient(145deg,rgba(244,114,182,0.10),rgba(10,12,18,0.94))] hover:border-fuchsia-100/48",
  amber: "border-amber-100/24 bg-[radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.18),transparent_45%),linear-gradient(145deg,rgba(251,191,36,0.09),rgba(10,12,18,0.94))] hover:border-amber-100/48",
  violet: "border-violet-100/24 bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.20),transparent_45%),linear-gradient(145deg,rgba(167,139,250,0.10),rgba(10,12,18,0.94))] hover:border-violet-100/48",
};

export default function JourneyDeck({ eyebrow = "Plan your next move", title, intro, cards = [], className = "" }) {
  if (!cards.length) return null;
  return (
    <section className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0d13] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-7 ${className}`}>
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/48">{eyebrow}</p>
        <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">{title}</h2>
        {intro ? <p className="mt-3 text-sm leading-6 text-white/62 sm:text-base">{intro}</p> : null}
      </div>
      <div className={`mt-6 grid gap-3 ${cards.length > 3 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {cards.map((card, index) => (
          <Link key={card.href} href={card.href} className={`group relative min-h-40 overflow-hidden rounded-[22px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(0,0,0,0.30)] ${ACCENTS[card.accent] || ACCENTS.cyan}`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/52">0{index + 1} · {card.kicker || "Explore"}</span>
            <strong className="mt-5 block max-w-[17rem] text-lg font-semibold tracking-[-0.025em] text-white">{card.title}</strong>
            <span className="mt-2 block max-w-[20rem] text-sm leading-6 text-white/65">{card.description}</span>
            <span aria-hidden="true" className="absolute bottom-4 right-5 text-xl text-white/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
