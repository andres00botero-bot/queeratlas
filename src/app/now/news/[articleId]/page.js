import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NewsComments from "@/components/news/NewsComments";
import { supabase } from "@/lib/supabase";
import { QA_LOGO_URL, QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

const getNewsArticle = cache(async (articleId) => {
  const { data, error } = await supabase
    .from("qa_world_news")
    .select("*")
    .eq("id", String(articleId))
    .maybeSingle();
  if (error) {
    console.error("[news-article] Supabase lookup failed", {
      articleId: String(articleId),
      errorCode: String(error.code || ""),
      errorMessage: String(error.message || ""),
    });
    throw new Error("News article lookup failed.", { cause: error });
  }
  if (!data) return null;
  return data;
});

function articleDescription(article) {
  return String(article?.summary || "").replace(/\s+/g, " ").trim().slice(0, 160);
}
function articleUrl(articleId) {
  return `${QA_SITE_URL}/now/news/${encodeURIComponent(String(articleId))}`;
}

export async function generateMetadata({ params }) {
  const { articleId } = await params;
  const article = await getNewsArticle(articleId);
  if (!article) return { title: "News article not found" };
  const url = articleUrl(article.id);
  const image = String(article.image_url || "").trim();
  return {
    title: article.title,
    description: articleDescription(article),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: articleDescription(article),
      publishedTime: article.created_at || undefined,
      images: image ? [{ url: image, alt: article.image_alt || article.title }] : [],
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    url,
    headline: article.title,
    description: articleDescription(article),
    datePublished: article.created_at || article.date,
    dateModified: article.updated_at || article.created_at || article.date,
    image: article.image_url ? [article.image_url] : undefined,
    mainEntityOfPage: url,
    isPartOf: { "@id": QA_WEBSITE_ID },
    publisher: { "@id": QA_ORGANIZATION_ID, logo: { "@type": "ImageObject", url: QA_LOGO_URL } },
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(217,70,239,0.09),transparent_26%),#050505] px-4 py-6 text-white sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-4xl overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,18,22,0.98),rgba(8,8,10,1))] shadow-[0_32px_110px_rgba(0,0,0,0.48)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-7">
          <Link
            href="/now/news"
            aria-label="Back to Queer World News"
            className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,255,255,0.06))] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-50 shadow-[0_10px_30px_rgba(34,211,238,0.10)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-200/16 hover:shadow-[0_14px_36px_rgba(34,211,238,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-100/25 bg-black/25 transition duration-200 group-hover:border-cyan-100/45 group-hover:bg-cyan-100/10">
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </span>
            <span>Back to Queer World News</span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/42">{article.city || "Global"} · {article.date || ""}</p>
        </header>

        {article.image_url ? (
          <div className="relative h-64 w-full border-b border-white/10 bg-black/35 sm:h-[28rem]">
            <Image src={article.image_url} alt={article.image_alt || article.title} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-contain" />
          </div>
        ) : null}

        <div className="p-5 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/68">{article.category?.replaceAll("_", " ") || "Queer news"}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-5xl">{article.title}</h1>
          <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-white/84 sm:text-base">{article.summary}</p>

          {article.why_it_matters ? (
            <section className="mt-6 rounded-2xl border border-cyan-200/14 bg-cyan-200/[0.05] p-5">
              <h2 className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/68">Why it matters</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-white/80">{article.why_it_matters}</p>
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/52">
            <span>{article.source_name || "Queer Atlas"}</span>
            {article.image_credit ? <span>Photo: {article.image_credit}</span> : null}
          </div>

          <NewsComments articleId={article.id} articleTitle={article.title} />
        </div>
      </article>
    </main>
  );
}
