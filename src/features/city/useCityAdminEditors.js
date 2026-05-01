import { useCallback, useMemo } from "react";

export function useCityAdminEditors({
  isMember,
  isAdmin,
  userId,
  selectedService,
  selectedPlace,
  selectedEvent,
  setServiceAdminOpen,
  setServiceAdminDraft,
  setPlaceAdminOpen,
  setPlaceAdminDraft,
  setEventAdminOpen,
  setEventAdminDraft,
  buildServiceAdminDraft,
  buildPlaceAdminDraft,
  buildEventAdminDraft,
}) {
  const canEditSelectedService = useMemo(
    () =>
      Boolean(
        isMember &&
          selectedService &&
          (isAdmin || String(selectedService.created_by || "") === String(userId || ""))
      ),
    [isAdmin, isMember, selectedService, userId]
  );

  const toggleServiceAdminEditor = useCallback(() => {
    if (!selectedService) return;
    setServiceAdminOpen((value) => !value);
    setServiceAdminDraft(buildServiceAdminDraft(selectedService));
  }, [buildServiceAdminDraft, selectedService, setServiceAdminDraft, setServiceAdminOpen]);

  const togglePlaceAdminEditor = useCallback(() => {
    if (!selectedPlace) return;
    setPlaceAdminOpen((value) => !value);
    setPlaceAdminDraft(buildPlaceAdminDraft(selectedPlace));
  }, [buildPlaceAdminDraft, selectedPlace, setPlaceAdminDraft, setPlaceAdminOpen]);

  const toggleEventAdminEditor = useCallback(() => {
    if (!selectedEvent) return;
    setEventAdminOpen((value) => !value);
    setEventAdminDraft(buildEventAdminDraft(selectedEvent));
  }, [buildEventAdminDraft, selectedEvent, setEventAdminDraft, setEventAdminOpen]);

  return {
    canEditSelectedService,
    toggleServiceAdminEditor,
    togglePlaceAdminEditor,
    toggleEventAdminEditor,
  };
}
