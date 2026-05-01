"use client";

import { useCallback, useState } from "react";
import { SERVICE_TYPES } from "@/features/city/cityPageConstants";

const DEFAULT_SERVICE_TYPE = SERVICE_TYPES[0]?.value || "other";

export function useCityServiceForm() {
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState(DEFAULT_SERVICE_TYPE);
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceVibe, setServiceVibe] = useState("");
  const [serviceVibeTags, setServiceVibeTags] = useState([]);
  const [serviceHours, setServiceHours] = useState("");
  const [serviceLink, setServiceLink] = useState("");
  const [serviceBookingLink, setServiceBookingLink] = useState("");
  const [serviceContact, setServiceContact] = useState("");
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [servicePriceTier, setServicePriceTier] = useState("");
  const [serviceImageUrlsInput, setServiceImageUrlsInput] = useState("");

  const resetServiceForm = useCallback(() => {
    setServiceName("");
    setServiceType(DEFAULT_SERVICE_TYPE);
    setServiceAddress("");
    setServiceDescription("");
    setServiceVibe("");
    setServiceVibeTags([]);
    setServiceHours("");
    setServiceLink("");
    setServiceBookingLink("");
    setServiceContact("");
    setServiceProviderName("");
    setServicePriceTier("");
    setServiceImageUrlsInput("");
  }, []);

  return {
    serviceName,
    setServiceName,
    serviceType,
    setServiceType,
    serviceAddress,
    setServiceAddress,
    serviceDescription,
    setServiceDescription,
    serviceVibe,
    setServiceVibe,
    serviceVibeTags,
    setServiceVibeTags,
    serviceHours,
    setServiceHours,
    serviceLink,
    setServiceLink,
    serviceBookingLink,
    setServiceBookingLink,
    serviceContact,
    setServiceContact,
    serviceProviderName,
    setServiceProviderName,
    servicePriceTier,
    setServicePriceTier,
    serviceImageUrlsInput,
    setServiceImageUrlsInput,
    resetServiceForm,
  };
}
