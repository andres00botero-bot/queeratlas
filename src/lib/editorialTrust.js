import { QA_SITE_URL } from "@/lib/seo/entityAuthority";

export const EDITORIAL_LAUNCH_DATE = "2026-08-04";
export const TRUST_REVIEW_DATE = "2026-11-18";

export const EDITORIAL_TEAM = {
  id: "queer-atlas-editorial-team",
  name: "Queer Atlas Editorial Team",
  type: "Organization",
  role: "Editorial desk",
  href: "/contributors#queer-atlas-editorial-team",
  bio: "The Queer Atlas editorial desk turns verified public information, local context, and moderated community signal into practical queer travel guidance.",
};

export const GUIDE_EDITORIAL_META = {
  gayGuide: {
    publishedAt: "2026-04-12",
    updatedAt: EDITORIAL_LAUNCH_DATE,
    researchScope:
      "This editorial planning guide uses Queer Atlas city, venue, event, and route structures to explain how to build a nightlife-focused trip. It does not independently verify every destination or guarantee current operating details.",
    changeLog: [
      { date: EDITORIAL_LAUNCH_DATE, note: "Added editorial ownership, research scope, and public change history; destination recommendations were not changed." },
      { date: "2026-04-12", note: "Guide first published as a permanent Queer Atlas editorial route." },
    ],
  },
  queerGuide: {
    publishedAt: "2026-04-12",
    updatedAt: EDITORIAL_LAUNCH_DATE,
    researchScope:
      "This editorial planning guide uses Queer Atlas city context, venue categories, events, and moderated community features to explain a context-first queer travel workflow. Individual place operations require a current check.",
    changeLog: [
      { date: EDITORIAL_LAUNCH_DATE, note: "Added editorial ownership, research scope, and public change history; planning guidance was not changed." },
      { date: "2026-04-12", note: "Guide first published as a permanent Queer Atlas editorial route." },
    ],
  },
  hbtqGuide: {
    publishedAt: "2026-04-12",
    updatedAt: EDITORIAL_LAUNCH_DATE,
    researchScope:
      "This Swedish-intent editorial guide maps Queer Atlas city, venue, event, and community features into an HBTQ travel workflow. It does not represent a complete audit of every linked city or place.",
    changeLog: [
      { date: EDITORIAL_LAUNCH_DATE, note: "Added editorial ownership, research scope, and public change history; route guidance was not changed." },
      { date: "2026-04-12", note: "Guide first published as a permanent Queer Atlas editorial route." },
    ],
  },
  collection: {
    publishedAt: "2026-06-25",
    updatedAt: EDITORIAL_LAUNCH_DATE,
    changeLog: [
      { date: EDITORIAL_LAUNCH_DATE, note: "Added editorial ownership, research scope, and public change history; collection picks were not changed." },
      { date: "2026-06-25", note: "Atlas Collections launched as permanent editorial lists." },
    ],
  },
  cityDiscovery: {
    publishedAt: "2026-05-26",
    updatedAt: EDITORIAL_LAUNCH_DATE,
    changeLog: [
      { date: EDITORIAL_LAUNCH_DATE, note: "Added editorial ownership, research scope, and public change history across city discovery routes." },
      { date: "2026-05-26", note: "City discovery route template first published." },
    ],
  },
};

export const TRUST_NAV_ITEMS = [
  { key: "about", href: "/about", label: "About" },
  { key: "editorial-policy", href: "/editorial-policy", label: "Editorial policy" },
  { key: "verification", href: "/verification", label: "Verification" },
  { key: "sources-and-reviews", href: "/sources-and-reviews", label: "Sources & reviews" },
  { key: "community-policy", href: "/community-policy", label: "Moderation" },
  { key: "corrections", href: "/corrections", label: "Corrections" },
  { key: "contributors", href: "/contributors", label: "Contributors" },
  { key: "contact", href: "/contact", label: "Contact & press" },
];

export const TRUST_PAGES = {
  about: {
    href: "/about",
    eyebrow: "About Queer Atlas",
    seoTitle: "About Queer Atlas: LGBTQ+ Travel, Places & Local Guides",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Queer discovery, with context",
    description:
      "Queer Atlas is an independent LGBTQ+ guide to places, events and local life, combining practical facts, editorial context and moderated community knowledge.",
    intro:
      "Queer Atlas is an independent guide to LGBTQ+ places, events, services and local life. We combine practical facts, editorial context and moderated community knowledge so people can make better decisions before they arrive.",
    accent: "cyan",
    highlights: [
      { label: "Coverage", value: "Global" },
      { label: "Focus", value: "Queer travel + local life" },
      { label: "Standard", value: "Useful before hype" },
    ],
    sections: [
      {
        id: "why",
        title: "Why Queer Atlas exists",
        body: "Finding queer-friendly places should not mean sorting through outdated listings, broad claims or information that ignores local realities. Queer Atlas exists to make local discovery more legible: where to go, what to check and what context may matter before you arrive.",
      },
      {
        id: "purpose",
        title: "What Queer Atlas is for",
        body: "We help people plan a night, choose a place, understand a city and find relevant community resources. The atlas is made for travellers planning ahead and locals reading the energy of their own city—not for turning queer life into a generic ranking.",
        bullets: [
          "Practical venue and event intelligence, not generic directory copy.",
          "City context that connects nightlife, community, movement, and safety.",
          "Volunteer and community contributions that help local knowledge improve the atlas.",
        ],
      },
      {
        id: "method",
        title: "Useful information needs a clear standard",
        body: "Queer spaces are not interchangeable. A useful guide explains who a place may work for, how a night tends to move and which details can change quickly. We label the difference between confirmed facts, editorial interpretation and community signal whenever it matters.",
        note: "Addresses, hours and event details are checked differently from atmosphere, access and lived experience. Read our verification standard for the full method.",
      },
      {
        id: "volunteers",
        title: "Built with volunteers and local knowledge",
        body: "Queer Atlas is strengthened by volunteers who contribute local knowledge, research leads, translations and corrections. Their work helps the atlas stay closer to the communities and places it describes.",
        bullets: [
          "Volunteers can flag changes, suggest places and share useful source material.",
          "A contribution is reviewed before it is published as an editorial claim or verified fact.",
          "Volunteer participation never turns one person’s experience into a claim about an entire community.",
        ],
        note: "We credit contributors where appropriate and protect privacy when public attribution is not wanted or could create a safety risk.",
      },
      {
        id: "accountability",
        title: "Independent, accountable and open to correction",
        body: "Our editorial desk is responsible for the standards behind the atlas. Commercial relationships do not buy recommendations, significant changes are recorded, and readers, venue owners and contributors can challenge a factual claim with evidence.",
        bullets: [
          "Editorial standards and conflicts are published openly.",
          "Safety, closure and identity-based exclusion reports are prioritised.",
          "Material corrections receive a visible update record.",
        ],
      },
      {
        id: "independence",
        title: "Funding and editorial independence",
        body: "We are transparent about influence. Editorial rankings and safety-related judgments are not for sale. If a partnership, sponsorship, grant or other material relationship affects published work, it should be disclosed close to that work so readers can judge the context for themselves.",
        note: "Support helps sustain research, verification and product development; it never guarantees a listing, a positive recommendation or the removal of accurate criticism.",
      },
      {
        id: "people",
        title: "Who Queer Atlas serves",
        body: "The atlas is built for LGBTQ+ people across identities, ages, travel styles, budgets and comfort levels. Inclusion is a practical product requirement: it shapes what information we look for, how we describe it and what we do when a reader flags a gap.",
      },
    ],
  },
  "editorial-policy": {
    href: "/editorial-policy",
    eyebrow: "Editorial standards",
    seoTitle: "Editorial Policy",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Independent, useful, accountable",
    description:
      "The principles used when Queer Atlas researches, writes, reviews, and updates editorial guidance.",
    intro:
      "Our editorial work should help a reader make a better real-world decision. Accuracy, context, transparency, and queer lived experience take priority over promotional language or artificial certainty.",
    accent: "fuchsia",
    highlights: [
      { label: "Priority", value: "Reader usefulness" },
      { label: "Commercial influence", value: "Disclosed" },
      { label: "Corrections", value: "Visible" },
    ],
    sections: [
      {
        id: "ownership",
        title: "Editorial ownership and review",
        body: "The Queer Atlas editorial desk owns these standards and the decision to publish, amend or remove editorial guidance. Where an individual editor or local contributor has shaped a guide, that role should be attributed on the relevant page when it is safe and consented to.",
      },
      {
        title: "Editorial independence",
        body: "Advertising, partnerships, complimentary access, or venue relationships must not buy a positive recommendation or suppress a relevant concern. Material relationships should be disclosed close to the content they affect.",
      },
      {
        title: "How we write",
        bullets: [
          "Use specific, natural language and avoid repeating template claims across different places.",
          "Distinguish durable facts from time-sensitive details and subjective atmosphere.",
          "Do not present a single review, rumor, or social post as broad community consensus.",
          "Avoid outing, doxxing, stereotyping, or unnecessary personal details.",
        ],
      },
      {
        title: "AI and editorial responsibility",
        body: "AI may assist with organization, comparison, translation, and drafting. It is not accepted as a source. Published claims should be traceable to real evidence, and responsibility remains with the named author and editor.",
        note: "Automated wording must never be used to manufacture certainty, firsthand experience, or community consensus.",
      },
      {
        title: "Conflicts and sponsored work",
        body: "Sponsored or commissioned work should be labeled. Editorial rankings and safety-related judgments should not be sold. Contributors should disclose relationships that could reasonably affect their judgment.",
      },
    ],
  },
  verification: {
    href: "/verification",
    eyebrow: "How we verify",
    seoTitle: "How Queer Atlas Verifies LGBTQ+ Places & Events",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "From signal to publishable information",
    description:
      "A practical verification standard for venues, events, services, guides, and reports.",
    intro:
      "Not every claim needs the same proof. An address can often be checked directly; a door atmosphere or typical crowd requires repeated, attributed signal and careful language.",
    accent: "emerald",
    highlights: [
      { label: "Facts", value: "Cross-checked" },
      { label: "Fast-changing details", value: "Dated" },
      { label: "Uncertainty", value: "Shown" },
    ],
    sections: [
      {
        id: "status-labels",
        title: "What our status labels mean",
        bullets: [
          "Verified means a core claim has been checked against appropriate, current evidence; it is not a guarantee of a future experience.",
          "Editorial context is Queer Atlas interpretation based on sourced facts, local research and clearly qualified judgment.",
          "Community signal is moderated lived experience or recurring feedback; it is not presented as independently confirmed fact.",
          "Needs updating means a time-sensitive claim should be checked again before a reader relies on it.",
        ],
      },
      {
        title: "The verification ladder",
        bullets: [
          "Confirm the identity of the place, event, or service and use its exact canonical route.",
          "Check core facts against an official operator, organizer, authority, or direct primary reference when available.",
          "Use independent local reporting and established specialist guides for context and corroboration.",
          "Use reviews and community accounts to identify recurring patterns, not isolated verdicts.",
          "Record when research was checked and soften or withhold claims that remain uncertain.",
        ],
      },
      {
        id: "review-cycle",
        title: "From submission to re-check",
        bullets: [
          "A listing or report is matched to the correct place, event or service before it is assessed.",
          "Core claims are checked against the strongest suitable sources and the research date is recorded where it matters.",
          "New evidence, corrections and high-risk reports can trigger a re-check, qualification or temporary withholding of a claim.",
        ],
        note: "A verified listing can still change overnight. Readers should confirm opening, access and event details directly when those details affect a decision.",
      },
      {
        title: "What changes quickly",
        body: "Opening hours, event dates, door policy, queues, prices, crowd mix, accessibility, and staff experience can shift by night. These details should carry a date, a qualification, or a prompt to confirm directly.",
      },
      {
        title: "Safety and rights",
        body: "Safety and legal context require stronger sourcing than atmosphere or style. Queer Atlas links to supporting authorities where available and does not present travel guidance as legal or medical advice.",
        note: "Immediate danger, harassment, closures, and identity-based exclusion are prioritized for review.",
      },
    ],
  },
  "sources-and-reviews": {
    href: "/sources-and-reviews",
    eyebrow: "Source & review policy",
    seoTitle: "Sources & Reviews Policy",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Many signals, one accountable judgment",
    description:
      "How Queer Atlas uses official pages, independent reporting, specialist guides, reviews, and community accounts.",
    intro:
      "Sources are evidence, not decoration. We use the source that fits the claim, preserve the difference between fact and interpretation, and avoid naming sources inside the prose when a clean citation can do the job.",
    accent: "amber",
    highlights: [
      { label: "Primary sources", value: "For core facts" },
      { label: "Reviews", value: "For patterns" },
      { label: "Citations", value: "Exact URLs" },
    ],
    sections: [
      {
        id: "claim-fit",
        title: "The source must fit the claim",
        bullets: [
          "Official sources are preferred for addresses, hours, tickets, accessibility statements and scheduled events.",
          "Independent reporting and specialist guides add local or historical context that an operator cannot verify alone.",
          "Reviews and community accounts can describe repeated experience patterns, but they do not verify a single allegation by themselves.",
          "Safety and legal claims require stronger, current authority than atmosphere or style.",
        ],
      },
      {
        title: "Source hierarchy",
        bullets: [
          "Official venue, organizer, government, transport, or rights-body information for direct facts.",
          "Independent local journalism and established queer or travel publications for context.",
          "Current review platforms, forums, and community accounts for recurring experience signals.",
          "Queer Atlas community submissions after moderation and confidence review.",
        ],
      },
      {
        id: "freshness",
        title: "Recency, uncertainty and missing evidence",
        body: "Time-sensitive information loses weight as it ages. When current evidence is missing or contradictory, we qualify the wording, ask readers to confirm directly or remove the claim rather than preserving an appealing but unreliable detail.",
      },
      {
        title: "How reviews may be used",
        body: "Reviews can help describe patterns such as queue pressure, staff warmth, tourist mix, accessibility, dress expectations, or how a night changes by weekday. We look for repetition across time and sources, and we paraphrase rather than copy reviewers' wording.",
        note: "A single allegation, unusually old review, or unverifiable claim is not treated as established fact.",
      },
      {
        title: "Attribution and links",
        body: "Factual claims should link to the most specific useful page, not a generic homepage. Source names belong in the evidence layer or reference list unless naming the source is important to the story itself.",
      },
      {
        title: "Commercial and user-generated sources",
        body: "Promotional copy is treated as a claim by the operator, not independent confirmation. Community material may add valuable lived experience, but it remains labeled and moderated rather than being silently converted into verified fact.",
      },
    ],
  },
  "community-policy": {
    href: "/community-policy",
    eyebrow: "Community moderation",
    seoTitle: "Community Moderation Policy",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Protect the signal, protect the people",
    description:
      "The participation and moderation rules used across stories, guides, messages, reviews, listings, and reports.",
    intro:
      "Queer Atlas welcomes disagreement, nuance, and honest criticism. It does not welcome content that makes queer discovery less safe, less truthful, or less humane.",
    accent: "rose",
    highlights: [
      { label: "Reports", value: "Human reviewed" },
      { label: "Safety concerns", value: "Prioritized" },
      { label: "Enforcement", value: "Proportionate" },
    ],
    sections: [
      {
        id: "report-status",
        title: "What happens after a report",
        bullets: [
          "A report is received with its context and category; urgent safety or identity-based harm can be escalated for review.",
          "The case may be assessed as requiring more information, a correction, a visibility limit, removal or no action.",
          "A decision can be revisited when meaningful new evidence is supplied.",
        ],
        note: "Reports are not an emergency service and are not monitored live. If someone is in immediate danger, contact local emergency services first.",
      },
      {
        title: "What is not allowed",
        bullets: [
          "Hate speech, slurs, harassment, threats, targeted abuse, or encouragement of violence.",
          "Doxxing, outing, impersonation, or sharing non-consensual intimate material.",
          "Spam, manipulation, fabricated experiences, or fraudulent venue and event claims.",
          "Sexual content involving minors or content that compromises consent and safety.",
        ],
      },
      {
        title: "How moderation works",
        body: "Reports enter a moderation queue with context and a reason. Moderators may review the content, account history, supporting material, and the risk of leaving the content visible while a decision is made.",
        bullets: [
          "Possible actions include a warning, correction request, visibility restriction, removal, or account limitation.",
          "Severe safety violations may be acted on immediately.",
          "Repeated manipulation or abuse may lead to stronger restrictions.",
        ],
      },
      {
        id: "appeals",
        title: "Appeals and reconsideration",
        body: "A person affected by a high-impact moderation decision or a significant factual claim may submit relevant context or evidence through the contact desk. Where practical, a different reviewer should assess the dispute.",
      },
      {
        title: "Fairness and appeals",
        body: "People may contact Queer Atlas if they believe a moderation decision or factual claim is wrong. A different reviewer should assess disputed high-impact decisions where practical.",
      },
      {
        title: "Venue criticism and lived experience",
        body: "Specific, good-faith accounts of discrimination, exclusion, access barriers, or poor treatment are allowed. We may request clarification or evidence when a claim could cause significant harm and cannot be responsibly assessed as written.",
      },
    ],
  },
  corrections: {
    href: "/corrections",
    eyebrow: "Corrections & updates",
    seoTitle: "Corrections & Updates Policy",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Make the atlas better, visibly",
    description:
      "How to report an error and how Queer Atlas records meaningful editorial changes.",
    intro:
      "Queer life moves quickly. Venues close, parties move, policies change, and community experience evolves. Corrections are part of the product, not an embarrassment hidden from readers.",
    accent: "cyan",
    highlights: [
      { label: "Submit", value: "From any page" },
      { label: "Priority", value: "Risk + reach" },
      { label: "Material changes", value: "Logged" },
    ],
    sections: [
      {
        id: "public-record",
        title: "Public change record",
        body: "Material policy and editorial updates are recorded here with the date and a short explanation. Listing-level corrections should appear on the affected page when they materially change meaning, safety, access or availability.",
        bullets: [
          "18 November 2026 — clarified verification labels, review process, source freshness, moderation status and contributor transparency across the Trust Center.",
        ],
      },
      {
        title: "What to send",
        bullets: [
          "The exact Queer Atlas URL or name of the affected venue, event, service, guide, or report.",
          "What appears wrong, what the corrected information should be, and when you checked it.",
          "A specific supporting link or document when one is available.",
          "Whether the issue creates an immediate safety, discrimination, closure, or access risk.",
        ],
      },
      {
        title: "How corrections are prioritized",
        body: "Immediate safety issues, false closure or opening claims, identity-based exclusion, and high-traffic factual errors receive higher priority. Style preferences and low-impact wording changes may take longer.",
      },
      {
        title: "What appears in change history",
        body: "Material changes should record the date and a short explanation. Silent fixes are reserved for spelling, formatting, broken links, or other changes that do not alter the meaning.",
      },
      {
        title: "Right of reply",
        body: "Venue owners, organizers, contributors, and community members may submit evidence or context. A right of reply does not guarantee removal of accurate criticism or override independent editorial judgment.",
      },
    ],
  },
  contributors: {
    href: "/contributors",
    eyebrow: "People behind the atlas",
    seoTitle: "Contributors & Editorial Team",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Editors, researchers, and local signal",
    description:
      "The editorial roles and contributor standards behind Queer Atlas guidance.",
    intro:
      "Trust is easier when readers can see who shaped a guide, what role they played, and where their knowledge comes from. This directory is the permanent home for those profiles.",
    accent: "violet",
    highlights: [
      { label: "Editorial ownership", value: "Visible" },
      { label: "Local expertise", value: "Attributed" },
      { label: "Contributor status", value: "Reviewed" },
    ],
    sections: [
      {
        id: "volunteers",
        title: "Volunteer contribution, with accountability",
        body: "Volunteers can add local knowledge, research leads, translations and corrections. Their contribution is valuable, but it does not bypass source review, moderation or editorial responsibility.",
        note: "Profiles are public only with consent. Contributors may remain private when attribution could create a safety or privacy risk.",
      },
      {
        id: "queer-atlas-editorial-team",
        title: EDITORIAL_TEAM.name,
        body: EDITORIAL_TEAM.bio,
        bullets: [
          "Maintains editorial standards, research disclosures, and corrections.",
          "Reviews how sources and community signal are translated into practical guidance.",
          "Owns the current legacy guides until individual named authors are assigned.",
        ],
        note: "Individual editor and local contributor profiles will be added only with verified names, roles, bios, and consent. Queer Atlas does not invent staff identities.",
      },
      {
        title: "Local editors",
        body: "Local editors should have meaningful, current knowledge of the city or community they cover. Their profile should state location, focus areas, languages, potential conflicts, and the date their local expertise was last confirmed.",
      },
      {
        title: "Trusted contributors",
        body: "Trusted status means a member has been reviewed for contribution quality and publishing access. It is not a permanent endorsement, a professional credential, or permission to bypass editorial standards.",
      },
    ],
  },
  contact: {
    href: "/contact",
    eyebrow: "Contact & press",
    seoTitle: "Contact & Press",
    lastReviewed: TRUST_REVIEW_DATE,
    title: "Talk to Queer Atlas",
    description:
      "Contact the editorial desk about corrections, safety concerns, partnerships, interviews, data, or press.",
    intro:
      "Use the contact desk for the fastest routing. Include the affected page and a clear subject so editorial, community, or partnership questions reach the right queue.",
    accent: "fuchsia",
    highlights: [
      { label: "Editorial", value: "Corrections + sources" },
      { label: "Community", value: "Safety + feedback" },
      { label: "Press", value: "Interviews + data" },
    ],
    sections: [
      {
        id: "urgent-safety",
        title: "Urgent safety concerns",
        body: "Use the safety route to flag information that could expose someone to harm, discrimination, closure or serious access risk. Queer Atlas reports are not monitored live; if someone is in immediate danger, contact local emergency services first.",
      },
      {
        title: "Editorial and corrections",
        body: "Send the exact page URL, the disputed detail, and the strongest supporting reference you have. Mark urgent safety or closure issues clearly.",
      },
      {
        title: "Press and partnerships",
        body: "For interviews, data questions, destination work, collaborations, and commercial enquiries, explain your organization, deadline, intended use, and the cities or topics involved.",
        note: "Email is also available at admin@queeratlas.app. The contact form creates a trackable reference for your message.",
      },
      {
        id: "press-kit",
        title: "Press information",
        body: "For a press request, include your publication, deadline, intended use and the cities or topics involved. Queer Atlas can provide a short description of the platform, current coverage figures and approved brand assets on request.",
      },
    ],
  },
};

export function getTrustPage(key = "") {
  return TRUST_PAGES[String(key || "").trim()] || null;
}

export function buildTrustMetadata(key = "") {
  const page = getTrustPage(key);
  if (!page) return {};

  return {
    title: page.seoTitle || page.eyebrow,
    description: page.description,
    alternates: { canonical: page.href },
    openGraph: {
      title: page.seoTitle || `${page.eyebrow} | Queer Atlas`,
      description: page.description,
      url: `${QA_SITE_URL}${page.href}`,
      siteName: "Queer Atlas",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle || `${page.eyebrow} | Queer Atlas`,
      description: page.description,
    },
  };
}

export function buildEditorialAuthorJsonLd(author = EDITORIAL_TEAM) {
  return {
    "@type": author.type || "Organization",
    "@id": `${QA_SITE_URL}${author.href || "/contributors"}#${author.id || "editorial-team"}`,
    name: author.name,
    url: `${QA_SITE_URL}${author.href || "/contributors"}`,
  };
}
