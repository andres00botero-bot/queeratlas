import { useCallback } from "react";

export function useCityContributionToggles({
  isMember,
  redirectToJoin,
  addEventMode,
  setAddMode,
  setAddEventMode,
  setAddServiceMode,
  openEventContribution,
  addServiceFormRef,
}) {
  const onToggleAddPlace = useCallback(() => {
    if (!isMember) {
      redirectToJoin();
      return;
    }
    setAddMode((current) => !current);
    setAddEventMode(false);
    setAddServiceMode(false);
  }, [isMember, redirectToJoin, setAddEventMode, setAddMode, setAddServiceMode]);

  const onToggleAddEvent = useCallback(() => {
    if (!isMember) {
      redirectToJoin();
      return;
    }
    if (addEventMode) {
      setAddEventMode(false);
      return;
    }
    openEventContribution();
  }, [addEventMode, isMember, openEventContribution, redirectToJoin, setAddEventMode]);

  const onToggleAddService = useCallback(() => {
    if (!isMember) {
      redirectToJoin();
      return;
    }
    setAddServiceMode((current) => {
      const next = !current;
      if (next) {
        setAddMode(false);
        setAddEventMode(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            addServiceFormRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        });
      }
      return next;
    });
  }, [addServiceFormRef, isMember, redirectToJoin, setAddEventMode, setAddMode, setAddServiceMode]);

  return {
    onToggleAddPlace,
    onToggleAddEvent,
    onToggleAddService,
  };
}
