"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  ExternalLink,
  FileClock,
  History,
  Library,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import ActionToast from "@/components/ui/ActionToast";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useActionToast } from "@/lib/useActionToast";

const PEOPLE_TABLE = "qa_editorial_people";
const ENTRIES_TABLE = "qa_editorial_entries";
const SOURCES_TABLE = "qa_editorial_sources";
const REVISIONS_TABLE = "qa_editorial_revisions";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-200/40";
const LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/52";

const EMPTY_PERSON = {
  id: "",
  slug: "",
  name: "",
  person_type: "person",
  role: "",
  bio: "",
  city: "",
  country: "",
  languages: "",
  expertise: "",
  avatar_url: "",
  profile_url: "",
  user_id: "",
  is_public: false,
  is_active: true,
};

const EMPTY_ENTRY = {
  id: "",
  content_key: "",
  route: "",
  content_type: "guide",
  title: "",
  status: "draft",
  author_id: "",
  reviewer_id: "",
  published_at: "",
  last_updated_at: "",
  reviewed_at: "",
  research_scope: "",
  methodology_note: "",
  is_public: true,
  version: 1,
};

const EMPTY_SOURCE = {
  id: "",
  url: "",
  source_name: "",
  source_type: "official",
  confidence: "high",
  claim_scope: "",
  checked_at: "",
  is_public: true,
  sort_order: 0,
  internal_note: "",
};

const EMPTY_REVISION = {
  id: "",
  changed_at: new Date().toISOString().slice(0, 10),
  summary: "",
  change_type: "editorial",
  is_material: true,
  is_public: true,
};

function slugify(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function splitList(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
}

function isMissingRelationError(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return code === "42P01" || code === "PGRST205" || text.includes("does not exist") || text.includes("schema cache");
}

function errorText(error) {
  return String(error?.message || error?.details || error?.hint || "Unexpected error").trim();
}

function mapPerson(row = {}) {
  return {
    ...EMPTY_PERSON,
    ...row,
    id: String(row.id || ""),
    languages: joinList(row.languages),
    expertise: joinList(row.expertise),
    user_id: String(row.user_id || ""),
    is_public: Boolean(row.is_public),
    is_active: row.is_active !== false,
  };
}

function mapEntry(row = {}) {
  return {
    ...EMPTY_ENTRY,
    ...row,
    id: String(row.id || ""),
    author_id: String(row.author_id || ""),
    reviewer_id: String(row.reviewer_id || ""),
    published_at: String(row.published_at || "").slice(0, 10),
    last_updated_at: String(row.last_updated_at || "").slice(0, 10),
    reviewed_at: String(row.reviewed_at || "").slice(0, 10),
    is_public: row.is_public !== false,
    version: Number(row.version || 1),
  };
}

function statusTone(status = "") {
  if (status === "published") return "border-emerald-200/24 bg-emerald-200/10 text-emerald-100";
  if (status === "in_review") return "border-amber-200/24 bg-amber-200/10 text-amber-100";
  if (status === "archived") return "border-white/12 bg-white/[0.04] text-white/48";
  return "border-violet-200/22 bg-violet-200/10 text-violet-100";
}

function Field({ label, children }) {
  return (
    <label className={LABEL_CLASS}>
      {label}
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label, note = "" }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
      <span>
        <span className="block text-xs font-semibold text-white/76">{label}</span>
        {note ? <span className="mt-0.5 block text-[10px] text-white/42">{note}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-cyan-300" />
    </label>
  );
}

export default function EditorialAdminPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, session } = useAuth();
  const { toast, showToast } = useActionToast();
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("people");
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [entries, setEntries] = useState([]);
  const [sources, setSources] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [personForm, setPersonForm] = useState(EMPTY_PERSON);
  const [entryForm, setEntryForm] = useState(EMPTY_ENTRY);
  const [sourceForm, setSourceForm] = useState(EMPTY_SOURCE);
  const [revisionForm, setRevisionForm] = useState(EMPTY_REVISION);
  const [selectedEvidenceEntryId, setSelectedEvidenceEntryId] = useState("");

  const loadEditorialData = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      const [peopleRes, entriesRes, sourcesRes, revisionsRes] = await Promise.all([
        supabase.from(PEOPLE_TABLE).select("*").order("name", { ascending: true }),
        supabase.from(ENTRIES_TABLE).select("*").order("last_updated_at", { ascending: false }),
        supabase.from(SOURCES_TABLE).select("*").order("sort_order", { ascending: true }),
        supabase.from(REVISIONS_TABLE).select("*").order("changed_at", { ascending: false }),
      ]);
      const firstError = [peopleRes.error, entriesRes.error, sourcesRes.error, revisionsRes.error].find(Boolean);
      if (firstError) {
        if (isMissingRelationError(firstError)) {
          setSetupRequired(true);
          setNotice("The editorial database has not been installed yet.");
          return;
        }
        throw firstError;
      }

      const nextPeople = (peopleRes.data || []).map(mapPerson);
      const nextEntries = (entriesRes.data || []).map(mapEntry);
      setPeople(nextPeople);
      setEntries(nextEntries);
      setSources(sourcesRes.data || []);
      setRevisions(revisionsRes.data || []);
      setSetupRequired(false);
      setSelectedEvidenceEntryId((current) => current || String(nextEntries[0]?.id || ""));
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (isAuthLoading) return undefined;

    if (!isMember) {
      localStorage.setItem("qa_redirect", "/admin/editorial");
      localStorage.setItem("qa_post_login_target", "/admin/editorial");
      router.replace("/?join=true");
      queueMicrotask(() => {
        if (active) setIsReady(true);
      });
      return () => {
        active = false;
      };
    }

    queueMicrotask(async () => {
      try {
        const access = await resolveAdminAccess({ email: user?.email });
        if (!active) return;
        setIsAdmin(Boolean(access?.isAdmin));
        setIsReady(true);
        if (access?.isAdmin) await loadEditorialData();
      } catch (error) {
        if (!active) return;
        setNotice(errorText(error));
        setIsReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, loadEditorialData, router, user?.email]);

  const peopleById = useMemo(
    () => new Map(people.map((person) => [String(person.id), person])),
    [people],
  );

  const filteredPeople = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) => `${person.name} ${person.role} ${person.city} ${person.country}`.toLowerCase().includes(needle));
  }, [people, search]);

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) => `${entry.title} ${entry.route} ${entry.content_key} ${entry.content_type}`.toLowerCase().includes(needle));
  }, [entries, search]);

  const selectedEntry = entries.find((entry) => String(entry.id) === String(selectedEvidenceEntryId)) || null;
  const selectedSources = sources.filter((source) => String(source.entry_id) === String(selectedEvidenceEntryId));
  const selectedRevisions = revisions.filter((revision) => String(revision.entry_id) === String(selectedEvidenceEntryId));

  const revalidateEditorialPaths = async (paths = []) => {
    const token = String(session?.access_token || "").trim();
    const normalizedPaths = [...new Set(paths.filter(Boolean))];
    if (!token || normalizedPaths.length === 0) return;
    try {
      await fetch("/api/admin/editorial/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paths: normalizedPaths }),
      });
    } catch {
      // The database save remains valid; ISR will refresh on its normal interval.
    }
  };

  const savePerson = async (event) => {
    event.preventDefault();
    const name = personForm.name.trim();
    const slug = slugify(personForm.slug || name);
    if (!name || !slug) return showToast("Name and profile slug are required.", { tone: "warn" });
    setSaving(true);
    try {
      const payload = {
        slug,
        name,
        person_type: personForm.person_type,
        role: personForm.role.trim() || null,
        bio: personForm.bio.trim() || null,
        city: personForm.city.trim() || null,
        country: personForm.country.trim() || null,
        languages: splitList(personForm.languages),
        expertise: splitList(personForm.expertise),
        avatar_url: personForm.avatar_url.trim() || null,
        profile_url: personForm.profile_url.trim() || null,
        user_id: personForm.user_id.trim() || null,
        is_public: Boolean(personForm.is_public),
        is_active: Boolean(personForm.is_active),
        updated_by: user?.id || null,
      };
      const query = personForm.id
        ? supabase.from(PEOPLE_TABLE).update(payload).eq("id", personForm.id)
        : supabase.from(PEOPLE_TABLE).insert([{ ...payload, created_by: user?.id || null }]);
      const { error } = await query;
      if (error) throw error;
      await revalidateEditorialPaths([
        "/contributors",
        ...entries
          .filter((entry) => entry.author_id === personForm.id || entry.reviewer_id === personForm.id)
          .map((entry) => entry.route),
      ]);
      showToast(personForm.id ? "Contributor updated." : "Contributor created.", { tone: "ok" });
      setPersonForm(EMPTY_PERSON);
      await loadEditorialData();
    } catch (error) {
      showToast(errorText(error), { tone: "warn", duration: 3200 });
    } finally {
      setSaving(false);
    }
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    if (!entryForm.title.trim() || !entryForm.content_key.trim() || !entryForm.route.trim()) {
      return showToast("Title, content key and route are required.", { tone: "warn" });
    }
    if (entryForm.status === "published" && !entryForm.published_at) {
      return showToast("Published content needs a publication date.", { tone: "warn" });
    }
    if (entryForm.author_id && entryForm.author_id === entryForm.reviewer_id) {
      return showToast("Author and fact-checker must be different people.", { tone: "warn" });
    }
    setSaving(true);
    try {
      const payload = {
        content_key: entryForm.content_key.trim().toLowerCase(),
        route: entryForm.route.trim(),
        content_type: entryForm.content_type,
        title: entryForm.title.trim(),
        status: entryForm.status,
        author_id: entryForm.author_id || null,
        reviewer_id: entryForm.reviewer_id || null,
        published_at: entryForm.published_at || null,
        last_updated_at: entryForm.last_updated_at || new Date().toISOString().slice(0, 10),
        reviewed_at: entryForm.reviewed_at || null,
        research_scope: entryForm.research_scope.trim() || null,
        methodology_note: entryForm.methodology_note.trim() || null,
        is_public: Boolean(entryForm.is_public),
        updated_by: user?.id || null,
      };
      const query = entryForm.id
        ? supabase.from(ENTRIES_TABLE).update(payload).eq("id", entryForm.id)
        : supabase.from(ENTRIES_TABLE).insert([{ ...payload, created_by: user?.id || null }]);
      const { error } = await query;
      if (error) throw error;
      await revalidateEditorialPaths([payload.route]);
      showToast(entryForm.id ? "Editorial entry updated." : "Editorial entry created.", { tone: "ok" });
      setEntryForm(EMPTY_ENTRY);
      await loadEditorialData();
    } catch (error) {
      showToast(errorText(error), { tone: "warn", duration: 3400 });
    } finally {
      setSaving(false);
    }
  };

  const saveSource = async (event) => {
    event.preventDefault();
    if (!selectedEvidenceEntryId) return showToast("Choose an editorial entry first.", { tone: "warn" });
    if (!sourceForm.url.trim() || !sourceForm.source_name.trim()) return showToast("Source name and URL are required.", { tone: "warn" });
    setSaving(true);
    try {
      const payload = {
        entry_id: selectedEvidenceEntryId,
        url: sourceForm.url.trim(),
        source_name: sourceForm.source_name.trim(),
        source_type: sourceForm.source_type,
        confidence: sourceForm.confidence,
        claim_scope: sourceForm.claim_scope.trim() || null,
        checked_at: sourceForm.checked_at || null,
        is_public: Boolean(sourceForm.is_public),
        sort_order: Number(sourceForm.sort_order || 0),
        internal_note: sourceForm.internal_note.trim() || null,
        updated_by: user?.id || null,
      };
      const query = sourceForm.id
        ? supabase.from(SOURCES_TABLE).update(payload).eq("id", sourceForm.id)
        : supabase.from(SOURCES_TABLE).insert([{ ...payload, created_by: user?.id || null }]);
      const { error } = await query;
      if (error) throw error;
      await revalidateEditorialPaths([selectedEntry?.route]);
      showToast(sourceForm.id ? "Source updated." : "Source added.", { tone: "ok" });
      setSourceForm(EMPTY_SOURCE);
      await loadEditorialData();
    } catch (error) {
      showToast(errorText(error), { tone: "warn", duration: 3400 });
    } finally {
      setSaving(false);
    }
  };

  const saveRevision = async (event) => {
    event.preventDefault();
    if (!selectedEvidenceEntryId) return showToast("Choose an editorial entry first.", { tone: "warn" });
    if (!revisionForm.summary.trim()) return showToast("Change summary is required.", { tone: "warn" });
    setSaving(true);
    try {
      const payload = {
        entry_id: selectedEvidenceEntryId,
        changed_at: revisionForm.changed_at,
        summary: revisionForm.summary.trim(),
        change_type: revisionForm.change_type,
        is_material: Boolean(revisionForm.is_material),
        is_public: Boolean(revisionForm.is_public),
        changed_by: user?.id || null,
      };
      const query = revisionForm.id
        ? supabase.from(REVISIONS_TABLE).update(payload).eq("id", revisionForm.id)
        : supabase.from(REVISIONS_TABLE).insert([payload]);
      const { error } = await query;
      if (error) throw error;
      await revalidateEditorialPaths([selectedEntry?.route]);
      showToast(revisionForm.id ? "Revision updated." : "Revision logged.", { tone: "ok" });
      setRevisionForm(EMPTY_REVISION);
      await loadEditorialData();
    } catch (error) {
      showToast(errorText(error), { tone: "warn", duration: 3400 });
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (table, id, successMessage) => {
    if (!id || !window.confirm("Delete this item? This cannot be undone.")) return;
    setSaving(true);
    try {
      const pathsToRefresh = table === PEOPLE_TABLE
        ? [
            "/contributors",
            ...entries
              .filter((entry) => entry.author_id === id || entry.reviewer_id === id)
              .map((entry) => entry.route),
          ]
        : table === ENTRIES_TABLE
          ? [entries.find((entry) => entry.id === id)?.route]
          : [selectedEntry?.route];
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await revalidateEditorialPaths(pathsToRefresh);
      showToast(successMessage, { tone: "ok" });
      await loadEditorialData();
    } catch (error) {
      showToast(errorText(error), { tone: "warn", duration: 3400 });
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <PageOpeningState title="Opening Editorial Studio..." subtitle="Checking access and loading the trust system." tone="cyan" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-lg rounded-3xl border border-rose-300/20 bg-rose-300/8 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-100/78">Access denied</p>
          <h1 className="mt-3 text-2xl font-semibold">Admin only area</h1>
          <Link href="/" className="mt-5 inline-flex rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/82">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_92%_4%,rgba(244,114,182,0.10),transparent_24%),linear-gradient(180deg,#050712_0%,#07070b_50%,#030305_100%)] px-4 py-7 text-white sm:px-6 sm:py-9">
      <ActionToast toast={toast} />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/52">
          <Link href="/admin" className="qa-action inline-flex items-center gap-2 transition hover:text-white"><ArrowLeft size={14} /> Command Center</Link>
          <Link href="/contributors" className="qa-action inline-flex items-center gap-2 transition hover:text-cyan-100">Public contributor page <ExternalLink size={13} /></Link>
        </div>

        <header className="relative mt-5 overflow-hidden rounded-[32px] border border-cyan-200/16 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(244,114,182,0.13),transparent_32%),linear-gradient(150deg,rgba(18,25,40,0.96),rgba(8,8,13,0.99))] p-6 shadow-[0_36px_110px_rgba(0,0,0,0.42)] sm:p-8">
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/72">Trust operations</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Editorial Studio</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
                Manage named authors, fact-checkers, research scope, source ledgers, and visible change history from one premium workspace.
              </p>
            </div>
            <button type="button" onClick={loadEditorialData} disabled={loading} className="qa-action qa-action-strong inline-flex items-center justify-center gap-2 rounded-full border border-cyan-100/32 bg-cyan-200/12 px-4 py-2.5 text-xs font-semibold text-cyan-100 disabled:opacity-50">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </header>

        {setupRequired ? (
          <section className="mt-5 rounded-[26px] border border-amber-200/24 bg-amber-200/[0.08] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/68">Database setup required</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Install the editorial migration</h2>
            <p className="mt-2 text-sm leading-7 text-white/66">Run <code className="rounded bg-black/30 px-1.5 py-1 text-amber-100">supabase/editorial-system-v1.sql</code> in the Supabase SQL editor, then refresh this page.</p>
          </section>
        ) : null}

        {notice && !setupRequired ? <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100">{notice}</div> : null}

        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "People", value: people.length, icon: UserRound, iconClass: "text-cyan-100" },
            { label: "Published", value: entries.filter((entry) => entry.status === "published").length, icon: Check, iconClass: "text-emerald-100" },
            { label: "Sources", value: sources.length, icon: Library, iconClass: "text-fuchsia-100" },
            { label: "Revisions", value: revisions.length, icon: History, iconClass: "text-amber-100" },
          ].map((item) => (
            <article key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
              <item.icon size={16} className={item.iconClass} />
              <p className="mt-3 text-2xl font-semibold">{item.value}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/42">{item.label}</p>
            </article>
          ))}
        </section>

        <nav className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" aria-label="Editorial admin sections">
          <div className="flex min-w-max gap-2">
            {[
              { id: "people", label: "People & roles", icon: UserRound },
              { id: "entries", label: "Guides & reports", icon: BookOpenCheck },
              { id: "evidence", label: "Sources & history", icon: FileClock },
            ].map((item) => (
              <button key={item.id} type="button" onClick={() => { setTab(item.id); setSearch(""); }} className={`qa-action inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${tab === item.id ? "border-cyan-200/32 bg-cyan-200/12 text-cyan-100" : "border-white/12 bg-white/[0.04] text-white/58 hover:border-white/24 hover:text-white"}`}>
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>
        </nav>

        {!setupRequired && tab !== "evidence" ? (
          <div className="mt-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "people" ? "Search people, roles or cities..." : "Search title, route or content key..."} className={`${INPUT_CLASS} max-w-xl`} />
          </div>
        ) : null}

        {!setupRequired && tab === "people" ? (
          <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">People</h2>
                <button type="button" onClick={() => setPersonForm(EMPTY_PERSON)} className="qa-action inline-flex items-center gap-1.5 rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1.5 text-xs text-cyan-100"><Plus size={13} /> New</button>
              </div>
              <div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">
                {filteredPeople.map((person) => (
                  <button key={person.id} type="button" onClick={() => setPersonForm(person)} className={`qa-action w-full rounded-2xl border p-3 text-left transition ${personForm.id === person.id ? "border-cyan-200/28 bg-cyan-200/10" : "border-white/9 bg-black/20 hover:border-white/20"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{person.name}</p><p className="mt-1 truncate text-xs text-white/48">{person.role || person.person_type}</p></div>
                      <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${person.is_public ? "border-emerald-200/20 bg-emerald-200/8 text-emerald-100" : "border-white/10 bg-white/[0.04] text-white/42"}`}>{person.is_public ? "Public" : "Private"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={savePerson} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/58">Profile editor</p><h2 className="mt-1 text-xl font-semibold">{personForm.id ? "Edit contributor" : "New contributor"}</h2></div>{personForm.id ? <button type="button" onClick={() => deleteRow(PEOPLE_TABLE, personForm.id, "Contributor deleted.")} className="qa-action rounded-full border border-rose-200/20 bg-rose-200/8 p-2 text-rose-100"><Trash2 size={15} /></button> : null}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Name"><input value={personForm.name} onChange={(event) => setPersonForm((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} className={INPUT_CLASS} required /></Field>
                <Field label="Profile slug"><input value={personForm.slug} onChange={(event) => setPersonForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className={INPUT_CLASS} required /></Field>
                <Field label="Type"><select value={personForm.person_type} onChange={(event) => setPersonForm((current) => ({ ...current, person_type: event.target.value }))} className={INPUT_CLASS}><option value="person">Person</option><option value="organization">Organization</option></select></Field>
                <Field label="Role"><input value={personForm.role} onChange={(event) => setPersonForm((current) => ({ ...current, role: event.target.value }))} className={INPUT_CLASS} placeholder="Local editor, fact-checker..." /></Field>
                <Field label="City"><input value={personForm.city} onChange={(event) => setPersonForm((current) => ({ ...current, city: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="Country"><input value={personForm.country} onChange={(event) => setPersonForm((current) => ({ ...current, country: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="Languages — comma separated"><input value={personForm.languages} onChange={(event) => setPersonForm((current) => ({ ...current, languages: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="Expertise — comma separated"><input value={personForm.expertise} onChange={(event) => setPersonForm((current) => ({ ...current, expertise: event.target.value }))} className={INPUT_CLASS} /></Field>
                <div className="sm:col-span-2"><Field label="Bio"><textarea value={personForm.bio} onChange={(event) => setPersonForm((current) => ({ ...current, bio: event.target.value }))} className={`${INPUT_CLASS} min-h-[120px]`} /></Field></div>
                <Field label="Avatar URL"><input type="url" value={personForm.avatar_url} onChange={(event) => setPersonForm((current) => ({ ...current, avatar_url: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="External profile URL"><input type="url" value={personForm.profile_url} onChange={(event) => setPersonForm((current) => ({ ...current, profile_url: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Toggle checked={personForm.is_public} onChange={(value) => setPersonForm((current) => ({ ...current, is_public: value }))} label="Public profile" note="Visible on the contributor page" />
                <Toggle checked={personForm.is_active} onChange={(value) => setPersonForm((current) => ({ ...current, is_active: value }))} label="Active contributor" note="Available for new assignments" />
              </div>
              <button type="submit" disabled={saving} className="qa-action qa-action-strong mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/36 bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"><Save size={15} /> {saving ? "Saving..." : "Save profile"}</button>
            </form>
          </section>
        ) : null}

        {!setupRequired && tab === "entries" ? (
          <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Editorial entries</h2><button type="button" onClick={() => setEntryForm(EMPTY_ENTRY)} className="qa-action inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200/22 bg-fuchsia-200/10 px-3 py-1.5 text-xs text-fuchsia-100"><Plus size={13} /> New</button></div>
              <div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">
                {filteredEntries.map((entry) => (
                  <button key={entry.id} type="button" onClick={() => setEntryForm(entry)} className={`qa-action w-full rounded-2xl border p-3 text-left transition ${entryForm.id === entry.id ? "border-fuchsia-200/28 bg-fuchsia-200/10" : "border-white/9 bg-black/20 hover:border-white/20"}`}>
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{entry.title}</p><p className="mt-1 truncate text-[11px] text-white/42">{entry.route}</p></div><span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.1em] ${statusTone(entry.status)}`}>{entry.status.replace("_", " ")}</span></div>
                    <p className="mt-2 text-[10px] text-white/34">v{entry.version} · {entry.content_type}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={saveEntry} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.16em] text-fuchsia-100/58">Content ownership</p><h2 className="mt-1 text-xl font-semibold">{entryForm.id ? "Edit editorial entry" : "New editorial entry"}</h2></div>{entryForm.id ? <button type="button" onClick={() => deleteRow(ENTRIES_TABLE, entryForm.id, "Editorial entry deleted.")} className="qa-action rounded-full border border-rose-200/20 bg-rose-200/8 p-2 text-rose-100"><Trash2 size={15} /></button> : null}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Title"><input value={entryForm.title} onChange={(event) => setEntryForm((current) => ({ ...current, title: event.target.value }))} className={INPUT_CLASS} required /></Field>
                <Field label="Content key"><input value={entryForm.content_key} onChange={(event) => setEntryForm((current) => ({ ...current, content_key: event.target.value.toLowerCase().replace(/[^a-z0-9:_-]/g, "-") }))} className={INPUT_CLASS} placeholder="guide:gay-guide" required /></Field>
                <Field label="Route"><input value={entryForm.route} onChange={(event) => setEntryForm((current) => ({ ...current, route: event.target.value }))} className={INPUT_CLASS} placeholder="/gay-guide" required /></Field>
                <Field label="Content type"><select value={entryForm.content_type} onChange={(event) => setEntryForm((current) => ({ ...current, content_type: event.target.value }))} className={INPUT_CLASS}><option value="guide">Guide</option><option value="report">Report</option><option value="collection">Collection</option><option value="city_discovery">City discovery</option><option value="policy">Policy</option><option value="other">Other</option></select></Field>
                <Field label="Status"><select value={entryForm.status} onChange={(event) => setEntryForm((current) => ({ ...current, status: event.target.value }))} className={INPUT_CLASS}><option value="draft">Draft</option><option value="in_review">In review</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
                <Field label="Author"><select value={entryForm.author_id} onChange={(event) => setEntryForm((current) => ({ ...current, author_id: event.target.value }))} className={INPUT_CLASS}><option value="">Unassigned</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>
                <Field label="Fact-checker"><select value={entryForm.reviewer_id} onChange={(event) => setEntryForm((current) => ({ ...current, reviewer_id: event.target.value }))} className={INPUT_CLASS}><option value="">Not required / unassigned</option>{people.filter((person) => person.id !== entryForm.author_id).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>
                <Field label="Published"><input type="date" value={entryForm.published_at} onChange={(event) => setEntryForm((current) => ({ ...current, published_at: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="Last updated"><input type="date" value={entryForm.last_updated_at} onChange={(event) => setEntryForm((current) => ({ ...current, last_updated_at: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Field label="Fact-checked"><input type="date" value={entryForm.reviewed_at} onChange={(event) => setEntryForm((current) => ({ ...current, reviewed_at: event.target.value }))} className={INPUT_CLASS} /></Field>
                <Toggle checked={entryForm.is_public} onChange={(value) => setEntryForm((current) => ({ ...current, is_public: value }))} label="Public metadata" note="Shown when status is published" />
                <div className="sm:col-span-2"><Field label="What was researched"><textarea value={entryForm.research_scope} onChange={(event) => setEntryForm((current) => ({ ...current, research_scope: event.target.value }))} className={`${INPUT_CLASS} min-h-[120px]`} /></Field></div>
                <div className="sm:col-span-2"><Field label="Internal methodology note"><textarea value={entryForm.methodology_note} onChange={(event) => setEntryForm((current) => ({ ...current, methodology_note: event.target.value }))} className={`${INPUT_CLASS} min-h-[90px]`} /></Field></div>
              </div>
              <button type="submit" disabled={saving} className="qa-action qa-action-strong mt-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-100/36 bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-200 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"><Save size={15} /> {saving ? "Saving..." : "Save entry"}</button>
            </form>
          </section>
        ) : null}

        {!setupRequired && tab === "evidence" ? (
          <section className="mt-5 space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <Field label="Editorial entry"><select value={selectedEvidenceEntryId} onChange={(event) => { setSelectedEvidenceEntryId(event.target.value); setSourceForm(EMPTY_SOURCE); setRevisionForm(EMPTY_REVISION); }} className={INPUT_CLASS}><option value="">Choose a guide or report</option>{entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.title} · {entry.route}</option>)}</select></Field>
              {selectedEntry ? <p className="mt-2 text-xs text-white/46">Editing evidence for <span className="font-semibold text-white/72">{selectedEntry.title}</span> · {peopleById.get(selectedEntry.author_id)?.name || "No author assigned"}</p> : null}
            </div>

            {selectedEntry ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-4">
                  <form onSubmit={saveSource} className="rounded-[26px] border border-emerald-200/14 bg-[radial-gradient(circle_at_0%_0%,rgba(52,211,153,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/58">Evidence ledger</p><h2 className="mt-1 text-xl font-semibold">{sourceForm.id ? "Edit source" : "Add source"}</h2></div>{sourceForm.id ? <button type="button" onClick={() => setSourceForm(EMPTY_SOURCE)} className="text-xs text-white/52">Cancel edit</button> : null}</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Source name"><input value={sourceForm.source_name} onChange={(event) => setSourceForm((current) => ({ ...current, source_name: event.target.value }))} className={INPUT_CLASS} required /></Field>
                      <Field label="URL"><input type="url" value={sourceForm.url} onChange={(event) => setSourceForm((current) => ({ ...current, url: event.target.value }))} className={INPUT_CLASS} required /></Field>
                      <Field label="Source type"><select value={sourceForm.source_type} onChange={(event) => setSourceForm((current) => ({ ...current, source_type: event.target.value }))} className={INPUT_CLASS}><option value="official">Official</option><option value="authority">Authority</option><option value="local_media">Local media</option><option value="specialist">Specialist guide</option><option value="review_platform">Review platform</option><option value="community">Community</option><option value="other">Other</option></select></Field>
                      <Field label="Confidence"><select value={sourceForm.confidence} onChange={(event) => setSourceForm((current) => ({ ...current, confidence: event.target.value }))} className={INPUT_CLASS}><option value="high">High</option><option value="medium">Medium</option><option value="developing">Developing</option></select></Field>
                      <Field label="Checked"><input type="date" value={sourceForm.checked_at || ""} onChange={(event) => setSourceForm((current) => ({ ...current, checked_at: event.target.value }))} className={INPUT_CLASS} /></Field>
                      <Field label="Sort order"><input type="number" value={sourceForm.sort_order} onChange={(event) => setSourceForm((current) => ({ ...current, sort_order: event.target.value }))} className={INPUT_CLASS} /></Field>
                      <div className="sm:col-span-2"><Field label="Claims this source supports"><textarea value={sourceForm.claim_scope || ""} onChange={(event) => setSourceForm((current) => ({ ...current, claim_scope: event.target.value }))} className={`${INPUT_CLASS} min-h-[80px]`} /></Field></div>
                      <div className="sm:col-span-2"><Field label="Internal note — never public"><textarea value={sourceForm.internal_note || ""} onChange={(event) => setSourceForm((current) => ({ ...current, internal_note: event.target.value }))} className={`${INPUT_CLASS} min-h-[70px]`} /></Field></div>
                      <Toggle checked={sourceForm.is_public} onChange={(value) => setSourceForm((current) => ({ ...current, is_public: value }))} label="Public citation" note="Visible on the guide or report" />
                    </div>
                    <button type="submit" disabled={saving} className="qa-action qa-action-strong mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/34 bg-emerald-200/14 px-4 py-2 text-sm font-semibold text-emerald-100"><Save size={14} /> Save source</button>
                  </form>
                  <div className="space-y-2">
                    {selectedSources.map((source) => (
                      <article key={source.id} className="rounded-2xl border border-white/10 bg-black/24 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><a href={source.url} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold text-white hover:text-emerald-100">{source.source_name}</a><p className="mt-1 text-[11px] text-white/42">{source.source_type.replace("_", " ")} · {source.confidence} confidence{source.checked_at ? ` · checked ${source.checked_at}` : ""}</p>{source.claim_scope ? <p className="mt-2 text-xs leading-5 text-white/56">{source.claim_scope}</p> : null}</div><div className="flex gap-1"><button type="button" onClick={() => setSourceForm({ ...EMPTY_SOURCE, ...source, id: String(source.id) })} className="qa-action rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/62">Edit</button><button type="button" onClick={() => deleteRow(SOURCES_TABLE, source.id, "Source deleted.")} className="qa-action rounded-full border border-rose-200/16 p-1.5 text-rose-100"><Trash2 size={12} /></button></div></div></article>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <form onSubmit={saveRevision} className="rounded-[26px] border border-amber-200/14 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.16em] text-amber-100/58">Public accountability</p><h2 className="mt-1 text-xl font-semibold">{revisionForm.id ? "Edit revision" : "Log a change"}</h2></div>{revisionForm.id ? <button type="button" onClick={() => setRevisionForm(EMPTY_REVISION)} className="text-xs text-white/52">Cancel edit</button> : null}</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Change date"><input type="date" value={revisionForm.changed_at} onChange={(event) => setRevisionForm((current) => ({ ...current, changed_at: event.target.value }))} className={INPUT_CLASS} required /></Field>
                      <Field label="Change type"><select value={revisionForm.change_type} onChange={(event) => setRevisionForm((current) => ({ ...current, change_type: event.target.value }))} className={INPUT_CLASS}><option value="correction">Correction</option><option value="source_update">Source update</option><option value="fact_check">Fact-check</option><option value="editorial">Editorial</option><option value="formatting">Formatting</option></select></Field>
                      <div className="sm:col-span-2"><Field label="What changed"><textarea value={revisionForm.summary} onChange={(event) => setRevisionForm((current) => ({ ...current, summary: event.target.value }))} className={`${INPUT_CLASS} min-h-[110px]`} required /></Field></div>
                      <Toggle checked={revisionForm.is_material} onChange={(value) => setRevisionForm((current) => ({ ...current, is_material: value }))} label="Material change" note="Meaning or conclusions changed" />
                      <Toggle checked={revisionForm.is_public} onChange={(value) => setRevisionForm((current) => ({ ...current, is_public: value }))} label="Public history" note="Visible to readers" />
                    </div>
                    <button type="submit" disabled={saving} className="qa-action qa-action-strong mt-4 inline-flex items-center gap-2 rounded-full border border-amber-100/34 bg-amber-200/14 px-4 py-2 text-sm font-semibold text-amber-100"><Save size={14} /> Save revision</button>
                  </form>
                  <div className="space-y-2">
                    {selectedRevisions.map((revision) => (
                      <article key={revision.id} className="rounded-2xl border border-white/10 bg-black/24 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{revision.changed_at} · {revision.change_type.replace("_", " ")}</p><p className="mt-2 text-xs leading-5 text-white/58">{revision.summary}</p><p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/34">{revision.is_material ? "Material" : "Minor"} · {revision.is_public ? "Public" : "Internal"}</p></div><div className="flex gap-1"><button type="button" onClick={() => setRevisionForm({ ...EMPTY_REVISION, ...revision, id: String(revision.id), changed_at: String(revision.changed_at || "").slice(0, 10) })} className="qa-action rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/62">Edit</button><button type="button" onClick={() => deleteRow(REVISIONS_TABLE, revision.id, "Revision deleted.")} className="qa-action rounded-full border border-rose-200/16 p-1.5 text-rose-100"><Trash2 size={12} /></button></div></div></article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[26px] border border-dashed border-white/12 p-8 text-center text-sm text-white/46">Choose an editorial entry to manage its evidence and history.</div>
            )}
          </section>
        ) : null}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5 text-xs text-white/38">
          <span>Editorial records are protected by Supabase RLS and admin verification.</span>
          <Link href="/editorial-policy" className="inline-flex items-center gap-1.5 transition hover:text-white"><ShieldCheck size={13} /> Editorial policy</Link>
        </footer>
      </div>
    </main>
  );
}
