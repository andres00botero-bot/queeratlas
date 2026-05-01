import { useCallback } from "react";

export function useCitySelectionRouting({
  pathname,
  searchParams,
  placeId,
  eventId,
  serviceId,
  router,
}) {
  const navigateSelection = useCallback(
    (href, { replace = false } = {}) => {
      const runNavigation = () => {
        if (replace) {
          router.replace(href);
          return;
        }
        router.push(href);
      };

      if (
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function" &&
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        document.startViewTransition(() => {
          runNavigation();
        });
        return;
      }

      runNavigation();
    },
    [router]
  );

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
    (place, options = {}) => {
      navigateSelection(
        buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null, nextServiceId: null }),
        options
      );
    },
    [buildSelectionUrl, navigateSelection]
  );

  const openEvent = useCallback(
    (event, options = {}) => {
      navigateSelection(
        buildSelectionUrl({ nextPlaceId: null, nextEventId: event.id, nextServiceId: null }),
        options
      );
    },
    [buildSelectionUrl, navigateSelection]
  );

  const openService = useCallback(
    (service, options = {}) => {
      navigateSelection(
        buildSelectionUrl({ nextPlaceId: null, nextEventId: null, nextServiceId: service.id }),
        options
      );
    },
    [buildSelectionUrl, navigateSelection]
  );

  const closeService = useCallback(
    (options = {}) => {
      navigateSelection(buildSelectionUrl({ nextServiceId: null }), options);
    },
    [buildSelectionUrl, navigateSelection]
  );

  const closePlace = useCallback(
    (options = {}) => {
      navigateSelection(buildSelectionUrl({ nextPlaceId: null, nextServiceId: null }), options);
    },
    [buildSelectionUrl, navigateSelection]
  );

  const closeEvent = useCallback(
    (options = {}) => {
      navigateSelection(buildSelectionUrl({ nextEventId: null, nextServiceId: null }), options);
    },
    [buildSelectionUrl, navigateSelection]
  );

  const closeAllDetails = useCallback(
    (options = {}) => {
      navigateSelection(
        buildSelectionUrl({ nextPlaceId: null, nextEventId: null, nextServiceId: null }),
        options
      );
    },
    [buildSelectionUrl, navigateSelection]
  );

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
