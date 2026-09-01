let seedEventsContentPromise = null;

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

async function loadSeedEventsContent() {
  if (!seedEventsContentPromise) {
    seedEventsContentPromise = retryOnce(importSeedEventsWithReset);
  }
  return seedEventsContentPromise;
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
