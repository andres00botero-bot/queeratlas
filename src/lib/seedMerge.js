let seedPlacesContentPromise = null;
let seedEventsContentPromise = null;

async function loadSeedPlacesContent() {
  if (!seedPlacesContentPromise) {
    seedPlacesContentPromise = import("./seedPlacesContent");
  }
  return seedPlacesContentPromise;
}

async function loadSeedEventsContent() {
  if (!seedEventsContentPromise) {
    seedEventsContentPromise = import("./seedEventsContent");
  }
  return seedEventsContentPromise;
}

export async function mergeSeedPlacesAsync(databasePlaces = []) {
  const { mergeSeedPlaces } = await loadSeedPlacesContent();
  return mergeSeedPlaces(databasePlaces);
}

export async function mergeSeedEventsAsync(databaseEvents = []) {
  const { mergeSeedEvents } = await loadSeedEventsContent();
  return mergeSeedEvents(databaseEvents);
}
