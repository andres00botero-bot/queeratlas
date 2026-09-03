"use client";

export default function SelectedServiceActions({
  bookingUrl,
  linkUrl,
  canShowOnMap,
  onShowOnMap,
  canEdit,
  isEditorOpen,
  onToggleEditor,
  onReport,
  serviceName,
}) {
  return (
    <div className="qa-city-detail-surface mt-4 space-y-2 rounded-[22px] border p-4">
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="qa-action qa-action-strong qa-city-cta-primary block w-full rounded-2xl border border-[#88d9d4]/35 bg-[#88d9d4] py-3 text-center font-semibold text-[#0b1716] shadow-[0_12px_30px_rgba(136,217,212,0.14)]"
        >
          Open booking
        </a>
      )}
      {linkUrl && linkUrl !== bookingUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="qa-action qa-city-cta-secondary block w-full rounded-2xl border border-white/12 bg-white/6 py-3 text-center text-sm text-white/82 hover:border-white/22 hover:text-white"
        >
          Open official link
        </a>
      )}
      <button
        onClick={onShowOnMap}
        disabled={!canShowOnMap}
        className="qa-action qa-city-cta-secondary w-full rounded-2xl border border-white/10 bg-white/5 py-3 disabled:opacity-50"
      >
        Show on map
      </button>
      {canEdit && (
        <button
          onClick={onToggleEditor}
          className="qa-action qa-action-strong qa-city-cta-primary w-full rounded-2xl border border-cyan-200/24 bg-cyan-200/10 py-3 text-sm text-cyan-100 transition hover:border-cyan-200/38 hover:bg-cyan-200/16"
        >
          {isEditorOpen ? "Close editor" : "Edit service"}
        </button>
      )}
      <button
        onClick={onReport}
        className="qa-action qa-city-cta-tertiary w-full rounded-2xl border border-white/[0.09] bg-white/[0.025] py-3 text-sm text-white/56 hover:border-rose-200/24 hover:text-rose-100"
        aria-label={`Report service ${serviceName}`}
      >
        Report issue
      </button>
    </div>
  );
}
