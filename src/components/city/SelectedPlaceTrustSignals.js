"use client";

export default function SelectedPlaceTrustSignals({
  trustedPlaceSavesCount,
}) {
  return (
    <>
      {trustedPlaceSavesCount > 0 && (
        <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/24 bg-emerald-200/[0.10] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
          Saved by {trustedPlaceSavesCount} trusted member{trustedPlaceSavesCount > 1 ? "s" : ""}
        </div>
      )}
    </>
  );
}
