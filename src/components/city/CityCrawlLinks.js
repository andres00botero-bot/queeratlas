"use client";

import Link from "next/link";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

export default function CityCrawlLinks({ city, cityName }) {
  const clusterTopics = listCityClusterTopics().slice(0, 5);

  return (
    <nav aria-label="Internal city crawl path links" className="sr-only">
      <Link href="/cities">Cities</Link>
      <Link href="/events">LGBTQ events</Link>
      <Link href="/now">LGBTQ safety map</Link>
      <Link href="/gay-guide">Gay Travel Guide</Link>
      <Link href="/queer-guide">Queer Travel Guide</Link>
      <Link href={`/${city}`}>Queer nightlife {cityName}</Link>
      {clusterTopics.map((entry) => (
        <Link key={entry.key} href={`/${city}/discover/${entry.key}`}>
          {entry.title} in {cityName}
        </Link>
      ))}
    </nav>
  );
}
