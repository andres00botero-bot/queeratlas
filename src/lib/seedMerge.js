let seedPlacesContentPromise = null;
let seedEventsContentPromise = null;

function importSeedPlacesWithReset() {
  return import("./seedPlacesContent").catch((error) => {
    seedPlacesContentPromise = null;
    throw error;
  });
}

function importSeedEventsWithReset() {
  return import("./seedEventsContent").catch((error) => {
    seedEventsContentPromise = null;
    throw error;
  });
}

function retryOnce(importer) {
  return importer().catch((error) => {
    // Retry once to recover from transient dev chunk-load failures.
    return importer().catch((retryError) => {
      // Keep original error context when second attempt also fails.
      throw retryError || error;
    });
  });
}

async function loadSeedPlacesContent() {
  if (!seedPlacesContentPromise) {
    seedPlacesContentPromise = retryOnce(importSeedPlacesWithReset);
  }
  return seedPlacesContentPromise;
}

async function loadSeedEventsContent() {
  if (!seedEventsContentPromise) {
    seedEventsContentPromise = retryOnce(importSeedEventsWithReset);
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
