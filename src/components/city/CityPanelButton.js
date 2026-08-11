"use client";

import { useRouter } from "next/navigation";

const ENTITY_PARAM_KEYS = {
  event: "eventId",
  place: "placeId",
  service: "serviceId",
};

export default function CityPanelButton({
  city,
  entityId = "",
  entityKind = "",
  section = "",
  className = "",
  children,
}) {
  const router = useRouter();

  function openPanel() {
    const params = new URLSearchParams();
    const entityParamKey = ENTITY_PARAM_KEYS[entityKind] || "";
    if (entityParamKey && entityId) params.set(entityParamKey, String(entityId));
    else if (section) params.set("section", String(section));

    const query = params.toString();
    router.push(`/${city}${query ? `?${query}` : ""}`);
  }

  return (
    <button type="button" onClick={openPanel} className={className}>
      {children}
    </button>
  );
}
