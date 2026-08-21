import Link from "next/link";
import { BookOpenCheck, CalendarDays, ChevronDown, ExternalLink, History, ShieldCheck } from "lucide-react";
import { EDITORIAL_TEAM } from "@/lib/editorialTrust";

function formatEditorialDate(value = "") {
  const normalized = String(value || "").trim();
  if (!normalized) return "Not recorded";
  const date = new Date(`${normalized.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return normalized;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function EditorialDisclosure({
  author = EDITORIAL_TEAM,
  reviewer = null,
  publishedAt = "",
  updatedAt = "",
  researchScope = "",
  changeLog = [],
  sources = [],
  className = "",
  compact = false,
}) {
  return (
    <section className={`overflow-hidden rounded-[24px] border border-cyan-200/16 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.10),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.08),transparent_30%),linear-gradient(180deg,rgba(15,20,29,0.94),rgba(8,8,12,0.98))] shadow-[0_20px_64px_rgba(0,0,0,0.26)] ${className}`}>
      <div className={`grid gap-4 p-4 ${compact ? "" : "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/22 bg-cyan-200/10 text-cyan-100">
            <ShieldCheck size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/65">Editorial ownership</p>
            <Link href={author.href || "/contributors"} className="mt-1 block truncate text-sm font-semibold text-white transition hover:text-cyan-100">
              {author.name}
            </Link>
            <p className="mt-0.5 text-xs text-white/52">
              {author.role || "Author"}{reviewer?.name ? ` · Fact-checked by ${reviewer.name}` : ""}
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-2 text-xs ${compact ? "" : "sm:min-w-[17rem]"}`}>
          <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.13em] text-white/42"><CalendarDays size={12} aria-hidden="true" /> Published</p>
            <p className="mt-1 font-medium text-white/78">{formatEditorialDate(publishedAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.13em] text-white/42"><History size={12} aria-hidden="true" /> Updated</p>
            <p className="mt-1 font-medium text-white/78">{formatEditorialDate(updatedAt)}</p>
          </div>
        </div>
      </div>

      {(researchScope || changeLog.length > 0 || sources.length > 0) ? (
        <div className={`grid border-t border-white/8 ${compact ? "grid-cols-1" : sources.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {researchScope ? (
            <details className={`group border-b border-white/8 ${compact ? "" : "sm:border-b-0 sm:border-r"}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-white/76 transition hover:bg-white/[0.035] hover:text-white sm:px-5">
                <span className="flex items-center gap-2"><BookOpenCheck size={14} className="text-cyan-100/78" aria-hidden="true" /> What we researched</span>
                <ChevronDown size={14} className="transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-4 pb-4 text-xs leading-6 text-white/62 sm:px-5">{researchScope}</p>
            </details>
          ) : null}

          {changeLog.length > 0 ? (
            <details className={`group ${sources.length > 0 ? `border-b border-white/8 ${compact ? "" : "sm:border-b-0 sm:border-r"}` : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-white/76 transition hover:bg-white/[0.035] hover:text-white sm:px-5">
                <span className="flex items-center gap-2"><History size={14} className="text-fuchsia-100/78" aria-hidden="true" /> Change history</span>
                <ChevronDown size={14} className="transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ol className="space-y-2 px-4 pb-4 text-xs leading-6 text-white/62 sm:px-5">
                {changeLog.map((entry) => (
                  <li key={`${entry.date}-${entry.note}`}>
                    <span className="font-semibold text-white/76">{formatEditorialDate(entry.date)}:</span> {entry.note}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}

          {sources.length > 0 ? (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-white/76 transition hover:bg-white/[0.035] hover:text-white sm:px-5">
                <span className="flex items-center gap-2"><ExternalLink size={14} className="text-emerald-100/78" aria-hidden="true" /> Sources ({sources.length})</span>
                <ChevronDown size={14} className="transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="space-y-2 px-4 pb-4 text-xs leading-5 sm:px-5">
                {sources.map((source) => (
                  <li key={source.id || source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-white/68 transition hover:text-emerald-100">
                      <span>{source.name}</span>
                      <ExternalLink size={11} className="mt-1 shrink-0" aria-hidden="true" />
                    </a>
                    {source.claimScope ? <p className="mt-0.5 text-[11px] text-white/42">{source.claimScope}</p> : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
