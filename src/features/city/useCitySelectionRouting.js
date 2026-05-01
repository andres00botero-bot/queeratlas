import { useCallback } from "react";

export function useCitySelectionRouting({
  pathname,
  searchParams,
  placeId,
  eventId,
  serviceId,
  router,
}) {
  const buildSelectionUrl = useCallback(
    ({ nextPlaceId = placeId, nextEventId = eventId, nextServiceId = serviceId } = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextPlaceId) {
        params.set("placeId", String(nextPlaceId));
      } else {
        params.delete("placeId");
      }

      if (nextEventId) {
        params.set("eventId", String(nextEventId));
      } else {
        params.delete("eventId");
      }

      if (nextServiceId) {
        params.set("serviceId", String(nextServiceId));
      } else {
        params.delete("serviceId");
      }

      params.delete("lat");
      params.delete("lng");

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [eventId, pathname, placeId, searchParams, serviceId]
  );

  const openPlace = useCallback(
    (place) => {
      router.push(buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null, nextServiceId: null }));
    },
    [buildSelectionUrl, router]
  );

  const openEvent = useCallback(
    (event) => {
      router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: event.id, nextServiceId: null }));
    },
    [buildSelectionUrl, router]
  );

  const openService = useCallback(
    (service) => {
      router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: null, nextServiceId: service.id }));
    },
    [buildSelectionUrl, router]
  );

  const closeService = useCallback(() => {
    router.push(buildSelectionUrl({ nextServiceId: null }));
  }, [buildSelectionUrl, router]);

  const closePlace = useCallback(() => {
    router.push(buildSelectionUrl({ nextPlaceId: null, nextServiceId: null }));
  }, [buildSelectionUrl, router]);

  const closeEvent = useCallback(() => {
    router.push(buildSelectionUrl({ nextEventId: null, nextServiceId: null }));
  }, [buildSelectionUrl, router]);

  const closeAllDetails = useCallback(() => {
    router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: null, nextServiceId: null }));
  }, [buildSelectionUrl, router]);

  return {
    buildSelectionUrl,
    openPlace,
    openEvent,
    openService,
    closeService,
    closePlace,
    closeEvent,
    closeAllDetails,
  };
}
