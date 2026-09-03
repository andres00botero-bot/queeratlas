"use client";

import SelectedServiceActions from "@/components/city/SelectedServiceActions";
import SelectedServiceAdminControls from "@/components/city/SelectedServiceAdminControls";
import SelectedServiceSummary from "@/components/city/SelectedServiceSummary";

export default function SelectedServicePanel({
  selectedService,
  inlineMode = false,
  onWheel,
  onClose,
  selectedServiceImages,
  cityLabel,
  serviceTypeLabels,
  selectedServiceQuality,
  selectedServiceQualityStatus,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
  canEditSelectedService,
  canDeleteSelectedService,
  serviceAdminOpen,
  onToggleServiceAdmin,
  serviceAdminDraft,
  setServiceAdminDraft,
  onSaveServiceAddressOnly,
  isSavingServiceAddressOnly,
  onSaveService,
  isSavingServiceAdmin,
  onDeleteService,
  isDeletingServiceAdmin,
  serviceTypes,
  priceTierOptions,
  bookingUrl,
  linkUrl,
  canShowOnMap,
  onShowOnMap,
  onReportService,
}) {
  if (!selectedService) return null;

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq qa-city-detail-sheet qa-city-detail-service animate-panel-in border p-5 backdrop-blur sm:p-6 ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[24px] shadow-[0_18px_56px_rgba(0,0,0,0.34)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border-b-0 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)]"
      }`}
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="qa-city-detail-header sticky top-0 z-20 flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#aee7e2]">Service</p>
          <p className="truncate text-sm font-semibold text-white/92">{selectedService.name}</p>
        </div>
        <button type="button" aria-label="Close service details" className="qa-cinematic-hover rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 text-xs text-white/76 hover:border-white/28 hover:text-white" onClick={onClose}>Close</button>
      </div>

      <div className="qa-city-detail-surface mt-4 rounded-[22px] border p-4">
        <SelectedServiceSummary
          selectedService={selectedService}
          selectedServiceImages={selectedServiceImages}
          cityLabel={cityLabel}
          serviceTypeLabels={serviceTypeLabels}
          selectedServiceQuality={selectedServiceQuality}
          selectedServiceQualityStatus={selectedServiceQualityStatus}
          refreshEntityQuality={refreshEntityQuality}
          canRefreshQuality={canRefreshQuality}
          formatDate={formatDate}
          onShowOnMap={onShowOnMap}
        />

        <SelectedServiceAdminControls
          canEdit={canEditSelectedService}
          isOpen={serviceAdminOpen}
          onToggleOpen={onToggleServiceAdmin}
          draft={serviceAdminDraft}
          setDraft={setServiceAdminDraft}
          onSaveAddressOnly={onSaveServiceAddressOnly}
          isSavingAddressOnly={isSavingServiceAddressOnly}
          onSave={onSaveService}
          isSaving={isSavingServiceAdmin}
          onDelete={onDeleteService}
          isDeleting={isDeletingServiceAdmin}
          canDelete={canDeleteSelectedService}
          serviceTypes={serviceTypes}
          priceTierOptions={priceTierOptions}
          city={selectedService.city || cityLabel}
        />
      </div>

      <SelectedServiceActions
        bookingUrl={bookingUrl}
        linkUrl={linkUrl}
        canShowOnMap={canShowOnMap}
        onShowOnMap={onShowOnMap}
        canEdit={canEditSelectedService}
        isEditorOpen={serviceAdminOpen}
        onToggleEditor={onToggleServiceAdmin}
        onReport={onReportService}
        serviceName={selectedService.name}
      />
    </div>
  );
}
