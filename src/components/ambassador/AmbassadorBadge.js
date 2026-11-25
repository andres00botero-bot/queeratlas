import { useId } from "react";

const finishes = {
  city: ["City Ambassador", "#f3d8ff", "#c5a4ff", "#9c83ff"],
  venue: ["Venue Ambassador", "#caffed", "#80eacb", "#4acac3"],
};

export default function AmbassadorBadge({ role }) {
  const id = useId();
  const finish = finishes[role];
  if (!finish) return null;
  const [title, start, middle, end] = finish;
  return <svg viewBox="0 0 28 18" width="28" height="18" className="shrink-0" role="img" aria-label={title}>
    <title>{title}</title>
    <defs><linearGradient id={id} x2="94%" y2="100%">
      <stop stopColor={start} /><stop offset=".55" stopColor={middle} /><stop offset="1" stopColor={end} />
    </linearGradient></defs>
    <path fill={`url(#${id})`} d="M5 1H27L25 12.5 21.5 17H1L3 5Z" />
    <path d="M6 3H17" stroke="white" strokeOpacity=".63" strokeWidth=".8" />
    <g fill="none" stroke="#151322" strokeWidth="1.85" strokeLinecap="square" transform="skewX(-9)">
      <path d={role === "city" ? "M14 6H10L8 8v3l1.3 1.3h4" : "m8 5.8 2.7 6.5 4.1-6.5"} />
      <path d="m15.5 12.3 3.7-6.5h1.3l2.3 6.5m-5.8-2h4.5" />
    </g>
  </svg>;
}
