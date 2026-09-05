"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Bookmark, MapPin, Tags, X } from "lucide-react";
import { formatDateShort } from "@/lib/dateDisplay";
import useNewsPreferences from "@/features/news/useNewsPreferences";

const INITIAL_STORY_COUNT = 10;
const STORY_BATCH_SIZE = 8;

function storyMeta(item) {
  return {
    city: item.city || "Global",
    date: formatDateShort(item.createdAt || item.date),
    source: item.sourceName || "Queer Atlas desk",
  };
}

function leadStoryPreview(value, maxWords = 44) {
  const words = String(value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function categoryAccent(category) {
  if (category === "rights_safety") return "text-rose-200";
  if (category === "nightlife_change") return "text-amber-200";
  if (category === "major_event") return "text-violet-200";
  if (category === "rising_spot") return "text-emerald-200";
  return "text-cyan-200";
}

function normalizeFollowTarget(value) {
  return String(value || "").trim().toLowerCase().replaceAll(" ", "_");
}

function storyHeadingId(item, lane) {
  const itemId = String(item?.id || "story").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `news-${lane}-${itemId}`;
}

function storyFollowReason(item, followedPreferences, categoryLabels) {
  const cityId = normalizeFollowTarget(item.city);
  const cityMatch = followedPreferences.find((preference) => preference.preferenceType === "city" && preference.targetId === cityId);
  if (cityMatch) return cityMatch.metadata?.label || item.city || "Followed city";
  const topicMatch = followedPreferences.find((preference) => preference.preferenceType === "topic" && preference.targetId === String(item.category || ""));
  if (topicMatch) return topicMatch.metadata?.label || categoryLabels[item.category] || "Followed topic";
  return "";
}

function StoryImage({ item, priority = false, sizes, className = "" }) {
  if (!item.imageUrl) {
    return (
      <div
        className={`relative overflow-hidden bg-[radial-gradient(circle_at_22%_18%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(244,114,182,0.17),transparent_32%),linear-gradient(145deg,#121824,#090b10_68%,#08080b)] ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-x-[12%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-cyan-100/35 to-transparent" />
        <div className="absolute right-[18%] top-[24%] h-2 w-2 rounded-full bg-fuchsia-200/75 shadow-[0_0_24px_rgba(244,114,182,0.75)]" />
        <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/48 sm:bottom-5 sm:left-5">
          Atlas signal · World desk
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={item.imageUrl}
        alt={item.imageAlt || item.title || "Queer Atlas editorial news image"}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-700 group-hover:scale-[1.015]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07090e]/65 via-transparent to-transparent" />
      {item.imageCredit ? (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/70 backdrop-blur-md">
          {item.imageCredit}
        </span>
      ) : null}
    </div>
  );
}

function AdminActions({ item, canEdit, onEdit, onDelete }) {
  if (!onDelete) return null;
  return (
    <div className="flex items-center gap-2 pt-3">
      {canEdit && onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex min-h-8 items-center rounded-full border border-cyan-200/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"
        >
          Edit
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="inline-flex min-h-8 items-center rounded-full border border-rose-200/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/60"
      >
        Delete
      </button>
    </div>
  );
}

function SaveStoryButton({ item, saved, onToggle, compact = false }) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? "Remove saved story" : "Save story"}: ${item.title}`}
      onClick={() => onToggle(item)}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 ${
        compact ? "h-8 w-8" : "min-h-9 px-3 text-[10px] font-semibold"
      } ${saved ? "border-cyan-100/45 bg-cyan-100/14 text-cyan-50" : "border-white/12 bg-white/[0.035] text-white/48 hover:border-white/26 hover:text-white/78"}`}
    >
      <Bookmark size={13} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
      {!compact ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}

export default function NewsroomFeed({
  items,
  allItems = items,
  categoryLabels,
  availableTopics = [],
  feedMode = "latest",
  onSelectLatest,
  adminNewsIds,
  isAdmin,
  onOpen,
  onEdit,
  onDelete,
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_STORY_COUNT);
  const [feedAnnouncement, setFeedAnnouncement] = useState("");
  const { preferences, loading: preferencesLoading, isMember, hasPreference, requestSignIn, togglePreference } = useNewsPreferences();
  const followedPreferences = useMemo(
    () => preferences.filter((preference) => preference.preferenceType === "city" || preference.preferenceType === "topic"),
    [preferences]
  );
  const feedItems = useMemo(() => {
    if (feedMode !== "following") return items;
    return allItems.filter((item) => storyFollowReason(item, followedPreferences, categoryLabels));
  }, [allItems, categoryLabels, feedMode, followedPreferences, items]);
  const visibleItems = useMemo(() => feedItems.slice(0, visibleCount), [feedItems, visibleCount]);
  const lead = visibleItems[0] || null;
  const latest = visibleItems.slice(1, 5);
  const supporting = visibleItems.slice(5);
  const canLoadMore = visibleCount < feedItems.length;

  const loadMoreStories = () => {
    const next = Math.min(visibleCount + STORY_BATCH_SIZE, feedItems.length);
    setVisibleCount(next);
    setFeedAnnouncement(`${next - visibleCount} more stories loaded. ${next} of ${feedItems.length} stories shown.`);
  };

  const toggleFollow = (preference) => togglePreference({
    preferenceType: preference.preferenceType,
    targetId: preference.targetId,
    metadata: preference.metadata || {},
  });

  if (!lead) {
    if (feedMode === "following" && preferencesLoading) {
      return (
        <div className="border-y border-white/10 py-12 text-center" role="status">
          <p className="text-sm text-white/52">Loading your followed news…</p>
        </div>
      );
    }

    if (feedMode === "following" && !isMember) {
      return (
        <div className="mx-auto max-w-xl border-y border-white/10 py-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/72">Member news</p>
          <p className="qa-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#f7f4ee]">Your news, on your terms.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/52">Sign in to follow cities and topics. Queer Atlas only uses the interests you choose for this feed.</p>
          <button type="button" onClick={requestSignIn} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-100/34 bg-cyan-100/[0.09] px-5 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/58 hover:bg-cyan-100/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">
            Sign in to personalize
          </button>
        </div>
      );
    }

    if (feedMode === "following" && followedPreferences.length === 0) {
      return (
        <div className="mx-auto max-w-2xl border-y border-white/10 py-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/72">First step</p>
          <p className="qa-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#f7f4ee]">Choose what you want to follow.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/52">Pick a news desk below. You can also follow a city from any article and manage everything later in Your Atlas.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Topics to follow">
            {availableTopics.map((topic) => (
              <button
                key={topic.key}
                type="button"
                onClick={() => togglePreference({ preferenceType: "topic", targetId: topic.key, metadata: { label: categoryLabels[topic.key] || topic.label } })}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/[0.035] px-4 text-xs font-semibold text-white/68 transition hover:border-cyan-100/35 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"
              >
                <Tags size={14} aria-hidden="true" />
                {categoryLabels[topic.key] || topic.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (feedMode === "following") {
      return (
        <div className="mx-auto max-w-xl border-y border-white/10 py-12 text-center">
          <p className="qa-display text-3xl font-semibold tracking-[-0.035em] text-[#f7f4ee]">You’re caught up.</p>
          <p className="mt-3 text-sm leading-6 text-white/52">There are no current stories matching your followed cities or topics.</p>
          <button type="button" onClick={onSelectLatest} className="mt-6 min-h-11 rounded-full border border-white/16 px-5 text-xs font-semibold text-white/72 transition hover:border-white/32 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">
            Browse latest news
          </button>
        </div>
      );
    }

    return (
      <div className="border-y border-white/10 py-12 text-center">
        <p className="qa-display text-2xl font-semibold text-[#f7f4ee]">No stories in this desk yet.</p>
        <p className="mt-2 text-sm text-white/48">Try another category or check back after the next newsroom update.</p>
      </div>
    );
  }

  const leadMeta = storyMeta(lead);
  const leadFollowReason = feedMode === "following" ? storyFollowReason(lead, followedPreferences, categoryLabels) : "";
  const canEditLead = adminNewsIds.has(String(lead.id));
  const toggleStory = (item) => togglePreference({
    preferenceType: "story",
    targetId: String(item.id),
    metadata: {
      title: item.title,
      city: item.city || "Global",
      category: item.category || "culture_tip",
      storyType: categoryLabels[item.category] || "Queer news",
      date: item.createdAt || item.date || "",
      imageUrl: item.imageUrl || "",
      sourceName: item.sourceName || "Queer Atlas desk",
      href: `/now/news/${encodeURIComponent(String(item.id))}`,
    },
  });

  return (
    <div className="relative z-10 min-w-0">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{feedAnnouncement}</p>
      {feedMode === "following" && followedPreferences.length > 0 ? (
        <section className="mb-7 flex min-w-0 items-center gap-3 border-b border-white/10 pb-4" aria-label="Followed news interests">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">Following</span>
          <div className="qa-news-scrollrail flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
            {followedPreferences.map((preference) => {
              const label = preference.metadata?.label || preference.targetId.replaceAll("_", " ");
              const Icon = preference.preferenceType === "city" ? MapPin : Tags;
              return (
                <button
                  key={`${preference.preferenceType}-${preference.targetId}`}
                  type="button"
                  onClick={() => toggleFollow(preference)}
                  aria-label={`Unfollow ${label}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/12 px-3.5 text-xs text-white/62 transition hover:border-rose-200/32 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"
                >
                  <Icon size={13} aria-hidden="true" className="text-cyan-200/72" />
                  {label}
                  <X size={13} aria-hidden="true" className="text-white/36" />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className="grid min-w-0 gap-7 border-b border-white/12 pb-8 lg:grid-cols-12 lg:gap-8">
        <article className="group min-w-0 lg:col-span-8" aria-labelledby={storyHeadingId(lead, "lead")}>
          <button
            type="button"
            onClick={() => onOpen(lead)}
            tabIndex={-1}
            aria-hidden="true"
            className="block w-full text-left focus-visible:rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
          >
            <StoryImage
              item={lead}
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className={`${lead.imageUrl ? "aspect-[16/10] sm:aspect-[16/8]" : "h-44 sm:h-56"} w-full rounded-[22px] border border-white/12`}
            />
          </button>
          <div className="pt-4 sm:pt-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <span className={categoryAccent(lead.category)}>
                {categoryLabels[lead.category] || "News"}
              </span>
              <span className="text-white/38">{leadMeta.city}</span>
              <span className="text-white/38">{leadMeta.date}</span>
              {leadFollowReason ? <span className="text-cyan-100/70">Following {leadFollowReason}</span> : null}
            </div>
            <h2 id={storyHeadingId(lead, "lead")} className="qa-display mt-3 max-w-4xl text-[clamp(1.75rem,4vw,3.65rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[#f7f4ee]">
              <button
                type="button"
                onClick={() => onOpen(lead)}
                className="text-left transition hover:text-cyan-50 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
              >
                {lead.title}
              </button>
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
              {leadStoryPreview(lead.summary)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/42">
              <span>{leadMeta.source}</span>
              <span aria-hidden="true">·</span>
              <span>Lead story</span>
              <SaveStoryButton item={lead} saved={hasPreference("story", String(lead.id))} onToggle={toggleStory} />
              <button
                type="button"
                onClick={() => onOpen(lead)}
                className="ml-auto inline-flex min-h-12 items-center px-1 text-sm font-semibold text-cyan-100 transition hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"
              >
                Read story →
              </button>
            </div>
          </div>
          {isAdmin ? (
            <AdminActions
              item={lead}
              canEdit={canEditLead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : null}
        </article>

        <aside className="min-w-0 border-t border-white/12 pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0" aria-labelledby="latest-news-heading">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/75">Live desk</p>
              <h2 id="latest-news-heading" className="qa-display mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#f7f4ee]">
                Latest
              </h2>
            </div>
            <span className="mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/38">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
              Updating
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {latest.map((item) => {
              const meta = storyMeta(item);
              const followReason = feedMode === "following" ? storyFollowReason(item, followedPreferences, categoryLabels) : "";
              const canEdit = adminNewsIds.has(String(item.id));
              return (
                <article key={item.id} className="py-4 first:pt-3" aria-labelledby={storyHeadingId(item, "latest")}>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="group shrink-0 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
                    >
                      <StoryImage item={item} sizes="88px" className="h-[70px] w-[88px] rounded-xl border border-white/10" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${categoryAccent(item.category)}`}>
                        {categoryLabels[item.category] || "News"}
                      </p>
                      <h3 id={storyHeadingId(item, "latest")} className="mt-1 text-sm font-semibold leading-[1.28] text-[#f7f4ee]">
                        <button
                          type="button"
                          onClick={() => onOpen(item)}
                          className="min-h-6 line-clamp-3 text-left transition hover:text-cyan-50 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
                        >
                          {item.title}
                        </button>
                      </h3>
                      <p className="mt-1.5 text-[10px] text-white/38">{meta.city} · {meta.date}{followReason ? ` · Following ${followReason}` : ""}</p>
                      <div className="mt-2">
                        <SaveStoryButton item={item} saved={hasPreference("story", String(item.id))} onToggle={toggleStory} compact />
                      </div>
                    </div>
                  </div>
                  {isAdmin ? <AdminActions item={item} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} /> : null}
                </article>
              );
            })}
          </div>
        </aside>
      </div>

      {supporting.length > 0 ? (
        <section id="more-news-stories" className="pt-8" aria-labelledby="more-news-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">Across the atlas</p>
              <h2 id="more-news-heading" className="qa-display mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#f7f4ee] sm:text-3xl">
                More stories
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-white/34">{items.length} stories</span>
          </div>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {supporting.map((item) => {
              const meta = storyMeta(item);
              const followReason = feedMode === "following" ? storyFollowReason(item, followedPreferences, categoryLabels) : "";
              const canEdit = adminNewsIds.has(String(item.id));
              return (
                <article key={item.id} className="group min-w-0 border-t border-white/12 pt-4" aria-labelledby={storyHeadingId(item, "more")}>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block w-full text-left focus-visible:rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
                  >
                    <StoryImage item={item} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="aspect-[16/9] w-full rounded-[18px] border border-white/10" />
                  </button>
                  <div className="pt-3.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.14em]">
                      <span className={categoryAccent(item.category)}>{categoryLabels[item.category] || "News"}</span>
                      <span className="text-white/35">{meta.city}</span>
                    </div>
                    <h3 id={storyHeadingId(item, "more")} className="mt-2 text-lg font-semibold leading-[1.16] tracking-[-0.02em] text-[#f7f4ee]">
                      <button
                        type="button"
                        onClick={() => onOpen(item)}
                        className="min-h-6 line-clamp-3 text-left transition hover:text-cyan-50 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
                      >
                        {item.title}
                      </button>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/58">{item.summary}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-white/34">{followReason ? `Following ${followReason} · ` : ""}{meta.date} · {meta.source}</p>
                      <SaveStoryButton item={item} saved={hasPreference("story", String(item.id))} onToggle={toggleStory} compact />
                    </div>
                  </div>
                  {isAdmin ? <AdminActions item={item} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} /> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {canLoadMore ? (
        <div className="flex justify-center border-t border-white/10 pt-8 mt-9">
          <button
            type="button"
            onClick={loadMoreStories}
            aria-controls="more-news-stories"
            className="rounded-full border border-cyan-100/30 bg-cyan-100/[0.07] px-6 py-3 text-xs font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-100/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
          >
            Load more stories
          </button>
        </div>
      ) : null}
    </div>
  );
}
