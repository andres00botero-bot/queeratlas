"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { href: "#today", label: "Operations home", hint: "Priorities" },
  { href: "#safety", label: "Safety & moderation", hint: "Reports" },
  { href: "#submissions", label: "Content queue", hint: "Member entries" },
  { href: "#data-quality", label: "Data quality", hint: "Cities & sources" },
  { href: "#traffic", label: "Traffic intelligence", hint: "Demand & acquisition" },
  { href: "#members", label: "Members & privacy", hint: "Access" },
  { href: "#community", label: "Community signal", hint: "Ideas & contact" },
];

function Badge({ value, tone = "neutral" }) {
  if (!value) return null;
  const tones = {
    danger: "border-rose-300/30 bg-rose-300/12 text-rose-100",
    warning: "border-amber-300/30 bg-amber-300/12 text-amber-100",
    neutral: "border-white/12 bg-white/7 text-white/65",
  };
  return <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${tones[tone]}`}>{value}</span>;
}

export default function AdminOperationsShell({ children, counts = {}, onRefresh, refreshing = false }) {
  const urgent = Number(counts.reports || 0) + Number(counts.submissions || 0);
  return (
    <div className="mx-auto max-w-[1600px]">
      <nav aria-label="Admin operations mobile" className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {NAV_ITEMS.map((item) => <a key={item.href} href={item.href} className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold text-white/72 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">{item.label}</a>)}
      </nav>
      <div className="flex gap-6 xl:gap-8">
      <aside className="hidden w-64 shrink-0 xl:sticky xl:top-5 xl:block xl:h-[calc(100vh-2.5rem)]">
        <nav aria-label="Admin operations" className="flex h-full flex-col rounded-[26px] border border-white/10 bg-[#090c13]/90 p-3 shadow-[0_20px_70px_rgba(0,0,0,.26)] backdrop-blur-xl">
          <Link href="/" className="mb-5 flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-200 to-violet-300 text-sm font-black text-[#070a10]">Q</span>
            <span><span className="block text-sm font-semibold text-white">Queer Atlas</span><span className="block text-[10px] uppercase tracking-[0.14em] text-cyan-100/54">Operations</span></span>
          </Link>
          <div className="mb-3 rounded-2xl border border-cyan-200/12 bg-cyan-200/[0.06] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/64">Needs attention</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{urgent}</p>
            <p className="text-[11px] leading-4 text-white/48">Safety reports and member entries waiting for a decision.</p>
          </div>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const count = item.href === "#safety" ? counts.reports : item.href === "#submissions" ? counts.submissions : item.href === "#community" ? counts.comments : 0;
              return <a key={item.href} href={item.href} className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-white/25 group-hover:bg-cyan-200" /><span className="min-w-0"><span className="block text-xs font-semibold text-white/78">{item.label}</span><span className="block text-[10px] text-white/38">{item.hint}</span></span><Badge value={count} tone={item.href === "#safety" ? "danger" : "warning"} /></a>;
            })}
          </div>
          <div className="mt-auto border-t border-white/8 pt-3">
            <Link href="/admin/editorial" className="flex rounded-xl px-3 py-2.5 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-200/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200">Editorial studio <span className="ml-auto">↗</span></Link>
            <Link href="/admin/privacy" className="mt-1 flex rounded-xl px-3 py-2.5 text-xs font-semibold text-white/68 transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">Privacy review <span className="ml-auto">↗</span></Link>
            <button type="button" onClick={onRefresh} disabled={refreshing} className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5 text-xs font-semibold text-white/78 transition hover:border-cyan-200/35 hover:bg-cyan-200/10 disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">{refreshing ? "Refreshing…" : "Refresh operations"}</button>
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
