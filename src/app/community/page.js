"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../signal-motion.css";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { cityConfig } from "@/lib/cities";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import {
  addReport,
  getBlockedItems,
  subscribeBlockedItems,
  syncBlockedItemsFromCloud,
} from "@/lib/moderation";
import { useActionToast } from "@/lib/useActionToast";
import { trackKpiEvent } from "@/lib/analytics";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { resolveAdminAccess } from "@/lib/adminAccess";
import ActionToast from "@/components/ui/ActionToast";
import PageControls from "@/components/ui/PageControls";
import PageOpeningState from "@/components/ui/PageOpeningState";

const MEMBER_AVATAR_BUCKET = "member-avatars";

const KEYS = {
  stories: "qa_community_stories",
  guides: "qa_community_guides",
  jobs: "qa_community_jobs",
  topics: "qa_community_topics",
  messages: "qa_community_messages",
  messageArchive: "qa_community_messages_archive",
  ideas: "qa_community_ideas",
};

const baseStories = [
  { id: "s1", title: "First Sunday in Berlin", city: "Berlin", author: "Alex", category: "Nightlife", excerpt: "The energy shifted after midnight and felt more communal than performative.", body: "I expected intensity and found connection. The night felt less about spectacle and more about finding your people.", createdAt: "2026-04-02T20:30:00.000Z" },
  { id: "s2", title: "A softer side of Amsterdam", city: "Amsterdam", author: "Mika", category: "Daytime", excerpt: "Cafe culture and queer conversation made the city feel easy to enter.", body: "The strongest part of the city was daytime. Places where you could stay longer gave the best read of the local vibe.", createdAt: "2026-04-04T10:15:00.000Z" },
];

const baseGuides = [
  { id: "g1", title: "Best queer weekend in Berlin", city: "Berlin", author: "Atlas Member", focus: "Weekend flow", summary: "A flow from Friday arrival to Sunday peak energy.", content: "Start softer on Friday, keep Saturday open, and save your energy for Sunday. Build the weekend around neighborhoods.", createdAt: "2026-04-01T12:00:00.000Z" },
  { id: "g2", title: "Where to go if you're shy", city: "Multi-city", author: "Nico", focus: "Low-pressure starts", summary: "Softer venues and lower-pressure starts in major cities.", content: "Begin with cafes, terraces, and earlier bars. They make it easier to read the city before committing to nightlife.", createdAt: "2026-04-03T09:00:00.000Z" },
];

const baseJobs = [];

const baseTopics = [
  { id: "t1", name: "Berlin this weekend", mood: "Active now", description: "Plans, crowd energy, and where members are heading." },
  { id: "t2", name: "Best places to go solo", mood: "Helpful", description: "Advice for people traveling or going out alone." },
  { id: "t3", name: "What should Queer Atlas add next?", mood: "Feedback", description: "Feature requests and product thinking from members." },
];

const baseMessages = {
  t1: [
    { id: "m1", author: "Alex", text: "Berlin feels especially busy this Sunday. Curious which areas feel strongest right now.", createdAt: "2026-04-07T18:40:00.000Z" },
    { id: "m2", author: "Noah", text: "Schoneberg earlier, Friedrichshain later. Depends if you want social or more intense energy.", createdAt: "2026-04-07T18:54:00.000Z" },
  ],
  t2: [{ id: "m3", author: "Mika", text: "Daytime spots are underrated. They make it easier to read a city before committing to nightlife.", createdAt: "2026-04-06T11:00:00.000Z" }],
  t3: [{ id: "m4", author: "Rae", text: "Neighborhood notes on place pages would make a huge difference.", createdAt: "2026-04-04T09:30:00.000Z" }],
};

const baseIdeas = [
  { id: "i1", text: "Member follow lists for trusted reviewers", votes: 14, author: "Atlas Member", createdAt: "2026-04-01T08:00:00.000Z" },
  { id: "i2", text: "Neighborhood safety notes on city pages", votes: 21, author: "Noah", createdAt: "2026-04-03T16:00:00.000Z" },
];

function createClientId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStored(key, fallback) {
  return readLocalJson(key, fallback);
}

const MAX_MESSAGES_PER_TOPIC = 100;
const MAX_TOPICS = 120;
const TOPIC_RETENTION_DAYS = 365;
const MEMBER_SEARCH_PAGE_SIZE = 18;
const JOB_REVIEW_STATUSES = ["pending", "published", "rejected", "expired", "removed"];
const JOB_LOCATION_MODES = ["On-site", "Hybrid", "Remote"];
const JOB_EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Freelance", "Contract", "Internship", "Volunteer"];
const JOB_CATEGORIES = ["Venue / nightlife", "Events", "Community org", "Creative", "Hospitality", "Tech", "Health", "Operations", "Other"];
const REPORT_REASON_OPTIONS = [
  { value: "1", label: "Safety issue" },
  { value: "2", label: "Wrong info" },
  { value: "3", label: "Spam or scam" },
  { value: "4", label: "Abuse or hate" },
  { value: "5", label: "Other issue" },
];

function normalizeMemberKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 @._-]/g, "");
}

function isGenericMemberName(value = "") {
  return normalizeMemberKey(value) === "member";
}

function formatCityLabel(value = "") {
  return String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function mapStoryRow(row) {
  return {
    id: String(row.id),
    title: row.title || "",
    city: row.city || "",
    author: row.author || "Member",
    authorUserId: row.user_id ? String(row.user_id) : "",
    authorEmail: row.created_by_email || "",
    category: row.category || "Experience",
    excerpt: row.excerpt || "",
    body: row.body || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapGuideRow(row) {
  return {
    id: String(row.id),
    title: row.title || "",
    city: row.city || "Multi-city",
    author: row.author || "Member",
    authorUserId: row.user_id ? String(row.user_id) : "",
    authorEmail: row.created_by_email || "",
    focus: row.focus || "Community",
    summary: row.summary || "",
    content: row.content || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapJobRow(row) {
  return {
    id: String(row.id),
    title: row.title || "",
    organizationName: row.organization_name || "",
    organizationUrl: row.organization_url || "",
    city: row.city || "",
    country: row.country || "",
    locationMode: row.location_mode || "On-site",
    employmentType: row.employment_type || "Part-time",
    category: row.category || "Other",
    compensation: row.compensation || "",
    description: row.description || "",
    requirements: row.requirements || "",
    applyUrl: row.apply_url || "",
    applyEmail: row.apply_email || "",
    status: JOB_REVIEW_STATUSES.includes(row.status) ? row.status : "pending",
    verificationStatus: row.verification_status || "unverified",
    author: row.author || "Member",
    authorUserId: row.user_id ? String(row.user_id) : "",
    authorEmail: row.created_by_email || "",
    createdAt: row.created_at || new Date().toISOString(),
    publishedAt: row.published_at || "",
    expiresAt: row.expires_at || "",
  };
}

function mapTopicRow(row) {
  return {
    id: String(row.id),
    name: row.name || "",
    mood: row.mood || "Fresh",
    description: row.description || "",
    author: row.author || "Member",
    authorUserId: row.user_id ? String(row.user_id) : "",
    authorEmail: row.created_by_email || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapIdeaRow(row) {
  return {
    id: String(row.id),
    text: row.text || "",
    votes: Number(row.votes || 0),
    author: row.author || "Member",
    authorUserId: row.user_id ? String(row.user_id) : "",
    authorEmail: row.created_by_email || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapMessages(rows, topics) {
  const base = {};
  topics.forEach((topic) => {
    base[String(topic.id)] = [];
  });

  (rows || []).forEach((row) => {
    const topicKey = String(row.topic_id || "");
    if (!topicKey) return;
    if (!base[topicKey]) base[topicKey] = [];

    base[topicKey].push({
      id: String(row.id),
      author: row.author || "Member",
      text: row.text || "",
      createdAt: row.created_at || new Date().toISOString(),
    });
  });

  return base;
}

function pruneTopicMessages(rows = [], max = MAX_MESSAGES_PER_TOPIC) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length <= max) {
    return { visible: safeRows, archived: [] };
  }
  const keepFrom = safeRows.length - max;
  return {
    visible: safeRows.slice(keepFrom),
    archived: safeRows.slice(0, keepFrom),
  };
}

function applyTopicPolicy(inputTopics = []) {
  const cutoff = Date.now() - TOPIC_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return [...(Array.isArray(inputTopics) ? inputTopics : [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((topic) => {
      const created = new Date(topic.createdAt).getTime();
      return Number.isFinite(created) ? created >= cutoff : true;
    })
    .slice(0, MAX_TOPICS);
}

function mergeMessageMaps(primary = {}, fallback = {}, topics = []) {
  const topicIds = [...new Set(topics.map((topic) => String(topic.id)))];
  const result = {};

  topicIds.forEach((topicId) => {
    const first = Array.isArray(primary[topicId]) ? primary[topicId] : [];
    const second = Array.isArray(fallback[topicId]) ? fallback[topicId] : [];

    const seen = new Set();
    const merged = [];
    [...first, ...second].forEach((entry) => {
      const signature = String(entry.id || `${entry.author}|${entry.text}|${entry.createdAt}`);
      if (seen.has(signature)) return;
      seen.add(signature);
      merged.push(entry);
    });

    result[topicId] = merged;
  });

  return result;
}

function timeAgo(value) {
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.round(diffHours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function formatJobLocation(job) {
  const locationParts = [job.city, job.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location flexible";
  return `${job.locationMode || "On-site"} | ${location}`;
}

function formatJobStatus(status = "pending") {
  const safeStatus = String(status || "pending").toLowerCase();
  if (safeStatus === "published") return "Published";
  if (safeStatus === "rejected") return "Rejected";
  if (safeStatus === "expired") return "Expired";
  if (safeStatus === "removed") return "Removed";
  return "Pending review";
}

function isExpiredJob(job) {
  if (!job?.expiresAt) return false;
  const expires = new Date(job.expiresAt).getTime();
  return Number.isFinite(expires) && expires < Date.now();
}

function normalizeExternalUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function normalizeEmail(value = "") {
  const raw = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : "";
}

function normalizeReportReason(input = "") {
  const value = String(input || "").trim();
  if (!value) return "";
  const map = {
    "1": "Safety issue",
    "2": "Wrong info",
    "3": "Spam or scam",
    "4": "Abuse or hate",
    "5": "Other issue",
  };
  return map[value] || value;
}

function isMissingDbObjectError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const text = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();
  return (
    code === "42P01" ||
    code === "42883" ||
    (text.includes("does not exist") && (text.includes("function") || text.includes("relation")))
  );
}

function isCommunityIdentityColumnMissingError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return (code === "42703" || code === "PGRST204") &&
    (message.includes("user_id") || message.includes("created_by_email"));
}

async function insertCommunityRowWithIdentity(table, payload) {
  let response = await supabase.from(table).insert([payload]).select("*").single();
  if (!response.error || !isCommunityIdentityColumnMissingError(response.error)) {
    return response;
  }

  const legacyPayload = { ...payload };
  delete legacyPayload.user_id;
  delete legacyPayload.created_by_email;
  response = await supabase.from(table).insert([legacyPayload]).select("*").single();
  return response;
}

function formatMemberSeen(lastSeenAt = "", isOnline = false) {
  if (isOnline) return "Active now";
  if (!lastSeenAt) return "Seen unknown";
  const safe = new Date(lastSeenAt);
  if (Number.isNaN(safe.getTime())) return "Seen recently";
  return `Seen ${safe.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function mapMemberSearchRow(row) {
  return {
    user_id: String(row?.user_id || ""),
    display_name: String(row?.display_name || "Member"),
    home_city: String(row?.home_city || ""),
    resident_country: String(row?.resident_country || ""),
    pronouns: String(row?.pronouns || ""),
    title: String(row?.title || ""),
    rank: Number(row?.rank || 999999),
    score: Number(row?.score || 0),
    city_count: Number(row?.city_count || 0),
    is_following: Boolean(row?.is_following),
    follows_you: Boolean(row?.follows_you),
    mutual_count: Number(row?.mutual_count || 0),
    is_online: Boolean(row?.is_online),
    last_seen_at: String(row?.last_seen_at || ""),
    trusted_contributor: Boolean(row?.trusted_contributor),
    avatar_url: String(row?.avatar_url || "").trim(),
    avatar_path: String(row?.avatar_path || "").trim(),
  };
}

function isAvatarFieldMissingError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  if (code === "42703" || code === "PGRST204") return true;
  return message.includes("avatar_") && (message.includes("does not exist") || message.includes("schema cache"));
}

function resolveAvatarUrlFromProfile(profileLike) {
  const direct = String(profileLike?.avatar_url || "").trim();
  if (direct) return direct;
  const path = String(profileLike?.avatar_path || "").trim();
  if (!path) return "";
  return supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
}

function Field({ value, onChange, placeholder, area = false }) {
  if (area) {
    return <textarea value={value} onChange={onChange} placeholder={placeholder} className="h-28 w-full rounded-xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/16" />;
  }
  return <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/16" />;
}

export default function CommunityPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isMember, memberName, user, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stories, setStories] = useState(baseStories);
  const [guides, setGuides] = useState(baseGuides);
  const [jobs, setJobs] = useState(baseJobs);
  const [topics, setTopics] = useState(baseTopics);
  const [messages, setMessages] = useState(baseMessages);
  const [messageArchive, setMessageArchive] = useState(() =>
    readStored(KEYS.messageArchive, {}),
  );
  const [ideas, setIdeas] = useState(baseIdeas);
  const [topicId, setTopicId] = useState("t1");
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [expandedStoryIds, setExpandedStoryIds] = useState([]);
  const [expandedGuideIds, setExpandedGuideIds] = useState([]);
  const [expandedJobIds, setExpandedJobIds] = useState([]);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [storyForm, setStoryForm] = useState({ title: "", city: "", category: "Experience", excerpt: "", body: "" });
  const [guideForm, setGuideForm] = useState({ title: "", city: "", focus: "", summary: "", content: "" });
  const [jobForm, setJobForm] = useState({
    title: "",
    organizationName: "",
    organizationUrl: "",
    city: "",
    country: "",
    locationMode: "On-site",
    employmentType: "Part-time",
    category: "Venue / nightlife",
    compensation: "",
    description: "",
    requirements: "",
    applyUrl: "",
    applyEmail: "",
  });
  const [jobCityFilter, setJobCityFilter] = useState("");
  const [jobModeFilter, setJobModeFilter] = useState("all");
  const [messageForm, setMessageForm] = useState({ text: "" });
  const [topicForm, setTopicForm] = useState({ name: "", mood: "Fresh", description: "" });
  const [ideaForm, setIdeaForm] = useState({ text: "", category: "Feature" });
  const [syncError, setSyncError] = useState("");
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [leaderboard, setLeaderboard] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberSearchCity, setMemberSearchCity] = useState("");
  const [memberSearchSort, setMemberSearchSort] = useState("best");
  const [memberSearchScope, setMemberSearchScope] = useState("all");
  const [memberSearchRows, setMemberSearchRows] = useState([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchHasMore, setMemberSearchHasMore] = useState(false);
  const [memberSearchOffset, setMemberSearchOffset] = useState(0);
  const [memberSearchWarning, setMemberSearchWarning] = useState("");
  const [memberSearchBusyById, setMemberSearchBusyById] = useState({});
  const [activeCommunityPanel, setActiveCommunityPanel] = useState("discovery");
  const [communityFeedMode, setCommunityFeedMode] = useState("all");
  const [reportModal, setReportModal] = useState({
    open: false,
    targetType: "",
    targetId: "",
    title: "",
    reasonKey: "1",
    details: "",
  });
  const { toast, showToast } = useActionToast();
  const memberUserId = String(user?.id || "");
  const memberSearchCacheRef = useRef(new Map());
  const memberSearchSentinelRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const communityControlsRef = useRef(null);
  const communityControlButtonsRef = useRef({});

  useEffect(() => {
    const button = communityControlButtonsRef.current[activeCommunityPanel];
    if (!button || typeof button.scrollIntoView !== "function") return;
    button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCommunityPanel]);

  const hydrateMemberRowsWithAvatars = useCallback(async (rows = []) => {
    const userIds = [
      ...new Set(
        (rows || []).map((entry) => String(entry?.user_id || "").trim()).filter(Boolean)
      ),
    ];
    if (userIds.length === 0) return rows;
    const { data: profiles } = await supabase
      .from("member_profiles")
      .select("user_id,avatar_url,avatar_path")
      .in("user_id", userIds);

    const avatarByUserId = {};
    (profiles || []).forEach((profile) => {
      const profileUserId = String(profile?.user_id || "").trim();
      if (!profileUserId) return;
      avatarByUserId[profileUserId] = resolveAvatarUrlFromProfile(profile);
    });

    return (rows || []).map((entry) => ({
      ...entry,
      avatar_url:
        avatarByUserId[String(entry.user_id || "")] || resolveAvatarUrlFromProfile(entry),
    }));
  }, []);

  const loadCommunityData = useCallback(async () => {
    setSyncError("");
    const localStories = readStored(KEYS.stories, baseStories);
    const localGuides = readStored(KEYS.guides, baseGuides);
    const localJobs = readStored(KEYS.jobs, baseJobs);
    const localTopics = applyTopicPolicy(readStored(KEYS.topics, baseTopics));
    const localMessages = readStored(KEYS.messages, baseMessages);
    const localIdeas = readStored(KEYS.ideas, baseIdeas);
    const localArchive = readStored(KEYS.messageArchive, {});

    const [storiesRes, guidesRes, jobsRes, topicsRes, messagesRes, ideasRes, leaderboardRes] = await Promise.all([
      supabase.from("community_stories").select("*").order("created_at", { ascending: false }),
      supabase.from("community_guides").select("*").order("created_at", { ascending: false }),
      supabase.from("community_jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("community_topics").select("*").order("created_at", { ascending: false }),
      supabase.from("community_messages").select("*").order("created_at", { ascending: true }),
      supabase.from("community_ideas").select("*").order("created_at", { ascending: false }),
      supabase.from("qa_member_leaderboard").select("*").order("rank", { ascending: true }).limit(200),
    ]);

    const errorParts = [];
    if (storiesRes.error) errorParts.push("stories");
    if (guidesRes.error) errorParts.push("guides");
    if (jobsRes.error) errorParts.push("jobs");
    if (topicsRes.error) errorParts.push("topics");
    if (messagesRes.error) errorParts.push("messages");
    if (ideasRes.error) errorParts.push("ideas");

    const nextStories = storiesRes.error
      ? localStories
      : (storiesRes.data || []).length > 0
        ? (storiesRes.data || []).map(mapStoryRow)
        : baseStories;
    const nextGuides = guidesRes.error
      ? localGuides
      : (guidesRes.data || []).length > 0
        ? (guidesRes.data || []).map(mapGuideRow)
        : baseGuides;
    const nextJobs = jobsRes.error
      ? localJobs
      : (jobsRes.data || []).map(mapJobRow);
    const nextTopics = applyTopicPolicy(
      topicsRes.error
        ? localTopics
        : (topicsRes.data || []).length > 0
          ? (topicsRes.data || []).map(mapTopicRow)
          : baseTopics
    );
    const nextIdeas = ideasRes.error
      ? localIdeas
      : (ideasRes.data || []).length > 0
        ? (ideasRes.data || []).map(mapIdeaRow)
        : baseIdeas;
    const nextMessages = messagesRes.error
      ? localMessages
      : mapMessages(messagesRes.data || [], nextTopics);
    const mergedMessages = mergeMessageMaps(nextMessages, localMessages, nextTopics);
    const nextArchive = { ...localArchive };
    const cappedMessages = {};
    Object.keys(mergedMessages).forEach((topicKey) => {
      const pruned = pruneTopicMessages(mergedMessages[topicKey], MAX_MESSAGES_PER_TOPIC);
      cappedMessages[topicKey] = pruned.visible;
      if (pruned.archived.length > 0) {
        nextArchive[topicKey] = [...(nextArchive[topicKey] || []), ...pruned.archived].slice(-500);
      }
    });
    const nextLeaderboard = Array.isArray(leaderboardRes?.data) ? leaderboardRes.data : [];
    const leaderboardUserIds = [
      ...new Set(
        nextLeaderboard
          .map((entry) => String(entry?.user_id || "").trim())
          .filter(Boolean)
      ),
    ];
    const nextLeaderboardDisplayNameByUserId = {};
    if (leaderboardUserIds.length > 0) {
      const { data: leaderboardProfiles } = await supabase
        .from("member_profiles")
        .select("user_id,display_name")
        .in("user_id", leaderboardUserIds);
      (leaderboardProfiles || []).forEach((profile) => {
        const profileUserId = String(profile?.user_id || "").trim();
        if (!profileUserId) return;
        const profileDisplayName = String(profile?.display_name || "").trim();
        if (profileDisplayName) {
          nextLeaderboardDisplayNameByUserId[profileUserId] = profileDisplayName;
        }
      });
    }
    const nextLeaderboardRpcNameByUserId = {};
    if (memberUserId) {
      const { data: searchRows, error: searchError } = await supabase.rpc("qa_search_members", {
        search_query: "",
        city_filter: "",
        sort_mode: "best",
        friends_only: false,
        result_limit: 300,
        result_offset: 0,
      });
      if (!searchError) {
        (searchRows || []).forEach((row) => {
          const rowUserId = String(row?.user_id || "").trim();
          const rowDisplayName = String(row?.display_name || "").trim();
          if (!rowUserId || !rowDisplayName) return;
          nextLeaderboardRpcNameByUserId[rowUserId] = rowDisplayName;
        });
      }
    }
    const resolvedLeaderboard = nextLeaderboard.map((entry) => {
      const profileName = String(
        nextLeaderboardDisplayNameByUserId[String(entry?.user_id || "").trim()] || ""
      ).trim();
      const rpcName = String(
        nextLeaderboardRpcNameByUserId[String(entry?.user_id || "").trim()] || ""
      ).trim();
      const currentName = String(entry?.display_name || "").trim();
      const safeName = profileName
        || rpcName
        || (!isGenericMemberName(currentName) ? currentName : "")
        || "Member";
      return {
        ...entry,
        display_name: safeName,
      };
    });

    setStories(nextStories);
    setGuides(nextGuides);
    setJobs(nextJobs);
    setTopics(nextTopics);
    setMessages(Object.keys(cappedMessages).length > 0 ? cappedMessages : baseMessages);
    setMessageArchive(nextArchive);
    setIdeas(nextIdeas);
    setLeaderboard(resolvedLeaderboard);
    if (errorParts.length > 0) {
      setSyncError(`Partial cloud sync: ${errorParts.join(", ")} using local fallback.`);
    }
  }, [memberUserId]);

  useEffect(() => {
    if (!isReady || !isMember) return () => {};

    const channel = supabase
      .channel("community-live-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_topics" },
        () => {
          queueMicrotask(async () => {
            await loadCommunityData();
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_messages" },
        () => {
          queueMicrotask(async () => {
            await loadCommunityData();
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_jobs" },
        () => {
          queueMicrotask(async () => {
            await loadCommunityData();
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isReady, isMember, loadCommunityData]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isMember) {
      writeLocalValue("qa_redirect", "/community");
      writeLocalValue("qa_post_login_target", "/community");
      queueMicrotask(() => {
        setIsReady(true);
      });
      return;
    }

    queueMicrotask(async () => {
      await loadCommunityData();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadCommunityData]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.stories, stories);
    writeLocalJson(KEYS.guides, guides);
    writeLocalJson(KEYS.jobs, jobs);
    writeLocalJson(KEYS.topics, topics);
    writeLocalJson(KEYS.messages, messages);
    writeLocalJson(KEYS.messageArchive, messageArchive);
    writeLocalJson(KEYS.ideas, ideas);
  }, [isReady, isMember, stories, guides, jobs, topics, messages, messageArchive, ideas]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    let active = true;

    queueMicrotask(async () => {
      const synced = await syncBlockedItemsFromCloud();
      if (active) {
        setBlockedItems(synced.blockedItems || []);
      }
    });

    return () => {
      active = false;
    };
  }, [isReady, isMember]);

  useEffect(() => {
    if (!isReady || !isMember) return () => {};
    return subscribeBlockedItems((items) => {
      setBlockedItems(items || []);
    });
  }, [isReady, isMember]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.email) return;
    let active = true;

    queueMicrotask(async () => {
      const { isAdmin: adminState } = await resolveAdminAccess({
        email: user?.email,
      });

      if (!active) return;
      setIsAdmin(adminState);
    });

    return () => {
      active = false;
    };
  }, [isReady, isMember, user?.email]);

  const loadMemberDiscovery = useCallback(async ({
    offset = 0,
    append = false,
    force = false,
  } = {}) => {
    if (!isReady || !isMember || !memberUserId) return;
    const query = String(memberSearchTerm || "").trim();
    const city = String(memberSearchCity || "").trim();
    const safeOffset = Math.max(0, Number(offset || 0));
    const safeSort = String(memberSearchSort || "best").trim().toLowerCase();
    const friendsOnly = memberSearchScope === "friends";
    const cacheKey = JSON.stringify({
      query: query.toLowerCase(),
      city: city.toLowerCase(),
      sort: safeSort,
      scope: memberSearchScope,
      offset: safeOffset,
      size: MEMBER_SEARCH_PAGE_SIZE,
    });

    if (!force && memberSearchCacheRef.current.has(cacheKey)) {
      const cached = memberSearchCacheRef.current.get(cacheKey);
      setMemberSearchWarning(cached.warning || "");
      setMemberSearchHasMore(Boolean(cached.hasMore));
      setMemberSearchOffset(safeOffset);
      setMemberSearchRows((current) => {
        if (!append) return cached.rows;
        const seen = new Set(current.map((row) => row.user_id));
        const merged = [...current];
        cached.rows.forEach((row) => {
          if (seen.has(row.user_id)) return;
          seen.add(row.user_id);
          merged.push(row);
        });
        return merged;
      });
      return;
    }

    setMemberSearchLoading(true);
    if (!append) setMemberSearchWarning("");

    const requestLimit = MEMBER_SEARCH_PAGE_SIZE + 1;
    const { data, error } = await supabase.rpc("qa_search_members", {
      search_query: query,
      city_filter: city,
      sort_mode: safeSort,
      friends_only: friendsOnly,
      result_limit: requestLimit,
      result_offset: safeOffset,
    });

    if (error) {
      const fallbackRows = (leaderboard || [])
        .filter((entry) => String(entry.user_id || "") !== memberUserId)
        .map((entry) =>
          mapMemberSearchRow({
            user_id: entry.user_id,
            display_name: entry.display_name,
            title: entry.title,
            rank: entry.rank,
            score: entry.score,
            city_count: entry.city_count,
            is_following: false,
            follows_you: false,
            mutual_count: 0,
            is_online: false,
            last_seen_at: "",
            trusted_contributor: false,
          })
        )
        .filter((entry) => {
          const queryLower = query.toLowerCase();
          const cityLower = city.toLowerCase();
          const queryPass =
            !queryLower ||
            entry.display_name.toLowerCase().includes(queryLower) ||
            entry.home_city.toLowerCase().includes(queryLower) ||
            entry.resident_country.toLowerCase().includes(queryLower);
          const cityPass = !cityLower || entry.home_city.toLowerCase() === cityLower;
          return queryPass && cityPass;
        })
        .slice(0, MEMBER_SEARCH_PAGE_SIZE);

      const warning = isMissingDbObjectError(error)
        ? "Member search backend is not migrated yet. Run supabase/community-member-search-v1.sql for full results."
        : "Live member search is temporarily unavailable. Showing fallback ranking.";

      const fallbackRowsHydrated = await hydrateMemberRowsWithAvatars(fallbackRows);
      setMemberSearchWarning(warning);
      setMemberSearchHasMore(false);
      setMemberSearchOffset(0);
      setMemberSearchRows(fallbackRowsHydrated);
      memberSearchCacheRef.current.set(cacheKey, {
        rows: fallbackRowsHydrated,
        hasMore: false,
        warning,
      });
      setMemberSearchLoading(false);
      return;
    }

    const mapped = (data || []).map(mapMemberSearchRow);
    const hasMore = mapped.length > MEMBER_SEARCH_PAGE_SIZE;
    const visibleRows = hasMore ? mapped.slice(0, MEMBER_SEARCH_PAGE_SIZE) : mapped;
    const hydratedVisibleRows = await hydrateMemberRowsWithAvatars(visibleRows);

    setMemberSearchHasMore(hasMore);
    setMemberSearchOffset(safeOffset);
    setMemberSearchWarning("");
    setMemberSearchRows((current) => {
      if (!append) return hydratedVisibleRows;
      const seen = new Set(current.map((row) => row.user_id));
      const merged = [...current];
      hydratedVisibleRows.forEach((row) => {
        if (seen.has(row.user_id)) return;
        seen.add(row.user_id);
        merged.push(row);
      });
      return merged;
    });
    memberSearchCacheRef.current.set(cacheKey, {
      rows: hydratedVisibleRows,
      hasMore,
      warning: "",
    });
    setMemberSearchLoading(false);
  }, [
    isReady,
    isMember,
    memberUserId,
    memberSearchTerm,
    memberSearchCity,
    memberSearchSort,
    memberSearchScope,
    leaderboard,
    hydrateMemberRowsWithAvatars,
  ]);

  useEffect(() => {
    if (!isReady || !isMember || !memberUserId) return;
    const timer = setTimeout(() => {
      queueMicrotask(async () => {
        await loadMemberDiscovery({ offset: 0, append: false });
      });
    }, 240);
    return () => clearTimeout(timer);
  }, [
    isReady,
    isMember,
    memberUserId,
    memberSearchTerm,
    memberSearchCity,
    memberSearchSort,
    memberSearchScope,
    loadMemberDiscovery,
  ]);

  const loadMoreMemberDiscovery = useCallback(async () => {
    if (memberSearchLoading || !memberSearchHasMore) return;
    const nextOffset = memberSearchOffset + MEMBER_SEARCH_PAGE_SIZE;
    await loadMemberDiscovery({ offset: nextOffset, append: true });
  }, [memberSearchLoading, memberSearchHasMore, memberSearchOffset, loadMemberDiscovery]);

  useEffect(() => {
    const target = memberSearchSentinelRef.current;
    if (!target || memberSearchLoading || !memberSearchHasMore) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (!first?.isIntersecting) return;
      queueMicrotask(async () => {
        await loadMoreMemberDiscovery();
      });
    }, {
      rootMargin: "300px 0px",
      threshold: 0.01,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [memberSearchLoading, memberSearchHasMore, loadMoreMemberDiscovery]);

  useEffect(() => {
    if (activeCommunityPanel !== "chat") return;
    const node = chatMessagesRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [activeCommunityPanel, topicId, messages]);

  if (!isReady || !isMember) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening community..."
          subtitle="Loading stories, guides, and live member flow."
          tone="violet"
        />
      </main>
    );
  }

  const isBlocked = (targetType, targetId) =>
    blockedItems.some(
      (item) =>
        item.targetType === targetType &&
        String(item.targetId) === String(targetId)
    );

  const visibleStories = stories.filter((story) => !isBlocked("community-story", story.id));
  const visibleGuides = guides.filter((guide) => !isBlocked("community-guide", guide.id));
  const visibleJobs = jobs.filter((job) => {
    if (isBlocked("community-job", job.id)) return false;
    if (job.status === "removed") return false;
    if (isAdmin) return true;
    const isOwnJob =
      (job.authorUserId && memberUserId && String(job.authorUserId) === memberUserId) ||
      (normalizeMemberKey(job.authorEmail) && normalizeMemberKey(user?.email) && normalizeMemberKey(job.authorEmail) === normalizeMemberKey(user?.email));
    if (isOwnJob) return true;
    return job.status === "published" && !isExpiredJob(job);
  });
  const visibleIdeas = ideas.filter((idea) => !isBlocked("community-idea", idea.id));
  const visibleTopics = topics.filter((topic) => !isBlocked("community-topic", topic.id));

  const sortedStories = [...visibleStories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const sortedGuides = [...visibleGuides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const atlasCityLabels = Object.keys(cityConfig || {}).map(formatCityLabel);
  const jobCities = [
    ...new Set(
      [
        ...visibleJobs.map((job) => job.city),
        ...visibleStories.map((story) => story.city),
        ...visibleGuides.map((guide) => guide.city),
        ...memberSearchRows.map((row) => row.home_city),
        ...atlasCityLabels,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
  const publishedJobs = visibleJobs.filter((job) => job.status === "published" && !isExpiredJob(job));
  const pendingJobs = visibleJobs.filter((job) => job.status === "pending");
  const filteredJobs = publishedJobs.filter((job) => {
    const cityPass = !jobCityFilter || normalizeMemberKey(job.city) === normalizeMemberKey(jobCityFilter);
    const modePass = jobModeFilter === "all" || normalizeMemberKey(job.locationMode) === normalizeMemberKey(jobModeFilter);
    return cityPass && modePass;
  }).sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  const reviewJobs = pendingJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unifiedFeedItems = [...sortedStories.map((story) => ({
    id: `story-${story.id}`,
    type: "story",
    createdAt: story.createdAt,
    payload: story,
  })), ...sortedGuides.map((guide) => ({
    id: `guide-${guide.id}`,
    type: "guide",
    createdAt: guide.createdAt,
    payload: guide,
  }))].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredFeedItems = unifiedFeedItems.filter((item) => {
    if (communityFeedMode === "stories") return item.type === "story";
    if (communityFeedMode === "guides") return item.type === "guide";
    return true;
  });
  const sortedIdeas = [...visibleIdeas].sort((a, b) => b.votes - a.votes);
  const resolvedTopicId = visibleTopics.some((topic) => topic.id === topicId) ? topicId : visibleTopics[0]?.id;
  const activeTopic = visibleTopics.find((topic) => topic.id === resolvedTopicId) || null;
  const activeMessages = activeTopic
    ? (messages[activeTopic.id] || []).filter((message) => !isBlocked("community-message", message.id))
    : [];
  const busiestTopic = [...visibleTopics]
    .map((topic) => ({
      ...topic,
      replies: (messages[topic.id] || []).filter((message) => !isBlocked("community-message", message.id)).length,
    }))
    .sort((a, b) => b.replies - a.replies)[0];
  const rankMetaByAuthor = (() => {
    const map = new Map();
    leaderboard.forEach((entry) => {
      const authorKey = normalizeMemberKey(entry.display_name || "");
      if (!authorKey || map.has(authorKey)) return;
      map.set(authorKey, getMemberTitleMeta(entry.title));
    });
    return map;
  })();

  const getAuthorRankMeta = (authorName) =>
    rankMetaByAuthor.get(normalizeMemberKey(authorName || "")) || null;
  const getAuthorIdentityMeta = (authorName) => {
    const rankMeta = getAuthorRankMeta(authorName);
    if (rankMeta) return rankMeta;

    if (normalizeMemberKey(authorName) === normalizeMemberKey(memberName || "")) {
      return {
        label: "Member",
        icon: "*",
        iconClass: "text-white/65",
      };
    }

    return null;
  };

  const memberDiscoveryCities = (() => {
    const fromSearch = memberSearchRows.map((row) => row.home_city).filter(Boolean);
    const fromStories = visibleStories.map((story) => story.city).filter(Boolean);
    const fromGuides = visibleGuides.map((guide) => guide.city).filter(Boolean);
    const unique = [...new Set([...fromSearch, ...fromStories, ...fromGuides].map((value) => String(value).trim()).filter(Boolean))];
    return unique
      .map((value) => ({
        raw: value,
        normalized: normalizeMemberKey(value),
        label: formatCityLabel(value),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  const displayedMemberRows = memberSearchRows;

  const canDeleteTopic = (topic) => {
    if (!topic) return false;
    if (isAdmin) return true;
    if (topic.authorUserId && user?.id && String(topic.authorUserId) === String(user.id)) return true;

    const topicEmail = normalizeMemberKey(topic.authorEmail || "");
    const memberEmail = normalizeMemberKey(user?.email || "");
    if (topicEmail && memberEmail && topicEmail === memberEmail) return true;

    const authorKey = normalizeMemberKey(topic.author || "");
    const memberKey = normalizeMemberKey(memberName || "");
    const emailAlias = normalizeMemberKey(String(user?.email || "").split("@")[0] || "");
    return Boolean(authorKey) && (authorKey === memberKey || authorKey === emailAlias);
  };

  const deleteTopic = async (topic) => {
    if (!topic || !canDeleteTopic(topic)) {
      showToast("You can only delete your own topics.", { tone: "warn", duration: 2200 });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete topic "${topic.name}" and all its messages? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const topicIdValue = String(topic.id);

    setTopics((current) => current.filter((entry) => String(entry.id) !== topicIdValue));
    setMessages((current) => {
      const next = { ...current };
      delete next[topicIdValue];
      return next;
    });
    setMessageArchive((current) => {
      const next = { ...current };
      delete next[topicIdValue];
      return next;
    });
    setTopicId((current) => (String(current) === topicIdValue ? "" : current));

    const [messagesDeleteRes, topicDeleteRes] = await Promise.all([
      supabase.from("community_messages").delete().eq("topic_id", topicIdValue),
      supabase.from("community_topics").delete().eq("id", topicIdValue),
    ]);

    if (messagesDeleteRes.error || topicDeleteRes.error) {
      showToast("Topic removed locally. Cloud sync unavailable.", { tone: "info", duration: 2400 });
      setSyncError("Topic deletion synced locally. Some cloud cleanup may still be pending.");
      return;
    }

    showToast("Topic deleted.", { tone: "ok", duration: 2200 });
  };

  const publishStory = async (event) => {
    event.preventDefault();
    if (!storyForm.title || !storyForm.city || !storyForm.body) {
      showToast("Story not published. Fill all required fields.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = {
      id: createClientId("s"),
      ...storyForm,
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      excerpt: storyForm.excerpt || storyForm.body.slice(0, 120),
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await insertCommunityRowWithIdentity("community_stories", {
        title: storyForm.title,
        city: storyForm.city,
        author: memberName || "Member",
        user_id: user?.id || null,
        created_by_email: user?.email || null,
        category: storyForm.category || "Experience",
        excerpt: storyForm.excerpt || storyForm.body.slice(0, 120),
        body: storyForm.body,
      });

    const item = error || !data ? fallbackItem : mapStoryRow(data);
    setStories((current) => [item, ...current]);
    setStoryForm({ title: "", city: "", category: "Experience", excerpt: "", body: "" });
    setShowStoryForm(false);
    showToast(error ? "Story saved locally. Supabase sync unavailable." : "Story published.", { tone: error ? "info" : "ok", duration: 2400 });
  };

  const publishGuide = async (event) => {
    event.preventDefault();
    if (!guideForm.title || !guideForm.content) {
      showToast("Guide not published. Fill required fields.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = {
      id: createClientId("g"),
      ...guideForm,
      city: guideForm.city || "Multi-city",
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      focus: guideForm.focus || "Community",
      summary: guideForm.summary || guideForm.content.slice(0, 120),
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await insertCommunityRowWithIdentity("community_guides", {
        title: guideForm.title,
        city: guideForm.city || "Multi-city",
        author: memberName || "Member",
        user_id: user?.id || null,
        created_by_email: user?.email || null,
        focus: guideForm.focus || "Community",
        summary: guideForm.summary || guideForm.content.slice(0, 120),
        content: guideForm.content,
      });

    const item = error || !data ? fallbackItem : mapGuideRow(data);
    setGuides((current) => [item, ...current]);
    setGuideForm({ title: "", city: "", focus: "", summary: "", content: "" });
    setShowGuideForm(false);
    showToast(error ? "Guide saved locally. Supabase sync unavailable." : "Guide published.", { tone: error ? "info" : "ok", duration: 2400 });
  };

  const resetJobForm = () => {
    setJobForm({
      title: "",
      organizationName: "",
      organizationUrl: "",
      city: "",
      country: "",
      locationMode: "On-site",
      employmentType: "Part-time",
      category: "Venue / nightlife",
      compensation: "",
      description: "",
      requirements: "",
      applyUrl: "",
      applyEmail: "",
    });
  };

  const publishJob = async (event) => {
    event.preventDefault();
    const applyUrl = normalizeExternalUrl(jobForm.applyUrl);
    const applyEmail = normalizeEmail(jobForm.applyEmail);

    if (!jobForm.title || !jobForm.organizationName || !jobForm.description || (!applyUrl && !applyEmail)) {
      showToast("Job not submitted. Add title, organization, description, and an apply link or email.", { tone: "warn", duration: 2800 });
      return;
    }

    const reviewStatus = isAdmin ? "published" : "pending";
    const nowIso = new Date().toISOString();
    const expiresAt = addDaysIso(45);
    const fallbackItem = {
      id: createClientId("job"),
      ...jobForm,
      organizationUrl: normalizeExternalUrl(jobForm.organizationUrl),
      applyUrl,
      applyEmail,
      status: reviewStatus,
      verificationStatus: isAdmin ? "admin_verified" : "unverified",
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      createdAt: nowIso,
      publishedAt: reviewStatus === "published" ? nowIso : "",
      expiresAt,
    };

    const { data, error } = await insertCommunityRowWithIdentity("community_jobs", {
      title: jobForm.title.trim(),
      organization_name: jobForm.organizationName.trim(),
      organization_url: normalizeExternalUrl(jobForm.organizationUrl),
      city: jobForm.city.trim(),
      country: jobForm.country.trim(),
      location_mode: jobForm.locationMode || "On-site",
      employment_type: jobForm.employmentType || "Part-time",
      category: jobForm.category || "Other",
      compensation: jobForm.compensation.trim(),
      description: jobForm.description.trim(),
      requirements: jobForm.requirements.trim(),
      apply_url: applyUrl,
      apply_email: applyEmail,
      status: reviewStatus,
      verification_status: isAdmin ? "admin_verified" : "unverified",
      author: memberName || "Member",
      user_id: user?.id || null,
      created_by_email: user?.email || null,
      published_at: reviewStatus === "published" ? nowIso : null,
      expires_at: expiresAt,
    });

    const item = error || !data ? fallbackItem : mapJobRow(data);
    setJobs((current) => [item, ...current]);
    resetJobForm();
    setShowJobForm(false);
    showToast(
      error
        ? "Job saved locally. Supabase sync unavailable."
        : reviewStatus === "published"
          ? "Job published."
          : "Job submitted for admin review.",
      { tone: error ? "info" : "ok", duration: 2600 }
    );
  };

  const updateJobStatus = async (job, nextStatus) => {
    if (!isAdmin || !job?.id) {
      showToast("Only admins can moderate job posts.", { tone: "warn", duration: 2200 });
      return;
    }

    const publishedAt = nextStatus === "published" ? new Date().toISOString() : job.publishedAt || null;
    setJobs((current) =>
      current.map((entry) =>
        String(entry.id) === String(job.id)
          ? {
              ...entry,
              status: nextStatus,
              verificationStatus: nextStatus === "published" ? "admin_verified" : entry.verificationStatus,
              publishedAt: publishedAt || "",
            }
          : entry
      )
    );

    const { error } = await supabase
      .from("community_jobs")
      .update({
        status: nextStatus,
        verification_status: nextStatus === "published" ? "admin_verified" : job.verificationStatus,
        published_at: publishedAt,
      })
      .eq("id", job.id);

    if (error) {
      showToast("Job updated locally. Supabase sync unavailable.", { tone: "info", duration: 2400 });
      return;
    }

    showToast(nextStatus === "published" ? "Job published." : "Job updated.", { tone: "ok", duration: 2200 });
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeTopic || !messageForm.text.trim()) {
      showToast("Write a message before sending.", { tone: "warn", duration: 2200 });
      return;
    }
    const fallbackItem = { id: createClientId("m"), author: memberName || "Member", text: messageForm.text.trim(), createdAt: new Date().toISOString() };
    const { data, error } = await supabase
      .from("community_messages")
      .insert([{
        topic_id: activeTopic.id,
        author: memberName || "Member",
        text: messageForm.text.trim(),
      }])
      .select("*")
      .single();

    const item = error || !data
      ? fallbackItem
      : {
          id: String(data.id),
          author: data.author || "Member",
          text: data.text || "",
          createdAt: data.created_at || new Date().toISOString(),
        };
    setMessages((current) => {
      const topicMessages = [...(current[activeTopic.id] || []), item];
      const pruned = pruneTopicMessages(topicMessages, MAX_MESSAGES_PER_TOPIC);
      if (pruned.archived.length > 0) {
        setMessageArchive((archiveCurrent) => ({
          ...archiveCurrent,
          [activeTopic.id]: [...(archiveCurrent[activeTopic.id] || []), ...pruned.archived].slice(-500),
        }));
      }
      return { ...current, [activeTopic.id]: pruned.visible };
    });
    setMessageForm({ text: "" });
    showToast(error ? "Message saved locally. Supabase sync unavailable." : "Message sent.", { tone: error ? "info" : "ok", duration: 1800 });
  };

  const createTopic = async (event) => {
    event.preventDefault();
    if (!topicForm.name || !topicForm.description) {
      showToast("Topic not created. Add title and description.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = {
      id: createClientId("t"),
      ...topicForm,
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await insertCommunityRowWithIdentity("community_topics", {
        name: topicForm.name,
        mood: topicForm.mood || "Fresh",
        description: topicForm.description,
        author: memberName || "Member",
        user_id: user?.id || null,
        created_by_email: user?.email || null,
      });

    const item =
      error || !data
        ? fallbackItem
        : {
            ...mapTopicRow(data),
            authorUserId: String(data?.user_id || user?.id || ""),
            authorEmail: String(data?.created_by_email || user?.email || ""),
          };
    setTopics((current) => applyTopicPolicy([item, ...current]));
    setMessages((current) => ({ ...current, [item.id]: [] }));
    setMessageArchive((current) => ({ ...current, [item.id]: [] }));
    setTopicId(item.id);
    setTopicForm({ name: "", mood: "Fresh", description: "" });
    showToast(error ? "Topic saved locally. Supabase sync unavailable." : "Topic created.", { tone: error ? "info" : "ok", duration: 2200 });
  };

  const publishIdea = async (event) => {
    event.preventDefault();
    if (!ideaForm.text) {
      showToast("Idea not shared. Add idea text.", { tone: "warn", duration: 2400 });
      return;
    }
    const ideaCategory = String(ideaForm.category || "Feature").trim() || "Feature";
    const ideaText = `[${ideaCategory}] ${ideaForm.text.trim()}`;
    const fallbackItem = {
      id: createClientId("i"),
      text: ideaText,
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      votes: 1,
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await insertCommunityRowWithIdentity("community_ideas", {
        text: ideaText,
        author: memberName || "Member",
        user_id: user?.id || null,
        created_by_email: user?.email || null,
        votes: 1,
      });

    const item = error || !data ? fallbackItem : mapIdeaRow(data);
    setIdeas((current) => [item, ...current]);
    setIdeaForm({ text: "", category: "Feature" });
    setShowIdeaForm(false);
    showToast(error ? "Idea saved locally. Supabase sync unavailable." : "Idea shared.", { tone: error ? "info" : "ok", duration: 2200 });
  };

  const upvoteIdea = async (ideaId) => {
    let nextVotes = null;
    setIdeas((current) => current.map((idea) => {
      if (idea.id !== ideaId) return idea;
      nextVotes = Number(idea.votes || 0) + 1;
      return { ...idea, votes: nextVotes };
    }));

    if (nextVotes === null) return;

    const { error } = await supabase
      .from("community_ideas")
      .update({ votes: nextVotes })
      .eq("id", ideaId);

    if (error) {
      showToast("Vote saved locally. Supabase sync unavailable.", { tone: "info", duration: 2200 });
    }
  };

  const reportContent = ({ targetType, targetId, title }) => {
    setReportModal({
      open: true,
      targetType: String(targetType || ""),
      targetId: String(targetId || ""),
      title: String(title || ""),
      reasonKey: "1",
      details: "",
    });
  };

  const openMemberThread = (entry) => {
    const targetId = String(entry?.user_id || "").trim();
    if (!targetId) return;
    const safeName = String(entry?.display_name || "Member");
    router.push(`/messages?user=${encodeURIComponent(targetId)}&name=${encodeURIComponent(safeName)}`);
  };

  const openMemberProfile = (entry) => {
    const targetId = String(entry?.user_id || "").trim();
    if (!targetId) return;
    const safeName = String(entry?.display_name || "Member").trim() || "Member";
    const avatarUrl = resolveAvatarUrlFromProfile(entry);
    const avatarParam = avatarUrl ? `&member_avatar=${encodeURIComponent(avatarUrl)}` : "";
    router.push(
      `/favorites?tab=about&member=${encodeURIComponent(targetId)}&member_name=${encodeURIComponent(safeName)}${avatarParam}`
    );
  };

  const toggleMemberFollow = async (entry) => {
    const targetId = String(entry?.user_id || "").trim();
    if (!targetId || !user?.id) return;
    if (memberSearchBusyById[targetId]) return;

    const currentlyFollowing = Boolean(entry.is_following);
    setMemberSearchBusyById((current) => ({ ...current, [targetId]: true }));
    setMemberSearchRows((current) =>
      current.map((row) =>
        row.user_id === targetId ? { ...row, is_following: !currentlyFollowing } : row
      )
    );

    const operation = currentlyFollowing
      ? supabase
          .from("member_following")
          .delete()
          .eq("follower_user_id", user.id)
          .eq("followed_user_id", targetId)
      : supabase
          .from("member_following")
          .insert([{ follower_user_id: user.id, followed_user_id: targetId }]);

    const { error } = await operation;
    if (error) {
      setMemberSearchRows((current) =>
        current.map((row) =>
          row.user_id === targetId ? { ...row, is_following: currentlyFollowing } : row
        )
      );
      showToast("Could not update connection right now.", { tone: "warn", duration: 2200 });
    } else {
      showToast(currentlyFollowing ? "Removed from your trusted circle." : "Added to your trusted circle.", {
        tone: "ok",
        duration: 2200,
      });
      memberSearchCacheRef.current.clear();
      if (memberSearchScope === "friends") {
        queueMicrotask(async () => {
          await loadMemberDiscovery({ offset: 0, append: false, force: true });
        });
      }
    }

    setMemberSearchBusyById((current) => ({ ...current, [targetId]: false }));
  };

  const closeReportModal = () => {
    setReportModal((current) => ({ ...current, open: false }));
  };

  const submitReportModal = () => {
    const reason = normalizeReportReason(reportModal.reasonKey);
    if (!reason) {
      showToast("Choose a reason to continue.", { tone: "warn", duration: 2200 });
      return;
    }

    addReport({
      targetType: reportModal.targetType,
      targetId: reportModal.targetId,
      city: "",
      title: reportModal.title,
      reason,
      message: String(reportModal.details || "").trim(),
    });

    trackKpiEvent("report_submitted", {
      targetType: reportModal.targetType,
      targetId: String(reportModal.targetId),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      meta: { reason },
    });
    closeReportModal();
    showToast("Report sent. Thanks for helping keep community safe.", { tone: "info", duration: 2600 });
  };

  const toggleStoryExpanded = (storyId) => {
    setExpandedStoryIds((current) =>
      current.includes(storyId) ? current.filter((id) => id !== storyId) : [...current, storyId]
    );
  };

  const toggleGuideExpanded = (guideIdValue) => {
    setExpandedGuideIds((current) =>
      current.includes(guideIdValue)
        ? current.filter((id) => id !== guideIdValue)
        : [...current, guideIdValue]
    );
  };

  const toggleJobExpanded = (jobIdValue) => {
    setExpandedJobIds((current) =>
      current.includes(jobIdValue)
        ? current.filter((id) => id !== jobIdValue)
        : [...current, jobIdValue]
    );
  };

  const isDiscoveryPanel = activeCommunityPanel === "discovery";
  const isFeedPanel = activeCommunityPanel === "feed";
  const isJobsPanel = activeCommunityPanel === "jobs";
  const isChatPanel = activeCommunityPanel === "chat";
  const isImprovePanel = activeCommunityPanel === "improve";

  return (
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.06),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.06),transparent_24%),linear-gradient(180deg,#040406_0%,#05070b_52%,#040406_100%)] px-4 py-6 pb-8 text-white sm:px-6 sm:py-8 sm:pb-12">
      <ActionToast toast={toast} />
      <div className="qa-shell relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.04),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(59,130,246,0.05),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="qa-premium-card relative mb-7 overflow-hidden rounded-[30px] border border-white/10 bg-[#060910] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.46)] sm:mb-8 sm:rounded-[34px] sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/community/community-hero-neon-network.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 36%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,14,0.48),rgba(4,7,14,0.74)_56%,rgba(4,7,14,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(244,114,182,0.15),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(56,189,248,0.14),transparent_30%)]" />
          </div>
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-6 h-56 w-56 rounded-full bg-fuchsia-300/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/68">Community Signal</p>
            <h1 className="qa-display mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:mt-3 sm:text-5xl">Community</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:mt-4 sm:leading-7">Live member signal, practical city knowledge, and trusted conversations in one focused flow.</p>
            <p className="mt-2 text-xs text-white/64 sm:mt-3">
              Safety-first participation. Read our{" "}
              <Link href="/community-policy" className="underline underline-offset-2 transition hover:text-white">
                Community Policy & Reporting
              </Link>
              .
            </p>
            {syncError && (
              <p role="status" aria-live="polite" className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                {syncError}
              </p>
            )}
          </div>
        </div>

        <section className="mb-6">
          <PageControls
            className="qa-premium-card sticky top-3 z-20"
            controlsRef={communityControlsRef}
            controlButtonsRef={communityControlButtonsRef}
            buttons={[
              { id: "discovery", label: "Member discovery" },
              { id: "feed", label: "Member stories & guides" },
              { id: "jobs", label: "Queer jobs" },
              { id: "chat", label: "Live chat" },
              { id: "improve", label: "Improve atlas" },
            ]}
            activeId={activeCommunityPanel}
            onSelect={(panelId) => {
              setActiveCommunityPanel(panelId);
            }}
          />
        </section>

        {isDiscoveryPanel ? (
        <section aria-labelledby="community-discovery-heading" className="qa-premium-card animate-rise-in mb-6 rounded-[24px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.18),transparent_28%),linear-gradient(180deg,rgba(38,14,44,0.94),rgba(10,10,10,0.98))] p-4 shadow-[0_30px_96px_rgba(217,70,239,0.15),0_14px_34px_rgba(0,0,0,0.30)] transition-all duration-300 sm:rounded-[26px] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/85">Member Discovery</p>
              <h2 id="community-discovery-heading" className="mt-1 text-lg font-semibold text-white">Find people by name, city, and signal</h2>
            </div>
            <p className="text-xs text-fuchsia-100/75" aria-live="polite">
              {memberSearchLoading
                ? "Refreshing live member graph..."
                : `${displayedMemberRows.length} members loaded${memberSearchHasMore ? " · more available" : ""}`}
            </p>
          </div>

          <div className="mt-3 inline-flex rounded-full border border-fuchsia-200/24 bg-black/35 p-1">
            <button
              onClick={() => setMemberSearchScope("all")}
              className={`rounded-full px-3 py-1 text-xs transition ${memberSearchScope === "all" ? "bg-fuchsia-200/22 text-white" : "text-white/72 hover:text-white"}`}
            >
              All members
            </button>
            <button
              onClick={() => setMemberSearchScope("friends")}
              className={`rounded-full px-3 py-1 text-xs transition ${memberSearchScope === "friends" ? "bg-fuchsia-200/22 text-white" : "text-white/72 hover:text-white"}`}
            >
              My friends only
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
            <input
              value={memberSearchTerm}
              onChange={(event) => setMemberSearchTerm(event.target.value)}
              placeholder="Search member name, city, title, pronouns"
              className="w-full rounded-xl border border-fuchsia-200/24 bg-black/45 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-200/55"
            />
            <select
              value={memberSearchCity}
              onChange={(event) => setMemberSearchCity(event.target.value)}
              className="w-full rounded-xl border border-fuchsia-200/24 bg-black/45 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-200/55"
            >
              <option value="">All cities</option>
              {memberDiscoveryCities.map((city) => (
                <option key={city.normalized} value={city.raw}>
                  {city.label}
                </option>
              ))}
            </select>
            <select
              value={memberSearchSort}
              onChange={(event) => setMemberSearchSort(event.target.value)}
              className="w-full rounded-xl border border-fuchsia-200/24 bg-black/45 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-200/55"
            >
              <option value="best">Best match</option>
              <option value="active">Most active</option>
              <option value="mutual">Most mutual</option>
            </select>
            <button
              onClick={() => {
                memberSearchCacheRef.current.clear();
                queueMicrotask(async () => {
                  await loadMemberDiscovery({ offset: 0, append: false, force: true });
                });
              }}
              className="qa-action qa-action-strong rounded-xl border border-fuchsia-200/42 bg-[linear-gradient(135deg,rgba(232,121,249,0.24),rgba(99,102,241,0.18),rgba(14,10,20,0.94))] px-4 py-3 text-sm font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/62"
            >
              Refresh
            </button>
          </div>

          {memberSearchWarning && (
            <p className="mt-3 rounded-xl border border-amber-200/22 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {memberSearchWarning}
            </p>
          )}

          <div className="mt-4 max-h-[62vh] overflow-y-auto pr-1 [scrollbar-gutter:stable]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {displayedMemberRows.map((entry) => {
              const titleMeta = getMemberTitleMeta(entry.title || "");
              const busy = Boolean(memberSearchBusyById[entry.user_id]);
              const avatarUrl = resolveAvatarUrlFromProfile(entry);
              const initials =
                String(entry.display_name || "Member")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((chunk) => chunk.charAt(0).toUpperCase())
                  .join("") || "M";
              return (
                <article key={entry.user_id} className="qa-premium-card rounded-2xl border border-white/10 bg-black/28 p-4 transition hover:border-fuchsia-200/30 hover:bg-black/35 hover:shadow-[0_20px_50px_rgba(217,70,239,0.14)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-fuchsia-200/24 bg-fuchsia-200/12 text-[11px] font-semibold text-fuchsia-100">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt={entry.display_name} className="h-full w-full object-cover" />
                        ) : initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">{entry.display_name}</p>
                        {entry.trusted_contributor && (
                          <span className="rounded-full border border-cyan-200/30 bg-cyan-200/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                            Trusted
                          </span>
                        )}
                        </div>
                      <p className="mt-1 text-xs text-white/62">
                          {[entry.home_city, entry.resident_country].filter(Boolean).join(" · ") || "City not set"}
                      </p>
                    </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}>
                      <span>{titleMeta.icon}</span>
                      {titleMeta.label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${entry.is_online ? "border-emerald-200/30 bg-emerald-200/14 text-emerald-100" : "border-white/14 bg-white/6 text-white/75"}`}>
                      {formatMemberSeen(entry.last_seen_at, entry.is_online)}
                    </span>
                    {entry.follows_you && (
                      <span className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                        Follows you
                      </span>
                    )}
                    {entry.mutual_count > 0 && (
                      <span className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-fuchsia-100">
                        {entry.mutual_count} mutual
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2">
                    <button
                      onClick={() => openMemberProfile(entry)}
                      className="qa-action qa-action-strong rounded-xl border border-fuchsia-200/40 bg-[linear-gradient(135deg,rgba(232,121,249,0.22),rgba(99,102,241,0.16),rgba(14,10,20,0.94))] px-3 py-2 text-xs font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/62"
                    >
                      Open profile
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openMemberThread(entry)}
                        className="qa-action rounded-xl border border-cyan-200/28 bg-cyan-200/12 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/50"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => toggleMemberFollow(entry)}
                        disabled={busy}
                        className="qa-action qa-action-strong rounded-xl border border-fuchsia-200/40 bg-[linear-gradient(135deg,rgba(232,121,249,0.22),rgba(99,102,241,0.16),rgba(14,10,20,0.94))] px-3 py-2 text-xs font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/62 disabled:cursor-wait disabled:opacity-65"
                      >
                        {busy ? "Saving..." : entry.is_following ? "Following" : "Add friend"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {!memberSearchLoading && displayedMemberRows.length === 0 && (
              <div className="rounded-2xl border border-dashed border-fuchsia-200/26 px-4 py-6 text-sm text-white/62 md:col-span-2 xl:col-span-3">
                No members match this filter yet. Try another city or broaden your search.
              </div>
            )}
            </div>
          </div>
          <div ref={memberSearchSentinelRef} className="h-2 w-full" aria-hidden />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-fuchsia-100/65">
              Stable paging: {displayedMemberRows.length} members loaded
            </p>
            {memberSearchHasMore && (
              <button
                onClick={() => {
                  queueMicrotask(async () => {
                    await loadMoreMemberDiscovery();
                  });
                }}
                disabled={memberSearchLoading}
                className="qa-action qa-action-strong rounded-full border border-fuchsia-200/36 bg-fuchsia-200/16 px-3 py-1 text-[11px] font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/56 disabled:opacity-60"
              >
                      {memberSearchLoading ? "Loading..." : "Load more members"}
              </button>
            )}
          </div>
        </section>
        ) : null}

        {isFeedPanel ? (
        <section aria-labelledby="community-feed-heading-premium" className="qa-premium-card rounded-[30px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.13),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(244,114,182,0.12),transparent_30%),linear-gradient(180deg,rgba(20,16,34,0.95),rgba(10,10,10,1))] p-5 shadow-[0_34px_110px_rgba(139,92,246,0.12),0_14px_34px_rgba(0,0,0,0.3)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">Community Library</p>
              <h2 id="community-feed-heading-premium" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Stories and guides</h2>
              <p className="mt-1 text-xs text-violet-100/70">Personal experience on the left, practical city knowledge on the right.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowStoryForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-rose-300/34 bg-rose-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-100 transition hover:border-rose-200/62">
                {showStoryForm ? "Close story form" : "Write story"}
              </button>
              <button onClick={() => setShowGuideForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-violet-300/34 bg-violet-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-100 transition hover:border-violet-200/62">
                {showGuideForm ? "Close guide form" : "New guide"}
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
            <div className="rounded-[28px] border border-rose-300/18 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_34%),linear-gradient(180deg,rgba(34,17,28,0.92),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(244,63,94,0.10)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-rose-100/70">Member Stories</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Lived experience</h3>
                  <p className="mt-2 text-xs leading-5 text-white/56">Personal moments, local feeling, and what it was actually like.</p>
                </div>
                <span className="rounded-full border border-rose-200/24 bg-rose-200/12 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100">
                  {sortedStories.length} stories
                </span>
              </div>

              {showStoryForm && (
                <form id="community-story-form-feed-premium" onSubmit={publishStory} className="mb-4 space-y-3 rounded-2xl border border-rose-400/20 bg-rose-300/6 p-4">
                  <Field value={storyForm.title} onChange={(event) => setStoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="Story title" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                    <Field value={storyForm.category} onChange={(event) => setStoryForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
                  </div>
                  <Field value={storyForm.excerpt} onChange={(event) => setStoryForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short excerpt" area />
                  <Field value={storyForm.body} onChange={(event) => setStoryForm((current) => ({ ...current, body: event.target.value }))} placeholder="Write your experience" area />
                  <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-rose-100/65 bg-gradient-to-r from-rose-300 via-pink-300 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish story</button>
                </form>
              )}

              <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sortedStories.map((story) => (
                  <article key={`story-panel-${story.id}`} className="qa-premium-card rounded-[24px] border border-rose-300/22 bg-[linear-gradient(180deg,rgba(37,18,28,0.92),rgba(12,12,12,0.96))] p-4">
                    <span className="inline-flex rounded-full border border-rose-200/32 bg-rose-200/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100">Member Story</span>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-rose-100/66">
                      Personal experience | {story.city}
                      <span className="hidden sm:inline"> | {story.category}</span>
                    </p>
                    <h3 className="mt-3 text-base font-semibold text-white">{story.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/78">{story.excerpt}</p>
                    {expandedStoryIds.includes(story.id) && <p className="mt-2 text-sm leading-7 text-white/72">{story.body}</p>}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-white/62">{story.author} | {timeAgo(story.createdAt)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStoryExpanded(story.id)} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">{expandedStoryIds.includes(story.id) ? "Show less" : "Read more"}</button>
                        <button onClick={() => reportContent({ targetType: "community-story", targetId: story.id, title: story.title })} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">Report</button>
                      </div>
                    </div>
                  </article>
                ))}
                {sortedStories.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-rose-200/18 px-4 py-8 text-sm text-white/62">
                    No stories yet. Be the first to share a local moment.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-violet-300/18 bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.16),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(23,19,43,0.92),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(139,92,246,0.10)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-100/70">City Guides</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Practical wisdom</h3>
                  <p className="mt-2 text-xs leading-5 text-white/56">Useful routes, city notes, safety context, and member-made planning help.</p>
                </div>
                <span className="rounded-full border border-violet-200/24 bg-violet-200/12 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-violet-100">
                  {sortedGuides.length} guides
                </span>
              </div>

              {showGuideForm && (
                <form id="community-guide-form-feed-premium" onSubmit={publishGuide} className="mb-4 space-y-3 rounded-2xl border border-violet-400/20 bg-violet-300/6 p-4">
                  <Field value={guideForm.title} onChange={(event) => setGuideForm((current) => ({ ...current, title: event.target.value }))} placeholder="Guide title" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field value={guideForm.city} onChange={(event) => setGuideForm((current) => ({ ...current, city: event.target.value }))} placeholder="City or region" />
                    <Field value={guideForm.focus} onChange={(event) => setGuideForm((current) => ({ ...current, focus: event.target.value }))} placeholder="Focus" />
                  </div>
                  <Field value={guideForm.summary} onChange={(event) => setGuideForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Short summary" area />
                  <Field value={guideForm.content} onChange={(event) => setGuideForm((current) => ({ ...current, content: event.target.value }))} placeholder="Write the guide" area />
                  <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-violet-100/65 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-sky-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish guide</button>
                </form>
              )}

              <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sortedGuides.map((guide) => {
                  const isExpanded = expandedGuideIds.includes(guide.id);
                  return (
                    <article key={`guide-panel-${guide.id}`} className="qa-premium-card rounded-[24px] border border-violet-300/22 bg-[linear-gradient(180deg,rgba(23,19,42,0.78),rgba(11,11,11,0.96))] p-4">
                      <span className="inline-flex rounded-full border border-violet-200/32 bg-violet-200/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100">City Guide</span>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-violet-100/66">
                        Practical guide | {guide.city}
                        <span className="hidden sm:inline"> | {guide.focus}</span>
                      </p>
                      <h3 className="mt-3 text-base font-semibold text-white">{guide.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/78">{guide.summary}</p>
                      {isExpanded && <p className="mt-2 text-sm leading-7 text-white/72">{guide.content}</p>}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-white/62">{guide.author} | {timeAgo(guide.createdAt)}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleGuideExpanded(guide.id)} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">{isExpanded ? "Show less" : "Read guide"}</button>
                          <button onClick={() => reportContent({ targetType: "community-guide", targetId: guide.id, title: guide.title })} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">Report</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {sortedGuides.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-violet-200/18 px-4 py-8 text-sm text-white/62">
                    No guides yet. Add the first practical route or city note.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {isJobsPanel ? (
        <section aria-labelledby="community-jobs-heading" className="qa-premium-card animate-rise-in overflow-hidden rounded-[30px] border border-emerald-300/18 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_82%_6%,rgba(244,114,182,0.12),transparent_24%),radial-gradient(circle_at_88%_24%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,rgba(10,34,28,0.96),rgba(9,10,10,1))] p-5 shadow-[0_34px_110px_rgba(16,185,129,0.14),0_14px_34px_rgba(0,0,0,0.3)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Community Jobs</p>
              <h2 id="community-jobs-heading" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Queer jobs from the Atlas network</h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-emerald-100/70">Member-posted opportunities for queer venues, community orgs, events, hospitality, creative teams, and inclusive employers.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Reviewed before public", "SEO-ready job data", "Scam-aware apply links"].map((label) => (
                  <span key={label} className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/68">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200/24 bg-emerald-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-emerald-100">
                {publishedJobs.length} live
              </span>
              {reviewJobs.length > 0 && (
                <span className="rounded-full border border-amber-200/28 bg-amber-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-amber-100">
                  {reviewJobs.length} pending
                </span>
              )}
              <button
                onClick={() => setShowJobForm((current) => !current)}
                className="qa-action qa-action-strong rounded-full border border-emerald-300/40 bg-emerald-300/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-100 transition hover:border-emerald-200/62"
              >
                {showJobForm ? "Close job form" : "Post a queer job"}
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.74fr)_minmax(0,1.26fr)] xl:items-start">
            <div className="qa-premium-card rounded-[28px] border border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_92%_0%,rgba(244,114,182,0.10),transparent_28%),linear-gradient(180deg,rgba(13,45,35,0.92),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(16,185,129,0.12)] sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/70">Post opportunity</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Share a job with the community</h3>
              <p className="mt-2 text-xs leading-5 text-white/58">Posts go through review before they become visible to everyone. No upfront-payment, crypto-task, or WhatsApp-only jobs.</p>
              <div className="mt-3 rounded-[22px] border border-pink-200/16 bg-pink-200/[0.055] px-3 py-2">
                <p className="text-xs leading-5 text-pink-50/74">Cute enough to invite people in, strict enough to keep bad listings out.</p>
              </div>

              {showJobForm ? (
                <form id="community-job-form" onSubmit={publishJob} className="mt-4 space-y-3">
                  <Field value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} placeholder="Job title" />
                  <Field value={jobForm.organizationName} onChange={(event) => setJobForm((current) => ({ ...current, organizationName: event.target.value }))} placeholder="Organization / employer" />
                  <Field value={jobForm.organizationUrl} onChange={(event) => setJobForm((current) => ({ ...current, organizationUrl: event.target.value }))} placeholder="Organization website (optional)" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field value={jobForm.city} onChange={(event) => setJobForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                    <Field value={jobForm.country} onChange={(event) => setJobForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={jobForm.locationMode}
                      onChange={(event) => setJobForm((current) => ({ ...current, locationMode: event.target.value }))}
                      className="w-full rounded-xl border border-emerald-200/20 bg-[#0d211b] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#0d211b]"
                    >
                      {JOB_LOCATION_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                    <select
                      value={jobForm.employmentType}
                      onChange={(event) => setJobForm((current) => ({ ...current, employmentType: event.target.value }))}
                      className="w-full rounded-xl border border-emerald-200/20 bg-[#0d211b] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#0d211b]"
                    >
                      {JOB_EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <select
                    value={jobForm.category}
                    onChange={(event) => setJobForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-xl border border-emerald-200/20 bg-[#0d211b] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#0d211b]"
                  >
                    {JOB_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <Field value={jobForm.compensation} onChange={(event) => setJobForm((current) => ({ ...current, compensation: event.target.value }))} placeholder="Pay range / compensation (recommended)" />
                  <Field value={jobForm.description} onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the role, workplace, and why it is a good fit for queer community" area />
                  <Field value={jobForm.requirements} onChange={(event) => setJobForm((current) => ({ ...current, requirements: event.target.value }))} placeholder="Requirements, schedule, language, or access notes (optional)" area />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field value={jobForm.applyUrl} onChange={(event) => setJobForm((current) => ({ ...current, applyUrl: event.target.value }))} placeholder="Apply URL" />
                    <Field value={jobForm.applyEmail} onChange={(event) => setJobForm((current) => ({ ...current, applyEmail: event.target.value }))} placeholder="Apply email" />
                  </div>
                  <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-emerald-100/65 bg-gradient-to-r from-emerald-200 via-cyan-200 to-lime-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">
                    {isAdmin ? "Publish job" : "Submit for review"}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowJobForm(true)}
                  className="qa-action qa-action-strong mt-4 min-h-[44px] w-full rounded-xl border border-emerald-100/55 bg-gradient-to-r from-emerald-200 via-cyan-200 to-lime-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95"
                >
                  Post a queer job
                </button>
              )}

              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/44">Trust rules</p>
                <p className="mt-2 text-xs leading-5 text-white/58">Never pay to get paid. Report jobs that ask for upfront fees, crypto deposits, ID documents too early, or suspicious private messaging.</p>
              </div>
            </div>

            <div className="qa-premium-card rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.13),transparent_34%),radial-gradient(circle_at_10%_0%,rgba(52,211,153,0.10),transparent_30%),linear-gradient(180deg,rgba(12,38,32,0.88),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(0,0,0,0.24)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/70">Browse jobs</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Live opportunities</h3>
                  <p className="mt-2 text-xs leading-5 text-white/56">Filter by city or work mode. Each public listing expires after 45 days unless renewed.</p>
                </div>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <select
                  value={jobCityFilter}
                  onChange={(event) => setJobCityFilter(event.target.value)}
                  className="w-full rounded-xl border border-emerald-200/20 bg-[#0d211b] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#0d211b]"
                >
                  <option value="">All cities</option>
                  {jobCities.map((city) => <option key={city} value={city}>{formatCityLabel(city)}</option>)}
                </select>
                <select
                  value={jobModeFilter}
                  onChange={(event) => setJobModeFilter(event.target.value)}
                  className="w-full rounded-xl border border-emerald-200/20 bg-[#0d211b] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#0d211b]"
                >
                  <option value="all">All work modes</option>
                  {JOB_LOCATION_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {jobCities.slice(0, 10).map((city) => {
                  const active = normalizeMemberKey(jobCityFilter) === normalizeMemberKey(city);
                  return (
                    <button
                      key={`job-city-chip-${city}`}
                      type="button"
                      onClick={() => setJobCityFilter(active ? "" : city)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                        active
                          ? "border-emerald-100/55 bg-emerald-200/18 text-emerald-50"
                          : "border-white/12 bg-white/[0.045] text-white/66 hover:border-emerald-200/32 hover:text-white"
                      }`}
                    >
                      {formatCityLabel(city)}
                    </button>
                  );
                })}
              </div>

              {reviewJobs.length > 0 && (
                <div className="mb-4 rounded-[24px] border border-amber-200/22 bg-amber-200/8 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">Pending review</p>
                    <span className="rounded-full border border-amber-200/26 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-100">
                      {isAdmin ? "Admin queue" : "Your submissions"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {reviewJobs.map((job) => (
                      <article key={`pending-job-${job.id}`} className="rounded-2xl border border-amber-200/18 bg-black/24 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{job.title}</p>
                            <p className="mt-1 text-xs text-amber-100/72">{job.organizationName} | {formatJobLocation(job)}</p>
                          </div>
                          <span className="rounded-full border border-amber-200/26 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-100">{formatJobStatus(job.status)}</span>
                        </div>
                        {isAdmin && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => updateJobStatus(job, "published")} className="qa-action qa-action-strong rounded-full border border-emerald-200/38 bg-emerald-200/14 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/60">Publish</button>
                            <button onClick={() => updateJobStatus(job, "rejected")} className="qa-action rounded-full border border-rose-200/30 bg-rose-200/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:border-rose-200/52">Reject</button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="qa-defer-render max-h-[52rem] space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {filteredJobs.map((job) => {
                  const isExpanded = expandedJobIds.includes(job.id);
                  const applyHref = normalizeExternalUrl(job.applyUrl) || (normalizeEmail(job.applyEmail) ? `mailto:${normalizeEmail(job.applyEmail)}` : "");
                  const orgHref = normalizeExternalUrl(job.organizationUrl);
                  return (
                    <article key={`job-${job.id}`} itemScope itemType="https://schema.org/JobPosting" className="qa-premium-card animate-rise-in rounded-[24px] border border-emerald-300/20 bg-[linear-gradient(180deg,rgba(14,42,34,0.82),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] hover:border-emerald-200/34 hover:shadow-[0_24px_60px_rgba(16,185,129,0.14)]">
                      <meta itemProp="datePosted" content={job.publishedAt || job.createdAt} />
                      {job.expiresAt && <meta itemProp="validThrough" content={job.expiresAt} />}
                      <meta itemProp="employmentType" content={job.employmentType} />
                      <meta itemProp="jobLocationType" content={job.locationMode === "Remote" ? "TELECOMMUTE" : job.locationMode} />
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-emerald-200/30 bg-emerald-200/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">{job.category}</span>
                            <span className="rounded-full border border-cyan-200/26 bg-cyan-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">{job.employmentType}</span>
                            {job.verificationStatus === "admin_verified" && (
                              <span className="rounded-full border border-lime-200/28 bg-lime-200/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100">Verified</span>
                            )}
                          </div>
                          <h3 itemProp="title" className="mt-3 text-base font-semibold text-white">{job.title}</h3>
                          <p itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization" className="mt-1 text-sm text-emerald-100/78">
                            <meta itemProp="name" content={job.organizationName} />
                            {orgHref ? (
                              <a href={orgHref} target="_blank" rel="noreferrer" itemProp="url" className="underline underline-offset-2 transition hover:text-white">{job.organizationName}</a>
                            ) : job.organizationName}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-emerald-100/62">{formatJobLocation(job)}</p>
                        </div>
                        <span className="rounded-full border border-white/12 bg-white/7 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/58">{timeAgo(job.publishedAt || job.createdAt)}</span>
                      </div>
                      {job.compensation && <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/72">{job.compensation}</p>}
                      <p itemProp="description" className="mt-3 text-sm leading-6 text-white/78">{job.description}</p>
                      {isExpanded && job.requirements && <p className="mt-2 text-sm leading-7 text-white/70">{job.requirements}</p>}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-white/56">Posted by {job.author} | expires {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "soon"}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.requirements && (
                            <button onClick={() => toggleJobExpanded(job.id)} className="qa-action rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">
                              {isExpanded ? "Show less" : "Details"}
                            </button>
                          )}
                          <button onClick={() => reportContent({ targetType: "community-job", targetId: job.id, title: job.title })} className="qa-action rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">Report</button>
                          {isAdmin && (
                            <button onClick={() => updateJobStatus(job, "removed")} className="qa-action rounded-full border border-rose-200/26 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">Remove</button>
                          )}
                          {applyHref ? (
                            <a href={applyHref} target={applyHref.startsWith("mailto:") ? undefined : "_blank"} rel={applyHref.startsWith("mailto:") ? undefined : "noreferrer"} className="qa-action qa-action-strong rounded-full border border-emerald-100/55 bg-gradient-to-r from-emerald-200 via-cyan-200 to-lime-200 px-4 py-2 text-xs font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Apply</a>
                          ) : (
                            <span className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-xs text-white/56">Apply details hidden</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {filteredJobs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-emerald-300/26 px-4 py-8 text-sm text-white/62">
                    {jobCityFilter
                      ? `No live jobs in ${formatCityLabel(jobCityFilter)} yet. Clear the city filter or post the first opportunity.`
                      : "No live jobs match this filter yet. Post the first opportunity or broaden the filters."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {false && isFeedPanel ? (
        <section aria-labelledby="community-feed-heading" className="qa-premium-card rounded-[30px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.14),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(244,114,182,0.12),transparent_30%),linear-gradient(180deg,rgba(20,16,34,0.95),rgba(10,10,10,1))] p-5 shadow-[0_34px_110px_rgba(139,92,246,0.12),0_14px_34px_rgba(0,0,0,0.3)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">Community Feed</p>
              <h2 id="community-feed-heading" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Stories + Guides in one stream</h2>
              <p className="mt-1 text-xs text-violet-100/70">Switch between all posts, stories, or guides without leaving the flow.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowStoryForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-rose-300/34 bg-rose-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-100 transition hover:border-rose-200/62">
                {showStoryForm ? "Close story form" : "Write story"}
              </button>
              <button onClick={() => setShowGuideForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-violet-300/34 bg-violet-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-100 transition hover:border-violet-200/62">
                {showGuideForm ? "Close guide form" : "New guide"}
              </button>
            </div>
          </div>

          <div className="mb-4 inline-flex rounded-full border border-white/16 bg-black/35 p-1">
            <button onClick={() => setCommunityFeedMode("all")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "all" ? "bg-white/16 text-white" : "text-white/72 hover:text-white"}`}>All</button>
            <button onClick={() => setCommunityFeedMode("stories")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "stories" ? "bg-rose-300/22 text-rose-50" : "text-white/72 hover:text-white"}`}>Stories</button>
            <button onClick={() => setCommunityFeedMode("guides")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "guides" ? "bg-violet-300/22 text-violet-50" : "text-white/72 hover:text-white"}`}>Guides</button>
          </div>

          {showStoryForm && (
            <form id="community-story-form-feed" onSubmit={publishStory} className="mb-4 space-y-3 rounded-2xl border border-rose-400/20 bg-rose-300/6 p-4">
              <Field value={storyForm.title} onChange={(event) => setStoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="Story title" />
              <div className="grid gap-3 md:grid-cols-2">
                <Field value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                <Field value={storyForm.category} onChange={(event) => setStoryForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
              </div>
              <Field value={storyForm.excerpt} onChange={(event) => setStoryForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short excerpt" area />
              <Field value={storyForm.body} onChange={(event) => setStoryForm((current) => ({ ...current, body: event.target.value }))} placeholder="Write your experience" area />
              <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-rose-100/65 bg-gradient-to-r from-rose-300 via-pink-300 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish story</button>
            </form>
          )}

          {showGuideForm && (
            <form id="community-guide-form-feed" onSubmit={publishGuide} className="mb-4 space-y-3 rounded-2xl border border-violet-400/20 bg-violet-300/6 p-4">
              <Field value={guideForm.title} onChange={(event) => setGuideForm((current) => ({ ...current, title: event.target.value }))} placeholder="Guide title" />
              <div className="grid gap-3 md:grid-cols-2">
                <Field value={guideForm.city} onChange={(event) => setGuideForm((current) => ({ ...current, city: event.target.value }))} placeholder="City or region" />
                <Field value={guideForm.focus} onChange={(event) => setGuideForm((current) => ({ ...current, focus: event.target.value }))} placeholder="Focus" />
              </div>
              <Field value={guideForm.summary} onChange={(event) => setGuideForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Short summary" area />
              <Field value={guideForm.content} onChange={(event) => setGuideForm((current) => ({ ...current, content: event.target.value }))} placeholder="Write the guide" area />
              <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-violet-100/65 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-sky-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish guide</button>
            </form>
          )}

          <div className="qa-defer-render max-h-[700px] space-y-3 overflow-y-auto pr-1">
            {filteredFeedItems.map((item) => {
              if (item.type === "story") {
                const story = item.payload;
                return (
                  <article key={item.id} className="qa-premium-card rounded-[24px] border border-rose-300/24 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_32%),linear-gradient(180deg,rgba(38,18,29,0.94),rgba(12,12,12,0.97))] p-4 shadow-[0_18px_48px_rgba(244,63,94,0.10)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-full border border-rose-200/32 bg-rose-200/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100">
                          Member Story
                        </span>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-rose-100/66">
                          <span>Personal experience | {story.city}</span>
                          <span className="hidden sm:inline"> | {story.category}</span>
                          <span className="hidden">
                      Story · {story.city}
                      <span className="hidden sm:inline"> · {story.category}</span>
                          </span>
                        </p>
                      </div>
                      <span className="rounded-full border border-white/12 bg-white/7 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/56">
                        Story
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">{story.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/78">{story.excerpt}</p>
                    {expandedStoryIds.includes(story.id) && <p className="mt-2 text-sm leading-7 text-white/72">{story.body}</p>}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-white/62">{story.author} · {timeAgo(story.createdAt)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStoryExpanded(story.id)} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">{expandedStoryIds.includes(story.id) ? "Show less" : "Read more"}</button>
                        <button onClick={() => reportContent({ targetType: "community-story", targetId: story.id, title: story.title })} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">Report</button>
                      </div>
                    </div>
                  </article>
                );
              }

              const guide = item.payload;
              const isExpanded = expandedGuideIds.includes(guide.id);
              return (
                <article key={item.id} className="qa-premium-card rounded-2xl border border-violet-300/22 bg-[linear-gradient(180deg,rgba(23,19,42,0.78),rgba(11,11,11,0.96))] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/80">
                    Guide · {guide.city}
                    <span className="hidden sm:inline"> · {guide.focus}</span>
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/78">{guide.summary}</p>
                  {isExpanded && <p className="mt-2 text-sm leading-7 text-white/72">{guide.content}</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-white/62">{guide.author} · {timeAgo(guide.createdAt)}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleGuideExpanded(guide.id)} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">{isExpanded ? "Show less" : "Read more"}</button>
                      <button onClick={() => reportContent({ targetType: "community-guide", targetId: guide.id, title: guide.title })} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">Report</button>
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredFeedItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/16 px-4 py-8 text-sm text-white/62">
                No posts in this filter yet. Switch filter or publish the first post.
              </div>
            )}
          </div>
        </section>
        ) : null}

        {isChatPanel ? (
        <section aria-labelledby="community-chat-heading" className="qa-premium-card animate-rise-in mt-6 rounded-[30px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_12%_0%,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,rgba(8,28,38,0.96),rgba(10,10,10,1))] p-4 shadow-[0_32px_100px_rgba(34,211,238,0.13),0_14px_34px_rgba(0,0,0,0.30)] transition-all duration-300 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Live Chat Lounge</p>
              <h2 id="community-chat-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Rooms and real-time signal</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-100/70">Ask locals, coordinate tonight, and share fresh community context in focused rooms.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-cyan-100">
                {visibleTopics.length} rooms
              </span>
              <span className="rounded-full border border-sky-200/22 bg-sky-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-sky-100">
                {Object.values(messages || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0)} messages
              </span>
              <button
                type="button"
                onClick={() => {
                  const node = document.getElementById("community-topic-form");
                  if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="qa-action qa-action-strong rounded-full border border-cyan-200/42 bg-cyan-200/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/62"
              >
                Start topic
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.82fr)_minmax(0,1.18fr)] xl:items-stretch">
            <div className="qa-premium-card flex flex-col rounded-[28px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_34%),linear-gradient(180deg,rgba(8,31,39,0.92),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(34,211,238,0.10)] sm:p-5 xl:h-[52rem]">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/70">Rooms</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Choose a room</h3>
                  <p className="mt-2 text-xs leading-5 text-white/56">Focused conversations for tonight, questions, safety, and local signal.</p>
                </div>
                {busiestTopic ? (
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                    Trending
                  </span>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {visibleTopics.map((topic) => {
                  const replies = (messages[topic.id] || []).length;
                  const active = activeTopic?.id === topic.id;
                  return (
                    <article key={topic.id} className={`qa-premium-card w-full rounded-[22px] border p-3.5 text-left transition ${active ? "border-cyan-200/46 bg-cyan-300/14 shadow-[0_14px_34px_rgba(34,211,238,0.16)]" : "border-white/8 bg-[linear-gradient(180deg,rgba(8,30,38,0.74),rgba(11,11,11,0.95))] hover:border-cyan-300/30"} animate-rise-in`}>
                      <button onClick={() => setTopicId(topic.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">{topic.name}</h3>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{topic.description}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.11em] text-cyan-100">{topic.mood}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/58">
                          <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5">{replies} replies</span>
                          {busiestTopic?.id === topic.id ? (
                            <span className="rounded-full border border-emerald-200/18 bg-emerald-200/10 px-2 py-0.5 text-emerald-100">Most active</span>
                          ) : null}
                        </div>
                      </button>
                      {canDeleteTopic(topic) && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => deleteTopic(topic)}
                            className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
                          >
                            Delete topic
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
                {visibleTopics.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-cyan-200/18 px-4 py-8 text-sm text-white/62">
                    No rooms yet. Start the first topic.
                  </div>
                )}
              </div>

              <form id="community-topic-form" onSubmit={createTopic} className="mt-4 rounded-[24px] border border-cyan-400/20 bg-cyan-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Start a topic</p>
                <div className="mt-3 grid gap-3">
                  <Field value={topicForm.name} onChange={(event) => setTopicForm((current) => ({ ...current, name: event.target.value }))} placeholder="Topic name" />
                  <Field value={topicForm.mood} onChange={(event) => setTopicForm((current) => ({ ...current, mood: event.target.value }))} placeholder="Mood" />
                  <Field value={topicForm.description} onChange={(event) => setTopicForm((current) => ({ ...current, description: event.target.value }))} placeholder="What should people discuss here?" area />
                  <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-cyan-100/65 bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Create topic</button>
                </div>
              </form>
            </div>

            <div className="qa-premium-card flex flex-col rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.13),transparent_34%),linear-gradient(180deg,rgba(8,30,38,0.90),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(14,165,233,0.10)] sm:p-5 xl:h-[52rem]">
              {activeTopic ? (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">{activeTopic.mood}</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{activeTopic.name}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{activeTopic.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] text-cyan-100">
                          {activeMessages.length} messages
                        </span>
                        {canDeleteTopic(activeTopic) && (
                          <button
                            onClick={() => deleteTopic(activeTopic)}
                            className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
                          >
                            Delete topic
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 rounded-2xl border border-cyan-200/12 bg-cyan-200/[0.055] px-3 py-2 text-[11px] leading-5 text-cyan-100/72">
                      Keep it kind. Report unsafe, harmful, or private-identifying content.
                    </p>
                  </div>

                  <div ref={chatMessagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4 pr-1 [scrollbar-gutter:stable]">
                    {activeMessages.length === 0 && (
                      <div className="rounded-[24px] border border-dashed border-cyan-200/18 bg-white/[0.025] px-4 py-8 text-sm text-white/60">This room is quiet. Start the signal.</div>
                    )}
                    {activeMessages.map((message) => {
                      const isMine = message.author === (memberName || "Member");
                      return (
                        <div key={message.id} className={`flex gap-2 sm:gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                              {message.author.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-[92%] rounded-[22px] px-3.5 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] sm:max-w-[82%] ${isMine ? "border border-cyan-200/34 bg-cyan-200/16" : "border border-white/10 bg-black/35"}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold text-white/78">
                                {(() => {
                                  const rankMeta = getAuthorIdentityMeta(message.author);
                                  return (
                                    <span className="inline-flex items-center gap-1.5">
                                      {rankMeta?.icon ? (
                                        <span className={rankMeta.iconClass} title={rankMeta.label} aria-label={rankMeta.label}>
                                          {rankMeta.icon}
                                        </span>
                                      ) : null}
                                      <span>{message.author}</span>
                                    </span>
                                  );
                                })()}
                              </p>
                              <span className="text-[10px] text-white/45">{timeAgo(message.createdAt)}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-white/84">{message.text}</p>
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() =>
                                  reportContent({
                                    targetType: "community-message",
                                    targetId: message.id,
                                    title: activeTopic?.name || "Community message",
                                  })
                                }
                                className="qa-action rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/54 transition hover:text-white"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {[
                        "Anyone around this area tonight?",
                        "Best low-key spot for first-time visitors?",
                        "How's the vibe this weekend?",
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMessageForm({ text: preset })}
                          className="qa-action rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] text-cyan-100/90 transition hover:border-cyan-200/40"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} className="grid gap-2.5 md:grid-cols-[1fr_auto] md:gap-3">
                      <Field value={messageForm.text} onChange={(event) => setMessageForm({ text: event.target.value })} placeholder="Write a message to the room" />
                      <button type="submit" className="qa-action qa-action-strong min-h-[44px] rounded-xl border border-cyan-100/65 bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Send</button>
                    </form>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-cyan-100/60">Messages auto-scroll when this room updates.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const node = chatMessagesRef.current;
                          if (!node) return;
                          node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
                        }}
                        className="qa-action rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/45"
                      >
                        Jump to latest
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[28rem] items-center justify-center rounded-[24px] border border-dashed border-cyan-200/18 px-4 py-8 text-center text-sm text-white/58">
                  Choose or create a room to start chatting.
                </div>
              )}
            </div>
          </div>
        </section>
        ) : null}

        {isImprovePanel ? (
        <section aria-labelledby="community-ideas-heading-lab" className="qa-premium-card animate-rise-in mt-6 rounded-[30px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(167,139,250,0.12),transparent_30%),linear-gradient(180deg,rgba(45,31,10,0.96),rgba(10,10,10,1))] p-4 shadow-[0_32px_100px_rgba(251,191,36,0.13),0_14px_34px_rgba(0,0,0,0.30)] transition-all duration-300 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Improve Queer Atlas</p>
              <h2 id="community-ideas-heading-lab" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Atlas Improvement Lab</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-100/70">Suggest what we should build, fix, research, or polish next together.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200/24 bg-amber-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-amber-100">
                {sortedIdeas.length} ideas
              </span>
              <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-violet-100">
                Top vote {sortedIdeas[0]?.votes || 0}
              </span>
              <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/64">
                Community powered
              </span>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)] xl:items-start">
            <div className="qa-premium-card rounded-[28px] border border-amber-300/18 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(48,33,12,0.92),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(251,191,36,0.10)] sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/70">Submit an idea</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Help shape the atlas</h3>
              <p className="mt-2 text-xs leading-5 text-white/56">Tell us what would make the app safer, smarter, prettier, or more useful.</p>

              <form id="community-idea-form-lab" onSubmit={publishIdea} className="mt-4 space-y-3">
                <select
                  value={ideaForm.category}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-xl border border-amber-200/20 bg-[#1c160d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-200/50 [&_option]:bg-[#1c160d]"
                >
                  <option value="Feature">Feature</option>
                  <option value="Bug / Fix">Bug / Fix</option>
                  <option value="City data">City data</option>
                  <option value="Safety">Safety</option>
                  <option value="Design">Design</option>
                </select>
                <Field value={ideaForm.text} onChange={(event) => setIdeaForm((current) => ({ ...current, text: event.target.value }))} placeholder="What should we improve in the app?" area />
                <button type="submit" className="qa-action qa-action-strong min-h-[44px] w-full rounded-xl border border-amber-100/65 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Share idea</button>
              </form>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/44">How it helps</p>
                <p className="mt-2 text-xs leading-5 text-white/58">High-vote ideas help us choose roadmap priorities. Clear city-data and safety reports make updates faster.</p>
              </div>
            </div>

            <div className="qa-premium-card rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.12),transparent_34%),linear-gradient(180deg,rgba(34,25,12,0.86),rgba(9,9,11,0.98))] p-4 shadow-[0_22px_64px_rgba(0,0,0,0.24)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-100/70">Community roadmap</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Most wanted improvements</h3>
                  <p className="mt-2 text-xs leading-5 text-white/56">Vote on what matters. Report unsafe or irrelevant entries.</p>
                </div>
              </div>

              <div className="qa-defer-render max-h-[52rem] space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {sortedIdeas.map((idea, index) => {
                  const statusLabel =
                    index === 0 && Number(idea.votes || 0) > 1
                      ? "Most wanted"
                      : index < 3
                        ? "Community pick"
                        : isWithinDays(idea.createdAt, 7)
                          ? "Fresh"
                          : "Needs review";
                  const statusClass =
                    statusLabel === "Most wanted"
                      ? "border-amber-200/34 bg-amber-200/14 text-amber-100"
                      : statusLabel === "Community pick"
                        ? "border-violet-200/28 bg-violet-200/12 text-violet-100"
                        : statusLabel === "Fresh"
                          ? "border-emerald-200/24 bg-emerald-200/10 text-emerald-100"
                          : "border-white/14 bg-white/7 text-white/66";
                  return (
                    <article key={idea.id} className="qa-premium-card animate-rise-in rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(46,31,10,0.78),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] hover:border-amber-200/30 hover:shadow-[0_24px_60px_rgba(251,191,36,0.14)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass}`}>
                            {statusLabel}
                          </span>
                          <p className="mt-3 text-sm leading-6 text-white/78">{idea.text}</p>
                          <p className="mt-2 text-xs text-white/60">{idea.author} | {timeAgo(idea.createdAt)}</p>
                        </div>
                        <button onClick={() => upvoteIdea(idea.id)} className="qa-action shrink-0 rounded-[18px] border border-amber-300/34 bg-amber-300/12 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/16 hover:text-white">
                          <span className="block text-base leading-none">{idea.votes}</span>
                          <span className="mt-1 block text-[10px] uppercase tracking-[0.11em]">Vote +1</span>
                        </button>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() =>
                            reportContent({
                              targetType: "community-idea",
                              targetId: idea.id,
                              title: idea.text.slice(0, 80),
                            })
                          }
                          className="qa-action rounded-full border border-amber-200/22 bg-amber-200/10 px-3 py-1 text-xs text-amber-100 transition hover:border-amber-200/37"
                        >
                          Report
                        </button>
                      </div>
                    </article>
                  );
                })}
                {sortedIdeas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-amber-300/26 px-4 py-8 text-sm text-white/62">
                    No ideas yet. Suggest the first improvement for Queer Atlas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {false && isImprovePanel ? (
        <section aria-labelledby="community-ideas-heading" className="qa-premium-card animate-rise-in mt-6 rounded-[26px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%),linear-gradient(180deg,rgba(45,31,10,0.96),rgba(10,10,10,1))] p-4 shadow-[0_32px_100px_rgba(251,191,36,0.13),0_14px_34px_rgba(0,0,0,0.30)] transition-all duration-300 sm:rounded-[30px] sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5 sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Improve Queer Atlas</p>
              <h2 id="community-ideas-heading" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Member ideas</h2>
              <p className="mt-1 text-xs text-amber-100/70">Propose what we should build next together.</p>
            </div>
            <button
              onClick={() => setShowIdeaForm((current) => !current)}
              aria-expanded={showIdeaForm}
              aria-controls="community-idea-form"
              className="qa-action qa-action-strong rounded-full border border-amber-300/34 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/16 hover:text-white"
            >
              {showIdeaForm ? "Close form" : "Suggest an improvement"}
            </button>
          </div>
          {showIdeaForm && (
            <form id="community-idea-form" onSubmit={publishIdea} className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Field value={ideaForm.text} onChange={(event) => setIdeaForm((current) => ({ ...current, text: event.target.value }))} placeholder="What should we improve in the app?" />
                <button type="submit" className="qa-action qa-action-strong min-h-[44px] rounded-xl border border-amber-100/65 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Share idea</button>
              </div>
            </form>
          )}
          <div className="qa-defer-render grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedIdeas.map((idea) => (
              <div key={idea.id} className="qa-premium-card animate-rise-in rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(46,31,10,0.78),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] hover:border-amber-200/30 hover:shadow-[0_24px_60px_rgba(251,191,36,0.14)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm leading-6 text-white/74">{idea.text}</p>
                    <p className="mt-2 text-xs text-white/60">{idea.author} · {timeAgo(idea.createdAt)}</p>
                    <button
                      onClick={() =>
                        reportContent({
                          targetType: "community-idea",
                          targetId: idea.id,
                          title: idea.text.slice(0, 80),
                        })
                      }
                      className="qa-action mt-2 rounded-full border border-amber-200/22 bg-amber-200/10 px-3 py-1 text-xs text-amber-100 transition hover:border-amber-200/37"
                    >
                      Report
                    </button>
                  </div>
                  <button onClick={() => upvoteIdea(idea.id)} className="qa-action rounded-full border border-amber-300/34 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/16 hover:text-white">? {idea.votes}</button>
                </div>
              </div>
            ))}
            {sortedIdeas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-amber-300/26 px-4 py-8 text-sm text-white/62 md:col-span-2 xl:col-span-3">
                No ideas yet. Suggest the first improvement for Queer Atlas.
              </div>
            )}
          </div>
        </section>
        ) : null}
      </div>
      {reportModal.open && (
        <div className="fixed inset-0 z-[92] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-cyan-200/22 bg-[linear-gradient(165deg,rgba(8,30,38,0.9),rgba(10,10,10,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/75">Safety report</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Report content</h3>
                <p className="mt-1 line-clamp-1 text-sm text-white/70">{reportModal.title}</p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/66">Reason</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {REPORT_REASON_OPTIONS.map((item) => {
                      const active = reportModal.reasonKey === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setReportModal((current) => ({ ...current, reasonKey: item.value }))}
                          className={`rounded-2xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-cyan-200/42 bg-cyan-200/16 text-cyan-50"
                              : "border-white/12 bg-white/[0.03] text-white/82 hover:border-white/24"
                          }`}
                        >
                          <p className="text-sm font-semibold">{item.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-white/66" htmlFor="community-report-details">
                    Extra details (optional)
                  </label>
                  <textarea
                    id="community-report-details"
                    value={reportModal.details}
                    onChange={(event) => setReportModal((current) => ({ ...current, details: event.target.value }))}
                    placeholder="Share context to help moderators act faster."
                    className="mt-2 min-h-[104px] w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReportModal}
                  className="rounded-full border border-cyan-200/34 bg-cyan-200/16 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/55"
                >
                  Send report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ActionToast toast={toast} />
    </main>
  );
}


