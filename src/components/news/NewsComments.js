"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { captureOperationalError } from "@/lib/monitoring";

const MAX_COMMENT_LENGTH = 2000;

function formatCommentTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isMissingCommentsTable(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("qa_news_comments") &&
      (message.includes("does not exist") || message.includes("schema cache")))
  );
}

function commentErrorMessage(error, action = "publish") {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();

  if (isMissingCommentsTable(error)) {
    return "Comments are not configured in the database yet. Run the news comments migration in Supabase.";
  }
  if (code === "23503") {
    return "This article is no longer available in the news database, so the comment could not be saved.";
  }
  if (code === "42501" || message.includes("row-level security") || message.includes("permission denied")) {
    return "Your member session does not have permission to comment. Please sign out, sign in again, and retry.";
  }
  if (
    error?.name === "SupabaseUnavailableError" ||
    message.includes("failed to fetch") ||
    message.includes("temporarily unreachable") ||
    message.includes("network")
  ) {
    return "The comment service could not be reached. Check the Supabase connection and try again.";
  }
  return action === "load"
    ? "Comments could not be loaded right now."
    : "Your comment could not be published. Please try again.";
}

function CommentAvatar({ comment }) {
  const name = String(comment.author_display_name || "Member").trim() || "Member";
  const initial = name.slice(0, 1).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/20 bg-cyan-200/10 text-sm font-semibold text-cyan-50">
      {comment.author_avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={comment.author_avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  );
}

export default function NewsComments({ articleId, articleTitle = "this article" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMember, isLoading: isAuthLoading, user, memberName, memberProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState("info");

  const loadComments = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("qa_news_comments")
        .select("id,article_id,author_id,author_display_name,author_avatar_url,body,status,created_at,edited_at")
        .eq("article_id", String(articleId))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(Array.isArray(data) ? data : []);
      setNotice("");
      setNoticeKind("info");
    } catch (error) {
      setComments([]);
      setNotice(commentErrorMessage(error, "load"));
      setNoticeKind("error");
      captureOperationalError("news_comments_load_fail", error, {
        articleId: String(articleId),
        errorCode: String(error?.code || ""),
      });
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    queueMicrotask(loadComments);
  }, [loadComments]);

  const visibleCount = useMemo(
    () => comments.filter((comment) => comment.status === "published").length,
    [comments]
  );

  const openSignIn = () => {
    const target = pathname || `/now/news/${encodeURIComponent(String(articleId))}`;
    localStorage.setItem("qa_redirect", target);
    localStorage.setItem("qa_post_login_target", target);
    router.push("/?join=true");
  };

  const submitComment = async (event) => {
    event.preventDefault();
    const text = String(body || "").trim();
    if (!isMember || !user?.id || !text || text.length > MAX_COMMENT_LENGTH || submitting) return;

    setSubmitting(true);
    setNotice("");
    setNoticeKind("info");
    const optimisticId = `local-${Date.now()}`;
    const optimisticComment = {
      id: optimisticId,
      article_id: String(articleId),
      author_id: user.id,
      author_display_name: memberName || "Member",
      author_avatar_url: memberProfile?.avatarUrl || "",
      body: text,
      status: "published",
      created_at: new Date().toISOString(),
    };
    setComments((current) => [optimisticComment, ...current]);
    setBody("");

    try {
      const { data, error } = await supabase
        .from("qa_news_comments")
        .insert({ article_id: String(articleId), author_id: user.id, body: text, status: "published" })
        .select("id,article_id,author_id,author_display_name,author_avatar_url,body,status,created_at,edited_at")
        .single();

      if (error) throw error;
      setComments((current) => current.map((comment) => (comment.id === optimisticId ? data : comment)));
      setNotice("Comment published.");
      setNoticeKind("success");
    } catch (error) {
      setComments((current) => current.filter((comment) => comment.id !== optimisticId));
      setBody(text);
      setNotice(commentErrorMessage(error, "publish"));
      setNoticeKind("error");
      captureOperationalError("news_comment_publish_fail", error, {
        articleId: String(articleId),
        errorCode: String(error?.code || ""),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section data-nosnippet className="mt-8 border-t border-white/10 pt-6" aria-labelledby="news-comments-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/75">Member discussion</p>
          <h2 id="news-comments-title" className="mt-1 flex items-center gap-2 text-xl font-semibold text-white">
            <MessageCircle size={19} aria-hidden="true" />
            Comments <span className="text-white/45">{visibleCount}</span>
          </h2>
        </div>
        <Link href="/community-policy" className="rounded text-xs text-cyan-100/75 underline decoration-cyan-200/30 underline-offset-4 transition hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">
          Community guidelines
        </Link>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/62">
        Share your perspective on {articleTitle}. Be respectful and never share another person&apos;s private information.
      </p>

      {!isAuthLoading && !isMember ? (
        <div className="mt-5 rounded-2xl border border-fuchsia-200/20 bg-fuchsia-200/[0.07] p-4">
          <p className="text-sm text-white/78">Only Queer Atlas members can comment.</p>
          <button type="button" onClick={openSignIn} className="mt-3 inline-flex min-h-11 items-center rounded-full border border-fuchsia-100/45 bg-fuchsia-200/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-50 transition hover:border-fuchsia-100/70 hover:bg-fuchsia-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/65">
            Sign in to comment
          </button>
        </div>
      ) : null}

      {!isAuthLoading && isMember ? (
        <form onSubmit={submitComment} className="mt-5 rounded-2xl border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(217,70,239,0.05),rgba(0,0,0,0.2))] p-4">
          <label htmlFor={`news-comment-${articleId}`} className="text-xs font-semibold text-white/82">
            Comment as {memberName || "Member"}
          </label>
          <textarea
            id={`news-comment-${articleId}`}
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            placeholder="Add to the conversation..."
            disabled={submitting}
            className="mt-3 w-full resize-y rounded-xl border border-white/12 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-cyan-200/45 focus-visible:ring-2 focus-visible:ring-cyan-200/45 disabled:opacity-55"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-white/42">{body.length} / {MAX_COMMENT_LENGTH}</span>
            <button type="submit" disabled={submitting || !body.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-fuchsia-100/55 bg-[linear-gradient(135deg,rgba(244,114,182,0.92),rgba(168,85,247,0.9))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/65 disabled:cursor-not-allowed disabled:opacity-50">
              <Send size={14} aria-hidden="true" />
              {submitting ? "Publishing..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : null}

      {notice ? (
        <p
          role={noticeKind === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
            noticeKind === "error"
              ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
              : noticeKind === "success"
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                : "border-cyan-200/20 bg-cyan-300/5 text-cyan-100/76"
          }`}
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-6 space-y-3" aria-busy={loading}>
        {loading ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const removed = comment.status === "removed";
            return (
              <article key={comment.id} className={`rounded-2xl border p-4 ${removed ? "border-white/8 bg-white/[0.02]" : "border-white/10 bg-black/24"}`}>
                {removed ? (
                  <p className="text-sm italic text-white/45">Comment removed by Queer Atlas</p>
                ) : (
                  <div className="flex gap-3">
                    <CommentAvatar comment={comment} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-white">{comment.author_display_name || "Member"}</p>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/48">Member</span>
                        <time className="text-xs text-white/38" dateTime={comment.created_at}>{formatCommentTime(comment.created_at)}</time>
                      </div>
                      <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-white/78">{comment.body}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-white/12 px-4 py-7 text-center text-sm text-white/48">
            No comments yet. Start the conversation.
          </div>
        )}
      </div>
    </section>
  );
}
