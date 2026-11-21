import { getAtlasCollectionBySlug } from "@/lib/atlasCollections";
import styles from "./HomeCollections.module.css";

const highlights = [
  ["hidden-queer-cafes", "Hidden queer cafés"],
  ["best-lesbian-bars-europe", "Lesbian bars in Europe"],
  ["best-queer-beaches-europe", "Queer beaches in Europe"],
  ["best-drag-venues", "Drag venues"],
];

export function AtlasCollections() {
  return (
    <section id="atlas-collections" className={styles.feature} aria-labelledby="collections-heading" lang="en">
      <div className={styles.heading}>
        <h2 className="qa-h3" id="collections-heading">Atlas Collections</h2>
        <a href="/en/now/collections">View all <span aria-hidden="true">→</span></a>
      </div>
      <p>Queer travel guides, selected by the editors.</p>
      <ul className={styles.guides}>
        {highlights.map(([slug, label]) => {
          const guide = getAtlasCollectionBySlug(slug);
          return guide && <li key={slug}><a href={"/en" + guide.href}>{label}</a></li>;
        })}
      </ul>
    </section>
  );
}
export function HomeShortcuts() {
  return (
<nav className={styles.nav} aria-label="Atlas shortcuts" lang="en">
          <a href="/en/cities">City guides</a>
          <a href="/en/events">Event calendar</a>

          <a href="/en/qari">Travel risk map</a>
        </nav>
  );
}
