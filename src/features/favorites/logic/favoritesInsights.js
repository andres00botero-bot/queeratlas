export function computeSuggestedMembers(networkMembers = [], selfUserId = "") {
  const selfId = String(selfUserId || "");
  return (networkMembers || [])
    .filter((entry) => {
      const userId = String(entry.user_id || "");
      return userId && userId !== selfId;
    })
    .sort((a, b) => {
      const aRank = Number(a.rank || 9999);
      const bRank = Number(b.rank || 9999);
      const aScore = Number(a.score || 0);
      const bScore = Number(b.score || 0);
      const aCities = Number(a.city_count || 0);
      const bCities = Number(b.city_count || 0);
      const aSignal = aScore * 0.08 + aCities * 2.4 - aRank * 0.6;
      const bSignal = bScore * 0.08 + bCities * 2.4 - bRank * 0.6;
      return bSignal - aSignal;
    })
    .slice(0, 18);
}

export function computeFollowingFeedItems({
  followingFeedRows = [],
  eventsById = new Map(),
  placesById = new Map(),
}) {
  return (followingFeedRows || [])
    .map((row) => {
      const favoriteId = String(row.favorite_id || "");
      if (!favoriteId) return null;

      const isEvent = favoriteId.startsWith("event-");
      if (isEvent) {
        const eventId = favoriteId.replace("event-", "");
        const event = eventsById.get(String(eventId));
        if (!event) return null;
        return {
          kind: "event",
          favoriteId,
          itemId: String(event.id),
          name: event.name,
          city: event.city,
          date: row.created_at,
          sourceName: row.display_name || "Member",
          sourceTitle: row.title || "",
        };
      }

      const place = placesById.get(favoriteId);
      if (!place) return null;
      return {
        kind: "place",
        favoriteId,
        itemId: String(place.id),
        name: place.name,
        city: place.city,
        date: row.created_at,
        sourceName: row.display_name || "Member",
        sourceTitle: row.title || "",
      };
    })
    .filter(Boolean);
}

export function computeFollowingProfiles({
  followingUserIds = [],
  followingFeedRows = [],
  networkMembers = [],
}) {
  if (!Array.isArray(followingUserIds) || followingUserIds.length === 0) return [];

  const latestByOwner = new Map();
  (followingFeedRows || []).forEach((row) => {
    const ownerId = String(row.owner_user_id || "");
    if (!ownerId) return;
    const current = latestByOwner.get(ownerId);
    const currentTime = current ? new Date(current.created_at || 0).getTime() : 0;
    const nextTime = new Date(row.created_at || 0).getTime();
    if (!current || nextTime > currentTime) {
      latestByOwner.set(ownerId, row);
    }
  });

  return followingUserIds
    .map((id) => {
      const key = String(id);
      const member = (networkMembers || []).find((entry) => String(entry.user_id || "") === key);
      const latest = latestByOwner.get(key);
      return {
        userId: key,
        displayName: member?.display_name || "Member",
        title: member?.title || "",
        rank: member?.rank || null,
        score: member?.score || 0,
        cityCount: member?.city_count || 0,
        latestItemName: latest?.item_name || latest?.favorite_id || "",
        latestItemCity: latest?.item_city || "",
        latestAt: latest?.created_at || "",
      };
    })
    .sort((a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0));
}

export function computeForYouRecommendations({
  recommendationMode = "balanced",
  blockedEvents = new Set(),
  blockedPlaces = new Set(),
  events = [],
  favoriteIdSet = new Set(),
  followingFeedItems = [],
  places = [],
  savedPlaces = [],
  normalizeCityKey,
  resolvePrimaryVibeKey,
  resolvePrimaryVibeLabel,
  formatDate,
}) {
  const modeWeights =
    recommendationMode === "safe"
      ? { trustedCity: 3, savedCity: 4, vibe: 2, reviews: 0.25, rating: 0.5, typeSafe: 2.5, typePeak: 0.5, eventSoon: 0.04 }
      : recommendationMode === "peak"
        ? { trustedCity: 5, savedCity: 3, vibe: 3, reviews: 0.1, rating: 0.25, typeSafe: 0.6, typePeak: 2.8, eventSoon: 0.14 }
        : { trustedCity: 4, savedCity: 5, vibe: 3, reviews: 0.15, rating: 0.35, typeSafe: 1.2, typePeak: 1.4, eventSoon: 0.08 };

  const savedCityCounts = new Map();
  const trustedCityCounts = new Map();
  const savedVibeCounts = new Map();

  (savedPlaces || []).forEach((place) => {
    const cityKey = normalizeCityKey(place.city);
    if (cityKey) {
      savedCityCounts.set(cityKey, (savedCityCounts.get(cityKey) || 0) + 1);
    }

    const vibeKey = resolvePrimaryVibeKey(place, { includeTypeFallback: true });
    if (vibeKey) {
      savedVibeCounts.set(vibeKey, (savedVibeCounts.get(vibeKey) || 0) + 1);
    }
  });

  (followingFeedItems || []).forEach((item) => {
    const cityKey = normalizeCityKey(item.city);
    if (!cityKey) return;
    trustedCityCounts.set(cityKey, (trustedCityCounts.get(cityKey) || 0) + 1);
  });

  const topSavedCity = [...savedCityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const topTrustedCity = [...trustedCityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const topVibeKey = [...savedVibeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const recommendedPlaces = (places || [])
    .filter((place) => !favoriteIdSet.has(String(place.id)) && !blockedPlaces.has(String(place.id)))
    .map((place) => {
      const cityKey = normalizeCityKey(place.city);
      const placeVibe = resolvePrimaryVibeKey(place, { includeTypeFallback: true });
      const placeType = String(place.type || "").trim().toLowerCase();
      let score = 0;
      if (cityKey && cityKey === topSavedCity) score += modeWeights.savedCity;
      if (cityKey && cityKey === topTrustedCity) score += modeWeights.trustedCity;
      if (topVibeKey && placeVibe && placeVibe === topVibeKey) score += modeWeights.vibe;
      score += Math.min(Number(place.reviewCount || 0), 20) * modeWeights.reviews;
      score += Number(place.avgRating || 0) * modeWeights.rating;
      if (["cafe", "bar", "hotel"].includes(placeType)) score += modeWeights.typeSafe;
      if (["club", "sauna", "cruise_club"].includes(placeType)) score += modeWeights.typePeak;

      return {
        kind: "place",
        id: String(place.id),
        city: place.city || "",
        name: place.name || "Place",
        subtitle: resolvePrimaryVibeLabel(place, { includeTypeFallback: true, fallback: "Venue" }),
        score,
        reasonBase:
          cityKey && cityKey === topSavedCity
            ? "Matches your strongest saved city signal."
            : cityKey && cityKey === topTrustedCity
              ? "Trending inside your trusted network."
              : topVibeKey && placeVibe === topVibeKey
                ? "Aligned with your saved vibe pattern."
                : "Strong quality signal from reviews.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recommendedEvents = (events || [])
    .filter((event) => !favoriteIdSet.has(`event-${event.id}`) && !blockedEvents.has(String(event.id)))
    .map((event) => {
      const cityKey = normalizeCityKey(event.city);
      const eventDate = new Date(event.date || "");
      const now = new Date();
      const daysUntil = Number.isNaN(eventDate.getTime())
        ? 120
        : Math.max(0, Math.round((eventDate.getTime() - now.getTime()) / 86400000));

      let score = 0;
      if (cityKey && cityKey === topSavedCity) score += modeWeights.savedCity - 1;
      if (cityKey && cityKey === topTrustedCity) score += modeWeights.trustedCity;
      score += Math.max(0, 40 - daysUntil) * modeWeights.eventSoon;

      return {
        kind: "event",
        id: String(event.id),
        city: event.city || "",
        name: event.name || "Event",
        subtitle: formatDate(event.date),
        score,
        reasonBase:
          cityKey && cityKey === topSavedCity
            ? "Upcoming in your saved city pattern."
            : cityKey && cityKey === topTrustedCity
              ? "Upcoming where your trusted members are active."
              : "Strong timing for your next plan window.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return [...recommendedPlaces, ...recommendedEvents]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      reason:
        recommendationMode === "safe"
          ? `${item.reasonBase} Prioritizing safer, lower-friction flow.`
          : recommendationMode === "peak"
            ? `${item.reasonBase} Prioritizing peak energy and late momentum.`
            : `${item.reasonBase} Balanced between comfort and intensity.`,
    }));
}

export function computeWeeklyDigest({
  followingFeedItems = [],
  events = [],
  allCities = [],
  totalCities = 0,
  nowTs = Date.now(),
  normalizeCityKey,
  isWithinDays,
  formatWeekRange,
}) {
  const weekAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
  const followingThisWeek = followingFeedItems.filter((item) => {
    const value = new Date(item.date || "").getTime();
    return Number.isFinite(value) && value >= weekAgo;
  });

  const upcomingInSavedCities = events
    .filter((event) => {
      const cityKey = normalizeCityKey(event.city);
      return allCities.some((city) => normalizeCityKey(city) === cityKey) && isWithinDays(event.date, 10);
    })
    .slice(0, 3);

  const newCityTarget = Math.max(0, 5 - totalCities);
  const topFollowingCity =
    [...new Set(followingThisWeek.map((item) => item.city).filter(Boolean))][0] || "";

  return {
    weekLabel: formatWeekRange(new Date()),
    followingThisWeekCount: followingThisWeek.length,
    topFollowingCity,
    upcomingInSavedCities,
    newCityTarget,
  };
}

export function computeMomentumMilestones({
  checkins = [],
  totalPlaces = 0,
  normalizeCityKey,
}) {
  const checkinCount = checkins.length;
  const checkinCityCount = new Set(
    checkins.map((item) => normalizeCityKey(item.city)).filter(Boolean)
  ).size;
  const weekendActivityCount = new Set(
    checkins
      .map((item) => {
        const date = new Date(item.checkedInAt || item.createdAt || "");
        if (Number.isNaN(date.getTime())) return "";
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })
      .filter(Boolean)
  ).size;

  const items = [
    {
      id: "first-checkin",
      label: "First check-in",
      current: checkinCount,
      target: 1,
    },
    {
      id: "cities-5",
      label: "5 cities explored",
      current: checkinCityCount,
      target: 5,
    },
    {
      id: "venues-10",
      label: "10 places saved",
      current: totalPlaces,
      target: 10,
    },
    {
      id: "weekends-3",
      label: "3 active days",
      current: weekendActivityCount,
      target: 3,
    },
  ].map((item) => ({
    ...item,
    done: item.current >= item.target,
    progress: Math.max(0, Math.min(1, item.current / item.target)),
  }));

  const completed = items.filter((item) => item.done).length;
  const overallProgress = items.length ? completed / items.length : 0;
  const nextMilestone = items.find((item) => !item.done) || null;

  return {
    items,
    completed,
    total: items.length,
    overallProgress,
    nextMilestone,
  };
}

export function computeContributionCountsFromCollections({
  stories = [],
  guides = [],
  ideas = [],
  topics = [],
  memberIdentity = "",
}) {
  const me = String(memberIdentity || "").trim().toLowerCase();
  if (!me) {
    return {
      stories: 0,
      guides: 0,
      ideas: 0,
      topics: 0,
      total: 0,
    };
  }

  const byAuthor = (item) => String(item?.author || "").trim().toLowerCase() === me;
  const mineStories = stories.filter(byAuthor).length;
  const mineGuides = guides.filter(byAuthor).length;
  const mineIdeas = ideas.filter(byAuthor).length;
  const mineTopics = topics.filter(byAuthor).length;

  return {
    stories: mineStories,
    guides: mineGuides,
    ideas: mineIdeas,
    topics: mineTopics,
    total: mineStories + mineGuides + mineIdeas + mineTopics,
  };
}

export function computePlannerCities({ configCities = [], places = [], events = [] }) {
  const dataCities = [...new Set((places || []).concat(events || []).map((item) => item?.city).filter(Boolean))];
  return [...new Set([...(configCities || []), ...dataCities])].sort((a, b) => a.localeCompare(b));
}
