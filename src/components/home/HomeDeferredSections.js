"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Compass,
  History,
  Map,
  Megaphone,
  Newspaper,
  Quote,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const DISCOVERY_ICONS = {
  Cities: Map,
  Events: CalendarDays,
  News: Newspaper,
  Collections: BookOpen,
};

const PULSE_ICONS = {
  "next-event": CalendarDays,
  "latest-news": Newspaper,
  "top-city": Map,
  "local-pick": Map,
};

const PARTICIPATION_ICONS = {
  Community: UsersRound,
  Contribute: Megaphone,
};

const EDITORIAL_PATHS = [
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/sources-and-reviews", label: "Sources & reviews", icon: Quote },
  { href: "/contributors", label: "Named contributors", icon: UsersRound },
  { href: "/corrections", label: "Corrections", icon: History },
];

function DiscoveryCard({ item }) {
  const Icon = DISCOVERY_ICONS[item.icon] || Compass;

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={`qa-premium-card group relative min-h-[6.75rem] overflow-hidden rounded-[22px] border p-3.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.055)] ring-1 ring-inset ring-white/[0.025] transition duration-300 hover:-translate-y-0.5 hover:border-white/26 hover:shadow-[0_22px_58px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-[8rem] sm:p-4 ${item.surface}`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl transition duration-500 group-hover:scale-125 ${item.glow}`} />
      <div className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r ${item.accentLine}`} />
      <div className="relative flex h-full min-h-[4.75rem] flex-col sm:min-h-[6rem]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="!text-left text-lg font-semibold leading-none tracking-[-0.025em] text-white sm:text-xl">{item.title}</h3>
            <p className="mt-2 hidden max-w-[13rem] !text-left text-[10px] leading-[1.45] text-white/62 sm:block sm:text-xs">
              <span>{item.description}</span>
            </p>
          </div>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-[0_12px_30px_rgba(0,0,0,0.25)] sm:h-9 sm:w-9 ${item.iconSurface}`}>
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className={`truncate text-[9px] font-semibold uppercase tracking-[0.13em] ${item.metricClass}`}>{item.metric}</span>
          <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/10 text-white/46 transition duration-300 group-hover:border-white/24 group-hover:bg-white/10 group-hover:text-white sm:flex">
            <ArrowUpRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}

const PULSE_TONES = {
  "next-event": {
    icon: "border-[#F2B38B]/25 bg-[#F2B38B]/[0.12] text-[#F2B38B]",
    text: "text-[#F2B38B]",
    hover: "hover:border-[#F2B38B]/50",
  },
  "latest-news": {
    icon: "border-[#67D4F1]/25 bg-[#67D4F1]/[0.12] text-[#67D4F1]",
    text: "text-[#67D4F1]",
    hover: "hover:border-[#67D4F1]/50",
  },
  "local-pick": {
    icon: "border-[#B9AAF0]/25 bg-[#B9AAF0]/[0.12] text-[#B9AAF0]",
    text: "text-[#B9AAF0]",
    hover: "hover:border-[#B9AAF0]/50",
  },
};

function PulseCard({ item }) {
  const Icon = PULSE_ICONS[item.key] || Activity;
  const tone = PULSE_TONES[item.key] || PULSE_TONES["local-pick"];
  const detail = item.key === "next-event" ? item.signalValue : item.meta;

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={`group flex w-full min-w-0 items-start gap-3 rounded-2xl border border-[#2B3949] bg-[#141E2C] p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4] sm:min-h-[15rem] sm:flex-col sm:gap-4 sm:rounded-[20px] sm:p-5 ${tone.hover}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${tone.icon}`}>
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col sm:w-full">
        <span className={`text-xs font-semibold leading-5 ${tone.text}`}>{item.subtitle}</span>
        <span className="mt-1 line-clamp-2 text-sm font-semibold leading-5 tracking-[-0.01em] text-[#F5F1E8] sm:mt-3 sm:text-lg sm:leading-6">
          {item.title}
        </span>
        {detail ? (
          <span className="mt-1 text-xs leading-5 text-[#BCC7D2] sm:mt-3 sm:text-sm">{detail}</span>
        ) : null}
        <span className={`mt-auto hidden items-center justify-between gap-3 pt-5 text-sm font-semibold sm:flex ${tone.text}`}>
          {item.ctaLabel}
          <ArrowUpRight size={16} className="shrink-0 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
      <ArrowUpRight size={16} className={`mt-1 shrink-0 sm:hidden ${tone.text}`} aria-hidden="true" />
    </button>
  );
}

function ParticipationStrip({ actions = [] }) {
  const { t } = useLocale();
  if (actions.length === 0) return null;

  return (
    <section id="home-participation" data-home-section="participation" className="qa-defer-render mt-8 scroll-mt-20 py-[0.4cm]">
      <div className="relative py-2 sm:py-3">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(30rem,0.92fr)] lg:items-center">
            <div className="min-w-0 lg:border-l lg:border-rose-200/22 lg:pl-4">
              <p className="flex items-center gap-2 !text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-100/66">
                <span className="flex -space-x-1" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-violet-300" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-teal-300" />
                </span>
                {t("home.poweredByExperience", "Powered by lived experience")}
              </p>
              <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[2rem]">
                {t("home.participationTitle", "Make the atlas feel more like us.")}
              </h2>
              <p className="mt-2 hidden max-w-2xl !text-left text-[13px] leading-5 text-white/58 sm:block sm:text-sm">
                {t("home.participationDescription", "Meet members, share opportunities, join live conversations, or contribute to the editorial Voices hub.")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {actions.map((item) => {
                const Icon = PARTICIPATION_ICONS[item.icon] || Compass;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className={`group relative min-h-[4.75rem] overflow-hidden rounded-full border p-2 text-left shadow-[0_16px_38px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 sm:min-h-[5.25rem] sm:p-2.5 ${item.cardClass}`}
                  >
                  <span className={`pointer-events-none absolute -right-3 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full blur-2xl ${item.glowClass}`} />
                  <span className={`absolute inset-y-4 left-0 w-[2px] rounded-r-full bg-gradient-to-b ${item.lineClass}`} />
                  <div className="relative flex h-full items-center gap-2.5 sm:gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(0,0,0,0.2)] sm:h-12 sm:w-12 ${item.iconClass}`}>
                      <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] sm:text-[15px] ${item.titleClass}`}>{item.title}</span>
                      <span className={`mt-1 block whitespace-nowrap text-[8px] font-medium sm:hidden ${item.copyClass}`}>{item.shortLabel}</span>
                      <span className={`mt-1 hidden truncate text-[10px] font-medium sm:block ${item.copyClass}`}>{item.label}</span>
                    </span>
                    <span className={`mr-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:flex ${item.arrowClass}`}>
                      <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                    </span>
                  </div>
                </button>
                );
              })}
            </div>
        </div>
      </div>
    </section>
  );
}

function CompassPreview({ onOpen }) {
  const { t } = useLocale();
  return (
    <section id="home-compass" data-home-section="compass" className="qa-defer-render mt-8 scroll-mt-20">
      <Link
        href="/dictionary"
        onClick={() => onOpen?.("/dictionary")}
        className="group relative block overflow-hidden rounded-[26px] border border-[#88d9d4]/22 bg-[#102431] px-4 py-4 shadow-[0_20px_54px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#88d9d4]/46 hover:bg-[#132d3b] hover:shadow-[0_25px_64px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#88d9d4]/55 sm:px-5 sm:py-5"
      >
        <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-[#88d9d4]/14 bg-[#88d9d4]/[0.045]" />
        <span className="pointer-events-none absolute bottom-0 left-[18%] h-px w-1/2 bg-gradient-to-r from-transparent via-[#88d9d4]/48 to-transparent" />
        <div className="relative flex items-center gap-3.5 sm:gap-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-[#88d9d4]/30 bg-[#88d9d4]/[0.10] text-[#d7fbf8] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.16)] sm:h-14 sm:w-14">
            <Compass size={22} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-6">
            <span className="block shrink-0">
              <span className="inline-flex rounded-full border border-[#88d9d4]/24 bg-[#88d9d4]/[0.09] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#d7fbf8]/88">{t("home.dictionaryNew", "New · Queer Dictionary")}</span>
              <span className="qa-display mt-2 block text-[19px] font-semibold tracking-[-0.035em] text-white sm:text-[1.45rem]">Queer Dictionary</span>
            </span>
            <span className="mt-1 block text-left text-xs font-medium leading-5 text-white/68 sm:mt-0 sm:flex-1 sm:text-sm sm:leading-6">{t("home.dictionaryDescription", "Identities, pronouns and community language — with sources and nuance.")}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-[#88d9d4]/34 bg-[#88d9d4]/[0.10] py-2.5 pl-3.5 pr-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#d7fbf8] shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition group-hover:border-[#88d9d4]/58 group-hover:bg-[#88d9d4]/[0.17] group-hover:text-[#f2fffe]">
            <span className="sm:hidden">{t("home.open", "Open")}</span>
            <span className="hidden sm:inline">{t("home.openDictionary", "Open Dictionary")}</span>
            <ArrowUpRight size={12} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </section>
  );
}

function TrustSupportStrip({ onAction, contactSlot }) {
  const { t } = useLocale();
  const editorialPaths = [
    { href: "/verification", label: t("home.verification", "Verification"), icon: ShieldCheck },
    { href: "/sources-and-reviews", label: t("home.sourcesReviews", "Sources & reviews"), icon: Quote },
    { href: "/contributors", label: t("home.contributors", "Named contributors"), icon: UsersRound },
    { href: "/corrections", label: t("home.corrections", "Corrections"), icon: History },
  ];
  return (
    <section id="home-editorial-trust" data-home-section="editorial_trust" className="qa-defer-render mt-8 scroll-mt-20" aria-label="Queer Atlas trust and support">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <article className="relative flex h-full min-w-0 flex-col rounded-[26px] border border-transparent bg-transparent p-4 shadow-none sm:p-5 lg:rounded-[28px]">
            
            <p className="flex items-center gap-2 !text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100/60">
              <ClipboardCheck size={13} strokeWidth={1.8} aria-hidden="true" />
              {t("home.editorialStandards", "Editorial standards")}
            </p>
            <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[1.75rem]">
              {t("home.verificationTitle", "How we verify what you see.")}
            </h2>
            <p className="mt-2 hidden max-w-xl !text-left text-[13px] leading-5 text-white/54 sm:block sm:text-sm">
              {t("home.verificationDescription", "See how we check places, use reviews, credit contributors and record corrections.")}
            </p>
            <nav aria-label={t("home.editorialNav", "Queer Atlas editorial standards")} className="mt-4 grid grid-cols-2 gap-2 lg:mt-auto lg:pt-5">
              {editorialPaths.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onAction?.(item.href)}
                    className="group relative flex min-h-[4.25rem] items-center gap-2.5 overflow-hidden rounded-[17px] border border-cyan-100/14 bg-[linear-gradient(145deg,rgba(103,232,249,0.075),rgba(255,255,255,0.025))] px-3 py-2.5 text-left shadow-[0_10px_26px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/32 hover:bg-cyan-100/[0.1] hover:shadow-[0_14px_32px_rgba(8,145,178,0.12)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 sm:min-h-[4.5rem] sm:px-3.5 sm:py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-100/16 bg-cyan-100/[0.07] text-cyan-100/70 transition group-hover:border-cyan-100/30 group-hover:text-cyan-50">
                      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-[10px] font-medium leading-4 text-white/66 transition group-hover:text-cyan-50 sm:text-[11px]">
                      {item.label}
                    </span>
                    <ArrowUpRight size={12} className="shrink-0 text-cyan-100/34 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-50" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
          </article>

          <div className="relative h-full min-w-0 rounded-[26px] border border-transparent bg-transparent p-4 shadow-none sm:p-5 lg:rounded-[28px]">
            
            {contactSlot}
          </div>
      </div>
    </section>
  );
}

export function HomeDiscoverySection({ discoveryCards = [] }) {
  const { t } = useLocale();
  return (
    <section id="home-discovery" data-home-section="discovery" className="mt-8 scroll-mt-20">
      <div className="relative overflow-hidden rounded-[30px] border border-white/14 bg-[radial-gradient(circle_at_7%_0%,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_94%_8%,rgba(217,70,239,0.14),transparent_30%),radial-gradient(circle_at_52%_110%,rgba(139,92,246,0.1),transparent_38%),linear-gradient(155deg,rgba(16,19,33,0.98),rgba(7,9,17,0.99))] p-4 shadow-[0_28px_78px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.075)] ring-1 ring-inset ring-white/[0.035] sm:p-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/46 to-transparent" />
        <div className="relative mb-6 sm:mb-7">
          <p className="!text-left text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-100/68 sm:text-[10px]">{t("home.exploreQueerAtlas", "Explore Queer Atlas")}</p>
          <h2 className="qa-display mt-2.5 !text-left text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[2.1rem]">
            {t("home.findPrompt", "What do you want to find?")}
          </h2>
        </div>
        <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {discoveryCards.map((item) => (
            <DiscoveryCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MembershipPreview({ isMember = false, onAction }) {
  const { t } = useLocale();

  return (
    <section data-home-section="membership-preview" className="qa-defer-render mt-6 py-3 sm:py-4">
      <div className="relative isolate overflow-hidden rounded-[30px] bg-[#e6d7be] text-[#171421] shadow-[0_30px_84px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-[radial-gradient(circle_at_80%_15%,rgba(48,208,204,0.9),transparent_18%),radial-gradient(circle_at_18%_88%,rgba(229,113,174,0.72),transparent_28%),linear-gradient(135deg,#131b35_4%,#19294a_58%,#101826)] lg:block" />
        <div className="pointer-events-none absolute -right-20 top-20 hidden h-72 w-72 rounded-full border border-white/15 lg:block" />
        <div className="pointer-events-none absolute -right-4 top-36 hidden h-48 w-48 rounded-full border border-white/10 lg:block" />
        <div className="relative grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex min-h-0 flex-col justify-between p-5 sm:min-h-[330px] sm:p-6 lg:p-7">
            <div>
              <p className="!text-left text-[10px] font-bold uppercase tracking-[0.24em] text-[#645b70]">{t("home.memberEyebrow", "Your personal Atlas")}</p>
              <h2 className="qa-display mt-3 max-w-md !text-left text-[1.85rem] font-semibold leading-[1.05] tracking-[-0.065em] text-[#171421] sm:mt-3 sm:text-[2.5rem]">
                {t("home.memberTitle", "Save places. Plan your trip.")}
              </h2>
              <p className="mt-3 max-w-sm !text-left text-sm leading-6 text-[#4f4858] sm:mt-3 sm:text-sm">
                {t("home.memberShortDescription", "Keep your favourite places and organise your next trip—all in your own Atlas.")}
              </p>
            </div>
            <div className="mt-5 sm:mt-6">
              <button type="button" onClick={onAction} className="qa-action inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171421] px-5 py-3 text-sm font-semibold text-[#fff8ef] shadow-[0_12px_24px_rgba(23,20,33,0.2)] transition hover:-translate-y-0.5 hover:bg-[#2b2438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171421] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e6d7be]">
                {isMember ? t("home.openYourAtlas", "Open your Atlas") : t("home.createFreeAtlas", "Create your free Atlas")}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className="mt-2 text-xs font-medium text-[#665d6d]">{t("home.memberReassurance", "Free to join. Private by default.")}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#121b32] p-3 lg:hidden">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="relative rounded-[20px] border border-white/[0.17] bg-[#0d1528]/80 p-3 shadow-[0_16px_32px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-50/58">
                <span>{t("home.memberPreviewLabel", "Preview · My Atlas")}</span>
                <span>{t("home.memberPreviewStatus", "Private")}</span>
              </div>
              <div className="mt-2 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-100/18 bg-cyan-100/10 text-xs font-bold text-cyan-50">QA</span><span><span className="block text-sm font-semibold text-white">My Atlas</span><span className="mt-0.5 block text-[11px] text-white/48">Places, plans and memories</span></span></div>
              <div className="mt-2 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/[0.06] px-2.5 py-2"><span className="block text-sm font-semibold text-white">14</span><span className="text-[9px] uppercase tracking-[0.1em] text-white/46">Saved</span></div><div className="rounded-xl bg-white/[0.06] px-2.5 py-2"><span className="block text-sm font-semibold text-white">3</span><span className="text-[9px] uppercase tracking-[0.1em] text-white/46">Visited</span></div><div className="rounded-xl bg-white/[0.06] px-2.5 py-2"><span className="block text-sm font-semibold text-white">4</span><span className="text-[9px] uppercase tracking-[0.1em] text-white/46">Cities</span></div></div>
              <div className="hidden sm:block mt-3 rounded-xl border border-cyan-100/14 bg-cyan-100/[0.06] px-3 py-2.5"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-100/66">Coming up</p><p className="mt-1 text-xs font-medium text-white">Berlin · 4 places ready to shape</p></div>
            </div>
          </div>

          <div className="relative hidden min-h-[330px] overflow-hidden px-5 pb-7 pt-4 sm:px-7 sm:pb-7 lg:block lg:py-5">
            <div className="absolute left-[14%] top-[19%] h-[58%] w-px bg-gradient-to-b from-transparent via-cyan-100/70 to-transparent" />
            <div className="absolute left-[14%] top-[31%] h-2.5 w-2.5 -translate-x-[45%] rounded-full bg-cyan-200 shadow-[0_0_0_5px_rgba(125,211,252,0.12),0_0_25px_rgba(125,211,252,0.8)]" />
            <div className="absolute left-[14%] top-[65%] h-2.5 w-2.5 -translate-x-[45%] rounded-full bg-fuchsia-300 shadow-[0_0_0_5px_rgba(232,121,249,0.1),0_0_24px_rgba(232,121,249,0.62)]" />
            <div className="relative ml-[12%] max-w-md">
              <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-50/58">
                <span>{t("home.memberPreviewLabel", "Preview · My Atlas")}</span>
                <span>{t("home.memberPreviewStatus", "Private")}</span>
              </div>

              <div className="mt-3 rounded-[22px] border border-white/[0.18] bg-[#0e162a]/70 p-4 shadow-[0_18px_38px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-100/18 bg-cyan-100/10 text-xs font-bold text-cyan-50">QA</span><div><p className="text-sm font-semibold text-white">My Atlas</p><p className="mt-0.5 text-[11px] text-white/48">Private by default</p></div></div><span className="rounded-full border border-cyan-100/20 bg-cyan-100/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-50">Growing</span></div>
                <div className="mt-2 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/[0.06] px-3 py-2.5"><p className="text-base font-semibold text-white">14</p><p className="text-[9px] uppercase tracking-[0.12em] text-white/46">Saved</p></div><div className="rounded-xl bg-white/[0.06] px-3 py-2.5"><p className="text-base font-semibold text-white">3</p><p className="text-[9px] uppercase tracking-[0.12em] text-white/46">Visited</p></div><div className="rounded-xl bg-white/[0.06] px-3 py-2.5"><p className="text-base font-semibold text-white">4</p><p className="text-[9px] uppercase tracking-[0.12em] text-white/46">Cities</p></div></div>
                <div className="mt-4 border-t border-white/10 pt-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/66">Your cities</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1 text-[11px] text-white/76">Berlin · 6</span><span className="rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1 text-[11px] text-white/76">Stockholm · 5</span><span className="rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1 text-[11px] text-white/76">Brussels · 3</span></div></div>
              </div>

              <div className="ml-[7%] mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#f5d99a]/25 bg-[#1d1b2b]/90 px-4 py-3 shadow-[0_16px_30px_rgba(0,0,0,0.2)]"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5d99a]/70">Coming up</p><p className="mt-1 text-sm font-medium text-white">Berlin · 4 places ready to shape</p></div><span className="h-2.5 w-2.5 rounded-full bg-[#f5d99a] shadow-[0_0_18px_rgba(245,217,154,0.7)]" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeDeferredSections({
  discoveryCards = [],
  livePulseCards = [],
  localContext = null,
  onLocalCityChange,
  participationActions = [],
  onEditorialAction,
  contactSlot = null,
  evidenceSlot = null,
  showDiscovery = true,
  isMember = false,
  onMembershipAction,
}) {
  const { t } = useLocale();
  return (
    <>
      {showDiscovery ? <HomeDiscoverySection discoveryCards={discoveryCards} /> : null}

      <ParticipationStrip actions={participationActions} />

      <CompassPreview onOpen={onEditorialAction} />

      {livePulseCards.length > 0 ? (
        <section id="atlas-pulse" data-home-section="live" className="qa-defer-render mt-8 scroll-mt-5">
          <div className="rounded-[24px] bg-[#0B1220] p-3 sm:p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 !text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#80D4C4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#80D4C4]" />
                  {t("home.atlasUpdates", "Atlas updates")}
                </p>
                {localContext?.cityOptions?.length ? (
                  <label className="flex shrink-0 items-center gap-2 rounded-full border border-[#2B3949] bg-[#141E2C] px-3 py-2 text-xs text-[#BCC7D2]">
                    <span>{t("home.localFocus", "Local focus")}</span>
                    <select
                      aria-label={t("home.chooseLocalCity", "Choose local city")}
                      value={localContext.city || ""}
                      onChange={(event) => onLocalCityChange?.(event.target.value)}
                      className="min-h-7 max-w-[8.5rem] rounded bg-transparent text-xs font-semibold text-[#F5F1E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80D4C4] sm:max-w-[11rem]"
                    >
                      {localContext.cityOptions.map((city) => (
                        <option key={city} value={city} className="bg-[#111118] text-white">
                          {String(city).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              <h2 className="qa-display mt-3 !text-left text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] text-[#F5F1E8] sm:text-[2rem]">
                {t("home.happeningAcross", "Happening across the atlas")}
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {livePulseCards.map((item) => (
                <PulseCard key={item.key} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {evidenceSlot}

      <TrustSupportStrip onAction={onEditorialAction} contactSlot={contactSlot} />

      <section className="qa-defer-render mt-7 pb-24 sm:mt-10 sm:pb-4">
        <div className="hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3.5 opacity-75 sm:block">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
            <span className="mr-1 uppercase tracking-[0.18em] text-white/32">{t("home.discoverPaths", "Discover paths")}</span>
            <Link href="/gay-guide" className="rounded-full border border-fuchsia-200/14 bg-fuchsia-200/[0.05] px-2.5 py-1 text-fuchsia-100/70 transition hover:border-fuchsia-200/30 hover:text-fuchsia-100">Gay Guide</Link>
            <Link href="/queer-guide" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">Queer Guide</Link>
            <Link href="/hbtq-guide" className="rounded-full border border-amber-200/14 bg-amber-200/[0.05] px-2.5 py-1 text-amber-100/70 transition hover:border-amber-200/30 hover:text-amber-100">HBTQ Guide</Link>
            <Link href="/dictionary" className="rounded-full border border-violet-200/14 bg-violet-200/[0.05] px-2.5 py-1 text-violet-100/70 transition hover:border-violet-200/30 hover:text-violet-100">Queer Dictionary</Link>
            <Link href="/topics/nightlife" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">{t("home.nightlifeHub", "Nightlife hub")}</Link>
            <Link href="/topics/safety" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">{t("home.safetyHub", "Safety hub")}</Link>
            <Link href="/berlin/discover/queer-techno-clubs" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Berlin techno</Link>
            <Link href="/new_york/discover/events-tonight" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">New York tonight</Link>
            <Link href="/bangkok/discover/queer-cafes" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Bangkok cafes</Link>
            <Link href="/madrid/discover/lesbian-nightlife" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Madrid community</Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-white/45">
          <Link href="/about" className="underline underline-offset-2 transition hover:text-white">About</Link>
          <span className="text-white/25">|</span>
          <Link href="/editorial-policy" className="underline underline-offset-2 transition hover:text-white">{t("home.editorialStandards", "Editorial standards")}</Link>
          <span className="text-white/25">|</span>
          <Link href="/corrections" className="underline underline-offset-2 transition hover:text-white">{t("home.corrections", "Corrections")}</Link>
          <span className="text-white/25">|</span>
          <Link href="/contact" className="underline underline-offset-2 transition hover:text-white">{t("home.contactPress", "Contact & press")}</Link>
          <span className="text-white/25">|</span>
          <Link href="/privacy" className="underline underline-offset-2 transition hover:text-white">{t("home.privacyPolicy", "Privacy Policy")}</Link>
          <span className="text-white/25">|</span>
          <Link href="/terms" className="underline underline-offset-2 transition hover:text-white">{t("home.terms", "Terms")}</Link>
        </div>
      </section>
    </>
  );
}
