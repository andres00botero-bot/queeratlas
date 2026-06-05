"use client";

import { createContext, useContext } from "react";

const CityRouteConfigContext = createContext(null);

export function CityRouteConfigProvider({ config, children }) {
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
