"use client";

import SelectedServiceActions from "@/components/city/SelectedServiceActions";
import SelectedServiceAdminControls from "@/components/city/SelectedServiceAdminControls";
import SelectedServiceSummary from "@/components/city/SelectedServiceSummary";

export default function SelectedServicePanel({
  selectedService,
  onWheel,
  onClose,
  selectedServiceImages,
  cityLabel,
  serviceTypeLabels,
  selectedServiceQuality,
  selectedServiceQualityStatus,
  refreshEntityQuality,
  formatDate,
  canEditSelectedService,
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
      className="animate-panel-in fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border border-white/10 border-b-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,rgba(10,23,20,0.98),rgba(10,10,10,1))] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] backdrop-blur lg:relative lg:inset-auto lg:w-[520px] lg:max-h-none lg:overflow-visible lg:overscroll-auto lg:rounded-none lg:border-b-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:pb-6 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-emerald-400/12 blur-3xl" />
      <button
        className="sticky top-0 z-20 qa-cinematic-hover rounded-full border border-white/14 bg-[#0b1412]/90 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:border-white/25 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <SelectedServiceSummary
          selectedService={selectedService}
          selectedServiceImages={selectedServiceImages}
          cityLabel={cityLabel}
          serviceTypeLabels={serviceTypeLabels}
          selectedServiceQuality={selectedServiceQuality}
          selectedServiceQualityStatus={selectedServiceQualityStatus}
          refreshEntityQuality={refreshEntityQuality}
          formatDate={formatDate}
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
          serviceTypes={serviceTypes}
          priceTierOptions={priceTierOptions}
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
