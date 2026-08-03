import { ExternalLink } from "lucide-react";

export default function OfficialExternalLink({ href, kind = "venue", className = "" }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`qa-action qa-action-strong group flex w-full items-center justify-between gap-5 overflow-hidden rounded-[22px] border border-fuchsia-200/40 bg-[linear-gradient(115deg,rgba(236,72,153,0.30),rgba(139,92,246,0.28),rgba(10,15,30,0.96))] px-5 py-4 text-left shadow-[0_18px_44px_rgba(168,85,247,0.20),inset_0_1px_0_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:border-amber-100/55 hover:shadow-[0_22px_54px_rgba(236,72,153,0.25),0_0_30px_rgba(139,92,246,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/75 ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-100/72">
          Official {kind}
        </span>
        <span className="mt-1 block text-sm font-semibold tracking-[0.01em] text-white sm:text-base">
          Visit official page
        </span>
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-100/30 bg-amber-100/10 text-amber-50 shadow-[0_0_24px_rgba(253,230,138,0.10)] transition duration-300 group-hover:scale-105 group-hover:border-amber-100/55 group-hover:bg-amber-100/16">
        <ExternalLink className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
    </a>
  );
}
