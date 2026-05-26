"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

export default function CitiesSeoClusterPanel({ cityKeys = [] }) {
  const topics = listCityClusterTopics().slice(0, 5);
  const sampleCities = Array.isArray(cityKeys) ? cityKeys.slice(0, 8) : [];

  if (topics.length === 0 || sampleCities.length === 0) return null;

  return (
    <section className="qa-panel qa-premium-card mb-8 rounded-[28px] border border-cyan-200/12 bg-[linear-gradient(160deg,rgba(34,211,238,0.10),rgba(10,10,10,0.96))] p-5 shadow-[0_20px_72px_rgba(0,0,0,0.28)]">
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/70">Explore Topic Clusters</p>
      <h2 className="mt-1 text-base font-semibold text-white">Long-tail city guides</h2>
      <p className="mt-2 text-sm text-white/68">
        Jump directly into high-intent LGBTQ search topics across active city routes.
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {topics.map((topic) => {
          const citySlug = sampleCities[topics.indexOf(topic) % sampleCities.length];
          return (
            <Link
              key={`${citySlug}-${topic.key}`}
              href={`/${citySlug}/discover/${topic.key}`}
              className="rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.08] px-4 py-3 text-sm text-cyan-50 transition hover:border-cyan-100/42 hover:bg-cyan-200/[0.14]"
            >
              {topic.title} in {String(citySlug || "").replaceAll("_", " ")}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

