"use client";

function PackedIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
      <defs>
        <linearGradient id="packed-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <path
        d="M11 30c6-6 9-17 14-17s8 11 12 17"
        fill="none"
        stroke="url(#packed-g)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M18 31c3-3 4.5-8 6-8s3 5 6 8"
        fill="none"
        stroke="url(#packed-g)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M9 35h30" stroke="url(#packed-g)" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function DancingIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
      <defs>
        <linearGradient id="dance-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="16" r="3" fill="url(#dance-g)" />
      <circle cx="24" cy="13" r="3" fill="url(#dance-g)" />
      <circle cx="33" cy="16" r="3" fill="url(#dance-g)" />
      <path d="M12 33v-8M15 33v-9M18 33v-7" stroke="url(#dance-g)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 33v-10M24 33v-8M27 33v-9" stroke="url(#dance-g)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 33v-7M33 33v-9M36 33v-8" stroke="url(#dance-g)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function QuietIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
      <defs>
        <linearGradient id="quiet-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        d="M30 10c-1 0-2 0.2-2.9 0.5 3.6 1.6 6.1 5.3 6.1 9.5 0 5.7-4.6 10.3-10.3 10.3-2.4 0-4.6-0.8-6.3-2.2 0.8 5.9 5.8 10.4 11.9 10.4 6.7 0 12.2-5.5 12.2-12.2S36.7 10 30 10z"
        fill="none"
        stroke="url(#quiet-g)"
        strokeWidth="2.4"
      />
      <path d="M11 35h10" stroke="url(#quiet-g)" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 31h7" stroke="url(#quiet-g)" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 15l1.5-1.5M37 18h2" stroke="url(#quiet-g)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OffVibeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
      <defs>
        <linearGradient id="off-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
      </defs>
      <path d="M24 8l16 27H8L24 8z" fill="none" stroke="url(#off-g)" strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="3.2" fill="url(#off-g)" />
      <path d="M24 29v4" stroke="url(#off-g)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function LiveVibeSignalIcon({ signalKey }) {
  if (signalKey === "packed") return <PackedIcon />;
  if (signalKey === "dancing") return <DancingIcon />;
  if (signalKey === "quiet" || signalKey === "dead") return <QuietIcon />;
  if (signalKey === "off_vibe") return <OffVibeIcon />;
  return <QuietIcon />;
}
