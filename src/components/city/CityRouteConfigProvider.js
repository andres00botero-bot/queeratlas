"use client";

import { createContext, useContext, useEffect } from "react";
import { registerRuntimeCityGeocodingContext } from "@/lib/cityGeocodingContext";

const CityRouteConfigContext = createContext(null);

export function CityRouteConfigProvider({ config, children }) {
  useEffect(() => {
    registerRuntimeCityGeocodingContext(config?.key, config);
  }, [config]);

  return (
    <CityRouteConfigContext.Provider value={config}>
      {children}
    </CityRouteConfigContext.Provider>
  );
}

export function useCityRouteConfig() {
  const config = useContext(CityRouteConfigContext);

  if (!config) {
    throw new Error("City route config is unavailable.");
  }

  return config;
}
