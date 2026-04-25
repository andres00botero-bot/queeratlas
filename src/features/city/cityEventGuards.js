export function selectCityEventsAll({ eventsData = [], city = "", blockedItems = [], normalizeCityKey }) {
  const normalizedCity = normalizeCityKey(city);
  return eventsData.filter((event) => (
    normalizeCityKey(event.city) === normalizedCity
    && !blockedItems.some(
      (item) => item.targetType === "event" && String(item.targetId) === String(event.id)
    )
  ));
}

export function selectVisibleCityEvents(cityEventsAll = [], isEventVisibleOnCityPage) {
  return cityEventsAll.filter((event) => isEventVisibleOnCityPage(event));
}

export function selectCityEventById(cityEventsAll = [], eventId = "") {
  if (!eventId) return null;
  return cityEventsAll.find((event) => String(event.id) === String(eventId)) || null;
}
