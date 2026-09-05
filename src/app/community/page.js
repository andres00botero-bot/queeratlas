"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import PageOpeningState from "@/components/ui/PageOpeningState";
import {
  CommunityField as Field,
  CommunityHero,
  CommunityNavigation,
} from "@/components/community/CommunityChrome";

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
const JOB_VISIBLE_BATCH = 8;
const IDEA_CATEGORIES = ["Feature", "Bug / Fix", "City data", "Safety", "Design"];
const IDEA_VISIBLE_BATCH = 10;
const ROOM_CATEGORIES = ["City question", "Tonight", "Solo travel", "Safety", "Recommendations", "Event meetup"];
const ROOM_FILTERS = [
  { id: "all", label: "For you" },
  { id: "city", label: "Cities" },
  { id: "event", label: "Events" },
  { id: "ask", label: "Ask locals" },
];
const ROOM_KIND_META = {
  city: {
    label: "City lounge",
    kicker: "Drop in",
    accent: "text-cyan-100",
    dot: "bg-cyan-200",
    wash: "bg-[radial-gradient(circle_at_82%_15%,rgba(103,232,249,0.20),transparent_30%),linear-gradient(145deg,rgba(13,29,38,0.96),rgba(7,10,15,0.99))]",
  },
  event: {
    label: "Event room",
    kicker: "Make a plan",
    accent: "text-rose-100",
    dot: "bg-rose-200",
    wash: "bg-[radial-gradient(circle_at_84%_14%,rgba(251,113,133,0.20),transparent_31%),linear-gradient(145deg,rgba(39,19,28,0.96),rgba(9,9,14,0.99))]",
  },
  ask: {
    label: "Ask locals",
    kicker: "Local knowledge",
    accent: "text-emerald-100",
    dot: "bg-emerald-200",
    wash: "bg-[radial-gradient(circle_at_84%_14%,rgba(110,231,183,0.18),transparent_31%),linear-gradient(145deg,rgba(14,33,29,0.96),rgba(7,10,13,0.99))]",
  },
};
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

function getRoomKind(topic = {}) {
  const category = String(topic.mood || "").toLowerCase();
  if (category.includes("event") || category.includes("tonight")) return "event";
  if (
    category.includes("question") ||
    category.includes("safety") ||
    category.includes("recommend") ||
    category.includes("helpful") ||
    category.includes("feedback")
  ) return "ask";
  return "city";
}

function getRoomCity(topic = {}) {
  const explicitCity = String(topic.city || "").trim();
  if (explicitCity) return explicitCity;
  const searchable = `${topic.name || ""} ${topic.description || ""}`.toLowerCase();
  const citySlug = Object.keys(cityConfig || {}).find((slug) => {
    const label = formatCityLabel(slug).toLowerCase();
    return label.length > 2 && searchable.includes(label);
  });
  return citySlug ? formatCityLabel(citySlug) : "Across the atlas";
}

function getRoomActivityLabel(value = "") {
  if (!value) return "Waiting for a first message";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently active";
  const ageInHours = Math.max(0, (Date.now() - timestamp) / 36e5);
  if (ageInHours < 2) return "Active now";
  if (ageInHours < 24) return "Active today";
  if (ageInHours < 168) return "Active this week";
  return "Quiet room";
}

function formatMessageDay(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Conversation";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const difference = Math.round((startToday - startDate) / 86400000);
  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
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

function getOrganizationInitials(value = "") {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "QA";
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function parseIdeaText(value = "") {
  const raw = String(value || "").trim();
  const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/s);
  if (!match) return { category: "Feature", content: raw };
  return {
    category: match[1].trim() || "Feature",
    content: match[2].trim() || raw,
  };
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
  if (!lastSeenAt) return "Activity private";
  const safe = new Date(lastSeenAt);
  if (Number.isNaN(safe.getTime())) return "Active recently";
  const ageInHours = Math.max(0, (Date.now() - safe.getTime()) / 36e5);
  if (ageInHours <= 24) return "Active recently";
  if (ageInHours <= 168) return "Active this week";
  return "Activity private";
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

export default function CommunityPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [authWaitExpired, setAuthWaitExpired] = useState(false);
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
  const [jobCategoryFilter, setJobCategoryFilter] = useState("all");
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [visibleJobCount, setVisibleJobCount] = useState(JOB_VISIBLE_BATCH);
  const [messageForm, setMessageForm] = useState({ text: "" });
  const [topicForm, setTopicForm] = useState({ name: "", mood: "City question", description: "" });
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [mobileRoomOpen, setMobileRoomOpen] = useState(false);
  const [roomFilter, setRoomFilter] = useState("all");
  const [ideaForm, setIdeaForm] = useState({ text: "", category: "Feature" });
  const [ideaCategoryFilter, setIdeaCategoryFilter] = useState("all");
  const [ideaSort, setIdeaSort] = useState("top");
  const [visibleIdeaCount, setVisibleIdeaCount] = useState(IDEA_VISIBLE_BATCH);
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
  const [activeCommunityPanel, setActiveCommunityPanel] = useState("home");
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
  const loadedCommunityScopesRef = useRef(new Set());
  const communityScopeRequestsRef = useRef(new Map());
  const memberSearchSentinelRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const communityControlsRef = useRef(null);
  const communityControlButtonsRef = useRef({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const panel = String(params.get("panel") || "").trim();
    const compose = String(params.get("compose") || "").trim();
    if (panel !== "feed" && compose !== "story" && compose !== "guide") return;
    const nextCompose = compose === "guide" ? "guide" : "story";
    router.replace(`/now/voices?compose=${nextCompose}`);
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setAuthWaitExpired(true), 2600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const button = communityControlButtonsRef.current[activeCommunityPanel];
    const controls = communityControlsRef.current;
    if (!button || !controls || typeof controls.scrollTo !== "function") return;
    const nextLeft = button.offsetLeft - (controls.clientWidth - button.clientWidth) / 2;
    controls.scrollTo({ left: Math.max(0, nextLeft), behavior: "smooth" });
  }, [activeCommunityPanel]);

  useEffect(() => {
    if (!reportModal.open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setReportModal((current) => ({ ...current, open: false }));
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [reportModal.open]);

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

  const loadCommunityData = useCallback(async ({ scope = "home", force = false } = {}) => {
    const safeScope = ["home", "feed", "chat", "jobs", "improve", "discovery"].includes(scope) ? scope : "home";
    if (!force && loadedCommunityScopesRef.current.has(safeScope)) return;
    if (!force && communityScopeRequestsRef.current.has(safeScope)) {
      await communityScopeRequestsRef.current.get(safeScope);
      return;
    }

    const request = (async () => {
    const needsFeed = safeScope === "feed";
    const needsRooms = safeScope === "home" || safeScope === "chat";
    const needsJobs = safeScope === "home" || safeScope === "jobs";
    const needsIdeas = safeScope === "improve";
    const needsLeaderboard = safeScope === "discovery";
    setSyncError("");
    const localStories = readStored(KEYS.stories, baseStories);
    const localGuides = readStored(KEYS.guides, baseGuides);
    const localJobs = readStored(KEYS.jobs, baseJobs);
    const localTopics = applyTopicPolicy(readStored(KEYS.topics, baseTopics));
    const localMessages = readStored(KEYS.messages, baseMessages);
    const localIdeas = readStored(KEYS.ideas, baseIdeas);
    const localArchive = readStored(KEYS.messageArchive, {});

    const skippedResponse = { data: [], error: null, skipped: true };
    const [storiesRes, guidesRes, jobsRes, topicsRes, messagesRes, ideasRes, leaderboardRes] = await Promise.all([
      needsFeed ? supabase.from("community_stories").select("*").order("created_at", { ascending: false }) : Promise.resolve(skippedResponse),
      needsFeed ? supabase.from("community_guides").select("*").order("created_at", { ascending: false }) : Promise.resolve(skippedResponse),
      needsJobs ? supabase.from("community_jobs").select("*").order("created_at", { ascending: false }) : Promise.resolve(skippedResponse),
      needsRooms ? supabase.from("community_topics").select("*").order("created_at", { ascending: false }) : Promise.resolve(skippedResponse),
      needsRooms ? supabase.from("community_messages").select("*").order("created_at", { ascending: true }) : Promise.resolve(skippedResponse),
      needsIdeas ? supabase.from("community_ideas").select("*").order("created_at", { ascending: false }) : Promise.resolve(skippedResponse),
      needsLeaderboard ? supabase.from("qa_member_leaderboard").select("*").order("rank", { ascending: true }).limit(200) : Promise.resolve(skippedResponse),
    ]);

    const errorParts = [];
    if (!storiesRes.skipped && storiesRes.error) errorParts.push("stories");
    if (!guidesRes.skipped && guidesRes.error) errorParts.push("guides");
    if (!jobsRes.skipped && jobsRes.error) errorParts.push("jobs");
    if (!topicsRes.skipped && topicsRes.error) errorParts.push("topics");
    if (!messagesRes.skipped && messagesRes.error) errorParts.push("messages");
    if (!ideasRes.skipped && ideasRes.error) errorParts.push("ideas");

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
    if (needsLeaderboard && leaderboardUserIds.length > 0) {
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
    if (needsLeaderboard && memberUserId) {
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

    if (needsFeed) {
      setStories(nextStories);
      setGuides(nextGuides);
    }
    if (needsJobs) setJobs(nextJobs);
    if (needsRooms) {
      setTopics(nextTopics);
      setMessages(Object.keys(cappedMessages).length > 0 ? cappedMessages : baseMessages);
      setMessageArchive(nextArchive);
    }
    if (needsIdeas) setIdeas(nextIdeas);
    if (needsLeaderboard) setLeaderboard(resolvedLeaderboard);
    if (errorParts.length > 0) {
      setSyncError(`Partial cloud sync: ${errorParts.join(", ")} using local fallback.`);
    }
    if (errorParts.length === 0) {
      loadedCommunityScopesRef.current.add(safeScope);
      if (safeScope === "home") {
        loadedCommunityScopesRef.current.add("chat");
        loadedCommunityScopesRef.current.add("jobs");
      }
    }
    })();

    communityScopeRequestsRef.current.set(safeScope, request);
    try {
      await request;
    } finally {
      communityScopeRequestsRef.current.delete(safeScope);
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
            await loadCommunityData({ scope: "chat", force: true });
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_messages" },
        () => {
          queueMicrotask(async () => {
            await loadCommunityData({ scope: "chat", force: true });
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_jobs" },
        () => {
          queueMicrotask(async () => {
            await loadCommunityData({ scope: "jobs", force: true });
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
      router.replace("/?join=true");
      queueMicrotask(() => {
        setIsReady(true);
      });
      return;
    }

    queueMicrotask(async () => {
      await loadCommunityData({ scope: "home" });
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadCommunityData, router]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    queueMicrotask(async () => {
      await loadCommunityData({ scope: activeCommunityPanel });
    });
  }, [activeCommunityPanel, isReady, isMember, loadCommunityData]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.stories, stories);
    writeLocalJson(KEYS.guides, guides);
  }, [isReady, isMember, stories, guides]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.jobs, jobs);
  }, [isReady, isMember, jobs]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.topics, topics);
    writeLocalJson(KEYS.messages, messages);
    writeLocalJson(KEYS.messageArchive, messageArchive);
  }, [isReady, isMember, topics, messages, messageArchive]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.ideas, ideas);
  }, [isReady, isMember, ideas]);

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
    if (activeCommunityPanel !== "home" && activeCommunityPanel !== "discovery") return;
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
    activeCommunityPanel,
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
    activeCommunityPanel,
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

  if (!isReady && !authWaitExpired) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening community..."
          subtitle="Connecting members, jobs, and live conversations."
          tone="violet"
        />
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <PageOpeningState
          title="Opening sign in..."
          subtitle="Community is reserved for Queer Atlas members."
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
    const categoryPass = jobCategoryFilter === "all" || normalizeMemberKey(job.category) === normalizeMemberKey(jobCategoryFilter);
    const searchNeedle = normalizeMemberKey(jobSearchTerm);
    const searchPass = !searchNeedle || normalizeMemberKey([
      job.title,
      job.organizationName,
      job.city,
      job.country,
      job.category,
      job.employmentType,
      job.description,
    ].join(" ")).includes(searchNeedle);
    return cityPass && modePass && categoryPass && searchPass;
  }).sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  const displayedJobs = filteredJobs.slice(0, visibleJobCount);
  const hasActiveJobFilters = Boolean(jobCityFilter || jobModeFilter !== "all" || jobCategoryFilter !== "all" || jobSearchTerm.trim());
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
  const filteredIdeas = visibleIdeas
    .filter((idea) => ideaCategoryFilter === "all" || normalizeMemberKey(parseIdeaText(idea.text).category) === normalizeMemberKey(ideaCategoryFilter))
    .sort((a, b) => {
      if (ideaSort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return Number(b.votes || 0) - Number(a.votes || 0) || new Date(b.createdAt) - new Date(a.createdAt);
    });
  const displayedIdeas = filteredIdeas.slice(0, visibleIdeaCount);
  const resolvedTopicId = visibleTopics.some((topic) => topic.id === topicId) ? topicId : visibleTopics[0]?.id;
  const activeTopic = visibleTopics.find((topic) => topic.id === resolvedTopicId) || null;
  const activeMessages = activeTopic
    ? (messages[activeTopic.id] || []).filter((message) => !isBlocked("community-message", message.id))
    : [];
  const roomCards = [...visibleTopics]
    .map((topic) => {
      const topicMessages = (messages[topic.id] || []).filter((message) => !isBlocked("community-message", message.id));
      const latestMessage = topicMessages[topicMessages.length - 1];
      const participants = new Set(
        [topic.author, ...topicMessages.map((message) => message.author)]
          .map((value) => normalizeMemberKey(value))
          .filter(Boolean)
      ).size;
      return {
        ...topic,
        kind: getRoomKind(topic),
        cityLabel: getRoomCity(topic),
        replies: topicMessages.length,
        participants,
        latestMessage,
        latestActivity: latestMessage?.createdAt || topic.createdAt || "",
      };
    })
    .sort((a, b) => {
      const dateDifference = new Date(b.latestActivity || 0) - new Date(a.latestActivity || 0);
      return dateDifference || b.replies - a.replies;
    });
  const filteredRoomCards = roomFilter === "all" ? roomCards : roomCards.filter((room) => room.kind === roomFilter);
  const featuredRoom = filteredRoomCards[0] || null;
  const roomList = filteredRoomCards.slice(1);
  const activeRoomKind = activeTopic ? getRoomKind(activeTopic) : "city";
  const activeRoomMeta = ROOM_KIND_META[activeRoomKind];
  const homeTopics = [...visibleTopics]
    .map((topic) => {
      const topicMessages = (messages[topic.id] || []).filter((message) => !isBlocked("community-message", message.id));
      const latestMessage = topicMessages[topicMessages.length - 1];
      return {
        ...topic,
        replies: topicMessages.length,
        latestActivity: latestMessage?.createdAt || topic.createdAt || "",
      };
    })
    .sort((a, b) => {
      const dateDifference = new Date(b.latestActivity || 0) - new Date(a.latestActivity || 0);
      return dateDifference || b.replies - a.replies;
    })
    .slice(0, 2);
  const homeMembers = [...memberSearchRows]
    .sort((a, b) => {
      const aSignal = Number(a.is_online) * 4 + Number(a.trusted_contributor) * 2 + Math.min(a.mutual_count, 3);
      const bSignal = Number(b.is_online) * 4 + Number(b.trusted_contributor) * 2 + Math.min(b.mutual_count, 3);
      return bSignal - aSignal;
    })
    .slice(0, 3);
  const homeJob = [...publishedJobs].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))[0] || null;
  const homeVoice = unifiedFeedItems[0] || null;
  const homeIdea = sortedIdeas[0] || null;
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
    setMobileRoomOpen(false);

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
    if (!storyForm.title || !storyForm.body) {
      showToast("Story not published. Fill all required fields.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = {
      id: createClientId("s"),
      ...storyForm,
      city: storyForm.city || "Global",
      author: memberName || "Member",
      authorUserId: String(user?.id || ""),
      authorEmail: String(user?.email || ""),
      excerpt: storyForm.excerpt || storyForm.body.slice(0, 120),
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await insertCommunityRowWithIdentity("community_stories", {
        title: storyForm.title,
        city: storyForm.city || "Global",
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
    setTopicForm({ name: "", mood: "City question", description: "" });
    setShowTopicForm(false);
    setMobileRoomOpen(true);
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
      title: String(reportModal.title || "").slice(0, 160),
      reason,
      message: String(reportModal.details || "").trim().slice(0, 1000),
    });

    trackKpiEvent("report_submitted", {
      targetType: reportModal.targetType,
      targetId: String(reportModal.targetId),
      memberKey: String(user?.id || "member"),
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

  const isHomePanel = activeCommunityPanel === "home";
  const isDiscoveryPanel = activeCommunityPanel === "discovery";
  const isFeedPanel = activeCommunityPanel === "feed";
  const isJobsPanel = activeCommunityPanel === "jobs";
  const isChatPanel = activeCommunityPanel === "chat";
  const isImprovePanel = activeCommunityPanel === "improve";

  return (
    <main data-community-section={activeCommunityPanel} className="qa-page qa-community-page min-h-screen px-4 py-6 pb-8 text-white sm:px-6 sm:py-8 sm:pb-12">
      <ActionToast toast={toast} />
      <div className="qa-shell relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.04),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(59,130,246,0.05),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_30%)]" />
        <CommunityHero
          memberName={memberName}
          onExplore={() => {
            setActiveCommunityPanel("discovery");
            window.requestAnimationFrame(() => {
              document.getElementById("community-discovery-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        />

        {syncError && (
          <p role="status" aria-live="polite" className="mb-5 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
            {syncError}
          </p>
        )}

        <CommunityNavigation
          activePanel={activeCommunityPanel}
          onSelect={setActiveCommunityPanel}
          controlsRef={communityControlsRef}
          controlButtonsRef={communityControlButtonsRef}
        />

        {isHomePanel ? (
          <section
            aria-labelledby="community-home-heading"
            className="qa-community-section qa-community-section-home animate-rise-in mb-6 overflow-hidden rounded-[28px] border border-white/[0.10] bg-[linear-gradient(155deg,rgba(15,19,28,0.97),rgba(7,9,14,0.99))] shadow-[0_28px_90px_rgba(0,0,0,0.32)] [&_h2]:!text-left [&_h2]:[hyphens:none] [&_h3]:!text-left [&_h3]:[hyphens:none] [&_p]:!text-left [&_p]:[hyphens:none] sm:rounded-[32px]"
          >
            <div className="border-b border-white/[0.08] px-5 py-6 sm:px-7 sm:py-7 lg:flex lg:items-end lg:justify-between lg:gap-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/62">Your community</p>
                <h2 id="community-home-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                  Start with what is moving now.
                </h2>
              </div>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/52 lg:mt-0">
                Conversations, people, and opportunities selected from across the member network.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
              <div className="px-5 py-6 sm:px-7 sm:py-7 lg:border-r lg:border-white/[0.08]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">Active rooms</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">Join the conversation</h3>
                  </div>
                  <button type="button" onClick={() => setActiveCommunityPanel("chat")} className="qa-action min-h-11 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/68 transition hover:border-white/24 hover:text-white">
                    All rooms
                  </button>
                </div>

                <div className="mt-5 border-y border-white/[0.08]">
                  {homeTopics.map((topic, index) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setTopicId(topic.id);
                        setActiveCommunityPanel("chat");
                        setMobileRoomOpen(true);
                      }}
                      className={`group flex min-h-[104px] w-full items-center justify-between gap-5 py-4 text-left transition hover:bg-white/[0.025] ${index > 0 ? "border-t border-white/[0.08]" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-semibold text-white transition group-hover:text-cyan-50">{topic.name}</h3>
                          <span className="text-[11px] text-cyan-100/58">{topic.mood}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/54">{topic.description}</p>
                        <p className="mt-2 text-xs text-white/38">{topic.replies} {topic.replies === 1 ? "reply" : "replies"}{topic.latestActivity ? ` · ${timeAgo(topic.latestActivity)}` : ""}</p>
                      </div>
                      <span aria-hidden="true" className="shrink-0 text-lg text-white/28 transition group-hover:translate-x-1 group-hover:text-cyan-100">→</span>
                    </button>
                  ))}
                  {homeTopics.length === 0 ? (
                    <div className="py-8">
                      <p className="text-sm text-white/52">No active rooms yet. Start the first conversation.</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-white/[0.08] px-5 py-6 sm:px-7 sm:py-7 lg:border-t-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">People to know</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">Across the atlas</h3>
                  </div>
                  <button type="button" onClick={() => setActiveCommunityPanel("discovery")} className="qa-action min-h-11 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/68 transition hover:border-white/24 hover:text-white">
                    Find people
                  </button>
                </div>

                <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {homeMembers.map((entry) => {
                    const avatarUrl = resolveAvatarUrlFromProfile(entry);
                    const initials = String(entry.display_name || "Member").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "M";
                    const memberContext = [entry.home_city ? formatCityLabel(entry.home_city) : "", entry.mutual_count > 0 ? `${entry.mutual_count} mutual` : ""].filter(Boolean).join(" · ");
                    return (
                      <div key={entry.user_id} className="flex min-h-[72px] items-center gap-3 py-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/[0.06] text-xs font-semibold text-white/78">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={`${entry.display_name || "Queer Atlas member"} profile photo`} className="h-full w-full object-cover" />
                          ) : initials}
                          {entry.is_online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0c1018] bg-emerald-300" aria-label="Active now" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{entry.display_name}</p>
                            {entry.trusted_contributor ? <span className="text-[10px] font-semibold text-cyan-100/66">Trusted</span> : null}
                          </div>
                          <p className="mt-1 truncate text-xs text-white/44">{memberContext || "Queer Atlas member"}</p>
                        </div>
                      </div>
                    );
                  })}
                  {homeMembers.length === 0 ? (
                    <div className="py-8">
                      <p className="text-sm text-white/52">Member recommendations will appear here.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid border-t border-white/[0.08] sm:grid-cols-3">
              <div className="px-5 py-5 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">Opportunity</p>
                <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{homeJob?.title || "Queer jobs across the network"}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/44">{homeJob ? [homeJob.organizationName, homeJob.city, homeJob.locationMode].filter(Boolean).join(" · ") : "Discover member-posted roles and collaborations."}</p>
                <button type="button" onClick={() => setActiveCommunityPanel("jobs")} className="mt-4 min-h-11 text-xs font-semibold text-cyan-100/76 transition hover:text-cyan-50">Explore jobs →</button>
              </div>
              <div className="border-t border-white/[0.08] px-5 py-5 sm:border-l sm:border-t-0 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">From Voices</p>
                <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{homeVoice?.payload?.title || "Stories from the community"}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/44">Local perspective, personal stories, and member guides.</p>
                <Link href="/now/voices" className="mt-4 inline-flex min-h-11 items-center text-xs font-semibold text-cyan-100/76 transition hover:text-cyan-50">Read Voices →</Link>
              </div>
              <div className="border-t border-white/[0.08] px-5 py-5 sm:border-l sm:border-t-0 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">Build with us</p>
                <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{homeIdea?.text || "Help shape what comes next"}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/44">Suggest, vote, and follow ideas for Queer Atlas.</p>
                <button type="button" onClick={() => setActiveCommunityPanel("improve")} className="mt-4 min-h-11 text-xs font-semibold text-cyan-100/76 transition hover:text-cyan-50">Open ideas →</button>
              </div>
            </div>
          </section>
        ) : null}

        {isDiscoveryPanel ? (
          <section
            aria-labelledby="community-discovery-heading"
            aria-busy={memberSearchLoading}
            className="qa-community-section qa-community-section-people animate-rise-in mb-6 overflow-hidden rounded-[28px] border border-white/[0.10] bg-[linear-gradient(155deg,rgba(15,19,28,0.97),rgba(7,9,14,0.99))] shadow-[0_28px_90px_rgba(0,0,0,0.32)] [&_h2]:!text-left [&_h2]:[hyphens:none] [&_p]:!text-left [&_p]:[hyphens:none] sm:rounded-[32px]"
          >
            <div className="border-b border-white/[0.08] px-5 py-6 sm:px-7 sm:py-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/62">People</p>
                  <h2 id="community-discovery-heading" className="mt-2 scroll-mt-28 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">Find people across the atlas.</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/52">Search by name or place, then connect at your own pace.</p>
                </div>
                <p className="text-xs text-white/42" aria-live="polite">
                  {memberSearchLoading ? "Searching members..." : `${displayedMemberRows.length} members shown${memberSearchHasMore ? " · more available" : ""}`}
                </p>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.75fr)_minmax(11rem,0.65fr)]">
                <input
                  value={memberSearchTerm}
                  onChange={(event) => setMemberSearchTerm(event.target.value)}
                  placeholder="Search name, city, country, or pronouns"
                  aria-label="Search community members"
                  className="min-h-12 w-full rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-100/42 focus:bg-white/[0.075]"
                />
                <select
                  value={memberSearchCity}
                  onChange={(event) => setMemberSearchCity(event.target.value)}
                  aria-label="Filter members by city"
                  className="min-h-12 w-full rounded-2xl border border-white/12 bg-[#11151e] px-4 text-sm text-white/78 outline-none transition focus:border-cyan-100/42"
                >
                  <option value="">All cities</option>
                  {memberDiscoveryCities.map((city) => (
                    <option key={city.normalized} value={city.raw}>{city.label}</option>
                  ))}
                </select>
                <select
                  value={memberSearchSort}
                  onChange={(event) => setMemberSearchSort(event.target.value)}
                  aria-label="Sort members"
                  className="min-h-12 w-full rounded-2xl border border-white/12 bg-[#11151e] px-4 text-sm text-white/78 outline-none transition focus:border-cyan-100/42"
                >
                  <option value="best">Best match</option>
                  <option value="active">Recently active</option>
                  <option value="mutual">Mutual connections</option>
                </select>
              </div>

              <div className="mt-3 flex items-center gap-5 border-t border-white/[0.06] pt-3">
                <button type="button" aria-pressed={memberSearchScope === "all"} onClick={() => setMemberSearchScope("all")} className={`min-h-11 text-xs font-semibold transition ${memberSearchScope === "all" ? "text-white" : "text-white/42 hover:text-white/72"}`}>All people</button>
                <button type="button" aria-pressed={memberSearchScope === "friends"} onClick={() => setMemberSearchScope("friends")} className={`min-h-11 text-xs font-semibold transition ${memberSearchScope === "friends" ? "text-white" : "text-white/42 hover:text-white/72"}`}>Following</button>
              </div>

              {memberSearchWarning ? (
                <p className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/[0.08] px-3 py-2 text-xs text-amber-100">{memberSearchWarning}</p>
              ) : null}
            </div>

            <div className="divide-y divide-white/[0.08] px-5 sm:px-7">
              {displayedMemberRows.map((entry) => {
                const titleMeta = getMemberTitleMeta(entry.title || "");
                const busy = Boolean(memberSearchBusyById[entry.user_id]);
                const avatarUrl = resolveAvatarUrlFromProfile(entry);
                const initials = String(entry.display_name || "Member").split(/\s+/).filter(Boolean).slice(0, 2).map((chunk) => chunk.charAt(0).toUpperCase()).join("") || "M";
                const location = [entry.home_city ? formatCityLabel(entry.home_city) : "", entry.resident_country].filter(Boolean).join(", ");
                return (
                  <article key={entry.user_id} className="group py-5 transition sm:py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <button type="button" onClick={() => openMemberProfile(entry)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold text-white/78">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={`${entry.display_name || "Queer Atlas member"} profile photo`} className="h-full w-full object-cover" />
                          ) : initials}
                          {entry.is_online ? <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0a0d13] bg-emerald-300" title="Active now" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <p className="truncate text-base font-semibold text-white transition group-hover:text-cyan-50">{entry.display_name}</p>
                            {entry.pronouns ? <span className="text-xs text-white/38">{entry.pronouns}</span> : null}
                            {entry.trusted_contributor ? (
                              <span title="Recognized for trusted contributions to Queer Atlas" className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-100/70">Trusted contributor</span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-white/48">{location || "Location not shared"}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/38">
                            <span className={entry.is_online ? "text-emerald-200/76" : ""}>{formatMemberSeen(entry.last_seen_at, entry.is_online)}</span>
                            <span>{titleMeta.icon} {titleMeta.label}</span>
                            {entry.mutual_count > 0 ? <span>{entry.mutual_count} mutual</span> : null}
                            {entry.follows_you ? <span>Follows you</span> : null}
                          </div>
                        </div>
                      </button>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                        <button type="button" onClick={() => openMemberThread(entry)} className="qa-action min-h-11 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/68 transition hover:border-white/24 hover:text-white">Message</button>
                        <button type="button" onClick={() => toggleMemberFollow(entry)} disabled={busy} className={`qa-action min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${entry.is_following ? "border-cyan-100/24 bg-cyan-100/[0.08] text-cyan-50" : "border-white/16 bg-white text-[#080b11] hover:bg-cyan-50"}`}>
                          {busy ? "Saving..." : entry.is_following ? "Following" : "Follow"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {!memberSearchLoading && displayedMemberRows.length === 0 ? (
                <div className="py-12">
                  <p className="text-sm text-white/52">No people match these filters. Try another place or broaden your search.</p>
                </div>
              ) : null}
            </div>

            <div ref={memberSearchSentinelRef} className="h-2 w-full" aria-hidden />
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-4 sm:px-7">
              <p className="text-[11px] text-white/36">Member visibility follows each person&apos;s profile settings.</p>
              {memberSearchHasMore ? (
                <button
                  type="button"
                  onClick={() => queueMicrotask(async () => { await loadMoreMemberDiscovery(); })}
                  disabled={memberSearchLoading}
                  className="qa-action min-h-11 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/68 transition hover:border-white/24 hover:text-white disabled:opacity-60"
                >
                  {memberSearchLoading ? "Loading..." : "Load more"}
                </button>
              ) : null}
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
              <button type="button" onClick={() => setShowStoryForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-rose-300/34 bg-rose-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-100 transition hover:border-rose-200/62">
                {showStoryForm ? "Close story form" : "Write story"}
              </button>
              <button type="button" onClick={() => setShowGuideForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-violet-300/34 bg-violet-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-100 transition hover:border-violet-200/62">
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
                    <Field value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City or venue (optional)" />
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
                        <button type="button" onClick={() => toggleStoryExpanded(story.id)} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">{expandedStoryIds.includes(story.id) ? "Show less" : "Read more"}</button>
                        <button type="button" onClick={() => reportContent({ targetType: "community-story", targetId: story.id, title: story.title })} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">Report</button>
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
                          <button type="button" onClick={() => toggleGuideExpanded(guide.id)} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">{isExpanded ? "Show less" : "Read guide"}</button>
                          <button type="button" onClick={() => reportContent({ targetType: "community-guide", targetId: guide.id, title: guide.title })} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">Report</button>
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
          <section aria-labelledby="community-jobs-heading" className="qa-community-section qa-community-section-jobs animate-rise-in [&_h2]:!text-left [&_h2]:[hyphens:none] [&_h3]:!text-left [&_h3]:[hyphens:none] [&_p]:!text-left [&_p]:[hyphens:none]">
            <div className="flex flex-col gap-5 border-b border-white/[0.10] pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-100/68">Community workboard</p>
                <h2 id="community-jobs-heading" className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Work that makes room for you.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">Roles from queer venues, community organizations, events, creative teams, and employers reaching the Atlas network.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowJobForm((current) => !current)}
                className="qa-action inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/70 bg-white px-5 py-2.5 text-sm font-semibold text-[#080b11] transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span aria-hidden="true">＋</span>
                <span>{showJobForm ? "Close form" : "Post a job"}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-white/[0.07] py-4 text-[11px] text-white/42">
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />Member submitted</span>
              <span>Atlas reviewed before public</span>
              <span>Applications leave Queer Atlas</span>
              <span>Listings expire after 45 days</span>
            </div>

            {showJobForm ? (
              <form id="community-job-form" onSubmit={publishJob} className="mt-6 overflow-hidden rounded-[28px] border border-white/[0.11] bg-[radial-gradient(circle_at_92%_0%,rgba(110,231,183,0.12),transparent_28%),linear-gradient(150deg,rgba(14,24,24,0.98),rgba(8,10,13,0.99))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-7">
                <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/62">Post an opportunity</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Clear work, clear expectations.</h3>
                  </div>
                  <p className="max-w-sm text-xs leading-5 text-white/42">Members submit for review. Admin listings publish directly.</p>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Role and organization</p>
                    <Field value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} placeholder="Job title" />
                    <Field value={jobForm.organizationName} onChange={(event) => setJobForm((current) => ({ ...current, organizationName: event.target.value }))} placeholder="Organization / employer" />
                    <Field value={jobForm.organizationUrl} onChange={(event) => setJobForm((current) => ({ ...current, organizationUrl: event.target.value }))} placeholder="Organization website (optional)" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field value={jobForm.city} onChange={(event) => setJobForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                      <Field value={jobForm.country} onChange={(event) => setJobForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select aria-label="Work mode" value={jobForm.locationMode} onChange={(event) => setJobForm((current) => ({ ...current, locationMode: event.target.value }))} className="min-h-12 w-full rounded-xl border border-white/14 bg-[#10171a] px-4 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#10171a]">
                        {JOB_LOCATION_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                      </select>
                      <select aria-label="Employment type" value={jobForm.employmentType} onChange={(event) => setJobForm((current) => ({ ...current, employmentType: event.target.value }))} className="min-h-12 w-full rounded-xl border border-white/14 bg-[#10171a] px-4 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#10171a]">
                        {JOB_EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <select aria-label="Job category" value={jobForm.category} onChange={(event) => setJobForm((current) => ({ ...current, category: event.target.value }))} className="min-h-12 w-full rounded-xl border border-white/14 bg-[#10171a] px-4 text-sm text-white outline-none transition focus:border-emerald-200/50 [&_option]:bg-[#10171a]">
                      {JOB_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <div>
                      <p className="mb-2 text-[11px] text-emerald-100/62">Pay range / compensation — strongly recommended</p>
                      <Field value={jobForm.compensation} onChange={(event) => setJobForm((current) => ({ ...current, compensation: event.target.value }))} placeholder="Example: €32–38/hour or €48k–55k/year" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Role details and application</p>
                    <Field value={jobForm.description} onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the role, workplace, and what makes the opportunity relevant to this community" area />
                    <Field value={jobForm.requirements} onChange={(event) => setJobForm((current) => ({ ...current, requirements: event.target.value }))} placeholder="Essential requirements, schedule, language, or accessibility notes" area />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field value={jobForm.applyUrl} onChange={(event) => setJobForm((current) => ({ ...current, applyUrl: event.target.value }))} placeholder="Official apply URL" />
                      <Field value={jobForm.applyEmail} onChange={(event) => setJobForm((current) => ({ ...current, applyEmail: event.target.value }))} placeholder="Apply email" />
                    </div>
                    <div className="border-l border-amber-200/24 pl-4">
                      <p className="text-xs leading-5 text-amber-50/62">No upfront fees, crypto deposits, identity documents before a legitimate hiring stage, or chat-only recruitment.</p>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button type="submit" className="qa-action min-h-12 rounded-xl border border-white/70 bg-white px-6 py-3 text-sm font-semibold text-[#080b11] transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100">
                        {isAdmin ? "Publish job" : "Submit for review"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : null}

            {reviewJobs.length > 0 ? (
              <div className="mt-6 border-y border-amber-100/[0.15] py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/68">Pending review</p>
                    <p className="mt-1 text-sm text-white/52">{isAdmin ? "Listings waiting in the admin queue." : "Your submissions waiting for review."}</p>
                  </div>
                  <span className="text-xs text-amber-100/56">{reviewJobs.length} pending</span>
                </div>
                <div className="mt-4 divide-y divide-white/[0.07] border-t border-white/[0.07]">
                  {reviewJobs.map((job) => (
                    <article key={`pending-job-${job.id}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white/86">{job.title}</p>
                        <p className="mt-1 text-xs text-white/42">{job.organizationName} · {formatJobLocation(job)} · {formatJobStatus(job.status)}</p>
                      </div>
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => updateJobStatus(job, "published")} className="qa-action min-h-10 rounded-full border border-emerald-200/28 px-4 text-xs font-semibold text-emerald-100">Publish</button>
                          <button type="button" onClick={() => updateJobStatus(job, "rejected")} className="qa-action min-h-10 rounded-full border border-rose-200/24 px-4 text-xs font-semibold text-rose-100">Reject</button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-7 rounded-[24px] border border-white/[0.10] bg-white/[0.025] p-3 sm:p-4">
              <div className="grid gap-2.5 lg:grid-cols-[minmax(14rem,1.35fr)_repeat(3,minmax(10rem,0.72fr))]">
                <label className="relative">
                  <span className="sr-only">Search jobs</span>
                  <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">⌕</span>
                  <input
                    type="search"
                    value={jobSearchTerm}
                    onChange={(event) => { setJobSearchTerm(event.target.value); setVisibleJobCount(JOB_VISIBLE_BATCH); }}
                    placeholder="Role, organization, or keyword"
                    className="min-h-12 w-full rounded-xl border border-white/[0.10] bg-black/20 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-100/42"
                  />
                </label>
                <select aria-label="Filter jobs by city" value={jobCityFilter} onChange={(event) => { setJobCityFilter(event.target.value); setVisibleJobCount(JOB_VISIBLE_BATCH); }} className="min-h-12 w-full rounded-xl border border-white/[0.10] bg-[#101317] px-4 text-sm text-white/76 outline-none focus:border-emerald-100/42 [&_option]:bg-[#101317]">
                  <option value="">All cities</option>
                  {jobCities.map((city) => <option key={city} value={city}>{formatCityLabel(city)}</option>)}
                </select>
                <select aria-label="Filter jobs by work mode" value={jobModeFilter} onChange={(event) => { setJobModeFilter(event.target.value); setVisibleJobCount(JOB_VISIBLE_BATCH); }} className="min-h-12 w-full rounded-xl border border-white/[0.10] bg-[#101317] px-4 text-sm text-white/76 outline-none focus:border-emerald-100/42 [&_option]:bg-[#101317]">
                  <option value="all">All work modes</option>
                  {JOB_LOCATION_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select>
                <select aria-label="Filter jobs by category" value={jobCategoryFilter} onChange={(event) => { setJobCategoryFilter(event.target.value); setVisibleJobCount(JOB_VISIBLE_BATCH); }} className="min-h-12 w-full rounded-xl border border-white/[0.10] bg-[#101317] px-4 text-sm text-white/76 outline-none focus:border-emerald-100/42 [&_option]:bg-[#101317]">
                  <option value="all">All categories</option>
                  {JOB_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              {hasActiveJobFilters ? (
                <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/[0.07] px-1 pt-3">
                  <p className="text-[11px] text-white/38">Showing a filtered view</p>
                  <button type="button" onClick={() => { setJobSearchTerm(""); setJobCityFilter(""); setJobModeFilter("all"); setJobCategoryFilter("all"); setVisibleJobCount(JOB_VISIBLE_BATCH); }} className="qa-action min-h-9 text-xs font-semibold text-emerald-100/68 transition hover:text-emerald-50">Clear filters</button>
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex items-end justify-between gap-4 border-b border-white/[0.10] pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">Open roles</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{filteredJobs.length} {filteredJobs.length === 1 ? "opportunity" : "opportunities"}</h3>
              </div>
              <p className="text-xs text-white/34">Newest first</p>
            </div>

            <div className="divide-y divide-white/[0.09]">
              {displayedJobs.map((job) => {
                const isExpanded = expandedJobIds.includes(job.id);
                const applyHref = normalizeExternalUrl(job.applyUrl) || (normalizeEmail(job.applyEmail) ? `mailto:${normalizeEmail(job.applyEmail)}` : "");
                const orgHref = normalizeExternalUrl(job.organizationUrl);
                return (
                  <article key={`job-${job.id}`} itemScope itemType="https://schema.org/JobPosting" className={`group py-6 transition sm:py-7 ${isExpanded ? "bg-white/[0.018]" : ""}`}>
                    <meta itemProp="datePosted" content={job.publishedAt || job.createdAt} />
                    {job.expiresAt && <meta itemProp="validThrough" content={job.expiresAt} />}
                    <meta itemProp="employmentType" content={job.employmentType} />
                    <meta itemProp="jobLocationType" content={job.locationMode === "Remote" ? "TELECOMMUTE" : job.locationMode} />
                    <div className="grid gap-5 sm:grid-cols-[3.25rem_minmax(0,1fr)] lg:grid-cols-[3.25rem_minmax(0,1fr)_minmax(12rem,0.34fr)] lg:items-start">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100/[0.16] bg-[linear-gradient(145deg,rgba(110,231,183,0.12),rgba(103,232,249,0.05))] text-xs font-semibold tracking-[0.08em] text-emerald-50/76 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
                        {getOrganizationInitials(job.organizationName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/62">{job.category}</span>
                          <span className="text-[10px] text-white/28">{timeAgo(job.publishedAt || job.createdAt)}</span>
                          {job.verificationStatus === "admin_verified" ? <span className="text-[10px] font-medium text-cyan-100/62" title="The listing was reviewed by Queer Atlas. This is not an employer endorsement.">◇ Listing reviewed</span> : null}
                        </div>
                        <h3 itemProp="title" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">{job.title}</h3>
                        <p itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization" className="mt-1 text-sm text-white/58">
                          <meta itemProp="name" content={job.organizationName} />
                          {orgHref ? <a href={orgHref} target="_blank" rel="noopener noreferrer" itemProp="url" className="underline decoration-white/18 underline-offset-4 transition hover:text-white">{job.organizationName}</a> : job.organizationName}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-white/44">{formatJobLocation(job)} · {job.employmentType}</p>
                        <p itemProp="description" className={`mt-4 max-w-3xl text-sm leading-6 text-white/68 ${isExpanded ? "" : "line-clamp-2"}`}>{job.description}</p>
                        {isExpanded && job.requirements ? (
                          <div className="mt-4 border-l border-white/[0.12] pl-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/34">Requirements and access notes</p>
                            <p className="mt-2 text-sm leading-7 text-white/64">{job.requirements}</p>
                          </div>
                        ) : null}
                        {isExpanded ? <p className="mt-4 text-[11px] leading-5 text-white/34">Posted by {job.author} · Expires {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "soon"}. Listing review checks the post, not the employer.</p> : null}
                      </div>
                      <div className="sm:col-start-2 lg:col-start-3 lg:row-start-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Compensation</p>
                        <p className={`mt-2 text-sm font-semibold leading-5 ${job.compensation ? "text-emerald-50/82" : "text-white/38"}`}>{job.compensation || "Pay not supplied"}</p>
                        <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
                          {applyHref ? (
                            <a href={applyHref} target={applyHref.startsWith("mailto:") ? undefined : "_blank"} rel={applyHref.startsWith("mailto:") ? undefined : "noopener noreferrer"} className="qa-action inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 bg-white px-5 text-xs font-semibold text-[#080b11] transition hover:bg-emerald-50">Apply externally ↗</a>
                          ) : <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-4 text-xs text-white/38">Application unavailable</span>}
                          {(job.requirements || job.description) ? <button type="button" onClick={() => toggleJobExpanded(job.id)} className="qa-action min-h-10 rounded-full border border-white/[0.11] px-4 text-xs font-semibold text-white/56 transition hover:border-white/22 hover:text-white">{isExpanded ? "Show less" : "View details"}</button> : null}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-4 sm:ml-[4.25rem]">
                      <button type="button" onClick={() => reportContent({ targetType: "community-job", targetId: job.id, title: job.title })} className="qa-action min-h-9 text-[11px] font-semibold text-white/30 transition hover:text-white/68">Report listing</button>
                      {isAdmin ? <button type="button" onClick={() => updateJobStatus(job, "removed")} className="qa-action min-h-9 text-[11px] font-semibold text-rose-100/42 transition hover:text-rose-100">Remove</button> : null}
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="border-b border-dashed border-white/[0.13] py-12 text-center">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white/76">No matching roles yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/42">Clear the filters or help the network by posting a legitimate opportunity.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {hasActiveJobFilters ? <button type="button" onClick={() => { setJobSearchTerm(""); setJobCityFilter(""); setJobModeFilter("all"); setJobCategoryFilter("all"); setVisibleJobCount(JOB_VISIBLE_BATCH); }} className="qa-action min-h-11 rounded-full border border-white/14 px-5 text-xs font-semibold text-white/68">Clear filters</button> : null}
                  <button type="button" onClick={() => setShowJobForm(true)} className="qa-action min-h-11 rounded-full border border-white/70 bg-white px-5 text-xs font-semibold text-[#080b11]">Post a job</button>
                </div>
              </div>
            ) : null}

            {displayedJobs.length < filteredJobs.length ? (
              <div className="flex justify-center border-t border-white/[0.08] pt-6">
                <button type="button" onClick={() => setVisibleJobCount((current) => current + JOB_VISIBLE_BATCH)} className="qa-action min-h-11 rounded-full border border-white/14 px-5 text-xs font-semibold text-white/62 transition hover:border-white/26 hover:text-white">Show more jobs · {filteredJobs.length - displayedJobs.length} remaining</button>
              </div>
            ) : null}

            <div className="mt-8 flex items-start gap-3 border-t border-white/[0.08] pt-5">
              <span aria-hidden="true" className="mt-0.5 text-amber-100/58">◇</span>
              <p className="max-w-3xl text-xs leading-5 text-white/38">Never pay to get paid. Be cautious if a recruiter requests money, crypto, banking details, or identity documents before a legitimate hiring stage. Report suspicious listings to Queer Atlas.</p>
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
              <button type="button" onClick={() => setShowStoryForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-rose-300/34 bg-rose-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-100 transition hover:border-rose-200/62">
                {showStoryForm ? "Close story form" : "Write story"}
              </button>
              <button type="button" onClick={() => setShowGuideForm((current) => !current)} className="qa-action qa-action-strong rounded-full border border-violet-300/34 bg-violet-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-100 transition hover:border-violet-200/62">
                {showGuideForm ? "Close guide form" : "New guide"}
              </button>
            </div>
          </div>

          <div className="mb-4 inline-flex rounded-full border border-white/16 bg-black/35 p-1">
            <button type="button" aria-pressed={communityFeedMode === "all"} onClick={() => setCommunityFeedMode("all")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "all" ? "bg-white/16 text-white" : "text-white/72 hover:text-white"}`}>All</button>
            <button type="button" aria-pressed={communityFeedMode === "stories"} onClick={() => setCommunityFeedMode("stories")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "stories" ? "bg-rose-300/22 text-rose-50" : "text-white/72 hover:text-white"}`}>Stories</button>
            <button type="button" aria-pressed={communityFeedMode === "guides"} onClick={() => setCommunityFeedMode("guides")} className={`rounded-full px-3 py-1 text-xs transition ${communityFeedMode === "guides" ? "bg-violet-300/22 text-violet-50" : "text-white/72 hover:text-white"}`}>Guides</button>
          </div>

          {showStoryForm && (
            <form id="community-story-form-feed" onSubmit={publishStory} className="mb-4 space-y-3 rounded-2xl border border-rose-400/20 bg-rose-300/6 p-4">
              <Field value={storyForm.title} onChange={(event) => setStoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="Story title" />
              <div className="grid gap-3 md:grid-cols-2">
                <Field value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City or venue (optional)" />
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
                        <button type="button" onClick={() => toggleStoryExpanded(story.id)} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">{expandedStoryIds.includes(story.id) ? "Show less" : "Read more"}</button>
                        <button type="button" onClick={() => reportContent({ targetType: "community-story", targetId: story.id, title: story.title })} className="qa-action rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">Report</button>
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
                      <button type="button" onClick={() => toggleGuideExpanded(guide.id)} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">{isExpanded ? "Show less" : "Read more"}</button>
                      <button type="button" onClick={() => reportContent({ targetType: "community-guide", targetId: guide.id, title: guide.title })} className="qa-action rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">Report</button>
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
          <section
            aria-labelledby="community-chat-heading"
            className="qa-community-section qa-community-section-rooms animate-rise-in [&_h2]:!text-left [&_h2]:[hyphens:none] [&_h3]:!text-left [&_h3]:[hyphens:none] [&_p]:!text-left [&_p]:[hyphens:none]"
          >
            {!mobileRoomOpen ? (
              <>
                <div className="flex flex-col gap-5 border-b border-white/[0.10] pb-7 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-100/64">Rooms</p>
                    <h2 id="community-chat-heading" className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                      Find the conversation that fits the moment.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/54">
                      Drop into a city, make a plan around an event, or ask people who know the place.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTopicForm((current) => !current)}
                    className="qa-action inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/70 bg-white px-5 py-2.5 text-sm font-semibold text-[#080b11] transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <span aria-hidden="true">＋</span>
                    <span>{showTopicForm ? "Close" : "Start a conversation"}</span>
                  </button>
                </div>

                {showTopicForm ? (
                  <form id="community-topic-form" onSubmit={createTopic} className="mt-6 rounded-[26px] border border-white/[0.11] bg-white/[0.035] p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">New conversation</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Give the room one clear purpose.</h3>
                      </div>
                      <p className="text-xs text-white/38">City, event, or local question</p>
                    </div>
                    <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.62fr]">
                      <Field value={topicForm.name} onChange={(event) => setTopicForm((current) => ({ ...current, name: event.target.value }))} placeholder="Room title" />
                      <select value={topicForm.mood} onChange={(event) => setTopicForm((current) => ({ ...current, mood: event.target.value }))} aria-label="Room category" className="min-h-12 w-full rounded-xl border border-white/14 bg-[#11151e] px-4 text-sm text-white outline-none transition focus:border-cyan-200/45">
                        {ROOM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      <div className="lg:col-span-2">
                        <Field value={topicForm.description} onChange={(event) => setTopicForm((current) => ({ ...current, description: event.target.value }))} placeholder="What should people discuss here?" area />
                      </div>
                      <button type="submit" className="qa-action min-h-11 rounded-xl border border-white/70 bg-white px-5 py-3 text-sm font-semibold text-[#080b11] transition hover:bg-cyan-50 lg:col-start-2">Create room</button>
                    </div>
                  </form>
                ) : null}

                <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter rooms">
                  {ROOM_FILTERS.map((filter) => {
                    const active = roomFilter === filter.id;
                    const count = filter.id === "all" ? roomCards.length : roomCards.filter((room) => room.kind === filter.id).length;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setRoomFilter(filter.id)}
                        className={`qa-action min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 ${active ? "border-cyan-100/42 bg-cyan-100/[0.12] text-cyan-50" : "border-white/[0.11] bg-white/[0.025] text-white/52 hover:border-white/22 hover:text-white/80"}`}
                      >
                        {filter.label} <span className="ml-1 text-white/34">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {featuredRoom ? (
                  <div className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)] xl:items-start">
                    <button
                      type="button"
                      onClick={() => {
                        setTopicId(featuredRoom.id);
                        setMobileRoomOpen(true);
                      }}
                      className={`group relative min-h-[286px] overflow-hidden rounded-[26px] border border-white/[0.11] p-5 text-left shadow-[0_30px_90px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 sm:min-h-[330px] sm:rounded-[30px] sm:p-8 ${ROOM_KIND_META[featuredRoom.kind].wash}`}
                    >
                      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/[0.07]" />
                      <div className="pointer-events-none absolute -right-7 -top-9 h-40 w-40 rounded-full border border-white/[0.06]" />
                      <div className="relative flex h-full min-h-[244px] flex-col justify-between sm:min-h-[266px]">
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${ROOM_KIND_META[featuredRoom.kind].accent}`}>{ROOM_KIND_META[featuredRoom.kind].kicker}</span>
                          <span className="inline-flex items-center gap-2 text-[11px] text-white/46"><span className={`h-1.5 w-1.5 rounded-full ${ROOM_KIND_META[featuredRoom.kind].dot}`} />{featuredRoom.latestActivity ? timeAgo(featuredRoom.latestActivity) : "New"}</span>
                        </div>
                        <div className="max-w-xl py-8 sm:py-10">
                          <p className="text-xs font-medium text-white/48">{ROOM_KIND_META[featuredRoom.kind].label} · {featuredRoom.cityLabel}</p>
                          <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">{featuredRoom.name}</h3>
                          <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">{featuredRoom.description}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-white/[0.09] pt-5">
                          <span className="text-xs text-white/42">{getRoomActivityLabel(featuredRoom.latestActivity)} · {featuredRoom.participants || 0} {featuredRoom.participants === 1 ? "voice" : "voices"}</span>
                          <span className="inline-flex items-center gap-3 text-sm font-semibold text-white">Enter room <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></span>
                        </div>
                      </div>
                    </button>

                    <div>
                      <div className="flex items-end justify-between gap-4 border-b border-white/[0.10] pb-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Explore</p>
                          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">More rooms</h3>
                        </div>
                        <span className="text-xs text-white/34">{filteredRoomCards.length} found</span>
                      </div>
                      <div className="divide-y divide-white/[0.09]">
                        {roomList.map((room) => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => {
                              setTopicId(room.id);
                              setMobileRoomOpen(true);
                            }}
                            className="group flex min-h-[112px] w-full items-center gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-100"
                          >
                            <span className={`h-10 w-1 shrink-0 rounded-full opacity-75 ${ROOM_KIND_META[room.kind].dot}`} />
                            <span className="min-w-0 flex-1">
                              <span className={`block text-[10px] font-semibold uppercase tracking-[0.16em] ${ROOM_KIND_META[room.kind].accent}`}>{ROOM_KIND_META[room.kind].label}</span>
                              <span className="mt-1.5 block truncate text-sm font-semibold text-white/86 transition group-hover:text-white">{room.name}</span>
                              <span className="mt-1.5 block truncate text-xs text-white/38">{room.cityLabel} · {getRoomActivityLabel(room.latestActivity)}</span>
                              {room.latestMessage?.text ? <span className="mt-1 block line-clamp-1 text-xs text-white/48">“{room.latestMessage.text}”</span> : null}
                            </span>
                            <span aria-hidden="true" className="text-white/24 transition group-hover:translate-x-1 group-hover:text-white/68">→</span>
                          </button>
                        ))}
                        {roomList.length === 0 ? <p className="py-8 text-sm leading-6 text-white/44">This is the only room in this view. Start a conversation or choose another filter.</p> : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-y border-dashed border-white/[0.13] py-12 text-center">
                    <p className="text-base font-semibold text-white/72">No rooms in this view yet.</p>
                    <p className="mt-2 text-sm text-white/42">Start the first focused conversation.</p>
                  </div>
                )}

                <div className="mt-10 grid gap-5 border-t border-white/[0.10] pt-7 md:grid-cols-3">
                  {[
                    ["city", "City lounges", "Ongoing local conversation without sharing anyone's exact position."],
                    ["event", "Event rooms", "Make plans around a real event and keep the conversation in context."],
                    ["ask", "Ask locals", "Useful questions and answers that are easier to find again."],
                  ].map(([kind, title, description]) => (
                    <button key={kind} type="button" onClick={() => setRoomFilter(kind)} className="group min-h-[116px] border-l border-white/[0.11] pl-5 text-left transition hover:border-white/26 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${ROOM_KIND_META[kind].accent}`}>{ROOM_KIND_META[kind].kicker}</span>
                      <span className="mt-2 block text-base font-semibold text-white/82 group-hover:text-white">{title}</span>
                      <span className="mt-2 block text-xs leading-5 text-white/42">{description}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : activeTopic ? (
              <div>
                <button
                  type="button"
                  onClick={() => setMobileRoomOpen(false)}
                  className="qa-action inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-white/24 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
                >
                  <span aria-hidden="true">←</span> All rooms
                </button>

                <div className={`relative mt-5 overflow-hidden rounded-[30px] border border-white/[0.11] px-5 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-9 ${activeRoomMeta.wash}`}>
                  <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border border-white/[0.07]" />
                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${activeRoomMeta.accent}`}><span className={`h-1.5 w-1.5 rounded-full ${activeRoomMeta.dot}`} />{activeRoomMeta.label}</span>
                        <span className="text-xs text-white/38">{getRoomCity(activeTopic)}</span>
                      </div>
                      <h2 id="community-chat-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-5xl">{activeTopic.name}</h2>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">{activeTopic.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex min-h-11 items-center rounded-full border border-white/[0.11] bg-black/15 px-4 text-xs text-white/52">{activeMessages.length} {activeMessages.length === 1 ? "message" : "messages"}</span>
                      {canDeleteTopic(activeTopic) ? (
                        <button type="button" onClick={() => deleteTopic(activeTopic)} className="qa-action min-h-11 rounded-full border border-rose-200/15 px-4 text-xs font-semibold text-rose-100/60 transition hover:border-rose-200/30 hover:text-rose-100">Delete room</button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-6 max-w-3xl">
                  <div className="flex items-start gap-3 border-b border-white/[0.09] pb-5">
                    <span aria-hidden="true" className="mt-0.5 text-sm text-emerald-200/72">◇</span>
                    <p className="text-xs leading-5 text-white/44">
                      {activeRoomKind === "event" ? "Coordinate the plan, not people's live locations. Share only what feels safe." : activeRoomKind === "ask" ? "Keep answers practical and kind. Helpful local context should be easy to find again." : "A low-pressure city conversation. Never share another person's identifying information."}
                    </p>
                  </div>

                  <div ref={chatMessagesRef} className="min-h-[20rem] space-y-4 py-7">
                    {activeMessages.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-base font-semibold text-white/70">The room is quiet.</p>
                        <p className="mt-2 text-sm text-white/42">Start with one useful question or plan.</p>
                      </div>
                    ) : null}
                    {activeMessages.map((message, messageIndex) => {
                      const isMine = message.author === (memberName || "Member");
                      const rankMeta = getAuthorIdentityMeta(message.author);
                      const messageDay = formatMessageDay(message.createdAt);
                      const previousMessageDay = messageIndex > 0 ? formatMessageDay(activeMessages[messageIndex - 1]?.createdAt) : "";
                      return (
                        <div key={message.id}>
                          {messageDay !== previousMessageDay ? (
                            <div className="mb-4 flex items-center gap-3" aria-label={messageDay}>
                              <span className="h-px flex-1 bg-white/[0.07]" />
                              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/28">{messageDay}</span>
                              <span className="h-px flex-1 bg-white/[0.07]" />
                            </div>
                          ) : null}
                          <div className={`flex gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine ? <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-xs font-semibold text-white/68 shadow-[0_8px_22px_rgba(0,0,0,0.2)]">{message.author.slice(0, 1).toUpperCase()}</div> : null}
                            <div className={`max-w-[88%] rounded-[22px] border px-4 py-3.5 sm:max-w-[76%] ${isMine ? "border-cyan-100/20 bg-[linear-gradient(145deg,rgba(103,232,249,0.12),rgba(103,232,249,0.055))]" : "border-white/[0.09] bg-white/[0.035]"}`}>
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <p className="text-[11px] font-semibold text-white/68"><span className="inline-flex items-center gap-1.5">{rankMeta?.icon ? <span className={rankMeta.iconClass} title={rankMeta.label}>{rankMeta.icon}</span> : null}<span>{isMine ? "You" : message.author}</span></span></p>
                                <span className="text-[10px] text-white/32">{timeAgo(message.createdAt)}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-white/78">{message.text}</p>
                              <button type="button" onClick={() => reportContent({ targetType: "community-message", targetId: message.id, title: activeTopic.name || "Community message" })} className="mt-2 min-h-8 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/28 transition hover:text-white/68">Report</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/[0.10] pb-2 pt-5">
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                      {(activeRoomKind === "event"
                        ? ["Anyone else going solo?", "Where should we meet?", "What time are people arriving?"]
                        : activeRoomKind === "ask"
                          ? ["Any local context?", "What should visitors know?", "Is this still current?"]
                          : ["What feels good this week?", "Any low-key recommendations?", "How is the city tonight?"]
                      ).map((preset) => (
                        <button key={preset} type="button" onClick={() => setMessageForm({ text: preset })} className="qa-action min-h-10 shrink-0 rounded-full border border-white/10 px-3.5 text-[11px] text-white/48 transition hover:border-white/20 hover:text-white/76">{preset}</button>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
                      <Field value={messageForm.text} onChange={(event) => setMessageForm({ text: event.target.value })} placeholder={activeRoomKind === "event" ? "Add to the plan" : activeRoomKind === "ask" ? "Share local knowledge" : "Write a message"} />
                      <button type="submit" className="qa-action min-h-12 rounded-xl border border-white/70 bg-white px-6 py-3 text-sm font-semibold text-[#080b11] transition hover:bg-cyan-50">Send</button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center"><p className="text-sm text-white/48">This room is no longer available.</p></div>
            )}
          </section>
        ) : null}

        {isImprovePanel ? (
          <section aria-labelledby="community-ideas-heading" className="qa-community-section qa-community-section-build animate-rise-in [&_h2]:!text-left [&_h2]:[hyphens:none] [&_h3]:!text-left [&_h3]:[hyphens:none] [&_p]:!text-left [&_p]:[hyphens:none]">
            <div className="flex flex-col gap-5 border-b border-white/[0.10] pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-100/68">Build with us</p>
                <h2 id="community-ideas-heading" className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Help shape the next Queer Atlas.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">Share one clear improvement, support the ideas that matter, and give the team a stronger signal about what members need.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIdeaForm((current) => !current)}
                aria-expanded={showIdeaForm}
                aria-controls="community-idea-form"
                className="qa-action inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/70 bg-white px-5 py-2.5 text-sm font-semibold text-[#080b11] transition hover:bg-fuchsia-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span aria-hidden="true">＋</span>
                <span>{showIdeaForm ? "Close form" : "Suggest an idea"}</span>
              </button>
            </div>

            <div className="grid border-b border-white/[0.07] sm:grid-cols-3">
              {[
                ["01", "Suggest", "Describe the need, not only the solution."],
                ["02", "Support", "Votes show shared interest across members."],
                ["03", "Review", "Signals inform decisions; they are not delivery promises."],
              ].map(([number, title, description], index) => (
                <div key={title} className={`py-4 ${index > 0 ? "border-t border-white/[0.07] sm:border-l sm:border-t-0 sm:pl-5" : "sm:pr-5"}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-semibold tracking-[0.16em] text-fuchsia-100/42">{number}</span>
                    <p className="text-xs font-semibold text-white/72">{title}</p>
                  </div>
                  <p className="mt-1 pl-8 text-[11px] leading-5 text-white/34">{description}</p>
                </div>
              ))}
            </div>

            {showIdeaForm ? (
              <form id="community-idea-form" onSubmit={publishIdea} className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.11] bg-[radial-gradient(circle_at_92%_0%,rgba(232,121,249,0.10),transparent_30%),linear-gradient(150deg,rgba(22,16,27,0.98),rgba(8,10,13,0.99))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)] sm:p-6">
                <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(12rem,0.34fr)_minmax(0,1fr)_auto] lg:items-end">
                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Area</span>
                    <select
                      value={ideaForm.category}
                      onChange={(event) => setIdeaForm((current) => ({ ...current, category: event.target.value }))}
                      className="min-h-12 w-full rounded-xl border border-white/[0.12] bg-[#151119] px-4 text-sm text-white outline-none transition focus:border-fuchsia-100/46 [&_option]:bg-[#151119]"
                    >
                      {IDEA_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Your idea</span>
                    <Field value={ideaForm.text} onChange={(event) => setIdeaForm((current) => ({ ...current, text: event.target.value }))} placeholder="What problem should Queer Atlas solve, and who would it help?" />
                  </label>
                  <button type="submit" className="qa-action min-h-12 rounded-xl border border-white/70 bg-white px-6 py-3 text-sm font-semibold text-[#080b11] transition hover:bg-fuchsia-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-100">Share idea</button>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-white/34">Avoid personal or sensitive information. Related ideas may be combined during review.</p>
              </form>
            ) : null}

            <div className="mt-7 flex flex-col gap-4 border-b border-white/[0.10] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">Member ideas</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{filteredIdeas.length} {filteredIdeas.length === 1 ? "idea" : "ideas"}</h3>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Filter ideas by category">
                  {["all", ...IDEA_CATEGORIES].map((category) => (
                    <button key={category} type="button" aria-pressed={ideaCategoryFilter === category} onClick={() => { setIdeaCategoryFilter(category); setVisibleIdeaCount(IDEA_VISIBLE_BATCH); }} className={`qa-action min-h-9 text-[11px] font-semibold transition ${ideaCategoryFilter === category ? "text-fuchsia-100" : "text-white/38 hover:text-white/70"}`}>
                      {category === "all" ? "All" : category}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-white/30">Sort</span>
                  <button type="button" aria-pressed={ideaSort === "top"} onClick={() => { setIdeaSort("top"); setVisibleIdeaCount(IDEA_VISIBLE_BATCH); }} className={`qa-action min-h-8 font-semibold ${ideaSort === "top" ? "text-white" : "text-white/36 hover:text-white/68"}`}>Most supported</button>
                  <button type="button" aria-pressed={ideaSort === "newest"} onClick={() => { setIdeaSort("newest"); setVisibleIdeaCount(IDEA_VISIBLE_BATCH); }} className={`qa-action min-h-8 font-semibold ${ideaSort === "newest" ? "text-white" : "text-white/36 hover:text-white/68"}`}>Newest</button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.09]">
              {displayedIdeas.map((idea) => {
                const parsedIdea = parseIdeaText(idea.text);
                return (
                  <article key={idea.id} className="group grid gap-4 py-5 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:items-start sm:py-6">
                    <button
                      type="button"
                      onClick={() => upvoteIdea(idea.id)}
                      aria-label={`Support idea with ${idea.votes} current votes`}
                      className="qa-action flex min-h-12 w-[4.25rem] shrink-0 flex-row items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.035] text-fuchsia-100/72 transition hover:border-fuchsia-100/30 hover:bg-fuchsia-100/[0.07] sm:flex-col sm:gap-0 sm:py-2"
                    >
                      <span aria-hidden="true" className="text-sm leading-none">↑</span>
                      <span className="text-sm font-semibold leading-none">{idea.votes}</span>
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-fuchsia-100/62">{parsedIdea.category}</span>
                        <span className="text-[10px] text-white/28">{timeAgo(idea.createdAt)}</span>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/76 sm:text-[15px]">{parsedIdea.content}</p>
                      <p className="mt-2 text-[11px] text-white/36">Suggested by {idea.author}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => reportContent({ targetType: "community-idea", targetId: idea.id, title: parsedIdea.content.slice(0, 80) })}
                      className="qa-action min-h-9 w-fit text-[11px] font-semibold text-white/28 transition hover:text-white/64 sm:justify-self-end"
                    >
                      Report
                    </button>
                  </article>
                );
              })}
            </div>

            {filteredIdeas.length === 0 ? (
              <div className="border-b border-dashed border-white/[0.13] py-12 text-center">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white/76">No ideas in this area yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/42">Choose another category or suggest the first thoughtful improvement.</p>
                <button type="button" onClick={() => setShowIdeaForm(true)} className="qa-action mt-5 min-h-11 rounded-full border border-white/70 bg-white px-5 text-xs font-semibold text-[#080b11]">Suggest an idea</button>
              </div>
            ) : null}

            {displayedIdeas.length < filteredIdeas.length ? (
              <div className="flex justify-center border-t border-white/[0.08] pt-6">
                <button type="button" onClick={() => setVisibleIdeaCount((current) => current + IDEA_VISIBLE_BATCH)} className="qa-action min-h-11 rounded-full border border-white/14 px-5 text-xs font-semibold text-white/62 transition hover:border-white/26 hover:text-white">Show more ideas · {filteredIdeas.length - displayedIdeas.length} remaining</button>
              </div>
            ) : null}

            <p className="mt-8 border-t border-white/[0.08] pt-5 text-xs leading-5 text-white/34">Community votes are one signal among safety, accessibility, editorial quality, technical effort, and member impact. A popular idea is not automatically scheduled.</p>
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
              type="button"
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
                      type="button"
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
                  <button type="button" onClick={() => upvoteIdea(idea.id)} className="qa-action rounded-full border border-amber-300/34 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/16 hover:text-white">? {idea.votes}</button>
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
            <div role="dialog" aria-modal="true" aria-labelledby="community-report-title" className="w-full max-w-xl overflow-hidden rounded-[28px] border border-cyan-200/22 bg-[linear-gradient(165deg,rgba(8,30,38,0.9),rgba(10,10,10,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/75">Safety report</p>
                <h3 id="community-report-title" className="mt-2 text-xl font-semibold text-white">Report content</h3>
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
                          aria-pressed={active}
                          autoFocus={item.value === "1"}
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
                    maxLength={1000}
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


