let seedContentPromise = null;

async function loadSeedContent() {
  if (!seedContentPromise) {
    seedContentPromise = import("./seedContent");
  }
  return seedContentPromise;
}

export async function mergeSeedPlacesAsync(databasePlaces = []) {
  const { mergeSeedPlaces } = await loadSeedContent();
  return mergeSeedPlaces(databasePlaces);
}

export async function mergeSeedEventsAsync(databaseEvents = []) {
  const { mergeSeedEvents } = await loadSeedContent();
  return mergeSeedEvents(databaseEvents);
}
