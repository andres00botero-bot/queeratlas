<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# QueerAtlas product operating system

## Mission

Build QueerAtlas into the world's most trusted and useful queer discovery platform: a product that helps LGBTQ+ people confidently discover cities, venues, events, communities, and practical local context while creating a durable, ethical business.

Treat this as a product and business mission, not only a website-design task. Every material change must improve a real user outcome, strengthen trust, or create measurable business value.

## North-star outcome and guardrails

Optimize for **successful queer discoveries**: sessions in which a person finds and meaningfully uses a relevant city, place, event, guide, safety insight, trip plan, or community contribution.

Use these non-negotiable guardrails:

- Never trade user safety, privacy, accuracy, accessibility, or community trust for growth.
- Do not expose sensitive identity, location, search, message, or behavioral data unnecessarily.
- Do not describe a place as safe without current, sourced, appropriately scoped evidence. Preserve QARI qualifications and uncertainty.
- Avoid pinkwashing, tokenism, stereotypes, exploitative copy, and treating the queer community as one homogeneous audience.
- Do not introduce dark patterns, fabricated urgency, pay-to-rank editorial results, or undisclosed sponsored influence.

## Decision hierarchy

When several solutions are possible, prefer the one that performs best across this order:

1. User safety and community trust.
2. Clear user value and task completion.
3. Data accuracy, freshness, provenance, and transparent uncertainty.
4. Accessibility, mobile usability, speed, and resilience.
5. Sustainable growth, retention, and ethical revenue.
6. Maintainability and operational cost.
7. Visual novelty.

Do not optimize vanity metrics in isolation. Pageviews, impressions, content volume, and signups matter only when they lead to useful, retained, trustworthy use.

## Product and business analysis

For strategy, feature, content, or growth work:

- Identify the primary audience, their job to be done, the pain or risk being reduced, and the alternative they use today.
- State the business hypothesis, expected user behavior, leading metric, guardrail metric, and cheapest credible validation.
- Separate verified facts, assumptions, and recommendations. Research unstable market, competitor, legal, travel, event, and platform claims before relying on them.
- Look for a defensible advantage in QueerAtlas's structured queer place graph, current community signals, safety intelligence, editorial judgment, personalization, and global-local network effects.
- Prefer focused wedges that can earn repeat use in a defined audience or geography before broad feature expansion.
- Consider acquisition, activation, retention, referral, revenue, data quality, moderation load, and operational cost together.
- Rank opportunities with evidence and explicit tradeoffs. Reject ideas whose moderation, freshness, or trust cost exceeds plausible user and business value.

## Experience principles

- Help first-time visitors understand the product and reach a useful result quickly.
- Design mobile-first for real travel conditions: slow networks, unfamiliar locations, limited attention, and one-handed use.
- Make city, venue, event, guide, safety, and community information easy to scan and compare.
- Show freshness, source, verification status, and uncertainty where they affect a decision.
- Use inclusive language and representative imagery without flattening differences across identities, ages, cultures, abilities, and geographies.
- Treat empty, loading, offline, error, blocked, reported, stale-data, and low-confidence states as core product states.
- Meet WCAG 2.2 AA expectations for semantics, keyboard access, focus, contrast, motion, labels, and screen readers.

## Growth, SEO, and monetization

- Build acquisition around high-intent, genuinely useful destination and discovery pages with unique structured information, strong internal linking, and honest metadata.
- Protect programmatic SEO from thin, duplicated, stale, or unverified pages. Index only pages that deserve to be search results.
- Create return loops through saved places, plans, calendars, followed destinations, useful alerts, and contribution feedback rather than notification volume.
- Evaluate monetization through user alignment. Favor clearly labelled premium planning tools, memberships, ethical bookings or affiliates, and transparent business products that do not corrupt rankings or safety information.
- Keep organic editorial ranking independent from payment. Label advertising, affiliate relationships, and sponsored placement clearly.

## Measurement and experimentation

- Tie each material product change to one primary outcome metric and at least one trust, safety, quality, or performance guardrail.
- Reuse the repository's established event taxonomy and privacy limits. Never send raw searches, messages, personal details, precise sensitive location, or member identifiers to centralized analytics.
- Instrument the smallest event set that can answer the decision. Avoid analytics noise.
- Establish a baseline, change one meaningful variable when practical, define the evaluation window, and record the decision.
- Segment results when relevant by new/returning user, member status, device class, discovery intent, and market maturity without creating privacy risk.

## Delivery standard

Before implementing, inspect the relevant product flow, existing components, data model, analytics, tests, and project documentation. For Next.js behavior, follow the repository's Next.js agent rule above.

For material work, briefly state:

- the user and business outcome;
- the evidence or assumption behind the change;
- the primary metric and guardrail;
- the smallest complete implementation.

Preserve existing user changes. Reuse established patterns before adding dependencies or parallel systems. Keep scope coherent, include essential states and telemetry, and run checks proportionate to risk. A task is complete only when the requested experience works end to end, its important failure states are handled, and the result can be evaluated after release.
