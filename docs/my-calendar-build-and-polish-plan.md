# My Calendar — build and polish plan

Status: implementation-ready plan  
Date: 2026-09-03  
Depends on: `docs/my-calendar-research-and-product-direction.md`

## Product goal

Build a calendar that feels like a personal queer travel diary rather than a productivity dashboard. It must let a member understand the next plan in seconds, explore the month without visual overload, and move naturally between Saved events, My Map and Plan a trip.

The experience has two primary views:

- **Agenda**: chronological and informative; default on mobile.
- **Month**: visual overview and date selection; default remains the member's remembered preference.

This matches patterns in Google Calendar's Schedule/Month experience and Fantastical's compact month-plus-agenda approach ([Google Calendar](https://support.google.com/calendar/answer/6110849?co=GENIE.Platform%3DAndroid&hl=en), [Fantastical](https://flexibits.com/fantastical-ios/help/calendar-views)). Airbnb's current travel design also supports the core QueerAtlas connection: saved places can move directly into a dated itinerary and show travel time from the stay ([Airbnb](https://www.airbnb.com/help/article/4192)).

## Visual concept: After-dark travel diary

The calendar should feel intimate, editorial and lightly celebratory — not corporate, not nightclub neon, and not a stack of black panels.

### Surface system

Use one background canvas and only three meaningful elevation levels:

| Role | Direction | Use |
|---|---|---|
| Canvas | near-black aubergine | page background |
| Calendar surface | muted plum-charcoal | the single Agenda/Month workspace |
| Floating surface | warmer wine-plum | item sheet, add sheet, active popover |

Suggested starting tokens, to be tuned against the existing Favorites palette:

```css
--calendar-canvas: #0d0a12;
--calendar-surface: #17121d;
--calendar-surface-raised: #211725;
--calendar-surface-soft: #2a1c2a;
--calendar-line: rgba(255, 242, 249, 0.10);
--calendar-text: #fff7fb;
--calendar-muted: #bcaeb9;
--calendar-accent: #f5a9c6;
--calendar-accent-strong: #ff78ad;
--calendar-trip: #88d9d4;
--calendar-personal: #d8b678;
--calendar-alert: #ff8b82;
```

These are roles, not colors to spread across every panel. Event, trip and personal colors appear as small semantic signals: a rail, dot, icon or date marker. Apple recommends adaptive semantic color and sufficient foreground contrast in dark interfaces, while Material dark-theme guidance uses restrained tonal elevation instead of relying on invisible shadows ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/dark-mode), [Material dark theme](https://design.google/library/material-design-dark-theme)).

### Signature details

- A very subtle aurora wash behind the active month, limited to the page header.
- Large editorial month title with compact utility controls.
- Today uses a filled rose date lozenge; selected uses a pearl outline. They must not look identical.
- Event rows use a 3px semantic side rail rather than tinted full-card backgrounds.
- Tiny constellation dots in Month indicate content sources; text/icon labels remain available for accessibility.
- Motion is short and soft: 180–240ms sheet/selection transitions, no continuous shimmer.
- Rounded geometry is hierarchical: workspace 28–32px, sheets 26–30px, rows 16–20px, chips full-pill.
- Empty states use one small bespoke line illustration or symbol, not another bordered panel.

## Final information architecture

```text
My Calendar
├── Header
│   ├── Agenda / Month
│   ├── Filter
│   └── + Add plan
├── Context strip
│   ├── next 7 dates (Agenda)
│   └── month navigation (Month)
├── Main canvas
│   ├── Agenda date groups
│   └── Month grid + selected-day list
└── Floating detail layer
    ├── Event detail sheet
    ├── Trip detail sheet
    └── Personal plan editor
```

Remove the current Today/Upcoming/Reminders KPI pills. These are dashboard statistics, not primary tasks. Their useful meaning moves into the content: Today is a date group, upcoming items form the agenda, and a reminder icon appears on the relevant row.

## Responsive layouts

### Mobile

- Agenda is the first-time default.
- Sticky local header inside the calendar section: view switcher, filter and Add.
- Seven-day horizontal date strip remains visible while scrolling Agenda.
- One continuous list with 12–16px gaps between date groups.
- Month cells show the day number and up to three small semantic markers, never event titles.
- Tapping a Month date reveals that day's agenda in a bottom sheet.
- Tapping an item opens a 85–92vh bottom sheet with a visible drag handle.
- Primary sheet action stays reachable near the bottom; destructive actions remain in overflow.

### Tablet and desktop

- Use the same Agenda/Month switch rather than displaying two permanent panels.
- Month may show short event labels because cells have enough width.
- Selecting a date opens a right-side peek without changing the grid width dramatically.
- Agenda uses a centered reading width around 760–880px, leaving breathing room rather than filling the screen with cards.

## Core interaction specification

### Agenda

1. Group by Today, Tomorrow, then formatted date.
2. Show all-day items first, then timed items.
3. Each item row contains time, title, venue/city, source label and status.
4. Only one inline action is allowed: the contextually strongest action.
   - upcoming saved event: `Going?`
   - event today: `Directions`
   - event in a trip: `Open trip`
   - changed event: `Review change`
5. All other actions live in the item sheet.
6. Past events collapse behind `Earlier` after the current day.

### Month

1. Monday-first remains consistent with the existing app.
2. Use six stable rows to prevent layout jumps.
3. Mobile cells are compact; no `min-h-[5.8rem]` and no truncated titles.
4. Desktop cells show at most two labels and `+n` overflow.
5. Multi-day events render as one continuous restrained bar.
6. Keyboard arrows navigate the grid, Home/End move across the week, and Enter opens the day. The WAI grid pattern requires managed focus rather than putting all 42 cells into a long tab sequence ([W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)).

### Item sheet

The upper half communicates; the lower half acts.

- source/status eyebrow;
- name, date/time and venue;
- changed/cancelled message if applicable;
- small location preview only when coordinates exist;
- Saved/Going selector;
- Reminder control;
- Add/Open trip;
- Show on My Map and Directions;
- external calendar export;
- event-page link;
- remove in overflow.

### Add plan sheet

The first state contains title, date, time and city/place. Type defaults to Personal. A `More options` disclosure reveals end time, notes, reminder and trip. This replaces the current always-visible form and follows progressive disclosure ([Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)).

## Build sequence

### Stage 0 — safety and component boundary

Goal: prepare without changing visible behavior.

- Extract calendar helpers and normalization from `src/app/favorites/page.js`.
- Create a dedicated feature directory, for example `src/features/favorites/calendar/`.
- Preserve current local-storage keys during migration.
- Add unit coverage for month cells, sorting, date ranges and reminder normalization.
- Record a mobile and desktop baseline screenshot.

Exit gate: no behavior change; current Calendar still works.

### Stage 1 — calendar shell and design tokens

Goal: establish the new visual hierarchy.

- Add scoped calendar design tokens.
- Replace `Calendar Studio` with `My Calendar` and concise supporting copy.
- Add Agenda/Month segmented control and member preference persistence.
- Remove KPI pills and permanent two-panel layout.
- Build one calendar workspace surface and shared header controls.
- Implement empty/loading/error states.

Exit gate: responsive shell at 375px, 430px, 768px, 1280px and 1440px; no horizontal overflow.

### Stage 2 — Agenda MVP

Goal: deliver the most useful mobile experience first.

- Build normalized unified entries with event ranges.
- Add seven-day strip and chronological date groups.
- Add source/status rails, all-day ordering and past/upcoming states.
- Add a reusable item sheet with existing Open, reminder and plan actions.
- Keep reminders honestly labeled as in-app until real push exists.

Exit gate: saved event, dated trip and personal plan all appear correctly; missing time and city have graceful fallbacks.

### Stage 3 — Month rebuild

Goal: make overview calm and compact.

- Replace current oversized cells.
- Add mobile markers and desktop label variants.
- Support multi-day event ranges and overflow counts.
- Open day sheet/peek on selection.
- Implement complete keyboard and screen-reader semantics.

Exit gate: dense month, empty month, six-week month and multi-day events remain readable.

### Stage 4 — Saved / Going model

Goal: separate interest from commitment.

- Add Going state independent of favorite state.
- Saved dated events continue to appear automatically.
- Going enables suggested reminder setup but never silently grants push.
- Preserve events attached to a trip when a favorite is removed.
- Show updated/cancelled states rather than removing silently.

Exit gate: save, unsave, Going, cancellation and event-date update behavior are deterministic and tested.

### Stage 5 — My Map and Plan a trip integration

Goal: make the calendar part of the Favorites ecosystem.

- Add Show on My Map and Directions.
- Limit Check in to relevant day/location context.
- Add event to matching trip by city/date.
- Open Calendar at a trip's date range from Plan a trip.
- Add non-blocking overlap and travel-gap warnings.
- Include same-day calendar items when opening My Map.

Airbnb's map/itinerary pattern validates saving a place, assigning a date and showing time-distance together rather than keeping map and itinerary as separate tools ([Airbnb](https://www.airbnb.com/help/article/4192)).

Exit gate: a member can move from saved event → calendar → trip → map and back without losing context.

### Stage 6 — real reminders and synchronization

Goal: make reminders dependable.

- Add member-owned backend tables for entries, state and reminders.
- Register service worker and push subscriptions.
- Ask permission only after `Enable reminders`; browser guidance requires a user gesture and mobile persistent notifications generally use a service worker ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)).
- Add idempotent scheduler, retry and cancellation/update handling.
- Provide discreet lock-screen wording for privacy.
- Add quiet hours and event-city timezone handling.

Exit gate: reminders arrive with the app closed, never duplicate, and reschedule when an event changes.

### Stage 7 — export and final delight pass

Goal: complete interoperability and premium polish.

- Add single-event ICS export.
- Later add a private revocable subscribed feed; TripIt uses this pattern to dynamically expose itineraries in external calendars ([TripIt](https://help.tripit.com/en/support/solutions/articles/103000063280-calendar-feed-setup-and-sync)).
- Tune motion, focus rings, touch targets, typography and dense-month behavior.
- Add one restrained calendar empty-state illustration if an existing asset does not fit.
- Run final contrast, reduced-motion and screen-reader checks.

Exit gate: visual review passes in light browser chrome and dark browser chrome, with reduced motion and 200% zoom.

## Proposed component structure

```text
CalendarExperience
├── CalendarHeader
├── CalendarViewSwitch
├── CalendarFilter
├── CalendarAgenda
│   ├── CalendarDateStrip
│   ├── AgendaDateGroup
│   └── AgendaItem
├── CalendarMonth
│   ├── MonthNavigation
│   ├── MonthGrid
│   └── MonthDayCell
├── CalendarItemSheet
├── CalendarAddSheet
└── CalendarEmptyState
```

Keep data orchestration in a hook such as `useMemberCalendar`, with pure selectors for Agenda and Month. Do not move the whole Favorites page into another monolithic component.

## Polish checklist

### Visual

- no more than one large bordered workspace surface;
- no full-card source tinting;
- semantic colors are consistent across Agenda, Month, My Map and Trips;
- body text contrast at least 4.5:1, aiming higher for small labels;
- no gradient used merely to fill empty space;
- today, selected, going, changed and cancelled states are visually distinct.

### Interaction

- all primary touch targets at least 44px;
- every sheet closes by explicit button, Escape and expected gesture;
- focus returns to the triggering control;
- filter/view state is remembered;
- loading never shifts the whole calendar unexpectedly;
- removing or unsaving offers undo when it changes calendar membership.

### Content

- use `My Calendar`, `Agenda`, `Month`, `Saved`, `Going`, `Add plan`;
- avoid internal labels such as Studio, source ID or reminder mode;
- cancellation and date changes use plain language;
- empty copy suggests one useful next action, not a paragraph.

### Performance

- lazy-load map preview only when a detail sheet opens;
- memoize entry grouping and month layout;
- avoid mounting all item details in every month cell;
- animate transform/opacity rather than layout-heavy properties;
- keep calendar usable before remote sync completes.

## Verification matrix

| Area | Required verification |
|---|---|
| Data | saved, unsaved, going, personal, trip, multi-day, changed, cancelled |
| Dates | DST change, traveler timezone, event timezone, date-only item |
| Responsive | 375, 430, 768, 1280, 1440px |
| Input | touch, mouse, keyboard, screen reader |
| State | empty, one item, dense day, dense month, offline/cache |
| Integration | Event → Calendar → Trip → Map → Event |
| Reminder | denied, granted, expired subscription, rescheduled, duplicate prevention |
| Accessibility | contrast, focus order, labels, reduced motion, 200% zoom |

## Recommended delivery slices

For safe review and easy push/deploy, ship in four user-visible slices:

1. **New shell + Agenda**
2. **Polished Month + sheets**
3. **Saved/Going + Map/Trip connections**
4. **Backend sync + real reminders + ICS**

Each slice should be visually reviewed on the live `/favorites` page before starting the next. The first two slices deliver the major design improvement without waiting for backend reminder infrastructure.

## Final design decision

The target is a calm plum-toned editorial calendar with small joyful color signals, a strong mobile agenda and one floating detail layer. Its premium quality comes from hierarchy, spacing, typography, purposeful motion and cross-feature continuity — not from adding more panels, brighter gradients or decorative glass everywhere.
