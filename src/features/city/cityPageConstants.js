export const TYPES = [
  { value: "club", label: "Clubs", color: "#ef4444" },
  { value: "bar", label: "Bars", color: "#3b82f6" },
  { value: "restaurant", label: "Restaurants", color: "#14b8a6" },
  { value: "sauna", label: "Saunas", color: "#a855f7" },
  { value: "cruise_club", label: "Cruise Clubs", color: "#111111" },
  { value: "cruising_area", label: "Cruising Areas", color: "#f97316" },
  { value: "cafe", label: "Cafes", color: "#22c55e" },
  { value: "hotel", label: "Hotels", color: "#eab308" },
];

export const TYPE_LABELS = {
  club: "Club",
  bar: "Bar",
  restaurant: "Restaurant",
  sauna: "Sauna",
  cruise_club: "Cruise Club",
  cruising_area: "Cruising Area",
  cafe: "Cafe",
  hotel: "Hotel",
};

export const TYPE_STYLES = {
  club: {
    card: "border-rose-300/12 bg-[linear-gradient(180deg,rgba(76,12,30,0.34),rgba(15,15,15,0.96))]",
    selected: "border-rose-200/30 bg-[linear-gradient(180deg,rgba(190,24,93,0.20),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(244,63,94,0.12)]",
    label: "text-rose-200",
    line: "from-rose-300/75 via-pink-300/45 to-transparent",
  },
  bar: {
    card: "border-sky-300/12 bg-[linear-gradient(180deg,rgba(10,35,72,0.34),rgba(15,15,15,0.96))]",
    selected: "border-sky-200/30 bg-[linear-gradient(180deg,rgba(14,116,244,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(59,130,246,0.12)]",
    label: "text-sky-200",
    line: "from-sky-300/75 via-cyan-300/45 to-transparent",
  },
  restaurant: {
    card: "border-teal-300/12 bg-[linear-gradient(180deg,rgba(8,64,58,0.34),rgba(15,15,15,0.96))]",
    selected: "border-teal-200/30 bg-[linear-gradient(180deg,rgba(20,184,166,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(20,184,166,0.12)]",
    label: "text-teal-200",
    line: "from-teal-300/75 via-cyan-300/45 to-transparent",
  },
  sauna: {
    card: "border-fuchsia-300/12 bg-[linear-gradient(180deg,rgba(78,18,90,0.34),rgba(15,15,15,0.96))]",
    selected: "border-fuchsia-200/30 bg-[linear-gradient(180deg,rgba(192,38,211,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(217,70,239,0.12)]",
    label: "text-fuchsia-200",
    line: "from-fuchsia-300/75 via-violet-300/45 to-transparent",
  },
  cruise_club: {
    card: "border-red-950/40 bg-[linear-gradient(180deg,rgba(30,6,6,0.78),rgba(10,10,10,0.98))]",
    selected: "border-red-700/40 bg-[linear-gradient(180deg,rgba(91,11,11,0.42),rgba(12,12,12,0.98))] shadow-[0_18px_50px_rgba(127,29,29,0.18)]",
    label: "text-red-200",
    line: "from-red-500/60 via-red-300/35 to-transparent",
  },
  cruising_area: {
    card: "border-amber-300/12 bg-[linear-gradient(180deg,rgba(84,44,7,0.34),rgba(15,15,15,0.96))]",
    selected: "border-amber-200/30 bg-[linear-gradient(180deg,rgba(217,119,6,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(245,158,11,0.12)]",
    label: "text-amber-200",
    line: "from-amber-300/75 via-orange-300/45 to-transparent",
  },
  cafe: {
    card: "border-emerald-300/12 bg-[linear-gradient(180deg,rgba(8,63,46,0.34),rgba(15,15,15,0.96))]",
    selected: "border-emerald-200/30 bg-[linear-gradient(180deg,rgba(5,150,105,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(16,185,129,0.12)]",
    label: "text-emerald-200",
    line: "from-emerald-300/75 via-teal-300/45 to-transparent",
  },
  hotel: {
    card: "border-yellow-200/12 bg-[linear-gradient(180deg,rgba(90,68,10,0.32),rgba(15,15,15,0.96))]",
    selected: "border-yellow-100/30 bg-[linear-gradient(180deg,rgba(202,138,4,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(234,179,8,0.12)]",
    label: "text-yellow-100",
    line: "from-yellow-200/75 via-amber-200/45 to-transparent",
  },
};

export const SERVICE_TYPES = [
  { value: "massage", label: "Massage", color: "#22d3ee" },
  { value: "tour", label: "Travel Tour", color: "#60a5fa" },
  { value: "wellness", label: "Wellness", color: "#14b8a6" },
  { value: "escort", label: "Escort", color: "#f59e0b" },
  { value: "styling", label: "Styling", color: "#f472b6" },
  { value: "concierge", label: "Concierge", color: "#e879f9" },
  { value: "transport", label: "Transport", color: "#34d399" },
  { value: "other", label: "Other", color: "#94a3b8" },
];

export const SERVICE_TYPE_LABELS = {
  massage: "Massage",
  tour: "Travel Tour",
  wellness: "Wellness",
  escort: "Escort",
  styling: "Styling",
  concierge: "Concierge",
  transport: "Transport",
  other: "Service",
};

export const SERVICE_TYPE_STYLES = {
  massage: {
    card: "border-cyan-300/12 bg-[linear-gradient(180deg,rgba(12,53,72,0.34),rgba(15,15,15,0.96))]",
    label: "text-cyan-100",
    line: "from-cyan-300/75 via-sky-300/45 to-transparent",
  },
  tour: {
    card: "border-sky-300/12 bg-[linear-gradient(180deg,rgba(16,49,86,0.34),rgba(15,15,15,0.96))]",
    label: "text-sky-100",
    line: "from-sky-300/75 via-blue-300/45 to-transparent",
  },
  wellness: {
    card: "border-teal-300/12 bg-[linear-gradient(180deg,rgba(10,63,58,0.34),rgba(15,15,15,0.96))]",
    label: "text-teal-100",
    line: "from-teal-300/75 via-emerald-300/45 to-transparent",
  },
  escort: {
    card: "border-amber-300/12 bg-[linear-gradient(180deg,rgba(86,48,8,0.34),rgba(15,15,15,0.96))]",
    label: "text-amber-100",
    line: "from-amber-300/75 via-orange-300/45 to-transparent",
  },
  styling: {
    card: "border-pink-300/12 bg-[linear-gradient(180deg,rgba(86,24,56,0.34),rgba(15,15,15,0.96))]",
    label: "text-pink-100",
    line: "from-pink-300/75 via-fuchsia-300/45 to-transparent",
  },
  concierge: {
    card: "border-fuchsia-300/12 bg-[linear-gradient(180deg,rgba(71,22,86,0.34),rgba(15,15,15,0.96))]",
    label: "text-fuchsia-100",
    line: "from-fuchsia-300/75 via-violet-300/45 to-transparent",
  },
  transport: {
    card: "border-emerald-300/12 bg-[linear-gradient(180deg,rgba(10,62,45,0.34),rgba(15,15,15,0.96))]",
    label: "text-emerald-100",
    line: "from-emerald-300/75 via-teal-300/45 to-transparent",
  },
  other: {
    card: "border-slate-300/12 bg-[linear-gradient(180deg,rgba(30,41,59,0.34),rgba(15,15,15,0.96))]",
    label: "text-slate-100",
    line: "from-slate-300/70 via-slate-200/40 to-transparent",
  },
};

export const REPORT_REASONS = [
  { value: "safety", label: "Safety issue", helper: "Unsafe behavior, consent issues, harassment or risky conditions." },
  { value: "wrong_info", label: "Wrong info", helper: "Hours, location, link, category, or details are incorrect." },
  { value: "spam", label: "Spam or scam", helper: "Misleading promos, fake listings, or low-trust content." },
  { value: "abuse", label: "Abuse or hate", helper: "Hate speech, threats, discrimination, or abusive language." },
  { value: "other", label: "Other issue", helper: "Anything else that should be reviewed by admin." },
];

export const TRUST_ACTIONS = [
  { value: "1", label: "Verified now" },
  { value: "2", label: "Needs refresh" },
  { value: "3", label: "Closed or moved" },
];
