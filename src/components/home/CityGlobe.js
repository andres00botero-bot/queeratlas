"use client";

import { useState } from "react";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import styles from "./CityGlobe.module.css";

// Anchors use percentages of the cropped, illustrated globe.
const destinations = [
  { key: "london", name: "London", country: "United Kingdom", x: 69, y: 22 },
  { key: "berlin", name: "Berlin", country: "Germany", x: 74, y: 24 },
  { key: "madrid", name: "Madrid", country: "Spain", x: 66, y: 32 },
  { key: "san_francisco", name: "San Francisco", country: "United States", x: 21, y: 31 },
  { key: "new_york", name: "New York", country: "United States", x: 37, y: 33 },
  { key: "mexico_city", name: "Mexico City", country: "Mexico", x: 28, y: 47 },
  { key: "bogota", name: "Bogotá", country: "Colombia", x: 38, y: 54 },
  { key: "sao_paulo", name: "São Paulo", country: "Brazil", x: 47, y: 73 },
  { key: "cape_town", name: "Cape Town", country: "South Africa", x: 78, y: 84 },
];

export default function CityGlobe({ places, events, onCityChange }) {
  const [selection, setSelection] = useState(null);
  const venue = selection && places.find(place => place.city === selection.key && place.name && place.id);
  const event = selection && events.find(item => item.city === selection.key && item.name && item.id);

  return (
    <section className={styles.globe} aria-label="Explore cities on the globe" lang="en">
      <div className={styles.map}>
        {destinations.map(city => (
          <a key={city.key} href={"/en" + cityPath(city.key)} style={{ left: city.x + "%", top: city.y + "%" }}
            aria-label={city.name} aria-current={selection?.key === city.key ? "location" : undefined} aria-controls="globe-city-notes"
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setSelection(city);
              onCityChange(city.key);
            }}>
            <span className={styles.dot} aria-hidden="true" /><span className={styles.caption}>{city.name}</span>
          </a>
        ))}
      </div>
      <div id="globe-city-notes" aria-live="polite" className={styles.notes}>
        <select aria-label="Explore a city" value={selection?.key || ""} onChange={e => {
          const city = destinations.find(item => item.key === e.target.value);
          if (city) { setSelection(city); onCityChange(city.key); }
        }}>
          <option value="" disabled>Explore a city</option>
          {destinations.map(city => <option key={city.key} value={city.key}>{city.name}</option>)}
        </select>
        {selection && <>
          <a href={"/en" + cityPath(selection.key)}>City guide →</a>
          {event ? <a href={"/en" + citySelectionPath(selection.key, { eventId: event.id })}>{event.name}</a>
            : venue && <a href={"/en" + citySelectionPath(selection.key, { placeId: venue.id })}>{venue.name}</a>}
        </>}      </div>
    </section>
  );
}
