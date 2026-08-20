import "server-only";

import { cache } from "react";
import { cityCoreConfig } from "@/lib/cityCore";
import { getTopicHub } from "@/lib/seo/topicHubs";
import { humanizeCityKey, humanizeTopicKey } from "@/lib/seo/entityConsistency";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import {
  selectCityDiscoveryResults,
} from "@/lib/seo/cityDiscoveryData";
import { evaluateCityDiscoveryIndexability } from "@/lib/seo/cityDiscoveryQuality";

function getHubClusterKeys(hub) {
  if (Array.isArray(hub?.clusterKeys) && hub.clusterKeys.length > 0) return hub.clusterKeys;
  return hub?.clusterKey ? [hub.clusterKey] : [];
}

function getHubCities(hub) {
  const configured = Array.isArray(hub?.cities) ? hub.cities : [];
  return configured.filter((city) => Boolean(cityCoreConfig[city]));
}

export const loadIndexableTopicHubRoutes = cache(async (hubKey = "") => {
  const hub = getTopicHub(hubKey);
  if (!hub) return [];

  const inventory = await loadSeoEntityInventory();
  const todayIso = new Date().toISOString().slice(0, 10);
  const clusterKeys = getHubClusterKeys(hub);

  return getHubCities(hub).flatMap((city) => {
    const places = inventory.venues.filter((row) => normalizeCitySlug(row?.city) === city);
    const events = inventory.events.filter((row) => normalizeCitySlug(row?.city) === city);
    const services = inventory.services.filter((row) => normalizeCitySlug(row?.city) === city);

    const discoveryRoutes = clusterKeys.flatMap((clusterKey) => {
      const discovery = selectCityDiscoveryResults({
        city,
        topic: clusterKey,
        places,
        events,
        services,
        todayIso,
      });
      const quality = evaluateCityDiscoveryIndexability({ topic: clusterKey, discovery });
      if (!quality.indexable) return [];

      return [{
        city,
        clusterKey,
        routeKind: "discovery",
        href: `/${city}/discover/${clusterKey}`,
        label: `${humanizeCityKey(city)} - ${humanizeTopicKey(clusterKey)}`,
      }];
    });

    if (discoveryRoutes.length > 0 || hub.key !== "events") return discoveryRoutes;
    return [{
      city,
      clusterKey: "events",
      routeKind: "city-fallback",
      href: `/${city}`,
      label: `Queer events in ${humanizeCityKey(city)}`,
    }];
  });
});

export function evaluateTopicHubIndexability({ hub, routes = [] } = {}) {
  const descriptionLength = String(hub?.description || "").trim().length;
  const selectedCitiesCount = new Set(routes.map((route) => route.city)).size;
  const reasons = [];

  if (descriptionLength < 90) reasons.push("thin-description");
  if (selectedCitiesCount < 3) reasons.push("insufficient-city-coverage");
  if (routes.length < 6) reasons.push("insufficient-route-coverage");

  return {
    indexable: reasons.length === 0,
    reasons,
    selectedCitiesCount,
    routeCount: routes.length,
  };
}
