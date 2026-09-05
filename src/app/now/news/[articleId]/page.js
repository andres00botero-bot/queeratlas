import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronDown, MapPin } from "lucide-react";
import NewsComments from "@/components/news/NewsComments";
import NewsArticleUtilityActions from "@/components/news/NewsArticleUtilityActions";
import NewsMemberActions from "@/components/news/NewsMemberActions";
import { getNewsArticleLinks, resolveNewsArticle } from "@/lib/newsArticleResolver";
import { QA_LOGO_URL, QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { safeJsonLd } from "@/lib/seo/safeJsonLd";

const getNewsArticle = cache(resolveNewsArticle);

function articleDescription(article) {
  return String(article?.summary || "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function articleDeck(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function resolveArticleCopy(summary, supportingCopy) {
  const fullSummary = String(summary || "").trim();
  const summaryIsArticleBody = fullSummary.length > 420 || /(?:\r?\n){2,}/.test(fullSummary);
  const supportingBody = uniqueArticleBody(fullSummary, supportingCopy);
  return {
    deck: summaryIsArticleBody ? "" : articleDeck(fullSummary),
    body: [summaryIsArticleBody ? fullSummary : "", supportingBody].filter(Boolean).join("\n\n"),
  };
}

function comparableCopy(value) {
  return String(value || "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function uniqueArticleBody(summary, body) {
  const cleanBody = String(body || "").trim();
  const summaryKey = comparableCopy(summary);
  const bodyKey = comparableCopy(cleanBody);
  if (!bodyKey || bodyKey === summaryKey) return "";
  if (summaryKey.length > 40 && bodyKey.startsWith(summaryKey)) {
    return cleanBody.slice(String(summary || "").trim().length).replace(/^[\s.,:;—–-]+/, "").trim();
  }
  return cleanBody;
}

function articleUrl(articleId) {
  return `${QA_SITE_URL}/now/news/${encodeURIComponent(String(articleId))}`;
}

function formatArticleDate(value) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isMeaningfullyUpdated(publishedAt, updatedAt) {
  if (!publishedAt || !updatedAt) return false;
  const published = new Date(publishedAt);
  const updated = new Date(updatedAt);
  if (Number.isNaN(published.getTime()) || Number.isNaN(updated.getTime())) return String(publishedAt) !== String(updatedAt);
  return updated.getTime() - published.getTime() >= 60 * 60 * 1000;
}

export async function generateMetadata({ params }) {
  const { articleId } = await params;
  const article = await getNewsArticle(articleId);
  if (!article) return { title: "News article not found", robots: { index: false, follow: false } };
  const url = articleUrl(article.id);
  const image = String(article.imageUrl || "").trim();
  return {
    title: article.title,
    description: articleDescription(article),
    alternates: { canonical: url },
    authors: [{ name: article.sourceName || "Queer Atlas editorial desk" }],
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: articleDescription(article),
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt || undefined,
      section: article.storyType,
      images: image ? [{ url: image, alt: article.imageAlt || article.title }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: article.title,
      description: articleDescription(article),
      images: image ? [image] : [],
    },
  };
}

export default async function NewsArticlePage({ params }) {
  const { articleId } = await params;
  const article = await getNewsArticle(articleId);
  if (!article) notFound();

  const url = articleUrl(article.id);
  const links = getNewsArticleLinks(article);
  const sourceUrl = safeExternalUrl(article.sourceUrl);
  const articleCopy = resolveArticleCopy(article.summary, article.whyItMatters);
  const deck = articleCopy.deck;
  const body = articleCopy.body;
  const publishedLabel = formatArticleDate(article.publishedAt || article.date);
  const updatedLabel = formatArticleDate(article.updatedAt || article.publishedAt || article.date);
  const showUpdated = isMeaningfullyUpdated(article.publishedAt || article.date, article.updatedAt);
  const isSignal = article.kind === "venue-signal" || article.kind === "event-signal";
  const isAtlasSource = /queer atlas|atlas /i.test(String(article.sourceName || ""));
  const sourcePrefix = isAtlasSource ? "By" : "Source";
  const useContainedImage = article.kind === "event-signal";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    url,
    headline: article.title,
    description: articleDescription(article),
    articleSection: article.storyType,
    datePublished: article.publishedAt || article.date || undefined,
    dateModified: article.updatedAt || article.publishedAt || article.date || undefined,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    author: { "@type": "Organization", name: article.sourceName || "Queer Atlas editorial desk" },
    mainEntityOfPage: url,
    isPartOf: { "@id": QA_WEBSITE_ID },
    publisher: { "@id": QA_ORGANIZATION_ID, logo: { "@type": "ImageObject", url: QA_LOGO_URL } },
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.09),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(244,114,182,0.08),transparent_28%),#07080c] px-4 pb-24 pt-5 text-white sm:px-6 sm:pb-16 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <article className="mx-auto max-w-6xl">
        <nav className="border-b border-white/10 pb-3" aria-label="Article navigation">
          <Link href="/now/news" className="group inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/58 transition hover:text-cyan-50 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">
            <ArrowLeft size={16} aria-hidden="true" className="transition group-hover:-translate-x-0.5" />
            Queer World News
          </Link>
        </nav>

        <header className="mx-auto max-w-[62rem] pb-7 pt-9 sm:pb-9 sm:pt-14">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.17em]">
            <span className="text-fuchsia-200">{article.storyType}</span>
            <span aria-hidden="true" className="text-white/24">/</span>
            <span className="text-white/44">{article.city || "Global"}</span>
          </div>
          <h1 className="qa-display mt-4 max-w-[58rem] text-[clamp(2.25rem,5.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.052em] text-[#f7f4ee]">{article.title}</h1>
          {deck ? <p className="mt-6 max-w-[46rem] text-[1.05rem] leading-7 text-white/68 [hyphens:none] sm:text-[1.3rem] sm:leading-8">{deck}</p> : null}

          <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-white/48 [&_p]:[hyphens:none]">
              <p className="font-medium text-white/72">{sourcePrefix} {article.sourceName}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>{isSignal ? "Verified" : "Published"} <time dateTime={article.publishedAt || article.date || undefined}>{publishedLabel}</time></span>
                {showUpdated ? <><span aria-hidden="true">·</span><span>Updated <time dateTime={article.updatedAt}>{updatedLabel}</time></span></> : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NewsMemberActions article={article} mode="save" />
              <NewsArticleUtilityActions title={article.title} url={url} compact />
            </div>
          </div>
        </header>

        {article.imageUrl ? (
          <figure className="overflow-hidden rounded-[18px] bg-[#0b0d12] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
              <Image src={article.imageUrl} alt={article.imageAlt || article.title} fill priority sizes="(max-width: 1152px) 100vw, 1152px" className={useContainedImage ? "object-contain" : "object-cover"} />
            </div>
            {article.imageCredit ? <figcaption className="px-1 pt-2.5 text-[10px] leading-4 text-white/38">Photo: {article.imageCredit}</figcaption> : null}
          </figure>
        ) : null}

        <div className="grid gap-12 pt-9 sm:pt-12 lg:grid-cols-[minmax(0,44rem)_16rem] lg:justify-center lg:gap-20">
          <div className="min-w-0">
            {body ? (
              <section className="hyphens-auto whitespace-pre-line text-justify text-[1.0625rem] leading-[1.78] text-[#e4e1dc]/86 [text-justify:inter-word] sm:text-[1.125rem]" aria-label="Article text">
                {body}
              </section>
            ) : null}

            <details className="group mt-10 border-y border-white/10 py-1" name="article-transparency">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold text-white/72 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2.5"><CheckCircle2 size={16} aria-hidden="true" className="text-emerald-200/80" />Sources &amp; verification</span>
                <ChevronDown size={16} aria-hidden="true" className="text-white/40 transition group-open:rotate-180" />
              </summary>
              <div className="pb-5 pl-[26px] text-sm leading-6 text-white/52">
                <p>{article.verificationLabel}.</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded text-cyan-100/78 underline decoration-cyan-200/25 underline-offset-4 transition hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">Open original source <ArrowUpRight size={13} aria-hidden="true" /></a> : null}
                  <Link href="/editorial-policy" className="rounded text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">Editorial policy</Link>
                  <Link href={`/corrections?article=${encodeURIComponent(article.id)}`} className="rounded text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">Report a correction</Link>
                </div>
              </div>
            </details>

            <NewsMemberActions article={article} mode="follow" />

            {article.commentsEnabled ? <NewsComments articleId={article.id} articleTitle={article.title} /> : null}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Continue in Queer Atlas">
            <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-white/38">Continue in the atlas</p>
            <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {links.entityHref ? <Link href={links.entityHref} className="group flex min-h-16 items-center justify-between gap-3 rounded-md py-3 text-sm font-semibold text-[#f7f4ee] transition hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"><span>{links.entityLabel}</span><ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-cyan-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link> : null}
              {links.cityHref ? <Link href={links.cityHref} className="group flex min-h-16 items-center justify-between gap-3 rounded-md py-3 text-sm font-semibold text-[#f7f4ee] transition hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"><span className="inline-flex items-center gap-2"><MapPin size={15} aria-hidden="true" className="text-fuchsia-200" />{links.cityLabel}</span><ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-cyan-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link> : null}
              <Link href="/events" className="group flex min-h-16 items-center justify-between gap-3 rounded-md py-3 text-sm font-semibold text-[#f7f4ee] transition hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"><span>Explore queer events</span><ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-cyan-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
