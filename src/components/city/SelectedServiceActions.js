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
    <div className="mt-3 space-y-2">
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="qa-action qa-action-strong qa-city-cta-primary block w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-200 py-3 text-center font-semibold text-black"
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
        className="qa-action qa-city-cta-tertiary w-full rounded-2xl border border-rose-200/20 bg-rose-200/8 py-3 text-sm text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
        aria-label={`Report service ${serviceName}`}
      >
        Report issue
      </button>
    </div>
  );
}
