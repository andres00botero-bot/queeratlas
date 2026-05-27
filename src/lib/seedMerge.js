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
  try {
    const { mergeSeedPlaces } = await loadSeedPlacesContent();
    return mergeSeedPlaces(databasePlaces);
  } catch (error) {
    if (typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn("[seed-merge] Failed to load seed places content, using database places only.", error);
    }
    return databasePlaces;
  }
}

export async function mergeSeedEventsAsync(databaseEvents = []) {
  try {
    const { mergeSeedEvents } = await loadSeedEventsContent();
    return mergeSeedEvents(databaseEvents);
  } catch (error) {
    if (typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn("[seed-merge] Failed to load seed events content, using database events only.", error);
    }
    return databaseEvents;
  }
}
