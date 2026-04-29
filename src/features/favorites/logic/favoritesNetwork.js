export function buildBlockedLookup(blockedItems = []) {
  return {
    places: new Set(
      (blockedItems || [])
        .filter((item) => item.targetType === "place")
        .map((item) => String(item.targetId))
    ),
    events: new Set(
      (blockedItems || [])
        .filter((item) => item.targetType === "event")
        .map((item) => String(item.targetId))
    ),
  };
}

export function normalizeFollowingTargetIds(followingUserIds = []) {
  return [...new Set((followingUserIds || []).map((id) => String(id)).filter(Boolean))];
}

export function mapProfileDisplayNamesByUserId(profileRows = []) {
  return new Map(
    (Array.isArray(profileRows) ? profileRows : []).map((row) => [
      String(row.user_id || ""),
      String(row.display_name || "").trim() || "Member",
    ])
  );
}

export function mapPresenceByUserId(presenceRows = []) {
  const presenceMap = {};
  (Array.isArray(presenceRows) ? presenceRows : []).forEach((row) => {
    const userId = String(row.user_id || "");
    if (!userId) return;
    presenceMap[userId] = {
      isOnline: Boolean(row.is_online),
      lastSeenAt: row.last_seen_at || null,
    };
  });
  return presenceMap;
}

export function mapFollowingCheckinsWithOwnerNames({
  checkinRows = [],
  displayNameByUserId = new Map(),
  mapCheckinRow,
}) {
  return (Array.isArray(checkinRows) ? checkinRows : []).map((row) => {
    const normalized = mapCheckinRow(row);
    const ownerId = String(row.user_id || "");
    return {
      ...normalized,
      ownerUserId: ownerId,
      ownerName: displayNameByUserId.get(ownerId) || "Member",
    };
  });
}

export function hasTrustNetworkMissingTables({
  followingError,
  feedError,
  isMissingTableError,
}) {
  return isMissingTableError(followingError) || isMissingTableError(feedError);
}

export function normalizeTrustNetworkRows({
  leaderboardRows = [],
  followingRows = [],
  feedRows = [],
}) {
  const members = Array.isArray(leaderboardRows) ? leaderboardRows : [];
  const follows = Array.isArray(followingRows) ? followingRows : [];
  const feed = Array.isArray(feedRows) ? feedRows : [];

  return {
    members,
    followingUserIds: follows.map((row) => String(row.followed_user_id || "")).filter(Boolean),
    feedRows: feed,
  };
}

export function normalizeCheckins(rows = [], mapCheckinRow) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => mapCheckinRow(row))
    .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0));
}
