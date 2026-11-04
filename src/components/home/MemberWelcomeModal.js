"use client";

import { useState } from "react";
import { ArrowRight, Compass, UserRound } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const copyByLocale = {
  en: { eyebrow: "Your Atlas is open", title: "Welcome to Queer Atlas", body: "You’re now part of a global queer discovery network built around cities, nightlife, culture, community and real local energy. Find queer spaces, events and unexpected routes beyond the mainstream — with more freedom, confidence and connection.", privacy: "Your profile stays private unless you choose otherwise.", explore: "Start exploring", profile: "Complete my profile", later: "Not now" },
  sv: { eyebrow: "Din Atlas är öppen", title: "Välkommen till Queer Atlas", body: "Du är nu en del av ett globalt queert upptäckarnätverk byggt kring städer, nattliv, kultur, community och verklig lokal energi. Hitta queera platser, events och oväntade vägar bortom det vanliga — med mer frihet, trygghet och kontakt.", privacy: "Din profil är privat tills du själv väljer något annat.", explore: "Börja utforska", profile: "Fyll i min profil", later: "Inte nu" },
  fr: { eyebrow: "Votre Atlas est ouvert", title: "Bienvenue sur Queer Atlas", body: "Vous faites désormais partie d’un réseau mondial de découverte queer, façonné par les villes, les nuits, la culture, les communautés et une vraie énergie locale. Trouvez des lieux queer, des événements et des itinéraires inattendus loin des sentiers battus — avec plus de liberté, d’assurance et de liens.", privacy: "Votre profil reste privé tant que vous n’en décidez pas autrement.", explore: "Commencer à explorer", profile: "Compléter mon profil", later: "Pas maintenant" },
  de: { eyebrow: "Dein Atlas ist geöffnet", title: "Willkommen bei Queer Atlas", body: "Du bist jetzt Teil eines weltweiten queeren Entdeckungsnetzwerks rund um Städte, Nachtleben, Kultur, Community und echte lokale Energie. Finde queere Orte, Events und unerwartete Wege abseits des Mainstreams — mit mehr Freiheit, Sicherheit und Verbindung.", privacy: "Dein Profil bleibt privat, bis du selbst etwas anderes auswählst.", explore: "Atlas erkunden", profile: "Mein Profil vervollständigen", later: "Nicht jetzt" },
  es: { eyebrow: "Tu Atlas está abierto", title: "Bienvenide a Queer Atlas", body: "Ya formas parte de una red global de descubrimiento queer creada alrededor de ciudades, vida nocturna, cultura, comunidad y energía local real. Encuentra espacios queer, eventos y rutas inesperadas más allá de lo convencional, con más libertad, confianza y conexión.", privacy: "Tu perfil seguirá siendo privado hasta que elijas lo contrario.", explore: "Empezar a explorar", profile: "Completar mi perfil", later: "Ahora no" },
};

export default function MemberWelcomeModal({ onExplore, onProfile, onLater }) {
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  const copy = copyByLocale[locale] || copyByLocale.en;
  const run = async (action) => { if (busy) return; setBusy(true); await action(); };
  return <div className="fixed inset-0 z-[90] flex items-end bg-[#05070d]/78 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="member-welcome-title">
    <section className="w-full max-w-xl overflow-hidden rounded-[30px] border border-fuchsia-100/20 bg-[radial-gradient(circle_at_16%_0%,rgba(244,114,182,.2),transparent_35%),radial-gradient(circle_at_86%_8%,rgba(34,211,238,.15),transparent_30%),linear-gradient(150deg,#171126,#0b1220_68%)] p-6 shadow-[0_34px_120px_rgba(0,0,0,.64)] sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100/25 bg-cyan-100/10 text-cyan-100"><Compass size={23} aria-hidden="true" /></div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.18em] text-fuchsia-100/72">{copy.eyebrow}</p><h1 id="member-welcome-title" className="mt-2 text-3xl font-semibold tracking-[-.04em] text-white sm:text-4xl">{copy.title}</h1>
      <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">{copy.body}</p><p className="mt-4 rounded-2xl border border-emerald-100/16 bg-emerald-100/[.06] px-4 py-3 text-xs leading-5 text-emerald-50/80">{copy.privacy}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" disabled={busy} onClick={() => run(onExplore)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(110deg,#a5f3fc,#ddd6fe_58%,#fbcfe8)] px-4 text-sm font-bold text-[#211527] transition hover:-translate-y-0.5 disabled:opacity-60"><ArrowRight size={17} />{copy.explore}</button><button type="button" disabled={busy} onClick={() => run(onProfile)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/[.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[.1] disabled:opacity-60"><UserRound size={17} />{copy.profile}</button></div>
      <button type="button" disabled={busy} onClick={() => run(onLater)} className="mt-4 min-h-11 w-full text-sm font-medium text-white/52 transition hover:text-white disabled:opacity-60">{copy.later}</button>
    </section>
  </div>;
}
