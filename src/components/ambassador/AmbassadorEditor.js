"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Check, CircleAlert } from "lucide-react";
import VenueLocationPicker from "@/components/location/VenueLocationPicker";
import { TYPE_LABELS } from "@/features/city/cityPageConstants";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { normalizeConfirmedCoordinates } from "@/lib/cityGeocodingContext";
import { supabase } from "@/lib/supabase";

const control = "mt-2 w-full min-h-12 rounded-xl border border-white/20 bg-[#171623] px-3 py-2 text-base text-white focus:border-[#cfc0ff] focus:outline-none focus:ring-2 focus:ring-[#a793ec]/40";
const label = "block text-sm font-semibold text-[#e7e0f2]";
const primary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#cfbaff] px-5 font-semibold text-[#211634] hover:bg-[#e1d4ff] disabled:opacity-50";

function EditorField({ title, field, draft, change, ...props }) {
  return <label className={label}>{title}<input className={control} value={draft[field]} onChange={e => change(field, e.target.value)} {...props} /></label>;
}

function initialDraft(kind, row, venue) {
  const data = row || {};
  const location = row || venue || {};
  const range = normalizeEventRange(data);
  return {
    name: data.name || "", description: data.description || "", link: data.link || "",
    hours: data.hours || "", location: location.location || "", pin: normalizeConfirmedCoordinates(location),
    type: data.type || "club", start_date: range.startDate, end_date: range.endDate,
    ticket_url: data.ticket_url || "", event_status: data.event_status || "scheduled",
    ambassador_venue_id: String(data.ambassador_venue_id || (kind === "event" && venue?.id) || ""),
  };
}

function editableValues(draft, kind) {
  const values = {
    name: draft.name.trim(), description: draft.description.trim(), hours: draft.hours.trim(),
    link: draft.link.trim() || null, location: draft.location.trim(),
    lat: draft.pin?.lat ?? null, lng: draft.pin?.lng ?? null,
  };
  if (kind === "venue") return { ...values, type: draft.type };
  return { ...values, start_date: draft.start_date || null, end_date: draft.end_date || draft.start_date || null,
    ticket_url: draft.ticket_url.trim() || null, event_status: draft.event_status,
    ambassador_venue_id: draft.ambassador_venue_id || null };
}

function explain(error) {
  if (error.code === "40001" || /revision|concurrent|conflict|stale/i.test(error.message)) return "Someone has updated this entry. Keep a copy of your changes, then reopen it from the latest version.";
  if (error.code === "42501") return "This assignment no longer permits that change. Contact the editorial team if your access has changed.";
  if (error.code === "22023" || error.code === "P0001") return error.message;
  return "We could not confirm the save. Your draft is still here. Check your connection and try again.";
}

export default function AmbassadorEditor({ kind, row, assignment, venues, onClose, onSaved, onBusyChange }) {
  const event = kind === "event";
  const fixedVenue = assignment.role === "venue" ? venues.find(item => String(item.id) === String(assignment.venue_id)) : null;
  const [original] = useState(() => initialDraft(kind, row, fixedVenue));
  const [draft, setDraft] = useState(original);
  const [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const request = useRef(null);
  const [error, setError] = useState("");
  const change = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));
  const fields = { draft, change };
  const pickVenue = (id) => {
    const venue = venues.find(item => String(item.id) === id);
    setDraft(prev => ({ ...prev, ambassador_venue_id: id, location: venue?.location || "", pin: normalizeConfirmedCoordinates(venue) }));
  };

  async function save(e) {
    e.preventDefault();
    if (guard.current) return;
    const next = editableValues(draft, kind);
    const previous = editableValues(original, kind);
    const payload = Object.fromEntries(Object.entries(next).filter(([key, value]) => !row || value !== previous[key]));
    if (!Object.keys(payload).length) { setError("There are no changes to save."); return; }
    if ((!row || "location" in payload || "lat" in payload || "lng" in payload) && (!next.location || !draft.pin)) {
      setError("Choose the public address and confirm its pin before publishing."); return;
    }
    if (event && draft.end_date && draft.end_date < draft.start_date) { setError("The end date must be on or after the start date."); return; }
    if (event && row && payload.event_status === "cancelled" && !window.confirm("Mark this event as cancelled and remove it from upcoming events?")) return;
    if (!row) {
      const signature = JSON.stringify(payload);
      if (request.current?.signature !== signature) request.current = { signature, id: crypto.randomUUID() };
      payload.request_id = request.current.id;
    }
    guard.current = true;
    setBusy(true); onBusyChange(true); setError("");
    try {
      const { data, error: failure } = await supabase.rpc("qa_ambassador_save", {
        p_assignment_id: assignment.id, p_entity_type: kind, p_entity_id: row?.id ?? null,
        p_expected_revision: row ? row.ambassador_revision : null, p_payload: payload,
      });
      if (failure) throw failure;
      await onSaved(kind, data);
    } catch (failure) {
      setError(explain(failure));
    } finally {
      guard.current = false;
      setBusy(false); onBusyChange(false);
    }
  }

  return <form data-ambassador-editor onSubmit={save} className="mt-5 rounded-3xl border border-white/15 bg-[#15131e] p-5 sm:p-8">
    <button type="button" disabled={busy} onClick={() => {
      if (JSON.stringify(original) === JSON.stringify(draft) || window.confirm("Discard these unsaved changes?")) onClose();
    }} className="inline-flex min-h-11 items-center gap-2 text-sm text-[#d6c8ea]"><ArrowLeft size={16} /> Back to content</button>
    <h2 className="mb-6 mt-3 text-2xl font-semibold">{row ? "Edit" : "Create"} {kind}</h2>
    <fieldset disabled={busy} className="grid gap-5">
      <EditorField {...fields} title={event ? "Event name" : "Venue name"} field="name" required maxLength={200} />
      {!event && <label className={label}>Venue category<select aria-label="Venue category" className={control} value={draft.type} onChange={e => change("type", e.target.value)}>
        {!TYPE_LABELS[draft.type] && <option>{draft.type}</option>}
        {Object.entries(TYPE_LABELS).filter(([value]) => value !== "cruising_area").map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select></label>}
      {event && <div className="grid gap-4 sm:grid-cols-2">
        <EditorField {...fields} title="Start date" field="start_date" type="date" required={!row || Boolean(original.start_date)} />
        <EditorField {...fields} title="End date" field="end_date" type="date" min={draft.start_date} />
      </div>}
      <EditorField {...fields} title={event ? "Times (local to the event)" : "Opening hours"} field="hours" maxLength={500} />
      {event && !row && !fixedVenue && <label className={label}>Host venue<select aria-label="Host venue" className={control} value={draft.ambassador_venue_id} onChange={e => pickVenue(e.target.value)}>
        <option value="">Independent event</option>{venues.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>}
      {event && (row?.ambassador_venue_id || fixedVenue) && <p className="text-sm text-[#c6bdd4]">Host venue · {venues.find(item => String(item.id) === draft.ambassador_venue_id)?.name || "Assigned venue"}</p>}
      <VenueLocationPicker address={draft.location} city={assignment.city} location={draft.pin} entityLabel={event ? "Event" : "Venue"}
        onAddressChange={value => change("location", value)} onLocationChange={value => change("pin", normalizeConfirmedCoordinates(value))} />
      <label className={label}>Description<textarea className={control} rows={5} value={draft.description} onChange={e => change("description", e.target.value)} /></label>
      <EditorField {...fields} title="Official website" type="url" field="link" />
      {event && <EditorField {...fields} title="Ticket link" type="url" field="ticket_url" />}
      {event && row && <label className={label}>Event status<select aria-label="Event status" className={control} value={draft.event_status} onChange={e => change("event_status", e.target.value)}>
        {!["scheduled","cancelled"].includes(original.event_status) && <option value={original.event_status}>{original.event_status.replaceAll("_"," ")}</option>}
        <option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option>
      </select></label>}
    </fieldset>
    {error && <p role="alert" className="mt-5 flex items-start gap-2 text-sm text-amber-200"><CircleAlert size={18} className="shrink-0" />{error}</p>}
    <button type="submit" disabled={busy} className={primary + " mt-6 w-full sm:w-auto"}><Check size={18} />{busy ? "Saving…" : row ? "Publish changes" : `Publish ${kind}`}</button>
  </form>;
}
