export default function FavoritesCardSkeleton() {
  return (
    <div className="qa-skeleton-card rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5" aria-hidden="true">
      <div className="qa-skeleton-card h-3 w-24 rounded-full" />
      <div className="qa-skeleton-card mt-3 h-5 w-2/3 rounded-full" />
      <div className="qa-skeleton-card mt-4 h-3 w-full rounded-full" />
      <div className="qa-skeleton-card mt-2 h-3 w-4/5 rounded-full" />
    </div>
  );
}
