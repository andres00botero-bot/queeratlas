"use client";

import { Bookmark, MapPin, Tags } from "lucide-react";
import useNewsPreferences from "@/features/news/useNewsPreferences";

function preferenceButtonClass(active) {
  return `inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 ${
    active
      ? "border-cyan-100/50 bg-cyan-100/16 text-cyan-50"
      : "border-white/14 bg-white/[0.04] text-white/68 hover:border-white/28 hover:text-white"
  }`;
}

export default function NewsMemberActions({ article, mode = "all" }) {
  const { cloudAvailable, hasPreference, togglePreference } = useNewsPreferences();
  const storySaved = hasPreference("story", String(article.id));
  const cityId = String(article.city || "").trim().toLowerCase().replaceAll(" ", "_");
  const canFollowCity = cityId && !["global", "multi-city", "regional"].includes(cityId) && !cityId.includes("/");
  const cityFollowed = canFollowCity && hasPreference("city", cityId);
  const topicId = String(article.category || "culture_tip");
  const topicFollowed = hasPreference("topic", topicId);
  const storyMetadata = {
    title: article.title,
    city: article.city,
    category: article.category,
    storyType: article.storyType,
    date: article.publishedAt || article.date || "",
    imageUrl: article.imageUrl || "",
    sourceName: article.sourceName || "Queer Atlas editorial desk",
    href: `/now/news/${encodeURIComponent(String(article.id))}`,
  };

  const showSave = mode === "all" || mode === "save";
  const showFollow = mode === "all" || mode === "follow";

  if (mode === "save") {
    return (
      <button
        type="button"
        aria-pressed={storySaved}
        onClick={() => togglePreference({ preferenceType: "story", targetId: String(article.id), metadata: storyMetadata })}
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-2.5 text-xs font-semibold text-white/58 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"
      >
        <Bookmark size={15} aria-hidden="true" fill={storySaved ? "currentColor" : "none"} />
        {storySaved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <section className="mt-10 border-b border-white/10 pb-8" aria-label="News member actions">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/38">Keep following the story</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {showSave ? <button
            type="button"
            aria-pressed={storySaved}
            onClick={() => togglePreference({ preferenceType: "story", targetId: String(article.id), metadata: storyMetadata })}
            className={preferenceButtonClass(storySaved)}
          >
            <Bookmark size={15} aria-hidden="true" fill={storySaved ? "currentColor" : "none"} />
            {storySaved ? "Story saved" : "Save story"}
          </button> : null}
        {showFollow && canFollowCity ? (
          <button
            type="button"
            aria-pressed={cityFollowed}
            onClick={() => togglePreference({ preferenceType: "city", targetId: cityId, metadata: { label: article.city } })}
            className={preferenceButtonClass(cityFollowed)}
          >
            <MapPin size={15} aria-hidden="true" />
            {cityFollowed ? `Following ${article.city}` : `Follow ${article.city}`}
          </button>
        ) : null}
        {showFollow ? <button
          type="button"
          aria-pressed={topicFollowed}
          onClick={() => togglePreference({ preferenceType: "topic", targetId: topicId, metadata: { label: article.storyType } })}
          className={preferenceButtonClass(topicFollowed)}
        >
          <Tags size={15} aria-hidden="true" />
          {topicFollowed ? `Following ${article.storyType}` : `Follow ${article.storyType}`}
        </button> : null}
      </div>
      {!cloudAvailable ? <p className="mt-2 text-[11px] text-amber-100/58">Saved on this device. Cloud sync activates when the News preferences migration is installed.</p> : null}
    </section>
  );
}
