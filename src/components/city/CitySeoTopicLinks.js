"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

export default function CitySeoTopicLinks({ city = "", cityName = "" }) {
  const topics = listCityClusterTopics().slice(0, 5);
  const topicHubMap = {
    nightlife: "nightlife",
    safety: "safety",
    events: "events",
    community: "community",
    daylife: "cafes",
  };
  if (!city || topics.length === 0) return null;

  const semanticAnchors = topics.slice(0, 3).map((entry) => ({
    title: entry.title,
    cityHref: `/${city}/discover/${entry.key}`,
    hubHref: `/topics/${topicHubMap[entry.intent] || "nightlife"}`,
  }));

  return (
    <section
      aria-label={`Explore ${cityName} topic guides`}
      className="mb-6 rounded-[22px] border border-cyan-200/16 bg-[linear-gradient(150deg,rgba(34,211,238,0.08),rgba(12,12,12,0.94))] p-4"
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/72">Explore City Topics</p>
      <h2 className="mt-1 text-sm font-semibold tracking-[0.01em] text-cyan-50">
        Long-tail guides for {cityName}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {topics.map((entry) => (
          <Link
            key={entry.key}
            href={`/${city}/discover/${entry.key}`}
            className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-3 py-1.5 text-[11px] text-cyan-50 transition hover:border-cyan-100/42 hover:bg-cyan-200/18"
          >
            {entry.title}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs leading-6 text-cyan-50/80">
        Start with{" "}
        <Link
          href={semanticAnchors[0]?.cityHref || `/${city}/discover/queer-techno-clubs`}
          className="underline decoration-cyan-200/50 underline-offset-2 transition hover:text-cyan-100"
        >
          {semanticAnchors[0]?.title || "nightlife discovery"}
        </Link>{" "}
        in {cityName}, then compare{" "}
        <Link
          href={semanticAnchors[1]?.cityHref || `/${city}/discover/safest-queer-bars`}
          className="underline decoration-cyan-200/50 underline-offset-2 transition hover:text-cyan-100"
        >
          {semanticAnchors[1]?.title || "safer venue paths"}
        </Link>{" "}
        and{" "}
        <Link
          href={semanticAnchors[2]?.cityHref || `/${city}/discover/events-tonight`}
          className="underline decoration-cyan-200/50 underline-offset-2 transition hover:text-cyan-100"
        >
          {semanticAnchors[2]?.title || "events routes"}
        </Link>
        . For global comparisons, open the{" "}
        <Link
          href={semanticAnchors[0]?.hubHref || "/topics/nightlife"}
          className="underline decoration-cyan-200/50 underline-offset-2 transition hover:text-cyan-100"
        >
          related topic hub
        </Link>
        .
      </p>
    </section>
  );
}
