# My Calendar — research and product direction

Status: research recommendation, not yet implemented  
Scope: member experience on `/favorites`, mobile-first with a responsive desktop layout  
Date: 2026-09-03

## Executive recommendation

QueerAtlas should not build a general-purpose calendar. It should build a **queer plans calendar**: a calm, visual place that answers four questions quickly:

1. What have I saved or planned?
2. What is happening today or next?
3. Where is it, and when should I leave?
4. Does it fit my trip and my other plans?

The best first version has only two primary views:

- **Agenda** — the default on phones, grouped by Today, Tomorrow and upcoming dates.
- **Month** — a compact overview for discovery and planning.

Selecting an item should open one bottom sheet on mobile or a side peek on desktop. Adding a personal item should also open a sheet. The current permanently visible detail and form panels should be removed from the main canvas. This follows progressive disclosure: show the common actions first and reveal advanced controls only when requested ([Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)).

## What exists today

The implementation in `src/app/favorites/page.js` already provides:

- a My Calendar page-control option;
- a Monday-first, 42-cell month grid;
- automatic calendar entries for saved events with valid dates;
- trip-plan entries when a plan has a date;
- personal entries with title, type, date, time, city, notes and reminder choice;
- Today, Upcoming and Reminders summary counts;
- event links back to the city page;
- a quick check-in connection to My Map;
- a link from a trip entry to the Trips/Plan a trip area;
- locally stored personal entries and reminder choices.

### Important gaps in the current behavior

- “Day before” and “Hour before” appear as choices, but the current reminder effect only produces an in-app day-of toast, and only while the Calendar tab is active.
- There is no scheduled browser/device push, backend reminder job or cross-device calendar sync.
- There is no agenda/day view, only the month grid and selected-day panel.
- The page always shows a large add form, creating unnecessary weight before the member decides to add anything.
- Events support date ranges elsewhere in the app, but My Calendar reduces a saved event to one parsed date.
- Event time, end time, all-day state and event timezone are not modeled reliably in the calendar.
- The integration with My Map is mainly check-in; it does not yet provide “show on map”, directions or leave-time guidance.
- The integration with Plan a trip is one-way and shallow; there is no calendar action to add an event to a trip or detect itinerary conflicts.
- Unsaving an event implicitly removes the derived calendar item. There is no separate “Going” or “keep in trip” intent.

## Research findings

### Views should serve different planning distances

Google Calendar offers Schedule and Month views on phones and describes Schedule as the list of events by day ([Google Calendar Help](https://support.google.com/calendar/answer/6110849?co=GENIE.Platform%3DAndroid&hl=en)). Notion supports month and week views on the web, but its mobile calendar emphasizes one-, two- or three-day views, showing that dense desktop grids do not translate cleanly to small screens ([Notion Calendar settings](https://www.notion.com/en-gb/help/notion-calendar-settings), [Notion mobile apps](https://www.notion.com/en-gb/help/notion-calendar-apps)).

For QueerAtlas, Agenda + Month is enough initially. Week view adds controls and density without solving a distinct member need. The app should remember the last chosen view, while Agenda remains the first-time mobile default.

### The calendar should be connected to real intent

Eventbrite separates saving/discovery from ticket ownership, while allowing ticket holders to add events to Calendar or Wallet ([Eventbrite Help](https://www.eventbrite.com/help/en-us/articles/783059/)). QueerAtlas should similarly distinguish:

- **Saved** — interested; appears automatically but is visually light and silent by default.
- **Going** — committed; receives suggested reminders and itinerary checks.
- **In a trip** — committed within a dated journey; remains available even if the original favorite is removed.

This prevents every casual heart click from becoming a noisy alert while preserving the user’s expectation that saved events appear automatically.

### Useful reminders are contextual, not numerous

Apple’s notification guidance says notifications should be timely, high-value, concise, non-duplicative and avoid sensitive details that may appear on a lock screen ([Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/notifications/)). This is especially relevant to queer plans, where event names or venue details may disclose sensitive information.

Recommended defaults:

- Saved: no push reminder; visible in Agenda.
- Going: suggest “1 day before” and “time to leave”.
- Event changed or cancelled: high-priority service update.
- Personal plan: use the member’s chosen reminder.

“Time to leave” is genuinely useful because Apple Calendar can use an event address, traffic and transit conditions to advise departure time ([Apple Support](https://support.apple.com/en-ie/guide/iphone/iph3d110f84/ios)). QueerAtlas can start with an explicit **Get directions** action and a simple departure suggestion; live routing can follow later.

Real mobile web notifications require more than the existing local effect. Permission must be requested after a user gesture, HTTPS is required, and mobile browsers generally need service-worker notifications ([MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)). Receiving push while the app is closed requires a service worker and a server-originated push subscription ([MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)). Therefore, the UI must never promise reminders until push permission and backend scheduling are actually available.

### Timezone and date ranges are product requirements

Google and Apple calendars both account for current-location and event-specific timezones ([Google Calendar Help](https://support.google.com/calendar/answer/37064?hl=en-au), [Apple Support](https://support.apple.com/en-nz/guide/iphone/iph69525c028/26/ios/26)). QueerAtlas already stores IANA timezones for cities, which is a strong foundation. Calendar entries should store UTC instants plus the event city’s timezone, while all-day dates remain date-only values. This avoids shifting an event to the wrong day when a member travels.

Multi-day and recurring events also need explicit treatment. Eventbrite supports recurring dates and time slots ([Eventbrite Help](https://www.eventbrite.com/help/en-us/articles/692566/create-a-recurring-or-timed-entry-event-in-eventbrites-new-recurring-event/)); QueerAtlas already has start/end dates in its event model. Month view should render a multi-day event across its full range, and Agenda should show it on each active day without creating duplicate underlying records.

### External calendar export should be an escape hatch, not the main experience

iCalendar is a standard interchange format for calendaring data ([RFC 5545](https://www.rfc-editor.org/rfc/rfc5545)). Google Calendar imports `.ics`, but imported files do not continually synchronize ([Google Calendar Help](https://support.google.com/calendar/answer/37118?hl=en-au)). Recommended rollout:

- first: “Add to Apple/Google/Outlook” for one event via a valid ICS download;
- later: a private subscribed calendar feed for continuous updates;
- never expose a guessable public feed URL; allow the member to revoke/regenerate it.

### Accessibility favors a strong agenda fallback

Google explicitly recommends Schedule view for screen-reader navigation ([Google Calendar Help](https://support.google.com/calendar/answer/6101541?hl=en)). If the month is implemented as an ARIA grid, the app must manage arrow-key focus and expose every meaningful cell according to the WAI grid pattern ([W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)). Agenda should remain a semantic list, and color must never be the only indication of Events, Trips or Personal entries.

## Proposed experience

### Page header

- Title: **My Calendar**
- Short contextual line: “Your saved events and travel plans, in one place.”
- Segmented control: **Agenda | Month**
- One primary `+` button, labeled **Add plan** on wider screens.
- Optional filter behind one compact control: Events, Trips, Personal.

Remove “Calendar Studio”; it sounds like an editing suite rather than a personal planning tool.

### Agenda — mobile default

Use one continuous canvas, not a collection of dashboard panels.

- A small date strip for the next seven days.
- “Next up” gets slight emphasis only when something is imminent.
- Date groups: Today, Tomorrow, weekday + date.
- Each row shows time, name, city/venue, source type and status.
- Useful state appears inline: “Starts in 2h”, “Date changed”, “In Madrid trip”.
- Tap opens the item sheet; do not place five buttons on every row.

The item sheet contains the contextual actions:

- Open event
- Going / Saved
- Add to trip or Open trip
- Show on My Map
- Get directions
- Reminder
- Add to external calendar
- Remove

### Month

- Compact grid with date numbers and at most two short items or dots per cell.
- A “+2 more” indicator instead of expanding cells.
- Multi-day events render as restrained bars.
- Selecting a day opens that date’s agenda below on desktop and as a bottom sheet on mobile.
- Today, selected date and dates with plans need shapes/labels in addition to color.
- Month navigation: previous, Today, next.

### Add flow

The current full form should become a bottom sheet/dialog opened by `+ Add plan`.

First level:

- title;
- date and optional time;
- city/place;
- type;
- Save.

“More options” reveals end time, notes, reminder and trip attachment. This preserves capability without making the blank page feel administrative.

## Connections across Favorites

### Saved events → My Calendar

- A saved dated event appears immediately as **Saved**.
- No push is enabled automatically.
- “Going” turns on suggested reminder settings.
- Date/time/location updates propagate to the same entry and show a brief change badge.
- Cancellation keeps a struck/alerted record long enough for the member to understand what changed; it must not silently disappear.

### My Calendar ↔ My Map

- Every geocoded calendar item offers **Show on My Map**.
- The map opens focused on the item, with other same-day items visible.
- **Get directions** is the primary day-of action.
- Check-in appears only near the event date/location, not as a permanent calendar action.
- A future “Tonight route” can order same-evening stops, but should not be MVP.

### My Calendar ↔ Plan a trip

- **Add to trip** suggests trips whose city and date range match the event.
- Trip days appear as subtle date-range context in Month and Agenda.
- Adding an event to a trip places it on the correct day automatically.
- Warn about overlapping event times and unrealistic travel gaps; do not block saving.
- From a trip, “View in calendar” opens the relevant range rather than merely switching tabs.

### Home and discovery

- Home may show one quiet “Next plan” module, not a second calendar dashboard.
- Event cards should display Saved or Going state consistently.
- The event detail page is the best moment to ask “Add reminder?” after the member chooses Going.

## Recommended data and technical architecture

Move from a client-only merge to a canonical member calendar model:

```text
calendar_entry
  id, user_id
  source_type: event | trip | personal
  source_id
  status: saved | going | cancelled
  title, city_id, place_id
  starts_at, ends_at, event_timezone
  all_day, visibility
  source_revision, created_at, updated_at

calendar_reminder
  id, entry_id, user_id
  trigger_type: absolute | relative | leave_time
  minutes_before, channel, status, scheduled_for
```

Use a uniqueness rule on `(user_id, source_type, source_id)` to prevent duplicates. Event updates should revise the linked calendar entry. Reminder delivery needs an idempotent backend job, push subscription storage, retry policy and cancellation when an event changes or is removed. Local storage can remain a temporary offline cache, not the source of truth.

Privacy defaults:

- all entries private;
- no public “attending” signal without explicit opt-in;
- generic lock-screen preview option, such as “You have a plan soon”;
- location access requested only when the member invokes directions, nearby or leave-time features;
- revocable push and calendar-feed permissions.

## Prioritized build sequence

### Phase 1 — clear and delightful

1. Replace the current layout with Agenda + Month.
2. Make Agenda the mobile default and remember the member’s preference.
3. Preserve automatic saved-event entries.
4. Add Saved / Going intent.
5. Move item details and Add plan into sheets/dialogs.
6. Correctly render event start/end dates and city timezone.
7. Add Show on My Map, Get directions and Add to trip actions.
8. Add change/cancellation states.

### Phase 2 — dependable membership value

1. Persist entries and preferences per member in the backend.
2. Implement real opt-in web push with service worker and scheduled jobs.
3. Add time-to-leave reminders when reliable location/routing data exists.
4. Add single-event ICS export, followed by an optional private feed.
5. Add conflict and travel-gap warnings.

### Phase 3 — only after usage proves demand

- recurring personal plans;
- Tonight route across multiple saved places;
- Wallet/ticket attachment;
- opt-in shared trip calendar;
- recommendation prompts for empty trip dates.

Do not build a week view, social attendance feed, complex recurrence editor or AI itinerary generator initially. They increase complexity before the two central views and cross-feature links have proven their value.

## Success criteria

- Members can understand their next plan in under five seconds.
- A saved event appears in Calendar without extra work.
- Going, reminder and trip status are understandable without opening settings.
- At least 90% of calendar interactions occur through Agenda/Month without needing a generic edit form.
- Reminder opt-in, direction opens and add-to-trip conversion can be measured separately.
- Changed/cancelled events never vanish silently.
- Keyboard and screen-reader users can use the Agenda fully and navigate the Month grid predictably.

## Decision

Proceed with Phase 1 as a focused redesign. The concept is strong, and much of the necessary source data and local behavior already exists. The major product shift is to make the calendar an integrated planning layer across Saved events, My Map and Plan a trip — not another isolated panel-heavy tool.
