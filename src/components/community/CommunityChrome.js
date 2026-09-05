"use client";

import Image from "next/image";
import PageControls from "@/components/ui/PageControls";

const COMMUNITY_PANELS = [
  { id: "home", label: "Home" },
  { id: "discovery", label: "People" },
  { id: "chat", label: "Rooms" },
  { id: "jobs", label: "Jobs" },
  { id: "improve", label: "Build with us" },
];

const ACTIVE_THEMES = Object.fromEntries(
  COMMUNITY_PANELS.map(({ id }) => [id, { className: "qa-community-control-active" }]),
);

export function CommunityHero({ memberName, onExplore }) {
  return (
    <header className="qa-community-hero relative mb-6 flex min-h-[390px] overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#05060a] shadow-[0_34px_100px_rgba(0,0,0,0.42)] sm:min-h-[420px] sm:rounded-[34px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Image
          src="/community/queer-atlas-community-global-network-hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover opacity-80"
          style={{ objectPosition: "center center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,10,0.98)_0%,rgba(3,5,10,0.94)_30%,rgba(3,5,10,0.76)_52%,rgba(3,5,10,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,7,0.14)_0%,rgba(2,3,7,0.08)_46%,rgba(2,3,7,0.72)_100%)]" />
        <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(255,255,255,0.025)]" />
      </div>
      <div className="relative z-10 flex w-full items-center px-6 py-10 sm:px-10 lg:px-14">
        <div className="max-w-3xl">
          <p className="!text-left text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/72 [hyphens:none]">
            Welcome back, {memberName || "member"}
          </p>
          <h1 className="qa-display mt-4 !text-left text-[2.75rem] font-semibold leading-[0.93] tracking-[-0.05em] text-white [hyphens:none] sm:text-6xl lg:text-[4.55rem]">
            <span className="block">Community,</span>
            <span className="block text-white/90">wherever you land.</span>
          </h1>
          <p className="mt-5 max-w-xl !text-left text-sm leading-6 text-white/68 [hyphens:none] sm:text-base sm:leading-7">
            Meet members, exchange local knowledge, and find queer opportunities across the atlas.
          </p>
          <div className="mt-7">
            <button
              type="button"
              onClick={onExplore}
              className="qa-action qa-cta-primary inline-flex min-h-11 items-center gap-3 rounded-full border border-white/70 bg-white px-5 py-2.5 text-sm font-semibold text-[#070a10] shadow-[0_14px_38px_rgba(0,0,0,0.25)] transition hover:border-cyan-100 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span>Find your people</span>
              <span aria-hidden="true" className="text-base leading-none text-cyan-700">→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function CommunityNavigation({
  activePanel,
  onSelect,
  controlsRef,
  controlButtonsRef,
}) {
  return (
    <section className="mb-6" aria-label="Community navigation">
      <PageControls
        className="qa-community-dock sticky top-3 z-20"
        controlsRef={controlsRef}
        controlButtonsRef={controlButtonsRef}
        variant="community-luxe"
        ariaLabel="Community sections"
        mobileLabelsById={{ improve: "Build" }}
        activeButtonThemeById={ACTIVE_THEMES}
        buttons={COMMUNITY_PANELS}
        activeId={activePanel}
        onSelect={onSelect}
      />
    </section>
  );
}

export function CommunityField({
  value,
  onChange,
  placeholder,
  area = false,
  ariaLabel,
  maxLength,
  ...props
}) {
  const sharedProps = {
    value,
    onChange,
    placeholder,
    "aria-label": ariaLabel || placeholder,
    maxLength: maxLength || (area ? 2000 : 320),
    ...props,
  };

  if (area) {
    return <textarea {...sharedProps} className="h-28 w-full rounded-xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/16" />;
  }

  return <input {...sharedProps} className="w-full rounded-xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/16" />;
}
