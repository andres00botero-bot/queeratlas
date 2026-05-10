let mapboxGlPromise = null;

export function loadMapboxGl() {
  if (!mapboxGlPromise) {
    mapboxGlPromise = import("mapbox-gl").then((mod) => mod.default ?? mod);
  }
  return mapboxGlPromise;
}
