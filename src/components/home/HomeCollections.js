import { getAtlasCollectionBySlug } from "@/lib/atlasCollections";
import { getMessage } from "@/lib/i18n/messages";
import { toLocalePath } from "@/lib/i18n/localeRouting";
import styles from "./HomeCollections.module.css";

const highlights = [
  ["hidden-queer-cafes", "cafes"],
  ["best-lesbian-bars-europe", "bars"],
  ["best-queer-beaches-europe", "beaches"],
  ["best-drag-venues", "drag"],
];

export function AtlasCollections({ locale = "en" }) {
  return (
    <section id="atlas-collections" className={styles.feature} aria-labelledby="collections-heading" lang={locale}>
      <div className={styles.heading}>
        <h2 className="qa-h3" id="collections-heading">{getMessage(locale, "fieldGuide.collections")}</h2>
        <a href={toLocalePath("/now/collections", locale)}>{getMessage(locale, "fieldGuide.all")} <span aria-hidden="true">→</span></a>
      </div>
      <p>{getMessage(locale, "fieldGuide.intro")}</p>
      <ul className={styles.guides}>
        {highlights.map(([slug, label]) => {
          const guide = getAtlasCollectionBySlug(slug);
          return guide && <li key={slug}><a href={toLocalePath(guide.href, locale)}>{getMessage(locale, "fieldGuide." + label)}</a></li>;
        })}
      </ul>
    </section>
  );
}
export function HomeShortcuts({ locale = "en" }) {
  return (
<nav className={styles.nav} aria-label={getMessage(locale, "fieldGuide.shortcuts")} lang={locale}>
          <a href={toLocalePath("/cities", locale)}>{getMessage(locale, "fieldGuide.cities")}</a>
          <a href={toLocalePath("/events", locale)}>{getMessage(locale, "fieldGuide.calendar")}</a>

          <a href={toLocalePath("/qari", locale)}>{getMessage(locale, "fieldGuide.risk")}</a>
          <a href={toLocalePath("/topics/hotels", locale)}>{getMessage(locale, "fieldGuide.hotels")}</a>
        </nav>
  );
}
