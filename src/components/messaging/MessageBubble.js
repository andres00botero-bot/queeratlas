import { ShieldAlert } from "lucide-react";

export default function MessageBubble({
  message,
  mine,
  dayLabel = "",
  startsDay = false,
  beginsGroup = false,
  endsGroup = false,
  isLastOwn = false,
  timeLabel = "",
  senderName = "Member",
  onReport,
}) {
  const shapeClassName = mine
    ? beginsGroup
      ? "rounded-[20px] rounded-br-md"
      : endsGroup
        ? "rounded-[20px] rounded-tr-md"
        : "rounded-[20px] rounded-r-md"
    : beginsGroup
      ? "rounded-[20px] rounded-bl-md"
      : endsGroup
        ? "rounded-[20px] rounded-tl-md"
        : "rounded-[20px] rounded-l-md";

  return (
    <div>
      {startsDay ? (
        <div className="my-6 flex items-center gap-3" aria-label={dayLabel}>
          <span className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{dayLabel}</span>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>
      ) : null}
      <div className={`group flex ${mine ? "justify-end" : "justify-start"} ${beginsGroup ? "mt-4" : "mt-1"}`}>
        <div className={`relative max-w-[86%] px-4 py-2.5 text-[14px] leading-6 sm:max-w-[74%] ${shapeClassName} ${mine ? "bg-[#17313a] text-[#effcff]" : "border border-white/[0.07] bg-[#151a22] text-[#f3efe9]"}`}>
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          {!mine ? (
            <button type="button" onClick={onReport} aria-label={`Report message from ${senderName}`} className="qa-action absolute -right-9 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/24 hover:bg-white/8 hover:text-rose-100 sm:hidden sm:group-hover:flex sm:group-focus-within:flex">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
      {endsGroup ? (
        <div className={`mt-1 flex items-center gap-2 text-[10px] text-white/32 ${mine ? "justify-end pr-1" : "justify-start pl-1"}`}>
          <time>{timeLabel}</time>
          {isLastOwn && message.readAt ? <span className="text-cyan-100/48">Seen</span> : null}
        </div>
      ) : null}
    </div>
  );
}
