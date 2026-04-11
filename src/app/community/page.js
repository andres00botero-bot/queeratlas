"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { addReport, getBlockedItems } from "@/lib/moderation";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import ActionToast from "@/components/ui/ActionToast";

const KEYS = {
  stories: "qa_community_stories",
  guides: "qa_community_guides",
  topics: "qa_community_topics",
  messages: "qa_community_messages",
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

function readStored(key, fallback) {
  return readLocalJson(key, fallback);
}

function mapStoryRow(row) {
  return {
    id: String(row.id),
    title: row.title || "",
    city: row.city || "",
    author: row.author || "Member",
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
    focus: row.focus || "Community",
    summary: row.summary || "",
    content: row.content || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapTopicRow(row) {
  return {
    id: String(row.id),
    name: row.name || "",
    mood: row.mood || "Fresh",
    description: row.description || "",
    author: row.author || "Member",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapIdeaRow(row) {
  return {
    id: String(row.id),
    text: row.text || "",
    votes: Number(row.votes || 0),
    author: row.author || "Member",
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

function timeAgo(value) {
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.round(diffHours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Field({ value, onChange, placeholder, area = false }) {
  if (area) {
    return <textarea value={value} onChange={onChange} placeholder={placeholder} className="h-28 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50" />;
  }
  return <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50" />;
}

function CommunityOpeningSkeleton() {
  return (
    <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
      <div className="animate-pulse space-y-3" aria-hidden="true">
        <div className="h-4 w-40 rounded-full bg-white/14" />
        <div className="h-8 w-64 rounded-full bg-white/12" />
        <div className="h-3 w-full rounded-full bg-white/8" />
        <div className="h-3 w-4/5 rounded-full bg-white/8" />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isMember, memberName, isLoading: isAuthLoading } = useAuth();
  const [stories, setStories] = useState(baseStories);
  const [guides, setGuides] = useState(baseGuides);
  const [topics, setTopics] = useState(baseTopics);
  const [messages, setMessages] = useState(baseMessages);
  const [ideas, setIdeas] = useState(baseIdeas);
  const [topicId, setTopicId] = useState("t1");
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [guideId, setGuideId] = useState("g1");
  const [storyForm, setStoryForm] = useState({ title: "", city: "", category: "Experience", author: memberName || "", excerpt: "", body: "" });
  const [guideForm, setGuideForm] = useState({ title: "", city: "", focus: "", author: memberName || "", summary: "", content: "" });
  const [messageForm, setMessageForm] = useState({ text: "" });
  const [topicForm, setTopicForm] = useState({ name: "", mood: "Fresh", description: "" });
  const [ideaForm, setIdeaForm] = useState({ author: memberName || "", text: "" });
  const [syncError, setSyncError] = useState("");
  const { toast, showToast } = useActionToast();

  const loadCommunityData = useCallback(async () => {
    setSyncError("");
    const [storiesRes, guidesRes, topicsRes, messagesRes, ideasRes] = await Promise.all([
      supabase.from("community_stories").select("*").order("created_at", { ascending: false }),
      supabase.from("community_guides").select("*").order("created_at", { ascending: false }),
      supabase.from("community_topics").select("*").order("created_at", { ascending: false }),
      supabase.from("community_messages").select("*").order("created_at", { ascending: true }),
      supabase.from("community_ideas").select("*").order("created_at", { ascending: false }),
    ]);

    const hasError = Boolean(
      storiesRes.error || guidesRes.error || topicsRes.error || messagesRes.error || ideasRes.error
    );

    if (hasError) {
      setStories(readStored(KEYS.stories, baseStories));
      setGuides(readStored(KEYS.guides, baseGuides));
      setTopics(readStored(KEYS.topics, baseTopics));
      setMessages(readStored(KEYS.messages, baseMessages));
      setIdeas(readStored(KEYS.ideas, baseIdeas));
      setSyncError("Community sync fallback active. Local data is shown.");
      return;
    }

    const nextStories = (storiesRes.data || []).length > 0 ? (storiesRes.data || []).map(mapStoryRow) : baseStories;
    const nextGuides = (guidesRes.data || []).length > 0 ? (guidesRes.data || []).map(mapGuideRow) : baseGuides;
    const nextTopics = (topicsRes.data || []).length > 0 ? (topicsRes.data || []).map(mapTopicRow) : baseTopics;
    const nextIdeas = (ideasRes.data || []).length > 0 ? (ideasRes.data || []).map(mapIdeaRow) : baseIdeas;
    const nextMessages = mapMessages(messagesRes.data || [], nextTopics);

    setStories(nextStories);
    setGuides(nextGuides);
    setTopics(nextTopics);
    setMessages(Object.keys(nextMessages).length > 0 ? nextMessages : baseMessages);
    setIdeas(nextIdeas);
  }, []);

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
      await loadCommunityData();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadCommunityData, router]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(KEYS.stories, stories);
    writeLocalJson(KEYS.guides, guides);
    writeLocalJson(KEYS.topics, topics);
    writeLocalJson(KEYS.messages, messages);
    writeLocalJson(KEYS.ideas, ideas);
  }, [isReady, isMember, stories, guides, topics, messages, ideas]);

  if (!isReady || !isMember) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <CommunityOpeningSkeleton />
      </main>
    );
  }

  const blockedItems = getBlockedItems();
  const isBlocked = (targetType, targetId) =>
    blockedItems.some(
      (item) =>
        item.targetType === targetType &&
        String(item.targetId) === String(targetId)
    );

  const visibleStories = stories.filter((story) => !isBlocked("community-story", story.id));
  const visibleGuides = guides.filter((guide) => !isBlocked("community-guide", guide.id));
  const visibleIdeas = ideas.filter((idea) => !isBlocked("community-idea", idea.id));
  const visibleTopics = topics.filter((topic) => !isBlocked("community-topic", topic.id));

  const sortedStories = [...visibleStories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const sortedGuides = [...visibleGuides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const resolvedGuideId = sortedGuides.some((guide) => guide.id === guideId) ? guideId : sortedGuides[0]?.id;
  const activeGuide = sortedGuides.find((guide) => guide.id === resolvedGuideId) || null;
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
  const topCities = [...new Set(sortedStories.map((story) => story.city).filter(Boolean))].slice(0, 3);

  const publishStory = async (event) => {
    event.preventDefault();
    if (!storyForm.title || !storyForm.city || !storyForm.author || !storyForm.body) {
      showToast("Story not published. Fill all required fields.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = { id: `s-${Date.now()}`, ...storyForm, excerpt: storyForm.excerpt || storyForm.body.slice(0, 120), createdAt: new Date().toISOString() };
    const { data, error } = await supabase
      .from("community_stories")
      .insert([{
        title: storyForm.title,
        city: storyForm.city,
        author: storyForm.author,
        category: storyForm.category || "Experience",
        excerpt: storyForm.excerpt || storyForm.body.slice(0, 120),
        body: storyForm.body,
      }])
      .select("*")
      .single();

    const item = error || !data ? fallbackItem : mapStoryRow(data);
    setStories((current) => [item, ...current]);
    setStoryForm({ title: "", city: "", category: "Experience", author: memberName || "", excerpt: "", body: "" });
    setShowStoryForm(false);
    showToast(error ? "Story saved locally. Supabase sync unavailable." : "Story published.", { tone: error ? "info" : "ok", duration: 2400 });
  };

  const publishGuide = async (event) => {
    event.preventDefault();
    if (!guideForm.title || !guideForm.author || !guideForm.content) {
      showToast("Guide not published. Fill required fields.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = { id: `g-${Date.now()}`, ...guideForm, city: guideForm.city || "Multi-city", focus: guideForm.focus || "Community", summary: guideForm.summary || guideForm.content.slice(0, 120), createdAt: new Date().toISOString() };
    const { data, error } = await supabase
      .from("community_guides")
      .insert([{
        title: guideForm.title,
        city: guideForm.city || "Multi-city",
        author: guideForm.author,
        focus: guideForm.focus || "Community",
        summary: guideForm.summary || guideForm.content.slice(0, 120),
        content: guideForm.content,
      }])
      .select("*")
      .single();

    const item = error || !data ? fallbackItem : mapGuideRow(data);
    setGuides((current) => [item, ...current]);
    setGuideId(item.id);
    setGuideForm({ title: "", city: "", focus: "", author: memberName || "", summary: "", content: "" });
    setShowGuideForm(false);
    showToast(error ? "Guide saved locally. Supabase sync unavailable." : "Guide published.", { tone: error ? "info" : "ok", duration: 2400 });
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeTopic || !messageForm.text.trim()) {
      showToast("Write a message before sending.", { tone: "warn", duration: 2200 });
      return;
    }
    const fallbackItem = { id: `m-${Date.now()}`, author: memberName || "Member", text: messageForm.text.trim(), createdAt: new Date().toISOString() };
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
    setMessages((current) => ({ ...current, [activeTopic.id]: [...(current[activeTopic.id] || []), item] }));
    setMessageForm({ text: "" });
    showToast(error ? "Message saved locally. Supabase sync unavailable." : "Message sent.", { tone: error ? "info" : "ok", duration: 1800 });
  };

  const createTopic = async (event) => {
    event.preventDefault();
    if (!topicForm.name || !topicForm.description) {
      showToast("Topic not created. Add title and description.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = { id: `t-${Date.now()}`, ...topicForm, author: memberName || "Member", createdAt: new Date().toISOString() };
    const { data, error } = await supabase
      .from("community_topics")
      .insert([{
        name: topicForm.name,
        mood: topicForm.mood || "Fresh",
        description: topicForm.description,
        author: memberName || "Member",
      }])
      .select("*")
      .single();

    const item = error || !data ? fallbackItem : mapTopicRow(data);
    setTopics((current) => [item, ...current]);
    setMessages((current) => ({ ...current, [item.id]: [] }));
    setTopicId(item.id);
    setTopicForm({ name: "", mood: "Fresh", description: "" });
    showToast(error ? "Topic saved locally. Supabase sync unavailable." : "Topic created.", { tone: error ? "info" : "ok", duration: 2200 });
  };

  const publishIdea = async (event) => {
    event.preventDefault();
    if (!ideaForm.author || !ideaForm.text) {
      showToast("Idea not shared. Add name and idea text.", { tone: "warn", duration: 2400 });
      return;
    }
    const fallbackItem = { id: `i-${Date.now()}`, text: ideaForm.text, author: ideaForm.author, votes: 1, createdAt: new Date().toISOString() };
    const { data, error } = await supabase
      .from("community_ideas")
      .insert([{
        text: ideaForm.text,
        author: ideaForm.author,
        votes: 1,
      }])
      .select("*")
      .single();

    const item = error || !data ? fallbackItem : mapIdeaRow(data);
    setIdeas((current) => [item, ...current]);
    setIdeaForm({ author: memberName || "", text: "" });
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
    const reason = window.prompt("Why are you reporting this content? (safety, abuse, spam, misinformation)");
    if (!reason) return;

    addReport({
      targetType,
      targetId,
      city: "",
      title,
      reason,
    });

    showToast("Report sent. Thanks for helping keep community safe.", { tone: "info", duration: 2600 });
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <ActionToast toast={toast} />
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.06),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(59,130,246,0.06),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
        <div className="mb-8 overflow-hidden rounded-[34px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.20),transparent_28%),linear-gradient(135deg,rgba(6,78,59,0.66),rgba(10,10,10,0.96),rgba(76,29,149,0.44))] p-8 shadow-[0_34px_130px_rgba(16,185,129,0.12)]">
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-rose-400/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-6 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/90">Members Only</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Community</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-200">Stories, discussions, guides, and product ideas from queer travelers, locals, and regulars shaping the atlas together.</p>
            <p className="mt-3 text-xs text-emerald-100/75">
              Safety first. Read our{" "}
              <Link href="/community-policy" className="underline underline-offset-2 transition hover:text-white">
                Community Policy & Reporting
              </Link>
              .
            </p>
            {syncError && (
              <p className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                {syncError}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {topCities.map((city) => (
                <span key={city} className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white shadow-[0_0_24px_rgba(255,255,255,0.06)] backdrop-blur">{city}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative grid gap-6 xl:grid-cols-2">
          <section className="rounded-[30px] border border-rose-400/15 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.18),transparent_26%),linear-gradient(180deg,rgba(38,14,28,0.96),rgba(10,10,10,1))] p-6 shadow-[0_28px_90px_rgba(244,114,182,0.10)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-rose-300">Stories</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Member experiences</h2>
              </div>
              <button onClick={() => setShowStoryForm((current) => !current)} className="rounded-full border border-rose-400/30 bg-rose-300/8 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-300 hover:bg-rose-300/15 hover:text-white">{showStoryForm ? "Close form" : "Write a story"}</button>
            </div>
            {showStoryForm && (
              <form onSubmit={publishStory} className="mb-5 space-y-3 rounded-2xl border border-rose-400/20 bg-rose-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Field value={storyForm.title} onChange={(event) => setStoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="Story title" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field value={storyForm.city} onChange={(event) => setStoryForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                  <Field value={storyForm.author} onChange={(event) => setStoryForm((current) => ({ ...current, author: event.target.value }))} placeholder="Your name" />
                </div>
                <Field value={storyForm.category} onChange={(event) => setStoryForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
                <Field value={storyForm.excerpt} onChange={(event) => setStoryForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short excerpt" area />
                <Field value={storyForm.body} onChange={(event) => setStoryForm((current) => ({ ...current, body: event.target.value }))} placeholder="Write your experience" area />
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-rose-300 via-pink-300 to-orange-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish story</button>
              </form>
            )}
            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
              {sortedStories.map((story) => (
                <article key={story.id} className="animate-rise-in rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(37,18,28,0.92),rgba(12,12,12,0.96))] p-5 transition hover:-translate-y-[1px] hover:border-rose-300/35 hover:shadow-[0_24px_60px_rgba(244,114,182,0.14)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-rose-200/70">{story.city} · {story.category}</p>
                      <h3 className="mt-2 text-lg font-semibold">{story.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-rose-300/15 bg-rose-300/10 px-3 py-1 text-xs text-rose-100">{story.author}</span>
                      <button
                        onClick={() =>
                          reportContent({
                            targetType: "community-story",
                            targetId: story.id,
                            title: story.title,
                          })
                        }
                        className="rounded-full border border-rose-200/18 bg-rose-200/8 px-3 py-1 text-xs text-rose-100 transition hover:border-rose-200/30"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-300">{story.excerpt}</p>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{story.body}</p>
                  <p className="mt-4 text-xs text-gray-500">{timeAgo(story.createdAt)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-violet-400/15 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_26%),linear-gradient(180deg,rgba(24,18,44,0.96),rgba(10,10,10,1))] p-6 shadow-[0_28px_90px_rgba(139,92,246,0.10)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">Member Guides</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Practical wisdom</h2>
              </div>
              <button onClick={() => setShowGuideForm((current) => !current)} className="rounded-full border border-violet-400/30 bg-violet-300/8 px-4 py-2 text-xs text-violet-100 transition hover:border-violet-300 hover:bg-violet-300/15 hover:text-white">{showGuideForm ? "Close form" : "New guide"}</button>
            </div>
            {showGuideForm && (
              <form onSubmit={publishGuide} className="mb-5 space-y-3 rounded-2xl border border-violet-400/20 bg-violet-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Field value={guideForm.title} onChange={(event) => setGuideForm((current) => ({ ...current, title: event.target.value }))} placeholder="Guide title" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field value={guideForm.city} onChange={(event) => setGuideForm((current) => ({ ...current, city: event.target.value }))} placeholder="City or region" />
                  <Field value={guideForm.author} onChange={(event) => setGuideForm((current) => ({ ...current, author: event.target.value }))} placeholder="Your name" />
                </div>
                <Field value={guideForm.focus} onChange={(event) => setGuideForm((current) => ({ ...current, focus: event.target.value }))} placeholder="Focus" />
                <Field value={guideForm.summary} onChange={(event) => setGuideForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Short summary" area />
                <Field value={guideForm.content} onChange={(event) => setGuideForm((current) => ({ ...current, content: event.target.value }))} placeholder="Write the guide" area />
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-200 via-fuchsia-200 to-sky-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Publish guide</button>
              </form>
            )}
            <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.05fr)]">
              <div className="qa-guides-scroll max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {sortedGuides.map((guide) => {
                  const active = activeGuide?.id === guide.id;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setGuideId(guide.id)}
                      className={`w-full rounded-2xl border p-4 text-left break-normal transition ${
                        active
                          ? "border-violet-300/35 bg-violet-300/12 shadow-[0_14px_34px_rgba(139,92,246,0.14)]"
                          : "border-white/8 bg-[linear-gradient(180deg,rgba(23,19,42,0.72),rgba(11,11,11,0.96))] hover:border-violet-300/24"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-violet-200/75">
                        {guide.city} · {guide.focus}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold text-white">{guide.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{guide.summary}</p>
                      <p className="mt-3 text-[11px] text-white/38">by {guide.author} · {timeAgo(guide.createdAt)}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(23,19,42,0.94),rgba(11,11,11,0.96))] p-4">
                {activeGuide ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">
                        {activeGuide.city} · {activeGuide.focus}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="whitespace-nowrap text-xs text-gray-500">{timeAgo(activeGuide.createdAt)}</p>
                        <button
                          onClick={() =>
                            reportContent({
                              targetType: "community-guide",
                              targetId: activeGuide.id,
                              title: activeGuide.title,
                            })
                          }
                          className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-xs text-violet-100 transition hover:border-violet-200/35"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{activeGuide.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-300">{activeGuide.summary}</p>
                    <p className="mt-3 text-sm leading-7 text-gray-400">{activeGuide.content}</p>
                    <p className="mt-4 text-xs text-gray-500">by {activeGuide.author}</p>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-sm text-white/50">
                    No guides yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[30px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(8,28,38,0.96),rgba(10,10,10,1))] p-6 shadow-[0_28px_90px_rgba(34,211,238,0.10)]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Discussions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Live chat</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {visibleTopics.map((topic) => {
                  const replies = (messages[topic.id] || []).length;
                  const active = activeTopic?.id === topic.id;
                  return (
                    <button key={topic.id} onClick={() => setTopicId(topic.id)} className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-cyan-300 bg-cyan-300/12 shadow-[0_12px_30px_rgba(34,211,238,0.12)]" : "border-white/8 bg-[linear-gradient(180deg,rgba(8,30,38,0.74),rgba(11,11,11,0.95))] hover:border-cyan-300/30"} animate-rise-in`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">{topic.name}</h3>
                        <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">{topic.mood}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-400">{topic.description}</p>
                      <p className="mt-3 text-xs text-gray-500">{replies} replies</p>
                    </button>
                  );
                })}
              </div>
              <form onSubmit={createTopic} className="rounded-2xl border border-cyan-400/20 bg-cyan-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Start a topic</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                  <Field value={topicForm.name} onChange={(event) => setTopicForm((current) => ({ ...current, name: event.target.value }))} placeholder="Topic name" />
                  <Field value={topicForm.mood} onChange={(event) => setTopicForm((current) => ({ ...current, mood: event.target.value }))} placeholder="Mood" />
                  <div className="md:col-span-3 xl:col-span-1">
                    <Field value={topicForm.description} onChange={(event) => setTopicForm((current) => ({ ...current, description: event.target.value }))} placeholder="What should people discuss here?" area />
                  </div>
                  <div className="md:col-span-3 xl:col-span-1">
                    <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Create topic</button>
                  </div>
                </div>
              </form>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(8,30,38,0.8),rgba(11,11,11,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              {activeTopic && (
                <>
                  <div className="border-b border-gray-800 pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{activeTopic.mood}</p>
                        <h3 className="mt-2 text-lg font-semibold">{activeTopic.name}</h3>
                      </div>
                      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                        {busiestTopic ? `Trending: ${busiestTopic.name}` : "New conversation"}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{activeTopic.description}</p>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,28,36,0.8),rgba(8,8,8,0.96))] p-3">
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <p className="text-xs text-gray-300">Signed in as <span className="font-semibold text-cyan-200">{memberName || "Member"}</span></p>
                      <p className="text-xs text-gray-500">{activeMessages.length} messages</p>
                    </div>
                    <div className="h-[340px] space-y-3 overflow-y-auto pr-1">
                      {activeMessages.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-700 px-4 py-6 text-sm text-gray-500">No messages yet. Start the conversation.</div>
                      )}
                      {activeMessages.map((message) => {
                        const isMine = message.author === (memberName || "Member");
                        return (
                          <div key={message.id} className={`flex gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine && (
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                                {message.author.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isMine ? "border border-cyan-300/35 bg-cyan-300/18" : "border border-white/10 bg-black/35"}`}>
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold text-gray-200">{message.author}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500">{timeAgo(message.createdAt)}</p>
                                  <button
                                    onClick={() =>
                                      reportContent({
                                        targetType: "community-message",
                                        targetId: message.id,
                                        title: activeTopic?.name || "Community message",
                                      })
                                    }
                                    className="rounded-full border border-white/12 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 transition hover:text-white"
                                  >
                                    Report
                                  </button>
                                </div>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-gray-200">{message.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <form onSubmit={sendMessage} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <Field value={messageForm.text} onChange={(event) => setMessageForm({ text: event.target.value })} placeholder="Write a message to the topic" />
                    <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Send</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%),linear-gradient(180deg,rgba(45,31,10,0.96),rgba(10,10,10,1))] p-6 shadow-[0_28px_90px_rgba(251,191,36,0.10)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Improve Queer Atlas</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Member ideas</h2>
            </div>
            <button onClick={() => setShowIdeaForm((current) => !current)} className="rounded-full border border-amber-300/30 bg-amber-300/8 px-4 py-2 text-xs text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/15 hover:text-white">{showIdeaForm ? "Close form" : "Suggest an improvement"}</button>
          </div>
          {showIdeaForm && (
            <form onSubmit={publishIdea} className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="grid gap-3 md:grid-cols-[0.35fr_1fr_auto]">
                <Field value={ideaForm.author} onChange={(event) => setIdeaForm((current) => ({ ...current, author: event.target.value }))} placeholder="Your name" />
                <Field value={ideaForm.text} onChange={(event) => setIdeaForm((current) => ({ ...current, text: event.target.value }))} placeholder="What should we improve in the app?" />
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95">Share idea</button>
              </div>
            </form>
          )}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedIdeas.map((idea) => (
              <div key={idea.id} className="animate-rise-in rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(46,31,10,0.78),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] hover:border-amber-200/30 hover:shadow-[0_24px_60px_rgba(251,191,36,0.14)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm leading-6 text-gray-300">{idea.text}</p>
                    <p className="mt-2 text-xs text-gray-500">{idea.author} · {timeAgo(idea.createdAt)}</p>
                    <button
                      onClick={() =>
                        reportContent({
                          targetType: "community-idea",
                          targetId: idea.id,
                          title: idea.text.slice(0, 80),
                        })
                      }
                      className="mt-2 rounded-full border border-amber-200/20 bg-amber-200/8 px-3 py-1 text-xs text-amber-100 transition hover:border-amber-200/35"
                    >
                      Report
                    </button>
                  </div>
                  <button onClick={() => upvoteIdea(idea.id)} className="rounded-full border border-amber-300/30 bg-amber-300/8 px-3 py-2 text-xs text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/15 hover:text-white">▲ {idea.votes}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
