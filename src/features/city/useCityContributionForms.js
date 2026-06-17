"use client";

import { useCallback, useState } from "react";

const DEFAULT_PLACE_TYPE = "club";

export function useCityContributionForms() {
  const [name, setName] = useState("");
  const [type, setType] = useState(DEFAULT_PLACE_TYPE);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [vibe, setVibe] = useState("");
  const [vibeTags, setVibeTags] = useState([]);
  const [placeHours, setPlaceHours] = useState("");
  const [placeLink, setPlaceLink] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventVibe, setEventVibe] = useState("");
  const [eventVibeTags, setEventVibeTags] = useState([]);
  const [eventDescription, setEventDescription] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventTicketUrl, setEventTicketUrl] = useState("");

  const resetPlaceForm = useCallback(() => {
    setName("");
    setType(DEFAULT_PLACE_TYPE);
    setAddress("");
    setDescription("");
    setVibe("");
    setVibeTags([]);
    setPlaceHours("");
    setPlaceLink("");
  }, []);

  const resetEventForm = useCallback(() => {
    setEventName("");
    setEventAddress("");
    setEventStartDate("");
    setEventEndDate("");
    setEventVibe("");
    setEventVibeTags([]);
    setEventDescription("");
    setEventLink("");
    setEventTicketUrl("");
  }, []);

  return {
    name,
    setName,
    type,
    setType,
    address,
    setAddress,
    description,
    setDescription,
    vibe,
    setVibe,
    vibeTags,
    setVibeTags,
    placeHours,
    setPlaceHours,
    placeLink,
    setPlaceLink,
    eventName,
    setEventName,
    eventAddress,
    setEventAddress,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
    eventVibe,
    setEventVibe,
    eventVibeTags,
    setEventVibeTags,
    eventDescription,
    setEventDescription,
    eventLink,
    setEventLink,
    eventTicketUrl,
    setEventTicketUrl,
    resetPlaceForm,
    resetEventForm,
  };
}
