import { Compass, Store } from "lucide-react";

const badges = {
  city: { title: "City Ambassador", Icon: Compass, colors: "border-violet-300/50 bg-violet-950 text-violet-100" },
  venue: { title: "Venue Ambassador", Icon: Store, colors: "border-teal-300/50 bg-teal-950 text-teal-100" },
};

export default function AmbassadorBadge({ role }) {
  const badge = badges[role];
  if (!badge) return null;
  const { Icon, title, colors } = badge;
  return <span className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-1.5 pr-3 text-xs font-semibold tracking-wide ${colors}`}>
    <span className="grid size-6 place-items-center rounded-full bg-white/10">
      <Icon size={16} aria-hidden="true" />
    </span>
    {title}
  </span>;
}
