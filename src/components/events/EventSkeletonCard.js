export default function EventSkeletonCard({ tone = "orange" }) {
  const toneStyle =
    tone === "cyan"
      ? "border-cyan-200/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(12,12,12,0.94))]"
      : "border-orange-200/14 bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(12,12,12,0.94))]";

  return (
    <div className={`qa-skeleton-card rounded-2xl border p-4 ${toneStyle}`} aria-hidden="true">
      <div className="qa-skeleton-card h-3 w-40 rounded-full" />
      <div className="qa-skeleton-card mt-3 h-5 w-3/4 rounded-full" />
      <div className="qa-skeleton-card mt-4 h-3 w-full rounded-full" />
      <div className="qa-skeleton-card mt-2 h-3 w-5/6 rounded-full" />
    </div>
  );
}
