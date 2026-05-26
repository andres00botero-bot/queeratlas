"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

export default function CitySeoTopicLinks({ city = "", cityName = "" }) {
  const topics = listCityClusterTopics().slice(0, 5);
  if (!city || topics.length === 0) return null;

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
    </section>
  );
}

