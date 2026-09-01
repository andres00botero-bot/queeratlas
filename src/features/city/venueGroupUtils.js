export function selectVisiblePlaceGroups(groupedPlaces = [], activeVenueFilterValues = []) {
  const activeValues = Array.isArray(activeVenueFilterValues) ? activeVenueFilterValues : [];
  return (Array.isArray(groupedPlaces) ? groupedPlaces : []).filter((group) => {
    const hasItems = Array.isArray(group?.items) && group.items.length > 0;
    if (activeValues.length === 0) return hasItems;
    return activeValues.includes(String(group?.value || ""));
  });
}

export function buildVenueJumpGroups(groupedPlaces = []) {
  return (Array.isArray(groupedPlaces) ? groupedPlaces : [])
    .filter((group) => (Array.isArray(group?.items) && group.items.length > 0) || group?.value === "store")
    .map((group) => ({
      value: String(group?.value || ""),
      label: String(group?.label || group?.value || "Venues"),
      count: Array.isArray(group?.items) ? group.items.length : 0,
    }));
}
