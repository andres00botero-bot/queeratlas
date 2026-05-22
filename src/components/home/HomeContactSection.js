"use client";

import { useMemo, useState } from "react";

const CATEGORY_OPTIONS = {
  community: [
    { value: "bug_report", label: "Bug report" },
    { value: "safety_concern", label: "Safety concern" },
    { value: "venue_event_correction", label: "Venue/Event correction" },
    { value: "general_feedback", label: "General feedback" },
  ],
  business: [
    { value: "business_inquiry", label: "Business inquiry (ads/partnership)" },
  ],
};

export default function HomeContactSection({
  isMember = false,
  userId = "",
  defaultName = "",
  className = "mt-12",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [intent, setIntent] = useState("community");
  const [category, setCategory] = useState("general_feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState(defaultName || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successRef, setSuccessRef] = useState("");

  const categoryOptions = useMemo(
    () => CATEGORY_OPTIONS[intent] || CATEGORY_OPTIONS.community,
    [intent]
  );

  const canUseAnonymous = intent === "community";
  const canSubmit =
    subject.trim().length >= 3 && message.trim().length >= 20 && !submitting;

  const handleIntentChange = (nextIntent) => {
    const normalized = nextIntent === "business" ? "business" : "community";
    setIntent(normalized);
    setCategory(normalized === "business" ? "business_inquiry" : "general_feedback");
    setErrorMessage("");
    setSuccessRef("");
  };

  const resetAfterSubmit = () => {
    setSubject("");
    setMessage("");
    setErrorMessage("");
    setSubmitting(false);
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    setSuccessRef("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          message,
          senderEmail,
          senderName,
          isAnonymous: canUseAnonymous ? isAnonymous : false,
          userId: isMember ? userId : "",
          pageContext: "/home",
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Could not send message.");
      }

      setSuccessRef(String(payload.reference || "").trim());
      resetAfterSubmit();
    } catch (error) {
      setSubmitting(false);
      setErrorMessage(error?.message || "Could not send message.");
    }
  };

  return (
    <section className={`${className} rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_22px_72px_rgba(0,0,0,0.28)] sm:p-6`}>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-[-0.015em] text-white">
          Contact Us
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">
          Have feedback, a safety concern, or a business idea? We read every message.
        </p>
      </div>

      {!isExpanded ? (
        <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
          <p className="text-sm leading-7 text-white/78">
            Need help, want to report something, or discuss a partnership?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                handleIntentChange("community");
                setIsExpanded(true);
              }}
              className="rounded-full border border-cyan-200/35 bg-cyan-200/12 px-4 py-2 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/55"
            >
              Community support
            </button>
            <button
              type="button"
              onClick={() => {
                handleIntentChange("business");
                setIsExpanded(true);
              }}
              className="rounded-full border border-fuchsia-200/35 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-200/55"
            >
              Business & partnerships
            </button>
          </div>
          <p className="mt-3 text-xs text-white/60">
            Usually replies within 24-48 hours.
          </p>
        </div>
      ) : null}

      {isExpanded ? (
        <form onSubmit={submitContact} className="grid grid-cols-1 gap-3">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleIntentChange("community")}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                  intent === "community"
                    ? "border-cyan-200/45 bg-cyan-200/14 text-cyan-100"
                    : "border-white/16 bg-white/6 text-white/75 hover:border-white/28"
                }`}
              >
                Community support
              </button>
              <button
                type="button"
                onClick={() => handleIntentChange("business")}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                  intent === "business"
                    ? "border-fuchsia-200/45 bg-fuchsia-200/14 text-fuchsia-100"
                    : "border-white/16 bg-white/6 text-white/75 hover:border-white/28"
                }`}
              >
                Business & partnerships
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-full border border-white/16 bg-white/6 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/70 transition hover:border-white/28"
            >
              Close
            </button>
          </div>

          <label className="text-xs uppercase tracking-[0.14em] text-white/65">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/14 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/45"
            >
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs uppercase tracking-[0.14em] text-white/65">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/14 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/45"
              placeholder="Short summary"
              maxLength={140}
              required
            />
          </label>

          <label className="text-xs uppercase tracking-[0.14em] text-white/65">
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1.5 min-h-[130px] w-full rounded-xl border border-white/14 bg-black/30 px-3 py-2.5 text-sm leading-7 text-white outline-none focus:border-cyan-200/45"
              placeholder="Tell us what happened or what you need."
              maxLength={5000}
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.14em] text-white/65">
              Your email (optional)
              <input
                type="email"
                value={senderEmail}
                onChange={(event) => setSenderEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/14 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/45"
                placeholder="you@email.com"
                maxLength={180}
              />
            </label>

            <label className="text-xs uppercase tracking-[0.14em] text-white/65">
              Name (optional)
              <input
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/14 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/45"
                placeholder="Your name"
                maxLength={120}
              />
            </label>
          </div>

          {canUseAnonymous ? (
            <label className="mt-1 inline-flex items-center gap-2 text-xs text-white/72">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-4 w-4 rounded border-white/24 bg-black/30"
              />
              Send anonymously
            </label>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="qa-action qa-action-strong rounded-full border border-cyan-100/70 bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
            <p className="text-xs text-white/60">
              Response time: usually within 24-48 hours.
            </p>
          </div>

          {errorMessage ? (
            <p className="mt-1 rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
              {errorMessage}
            </p>
          ) : null}

          {successRef ? (
            <p className="mt-1 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
              Thanks - your message has been received. Reference ID: {successRef}
            </p>
          ) : null}
        </form>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-white/55">
        <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
          Paid visibility is always labeled
        </span>
        <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
          Community safety comes first
        </span>
      </div>
    </section>
  );
}
