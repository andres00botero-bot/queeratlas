"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { isTier1CityTopic } from "@/lib/seo/indexingTier";

export default function CitySeoTopicLinks({ city = "", cityName = "" }) {
  const topics = listCityClusterTopics()
    .filter((entry) => isTier1CityTopic(city, entry.key))
    .slice(0, 5);
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
      className="qa-city-copy-left mb-8 rounded-[24px] border border-white/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(244,114,182,0.08),rgba(255,255,255,0.055))] p-5 shadow-[0_18px_48px_rgba(34,211,238,0.10)] backdrop-blur"
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/76">Explore City Topics</p>
      <h2 className="mt-2 text-base font-semibold tracking-[-0.01em] text-white">
        More ways into {cityName}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {topics.map((entry) => (
          <Link
            key={entry.key}
            href={`/${city}/discover/${entry.key}`}
            className="rounded-full border border-white/18 bg-white/[0.075] px-3 py-1.5 text-[11px] text-white/84 transition hover:border-cyan-100/42 hover:bg-cyan-200/14 hover:text-white"
          >
            {entry.title}
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs leading-6 text-white/70">
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
