export const cityGuideResearch = {
  austin: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Austin — LGBTQ Downtown & Warehouse District", url: "https://www.austintexas.org/explore/lgbtq/downtown-warehouse-district/" },
      { label: "Visit Austin — Pride", url: "https://www.austintexas.org/events/austin-pride/" },
    ],
  },
  wellington: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Wellington Pride Parade — route and community context", url: "https://www.wellingtonprideparade.co.nz/the-parade" },
      { label: "Wellington City Heritage — Carmen Rupe and Cuba Street", url: "https://wellingtoncityheritage.org.nz/buildings/1-150/92-7-shop-residence-288-cuba-street" },
    ],
  },
  brisbane: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Queensland — LGBTQIA+ travel and events", url: "https://www.queensland.com/us/en/things-to-do/traveller/lgbtiq" },
      { label: "Brisbane Pride", url: "https://www.brisbanepride.org.au/" },
    ],
  },
  atlanta: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "City of Atlanta — LGBTQ affairs", url: "https://www.atlantaga.gov/lgbtq" },
      { label: "Discover Atlanta — LGBTQ guide", url: "https://discoveratlanta.com/stories/things-to-do/essential-lgbtq-friendly-places-to-visit-in-atlanta/" },
    ],
  },
  hong_kong: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Hong Kong Tourism Board — Lan Kwai Fong", url: "https://www.discoverhongkong.com/eng/place-to-go/travel.guide-lan-kwai-fong.html" },
      { label: "Hong Kong Tourism Board — SoHo", url: "https://www.discoverhongkong.com/eng/place-to-go/travel.guide-soho.html" },
    ],
  },
  boston: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Meet Boston — South End", url: "https://www.meetboston.com/explore/neighborhoods/south-end/" },
      { label: "Boston Pride for the People", url: "https://www.bostonprideforthepeople.org/" },
    ],
  },
  auckland: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Auckland NZ — Karangahape Road", url: "https://www.aucklandnz.com/explore/karangahape-road-%28k-road%29" },
      { label: "Auckland Pride", url: "https://aucklandpride.org.nz/" },
    ],
  },
  denver: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Denver — LGBTQ history and neighbourhoods", url: "https://www.denver.org/visitdenver_com/glbt" },
      { label: "Denver Pride and The Center on Colfax", url: "https://denverpride.org/" },
    ],
  },
  dallas: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Dallas — LGBTQ guide", url: "https://www.visitdallas.com/explore/experiences/cultural-experiences/lgbtq/" },
      { label: "Pride in Dallas — Oak Lawn travel notes", url: "https://prideindallas.org/visit/" },
    ],
  },
  singapore: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Pink Dot SG", url: "https://pinkdot.sg/" },
      { label: "Tantric — Neil Road venue history", url: "https://tantric.sg/" },
    ],
  },
  sao_paulo: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Brazil Ministry of Tourism — Sao Paulo Pride", url: "https://www.gov.br/turismo/pt-br/assuntos/noticias/parada-do-orgulho-lgbt-de-sao-paulo-promete-atrair-uma-multidao-para-celebrar-a-diversidade/" },
      { label: "Sao Paulo Pride", url: "https://paradasp.org.br/" },
    ],
  },
  la_paz: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "City of La Paz — Sexual Diversity Unit", url: "https://lapaz.bo/atencion-diferenciada-a-la-poblacion-con-diversa-orientacion-sexual-e-identidad-de-genero-en-el-municipio-de-la-paz/" },
    ],
  },
  melbourne: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Victoria — LGBTQIA+ Melbourne", url: "https://www.visitvictoria.com/regions/melbourne/see-and-do/lgbtqia" },
      { label: "Midsumma Festival", url: "https://www.midsumma.org.au/" },
    ],
  },
  seville: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Seville — LGBTIQ+ guide", url: "https://visitasevilla.es/en/lgtbiq/" },
      { label: "City of Seville — Pride 2026", url: "https://www.sevilla.org/actualidad/noticias/2026/arranca-el-fin-de-semana-del-pride-de-sevilla-en-la-alameda-de-hercules-con-el-pregon-a-cargo-de-maria-pelae-falete-laura-gallego-manolo-rosado-y-jedet" },
    ],
  },
  valencia: {
    checkedAt: "2026-08-05",
    sources: [
      { label: "Visit Valencia — LGBTI-friendly city", url: "https://www.visitvalencia.com/en/what-to-do-valencia/valencia-lgbti-friendly-city" },
      { label: "Visit Valencia — Ruzafa and Ensanche", url: "https://www.visitvalencia.com/que-ver-valencia/ruzafa-y-ensanche" },
    ],
  },
};

export function getCityGuideResearch(city = "") {
  return cityGuideResearch[String(city || "").trim().toLowerCase()] || null;
}
