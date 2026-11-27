import { TYPES } from "./cityPageConstants.js";

const markerColors = Object.fromEntries(TYPES.map(({ value, color }) => [value, color]));
markerColors.event = "#ff83cd";

// Single-colour, 24-unit glyphs for the dark city map.
const glyphs = {
  sauna: "M6 11c3-3-2-4 1-8 M11 11c3-3-2-4 1-8 M16 11c3-3-2-4 1-8 M3 15h18 M5 16v5 M19 16v5",
  club: "M12 2v3 M12 5a8 8 0 1 0 0 16 8 8 0 1 0 0-16 M5 10h14 M5 16h14 M12 5c-5 5-5 11 0 16 5-5 5-11 0-16Z",
  bar: "M3 4h18l-9 9-9-9Z M12 13v7 M7 21h10",
  cruise_club: "M1 7q5-3 11 0 6-3 11 0-1 13-11 8Q2 20 1 7Z M4 9q4-1 6 2-4 3-6-2Z M20 9q-4-1-6 2 4 3 6-2Z",
  restaurant: "M4 3v5q0 4 3 4t3-4V3 M7 3v18 M17 13h3V3q-4 3-3 10Z M20 13v8",
  cafe: "M3 7h13v5a6.5 6.5 0 0 1-13 0Z M16 8h2a3 3 0 0 1 0 6h-2 M2 21h17",
  store: "M4 8h16l1 13H3L4 8Z M8 8V6a4 4 0 0 1 8 0v2",
  hotel: "M2 5v15 M2 16h20v4 M5 11V8h4q2 0 2 3H5Z M13 8h4q5 0 5 5H2",
  event: "M5 5h14q2 0 2 2v12q0 2-2 2H5q-2 0-2-2V7q0-2 2-2Z M7 2v5 M17 2v5 M3 10h18",
  cruising_area: "M12 1a8 8 0 0 0-8 8c0 5 8 14 8 14s8-9 8-14a8 8 0 0 0-8-8Z M12 5a4 4 0 1 1 0 8 4 4 0 1 1 0-8Z",
};

export function categoryMapMarker(type, name) {
  if (!Object.hasOwn(glyphs, type)) return null;
  const data = glyphs[type];
  const marker = document.createElement("div");
  marker.className = "qa-category-marker";
  marker.style.color = markerColors[type];
  marker.dataset.label = name || "";
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", data);
  if (type === "cruise_club" || type === "cruising_area") {
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
  } else {
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
  }
  svg.appendChild(path);
  marker.appendChild(svg);
  return marker;
}
