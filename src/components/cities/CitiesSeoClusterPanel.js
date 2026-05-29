"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

export default function CitiesSeoClusterPanel({
  cityKeys = [],
  topicHubKeys = [],
  crawlClusterCities = [],
  crawlClusterTopics = [],
}) {
  const topics = listCityClusterTopics().slice(0, 5);
  const sampleCities = Array.isArray(cityKeys) ? cityKeys.slice(0, 8) : [];
  const depthTopicHubs = Array.isArray(topicHubKeys) ? topicHubKeys.slice(0, 5) : [];
  const depthRouteCities = Array.isArray(crawlClusterCities) ? crawlClusterCities.slice(0, 4) : [];
  const depthRouteTopics = Array.isArray(crawlClusterTopics) ? crawlClusterTopics.slice(0, 2) : [];

  if (topics.length === 0 && depthTopicHubs.length === 0) return null;
  if (sampleCities.length === 0 && depthRouteCities.length === 0) return null;

  return (
    <section className="qa-panel mb-6 rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5">
      <div className="flex items-center gap-2 text-[11px] text-white/64">
        <span className="uppercase tracking-[0.16em] text-cyan-100/72">Discover paths</span>
        <span className="text-white/28">·</span>
        <span className="text-white/52">SEO depth links</span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
        {topics.map((topic) => {
          const citySlug = sampleCities[topics.indexOf(topic) % sampleCities.length];
          return (
            <Link
              key={`${citySlug}-${topic.key}`}
              href={`/${citySlug}/discover/${topic.key}`}
              className="rounded-full border border-cyan-200/16 bg-cyan-200/[0.06] px-2.5 py-1 text-cyan-100/84 transition hover:border-cyan-100/36 hover:text-cyan-100"
            >
              {topic.title} in {String(citySlug || "").replaceAll("_", " ")}
            </Link>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
        {depthTopicHubs.map((topicKey) => (
          <Link
            key={`cities-depth-hub-${topicKey}`}
            href={`/topics/${topicKey}`}
            className="rounded-full border border-cyan-200/16 bg-cyan-200/[0.06] px-2.5 py-1 text-cyan-100/84 transition hover:border-cyan-100/36"
          >
            {topicKey.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </Link>
        ))}
        {depthRouteCities.flatMap((cityKey) =>
          depthRouteTopics.map((topicKey) => (
            <Link
              key={`cities-depth-route-${cityKey}-${topicKey}`}
              href={`/${cityKey}/discover/${topicKey}`}
              className="rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-1 text-white/74 transition hover:border-white/24 hover:text-white/92"
            >
              {cityKey.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} · {topicKey.replaceAll("-", " ")}
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
