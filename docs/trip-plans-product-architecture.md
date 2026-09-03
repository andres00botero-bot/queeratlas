# Trip plans: recommended product architecture

## Recommendation

Trip plans should become one calm, stateful workspace—not a large generator beside a second route-library panel.

The best model for QueerAtlas is:

> **Save and collect → shape a day-by-day plan → use the map while out**

This preserves the existing itinerary intelligence but makes the experience much easier to understand.

## What exists today

Trip Studio already supports city, date/window, mood, vibe tags, budget, energy, lower-friction weighting, opening hours, event dates, distance estimates, trusted favorites, hotel suggestions, backup stops, lock/reshuffle, save, share, `.ics` export, and navigation to venues/events.

The weakness is not lack of features. It is that almost everything appears before the user has received value. The generator and saved-plan library also compete visually, while saved plans cannot be edited naturally.

## The new experience

### 1. Trips home

Open on `Your trips`, not the generator.

- One clear `New trip` button.
- The next upcoming trip is featured.
- Other cards are grouped into `Upcoming`, `Ideas`, and `Past`.
- Empty state: `Use my saved places` or `Start with a city`.

### 2. Quick create

Only three choices are required:

1. Destination.
2. Dates, quick window, or `Dates undecided`.
3. `Use my saves`, `Suggest a queer plan`, or `Blank trip`.

Mood, pace, budget, vibe tags, and comfort weighting move into `Tune the plan`. This follows progressive-disclosure guidance: core choices remain obvious while occasional controls appear on demand ([Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)).

The trip is created and autosaved immediately, before recommendations are generated.

### 3. Trip workspace

On mobile, use two views:

- `Plan`: day-by-day timeline.
- `Map`: synchronized full-screen map.

The timeline contains stop rows separated by actual transfer rows. Each stop shows time, category, open/event confidence, and one short `Why this fits` explanation. Users can add, reorder, move, reschedule, replace, or remove stops and undo changes.

The map uses numbered markers matching the timeline. Mapbox can calculate walking, cycling, and driving routes with up to 25 coordinates, which is enough for a daily itinerary ([Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)).

`Tighten route` should optimize one day, visibly show the changed order, and provide Undo—similar to Wanderlog’s reversible daily optimization model ([Wanderlog Help](https://help.wanderlog.com/hc/en-us/articles/13545624787867-Optimize-route)).

### 4. During-trip mode

On active dates, the same workspace emphasizes:

- Up next.
- Directions and transfer time.
- Open/start-time confidence.
- Nearby alternative or backup stop.
- A simple reschedule/replace action.

This is where QueerAtlas can be meaningfully different: queer-specific venue intelligence and local context appear at the decision moment, without becoming another large panel.

## Integration across Favorites

### Home

Show the next trip and one useful action: `Continue planning`, `Starts today`, or `Add first stop`.

### My Map

Add a normal `Trip` filter. Selecting a trip shows its numbered, day-colored stops and route. Venue/event sheets get `Add to trip`; multiple matching trips open a compact chooser.

### My Calendar

A trip appears as a date-range band and its timed stops as calendar items. Edits must share the same source records so Calendar and Trip plans cannot drift apart. Adding an event asks which trip when several trips match.

Calendar location fields can later power maps and time-to-leave features, while stable external IDs avoid duplicate writes ([Google Calendar developer guide](https://developers.google.com/workspace/calendar/api/guides/create-events)).

### Saved venues and events

Every saved item gets `Add to trip`. If exactly one active trip matches the city, it becomes one tap with Undo. If no trip exists, `Create trip from this` prefills destination and first stop.

### City pages and Nearby

Place `Add to trip` beside Save and Directions. Nearby can insert an alternative after the current stop and display the distance change. Live location remains optional and transient because precise geolocation is sensitive and requires explicit permission ([W3C Geolocation](https://www.w3.org/TR/geolocation/)).

## Visual design

- One continuous planning canvas instead of many nested “premium” cards.
- Warm near-black/plum base consistent with My Calendar.
- Restrained, desaturated night map.
- Rose, sea-glass, amber, and lavender only as small day/status accents—not full panel colors.
- 20–24 px outer radius and 14–16 px stop rows.
- Fewer gradients, chips, shadows, and uppercase labels.
- One primary action per state; secondary actions in bottom sheets or overflow.
- Touch controls should be approximately 44×44 px where practical, with clear keyboard focus ([WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)).

## Technical direction

Start by building the new workspace on the existing `member_plans` schema through an adapter. Then migrate to normalized records once editing is proven:

- `member_trips`: identity, destination, dates, lifecycle, privacy, preferences.
- `member_trip_days`: date, position, note.
- `member_trip_stops`: source entity, order, time, duration, status, note, locked state, snapshots.
- `member_trip_collaborators`: later, private-by-default sharing.

Route calculation, feasibility checks, recommendations, and calendar projection should be separate services. The recommendation output must include a reason and confidence—not only a hidden score.

Rename `Solo safe` to `Prioritize lower-friction places`. The existing heuristic can rank for comfort, but it cannot guarantee safety.

## Build order

### Phase 1 — Make it clear

- Trips home.
- Three-choice quick create.
- Autosaved draft.
- Editable timeline with Undo.
- `Add to trip` from Saved, My Map, My Calendar, and city pages.

### Phase 2 — Make it spatial

- Synchronized day map.
- Real walking/transit transfers.
- Reversible route optimization.
- Conflict warnings, backup stops, and during-trip mode.

### Phase 3 — Make it durable

- Normalized database model.
- Optional collaborators and private sharing.
- External calendar connection.
- Offline trip access and lightweight visited/skipped history.

Do not add flights, expenses, booking-email imports, packing lists, or chat now. Wanderlog and TripIt make those useful in general-purpose travel products, but QueerAtlas should concentrate on the journey from queer discovery to a confident, usable route ([Wanderlog](https://wanderlog.com/travel-maps), [TripIt](https://help.tripit.com/en/support/solutions/articles/103000063396-tripit-or-tripit-pro-)).

## Bottom line

Keep the intelligence. Remove the visible complexity.

The first version should feel like creating a playlist: start from saved favorites, accept a smart draft, rearrange a few stops, and immediately see the same trip in Calendar and on My Map.
