export default function SectionSkeleton({ tone = "violet", rows = 3 }) {
  const toneMap = {
    violet: {
      outer: "border-violet-200/14 bg-[linear-gradient(180deg,rgba(109,40,217,0.14),rgba(10,10,10,0.86))]",
      glow: "bg-violet-300/12",
    },
    amber: {
      outer: "border-amber-200/14 bg-[linear-gradient(180deg,rgba(217,119,6,0.12),rgba(10,10,10,0.86))]",
      glow: "bg-amber-300/12",
    },
  };

  const selectedTone = toneMap[tone] || toneMap.violet;

  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`skeleton-${tone}-${index}`}
          className={`relative overflow-hidden rounded-[24px] border p-4 ${selectedTone.outer} animate-pulse`}
        >
          <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl ${selectedTone.glow}`} />
          <div className="h-4 w-44 rounded-full bg-white/14" />
          <div className="mt-3 h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-white/8" />
            <div className="h-3 w-5/6 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}
