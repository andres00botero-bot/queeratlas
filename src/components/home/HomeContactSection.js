"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  MessageCircleMore,
  PencilLine,
  ShieldAlert,
  X,
} from "lucide-react";

const CONTACT_PATHS = [
  {
    key: "safety",
    title: "Safety concern",
    description: "Tell us about a place or situation.",
    category: "safety_concern",
    icon: ShieldAlert,
    cardClass: "hover:bg-rose-200/[0.055]",
    iconClass: "text-rose-100/72",
  },
  {
    key: "correction",
    title: "Fix information",
    description: "Update a venue, event or service.",
    category: "venue_event_correction",
    icon: PencilLine,
    cardClass: "hover:bg-cyan-200/[0.055]",
    iconClass: "text-cyan-100/72",
  },
  {
    key: "feedback",
    title: "Feedback or bug",
    description: "Help us improve Queer Atlas.",
    category: "general_feedback",
    icon: MessageCircleMore,
    cardClass: "hover:bg-violet-200/[0.055]",
    iconClass: "text-violet-100/72",
  },
  {
    key: "business",
    title: "Partnerships & press",
    description: "Work with Queer Atlas.",
    category: "business_inquiry",
    icon: BriefcaseBusiness,
    cardClass: "hover:bg-fuchsia-200/[0.055]",
    iconClass: "text-fuchsia-100/72",
  },
];

const CATEGORY_LABELS = {
  bug_report: "Bug report",
  safety_concern: "Safety concern",
  venue_event_correction: "Information correction",
  general_feedback: "General feedback",
  business_inquiry: "Business or press inquiry",
};

const SUBMIT_LABELS = {
  safety: "Send safety report",
  correction: "Send correction",
  feedback: "Send message",
  business: "Send inquiry",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default function HomeContactSection({
  isMember = false,
  userId = "",
  defaultName = "",
  pageContext = "/home",
  className = "mt-12",
  onAnalyticsEvent,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPathKey, setSelectedPathKey] = useState("");
  const [category, setCategory] = useState("general_feedback");
  const [message, setMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState(defaultName || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [wantsReply, setWantsReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successRef, setSuccessRef] = useState("");
  const dialogHeadingRef = useRef(null);

  const isStandalone = pageContext === "/contact";
  const selectedPath = useMemo(
    () => CONTACT_PATHS.find((item) => item.key === selectedPathKey) || CONTACT_PATHS[2],
    [selectedPathKey]
  );
  const canUseAnonymous = selectedPath.key !== "business";
  const needsEmail = selectedPath.key === "business" || wantsReply;
  const canSubmit =
    message.trim().length >= 20 &&
    (!needsEmail || isValidEmail(senderEmail)) &&
    !submitting;

  useEffect(() => {
    if (!isExpanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    if (!isStandalone) document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => dialogHeadingRef.current?.focus(), 50);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (!isStandalone) document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded, isStandalone]);

  const openPath = (path) => {
    setSelectedPathKey(path.key);
    setCategory(path.category);
    setIsAnonymous(false);
    setWantsReply(path.key === "business");
    setErrorMessage("");
    setSuccessRef("");
    setIsExpanded(true);
    onAnalyticsEvent?.("contact_started", { intent: path.key, category: path.category });
  };

  const closeForm = () => {
    if (submitting) return;
    setIsExpanded(false);
    setErrorMessage("");
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (message.trim().length < 20) {
      setErrorMessage("Please tell us a little more — at least 20 characters.");
      return;
    }
    if (needsEmail && !isValidEmail(senderEmail)) {
      setErrorMessage("Add a valid email address so we can reply.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessRef("");

    const categoryLabel = CATEGORY_LABELS[category] || "Message";
    const messageSummary = message.trim().replace(/\s+/g, " ").slice(0, 96);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject: `${categoryLabel}: ${messageSummary}`.slice(0, 140),
          message,
          senderEmail: isAnonymous ? "" : senderEmail,
          senderName: isAnonymous ? "" : senderName,
          isAnonymous: canUseAnonymous ? isAnonymous : false,
          userId: isMember ? userId : "",
          pageContext,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Could not send message.");
      }

      setSuccessRef(String(payload.reference || "").trim());
      setMessage("");
      setSubmitting(false);
      onAnalyticsEvent?.("contact_submitted", { intent: selectedPath.key, category });
    } catch (error) {
      setSubmitting(false);
      setErrorMessage(error?.message || "Could not send message.");
    }
  };

  const formContent = (
    <div className="relative">
      {successRef ? (
        <div className="py-3 text-center sm:py-5">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100/18 bg-emerald-200/[0.08] text-emerald-100">
            <CheckCircle2 size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h3 ref={dialogHeadingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-white outline-none">
            Message received.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/58">
            Keep this reference if you need to follow up.
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(successRef)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/72 transition hover:border-white/24 hover:text-white"
          >
            <Clipboard size={13} aria-hidden="true" /> {successRef}
          </button>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs text-white/72 transition hover:border-white/26 hover:text-white"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => setSuccessRef("")}
              className="rounded-full border border-cyan-100/24 bg-cyan-100/[0.08] px-4 py-2 text-xs text-cyan-50 transition hover:border-cyan-100/42"
            >
              Send another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitContact} noValidate>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100/56">Contact Queer Atlas</p>
              <h3 ref={dialogHeadingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white outline-none">
                {selectedPath.title}
              </h3>
              <p className="mt-1.5 text-sm text-white/55">{selectedPath.description}</p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close contact form"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-white/55 transition hover:border-white/25 hover:text-white"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {selectedPath.key === "feedback" ? (
            <fieldset className="mt-5">
              <legend className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/52">What kind of message?</legend>
              <div className="mt-2 flex gap-2">
                {[
                  { value: "general_feedback", label: "Feedback" },
                  { value: "bug_report", label: "Bug report" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`rounded-full border px-3 py-2 text-[10px] font-medium transition ${
                      category === option.value
                        ? "border-violet-100/32 bg-violet-200/[0.1] text-violet-50"
                        : "border-white/11 bg-white/[0.035] text-white/54 hover:border-white/22"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {selectedPath.key === "safety" ? (
            <div className="mt-5 rounded-[16px] border border-rose-100/14 bg-rose-200/[0.055] px-3.5 py-3 text-[11px] leading-5 text-rose-50/68">
              If someone is in immediate danger, contact local emergency services first. Queer Atlas reports are not monitored live.
            </div>
          ) : null}

          <label htmlFor="qa-contact-message" className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
            {selectedPath.key === "correction" ? "What needs changing?" : selectedPath.key === "safety" ? "What happened?" : "Your message"}
          </label>
          <textarea
            id="qa-contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-2 min-h-[118px] w-full resize-y rounded-[18px] border border-white/12 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-cyan-100/34 focus:ring-2 focus:ring-cyan-300/10"
            placeholder={selectedPath.key === "correction" ? "Tell us what is wrong and what the correct information should be." : "Share the details that will help us understand."}
            maxLength={5000}
            aria-describedby={errorMessage ? "qa-contact-error" : undefined}
            required
          />

          {canUseAnonymous ? (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <label className="inline-flex items-center gap-2 text-xs text-white/66">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => {
                    setIsAnonymous(event.target.checked);
                    if (event.target.checked) setWantsReply(false);
                  }}
                  className="h-4 w-4 rounded border-white/24 bg-black/30"
                />
                Send anonymously
              </label>
              {!isAnonymous ? (
                <label className="inline-flex items-center gap-2 text-xs text-white/66">
                  <input
                    type="checkbox"
                    checked={wantsReply}
                    onChange={(event) => setWantsReply(event.target.checked)}
                    className="h-4 w-4 rounded border-white/24 bg-black/30"
                  />
                  I want a reply
                </label>
              ) : null}
            </div>
          ) : null}

          {needsEmail && !isAnonymous ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label htmlFor="qa-contact-email" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
                Email
                <input
                  id="qa-contact-email"
                  type="email"
                  autoComplete="email"
                  value={senderEmail}
                  onChange={(event) => setSenderEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2.5 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/28 focus:border-cyan-100/34"
                  placeholder="you@email.com"
                  maxLength={180}
                  required
                />
              </label>
              <label htmlFor="qa-contact-name" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
                Name <span className="font-normal normal-case tracking-normal text-white/32">(optional)</span>
                <input
                  id="qa-contact-name"
                  autoComplete="name"
                  spellCheck="false"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2.5 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/28 focus:border-cyan-100/34"
                  placeholder="Your name"
                  maxLength={120}
                />
              </label>
            </div>
          ) : null}

          {isAnonymous ? (
            <p className="mt-3 text-[11px] leading-5 text-white/42">No name, email or member ID will be stored with this message.</p>
          ) : null}

          {errorMessage ? (
            <p id="qa-contact-error" role="alert" className="mt-4 rounded-xl border border-rose-300/24 bg-rose-300/[0.08] px-3 py-2 text-sm text-rose-100">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            {isStandalone ? (
              <button type="button" onClick={closeForm} className="inline-flex items-center gap-1.5 text-xs text-white/48 transition hover:text-white/78">
                <ArrowLeft size={13} aria-hidden="true" /> Contact options
              </button>
            ) : (
              <p className="text-[11px] text-white/42">Reviewed by the Queer Atlas team.</p>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="qa-action qa-action-strong rounded-full border border-cyan-100/65 bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? "Sending..." : SUBMIT_LABELS[selectedPath.key]}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <section
      id="home-contact"
      data-home-section="contact"
      className={`${className} qa-premium-card relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_5%_0%,rgba(34,211,238,0.11),transparent_31%),radial-gradient(circle_at_96%_100%,rgba(244,114,182,0.1),transparent_31%),linear-gradient(145deg,rgba(10,17,24,0.97),rgba(13,9,19,0.98))] p-4 shadow-[0_22px_64px_rgba(0,0,0,0.28)] sm:p-5`}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/24 to-transparent" />

      {!isExpanded || !isStandalone ? (
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(36rem,1.28fr)] lg:items-center lg:gap-8">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100/56">Contact</p>
            <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[2rem]">How can we help?</h2>
            <p className="mt-2 max-w-lg text-[13px] leading-5 text-white/55 sm:text-sm">
              Report something, suggest a correction or talk to us about working together.
            </p>
            <p className="mt-3 text-[10px] text-white/36">Messages are reviewed by the Queer Atlas team.</p>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-white/10 bg-black/10">
            {CONTACT_PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <button
                  key={path.key}
                  type="button"
                  onClick={() => openPath(path)}
                  className={`group min-h-[4.5rem] border-b border-r border-white/8 p-3 text-left transition duration-300 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 ${path.cardClass}`}
                >
                  <span className="flex items-start gap-2.5">
                    <Icon size={15} strokeWidth={1.8} className={`mt-0.5 shrink-0 ${path.iconClass}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold text-white/82 sm:text-xs">{path.title}</span>
                      <span className="mt-1 block text-[9px] leading-4 text-white/43 sm:text-[10px]">{path.description}</span>
                    </span>
                    <ArrowUpRight size={11} className="mt-0.5 shrink-0 text-white/24 transition group-hover:text-white/66" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isStandalone && isExpanded ? formContent : null}

      {!isStandalone && isExpanded && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[160] flex items-end justify-center bg-black/74 p-0 backdrop-blur-sm sm:items-center sm:p-5"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) closeForm();
              }}
            >
              <div role="dialog" aria-modal="true" aria-labelledby="qa-contact-dialog-title" className="max-h-[92svh] w-full overflow-y-auto rounded-t-[28px] border border-white/12 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.1),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(167,139,250,0.1),transparent_30%),linear-gradient(155deg,#10151d,#0b0a11)] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:max-w-[38rem] sm:rounded-[28px] sm:p-5">
                <span id="qa-contact-dialog-title" className="sr-only">Contact Queer Atlas</span>
                {formContent}
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
