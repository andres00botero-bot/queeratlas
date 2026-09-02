"use client";

/* eslint-disable @next/next/no-img-element */

import { Bookmark, CalendarDays, LockKeyhole, MapPin, Pencil, Plus, Sparkles } from "lucide-react";

function initialsFor(name = "") {
  return String(name || "M").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "M";
}

export default function FavoritesProfileHome({
  isReadOnly = false,
  isLoading = false,
  error = "",
  displayName,
  displayInitials,
  avatarUrl,
  showAvatarImage,
  avatarInputRef,
  onAvatarSelected,
  onEditAvatar,
  onAvatarError,
  titleLabel,
  visibilityLabel,
  locationLabel,
  pronouns,
  about,
  vibeChips = [],
  stats = [],
  recentSaves = [],
  friends = [],
  friendsLoading = false,
  memories = [],
  memoriesLoading = false,
  stories = [],
  storiesLoading = false,
  showStoryForm = false,
  storyForm,
  setStoryForm,
  onToggleStoryForm,
  onPublishStory,
  onUploadMoment,
  memoryInputRef,
  onMemoriesSelected,
  onRemoveMoment,
  onOpenFriend,
  onOpenRecentSave,
  onEditProfile,
  onCloseProfile,
  onFollow,
  isFollowed = false,
  onMessage,
  onReport,
}) {
  const visibleLocation = locationLabel && locationLabel !== "Location not set" ? locationLabel : "";

  return (
    <section className="relative mb-8 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,14,31,0.96),rgba(7,8,13,0.99))] shadow-[0_34px_108px_rgba(0,0,0,0.48)]">
      <div className="relative min-h-44 overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(244,114,182,0.44),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.36),transparent_35%),linear-gradient(135deg,#351443,#101c32_58%,#23122b)] px-5 pb-6 pt-5 sm:min-h-52 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_0.8px,transparent_0.8px)] [background-size:22px_22px]" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
            <Sparkles className="h-4 w-4 text-amber-100" aria-hidden="true" /> My Atlas profile
          </span>
          {isReadOnly ? (
            <button type="button" onClick={onCloseProfile} className="rounded-full border border-white/22 bg-black/24 px-3 py-1.5 text-[11px] text-white/82 backdrop-blur">Close</button>
          ) : (
            <button type="button" onClick={onEditProfile} className="inline-flex items-center gap-1.5 rounded-full border border-white/24 bg-black/24 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/38">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="relative px-5 pb-7 sm:px-8">
        {isLoading ? <p className="pt-4 text-sm text-white/56">Loading profile…</p> : null}
        {error ? <p className="pt-4 text-sm text-amber-100/76">{error}</p> : null}
        <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end">
          <button type="button" onClick={isReadOnly ? undefined : onEditAvatar} className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-[30px] border-[3px] border-[#15101f] bg-[linear-gradient(135deg,#f472b6,#22d3ee)] p-1 text-3xl font-semibold text-white shadow-[0_20px_52px_rgba(0,0,0,0.42)] sm:h-40 sm:w-40" aria-label={isReadOnly ? "Member profile image" : "Change profile image"}>
            {showAvatarImage ? (
              <img src={avatarUrl} alt={`${displayName} profile`} className="h-full w-full rounded-[25px] object-cover" onError={onAvatarError} />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-[25px] bg-[#17111f]">{displayInitials}</span>
            )}
            {!isReadOnly ? <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/64 py-1 text-center text-[10px] uppercase tracking-[0.1em] opacity-0 backdrop-blur transition group-hover:opacity-100">Change</span> : null}
          </button>
          {!isReadOnly ? <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarSelected} className="hidden" /> : null}

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-fuchsia-100">{titleLabel || "Contributor"}</span>
              {!isReadOnly ? <span className="inline-flex items-center gap-1 rounded-full px-1 text-[10px] text-white/48"><LockKeyhole className="h-3 w-3" aria-hidden="true" /> {visibilityLabel}</span> : null}
            </div>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{displayName}</h2>
            {(visibleLocation || pronouns) ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/58">
                {visibleLocation ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{visibleLocation}</span> : null}
                {pronouns ? <span>{pronouns}</span> : null}
              </p>
            ) : null}
          </div>
        </div>

        {about ? <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-7 text-white/76">{about}</p> : !isReadOnly ? <button type="button" onClick={onEditProfile} className="mt-5 text-left text-sm text-cyan-100/72 underline decoration-cyan-100/25 underline-offset-4">Make it yours · add a city, bio or photo</button> : null}

        {vibeChips.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{vibeChips.slice(0, 4).map((chip) => <span key={chip.key} className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 text-[11px] text-white/74">{chip.label}</span>)}</div> : null}

        {isReadOnly ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={onFollow} className="rounded-full bg-cyan-200 px-4 py-2 text-xs font-semibold text-[#081016]">{isFollowed ? "Following" : "Follow"}</button>
            <button type="button" onClick={onMessage} className="rounded-full border border-white/18 bg-white/[0.07] px-4 py-2 text-xs text-white/84">Message</button>
            <button type="button" onClick={onReport} className="rounded-full px-3 py-2 text-xs text-rose-100/72">Report</button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-white/10 py-4">
          {stats.map((stat) => <button key={stat.label} type="button" onClick={stat.onClick} className="text-left"><span className="block text-lg font-semibold text-white">{stat.value}</span><span className="text-[11px] uppercase tracking-[0.1em] text-white/44">{stat.label}</span></button>)}
        </div>

        {!isReadOnly ? (
          <div className="mt-7">
            <div className="flex items-end justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/66">Recently saved</p><h3 className="mt-1 text-xl font-semibold text-white">Your latest finds</h3></div>{recentSaves.length > 0 ? <Bookmark className="h-5 w-5 text-cyan-100/46" aria-hidden="true" /> : null}</div>
            {recentSaves.length > 0 ? (
              <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {recentSaves.slice(0, 5).map((item) => <button key={`${item.type}-${item.id}`} type="button" onClick={() => onOpenRecentSave(item)} className="min-w-[12.5rem] snap-start rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 text-left transition hover:border-cyan-100/28"><span className="text-[10px] uppercase tracking-[0.12em] text-fuchsia-100/62">{item.type === "event" ? "Event" : "Venue"}</span><span className="mt-2 block line-clamp-2 text-sm font-semibold text-white">{item.name}</span><span className="mt-2 block text-xs text-white/48">{item.city}</span></button>)}
              </div>
            ) : <p className="mt-3 text-sm text-white/48">Save a venue or event and it will appear here.</p>}
          </div>
        ) : null}

        <div className="mt-8 border-t border-white/10 pt-7">
          <div className="flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/66">Friends</p><h3 className="mt-1 text-xl font-semibold text-white">Your queer circle</h3></div><span className="text-sm text-white/46">{friends.length}</span></div>
          {friendsLoading ? <p className="mt-3 text-sm text-white/48">Loading friends…</p> : friends.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-4">{friends.slice(0, 6).map((friend) => <button key={friend.userId || friend.displayName} type="button" onClick={() => onOpenFriend(friend)} className="group w-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/16 bg-white/[0.07] text-sm font-semibold text-white transition group-hover:border-fuchsia-200/46">{friend.avatarUrl ? <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsFor(friend.displayName)}</span><span className="mt-1.5 block truncate text-[11px] text-white/62">{friend.displayName}</span></button>)}</div>
          ) : <p className="mt-3 text-sm text-white/48">{isReadOnly ? "No visible friends yet." : "Follow members from Community to build your circle."}</p>}
        </div>

        <div className="mt-8 border-t border-white/10 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/66">Moments & stories</p><h3 className="mt-1 text-xl font-semibold text-white">Places worth remembering</h3></div>{!isReadOnly ? <div className="flex gap-2"><button type="button" onClick={onUploadMoment} className="rounded-full border border-white/14 px-3 py-1.5 text-[11px] text-white/72"><Plus className="mr-1 inline h-3.5 w-3.5" />Photo</button><button type="button" onClick={onToggleStoryForm} className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1.5 text-[11px] text-fuchsia-100"><Plus className="mr-1 inline h-3.5 w-3.5" />Story</button></div> : null}</div>
          {!isReadOnly ? <input ref={memoryInputRef} type="file" accept="image/*" multiple onChange={onMemoriesSelected} className="hidden" /> : null}
          {showStoryForm && !isReadOnly ? <form onSubmit={onPublishStory} className="mt-4 space-y-2 border-l-2 border-fuchsia-200/24 pl-4"><div className="grid gap-2 sm:grid-cols-3"><input value={storyForm.title} onChange={(event) => setStoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="Story title" required className="rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm outline-none" /><input value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm outline-none" /><input value={storyForm.category} onChange={(event) => setStoryForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm outline-none" /></div><textarea value={storyForm.body} onChange={(event) => setStoryForm((current) => ({ ...current, body: event.target.value }))} placeholder="Tell the story…" required className="min-h-24 w-full rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm outline-none" /><button type="submit" className="rounded-full bg-fuchsia-200 px-4 py-2 text-xs font-semibold text-[#230c20]">Publish story</button></form> : null}

          {memoriesLoading ? <p className="mt-4 text-sm text-white/48">Loading moments…</p> : memories.length > 0 ? <div className="mt-4 grid grid-cols-3 gap-2">{memories.slice(0, 5).map((memory, index) => <div key={memory.id} className={`group relative overflow-hidden rounded-[20px] ${index === 0 ? "col-span-2 row-span-2" : ""}`}><img src={memory.url} alt={`${displayName} memory ${index + 1}`} className={`${index === 0 ? "h-64" : "h-[7.75rem]"} w-full object-cover`} />{!isReadOnly ? <button type="button" onClick={() => onRemoveMoment(memory.id)} className="absolute right-2 top-2 rounded-full bg-black/66 px-2 py-1 text-[9px] text-white opacity-0 transition group-hover:opacity-100">Remove</button> : null}</div>)}</div> : null}

          {storiesLoading ? <p className="mt-4 text-sm text-white/48">Loading stories…</p> : stories.length > 0 ? <div className="mt-5 divide-y divide-white/10">{stories.slice(0, 3).map((story) => <article key={story.id} className="py-4 first:pt-0"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-fuchsia-100/56"><CalendarDays className="h-3.5 w-3.5" />{story.category || "Story"}{story.city ? ` · ${story.city}` : ""}</div><h4 className="mt-2 text-base font-semibold text-white">{story.title}</h4><p className="mt-1 line-clamp-3 text-sm leading-6 text-white/58">{story.excerpt || story.body}</p></article>)}</div> : memories.length === 0 ? <p className="mt-4 text-sm text-white/48">{isReadOnly ? "No public moments yet." : "Add a photo or story when something feels worth remembering."}</p> : null}
        </div>
      </div>
    </section>
  );
}
