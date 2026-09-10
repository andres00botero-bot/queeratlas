export const COMPASS_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "identity", label: "Identity" },
  { key: "language", label: "Pronouns & language" },
  { key: "community", label: "Community & culture" },
  { key: "allyship", label: "Respect & support" },
];

const RFSL_GLOSSARY = {
  label: "RFSL — Begreppsordlista",
  url: "https://www.rfsl.se/hbtqi-fakta/begreppsordlista/",
};

const STONEWALL_GLOSSARY = {
  label: "Stonewall — LGBTQ+ glossary of terms",
  url: "https://www.stonewall.org.uk/resources/list-lgbtq-terms",
};

const PFLAG_GLOSSARY = {
  label: "PFLAG — National glossary",
  url: "https://pflag.org/glossary/",
};

export const COMPASS_TERMS = [
  {
    slug: "queer",
    name: "Queer",
    aliases: ["queerness"],
    category: "identity",
    paths: ["self", "support", "space"],
    type: "Umbrella term",
    summary:
      "An identity and umbrella term used by some people whose sexuality or gender does not fit heterosexual or cisgender norms.",
    nuance:
      "Queer has also been used as a slur and not everyone is comfortable with it. Use it for a person when they use it for themself, and avoid applying it to everyone.",
    actions: [
      "Follow the words a person uses for themself.",
      "Do not assume everyone in the wider community identifies as queer.",
      "Respect that comfort with the word can differ across generations and cultures.",
    ],
    related: ["LGBTQIA+", "Cisnormativity", "Questioning"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "lgbtqia",
    name: "LGBTQIA+",
    aliases: ["LGBTQ+", "LGBT", "HBTQI", "HBTQ"],
    category: "community",
    paths: ["self", "support", "space"],
    type: "Community acronym",
    summary:
      "A broad acronym for lesbian, gay, bisexual, transgender, queer or questioning, intersex and asexual or aromantic people. The plus recognizes more identities and experiences.",
    nuance:
      "Acronyms vary by language, place and organization. In Sweden, HBTQI is commonly used. No acronym perfectly describes every person or community.",
    actions: [
      "Use the form preferred by the people or organization you are describing.",
      "Write out unfamiliar acronyms when space allows.",
      "Treat the acronym as a coalition, not one uniform experience.",
    ],
    related: ["Queer", "Intersex", "Asexual"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "non-binary",
    name: "Non-binary",
    aliases: ["nonbinary", "ickebinär", "icke-binär"],
    category: "identity",
    paths: ["self", "support", "space"],
    type: "Gender identity",
    summary:
      "An umbrella term for people whose gender is not only woman or only man. People can experience and describe being non-binary in many different ways.",
    nuance:
      "Non-binary is not one appearance, body or set of pronouns. Some non-binary people also identify as trans; others do not.",
    actions: [
      "Use the person's own name, words and pronouns.",
      "Avoid assumptions based on appearance.",
      "Let people define their identity at their own pace.",
    ],
    related: ["Transgender", "Pronouns", "Gender expression"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "transgender",
    name: "Transgender",
    aliases: ["trans", "transperson"],
    category: "identity",
    paths: ["self", "support", "space"],
    type: "Gender identity",
    summary:
      "An umbrella term often used by people whose gender identity or gender expression differs from expectations connected to the sex they were assigned at birth.",
    nuance:
      "Trans describes many different experiences. It does not reveal a person's body, medical history, sexuality or pronouns.",
    actions: [
      "Use the person's current name and pronouns.",
      "Do not ask invasive questions about bodies or medical care.",
      "Challenge exclusion without making the trans person responsible for teaching everyone.",
    ],
    related: ["Non-binary", "Cisgender", "Misgendering"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "cisgender",
    name: "Cisgender",
    aliases: ["cis", "cisperson"],
    category: "identity",
    paths: ["self", "support"],
    type: "Gender identity",
    summary:
      "A person whose gender identity aligns with the sex they were assigned at birth.",
    nuance:
      "Cisgender describes gender identity, not sexuality, personality or gender expression.",
    actions: [
      "Use cisgender when the distinction is relevant rather than treating it as the unmarked default.",
      "Do not use the term to guess someone's sexuality.",
    ],
    related: ["Transgender", "Cisnormativity", "Gender identity"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "pronouns",
    name: "Pronouns",
    aliases: ["pronoun", "personal pronouns", "gender pronouns", "she/her", "he/him"],
    category: "language",
    paths: ["support", "space"],
    type: "Language",
    summary:
      "Words used to refer to someone without repeating their name. A person's pronouns do not reliably tell you their gender identity.",
    nuance:
      "There is no final universal list of pronouns. Language evolves, and some people use one set, several sets, any pronouns, neopronouns, their name, or no third-person pronouns.",
    actions: [
      "Share your own pronouns without pressuring others to share theirs.",
      "Use the name and pronouns a person gives you.",
      "If you make a mistake, correct it briefly and continue.",
    ],
    pronounGuide: {
      intro: "These are common English patterns, not a complete list. The reliable rule is to use the form each person shares.",
      sets: [
        { label: "she / her", forms: "she · her · her · hers · herself", example: "She brought her jacket. The jacket is hers." },
        { label: "he / him", forms: "he · him · his · his · himself", example: "He brought his jacket. The jacket is his." },
        { label: "they / them", forms: "they · them · their · theirs · themself", example: "They brought their jacket. The jacket is theirs." },
        { label: "ze / hir", forms: "ze · hir · hir · hirs · hirself", example: "Ze brought hir jacket. The jacket is hirs." },
        { label: "xe / xem", forms: "xe · xem · xyr · xyrs · xemself", example: "Xe brought xyr jacket. The jacket is xyrs." },
        { label: "ve / ver", forms: "ve · ver · vis · vis · verself", example: "Ve brought vis jacket. The jacket is vis." },
      ],
      notes: [
        "Multiple sets, such as she/they or he/they, can mean the person wants both used. Ask whether they have a preference.",
        "Any/all usually means several pronouns are welcome, but it is still respectful to avoid defaulting to only one.",
        "Name only means using the person's name instead of a third-person pronoun: ‘Alex brought Alex's jacket.’",
      ],
    },
    related: ["Misgendering", "Non-binary", "Ally / allyship"],
    sources: [
      {
        label: "The Trevor Project — Understanding gender identities and pronouns",
        url: "https://www.thetrevorproject.org/resources/article/understanding-gender-identities-and-pronouns/",
      },
      {
        label: "The Trevor Project — Guide to being an ally to trans and nonbinary youth",
        url: "https://www.thetrevorproject.org/resources/guide/a-guide-to-being-an-ally-to-transgender-and-nonbinary-youth/",
      },
    ],
  },
  {
    slug: "singular-they",
    name: "Singular they",
    aliases: ["they/them", "they them pronouns", "singular they pronouns"],
    category: "language",
    paths: ["support", "space"],
    type: "Pronoun pattern",
    summary:
      "Using they, them, their, theirs and themself for one person — either because these are the person's pronouns or because their gender is unknown.",
    nuance:
      "A person who uses they/them may be non-binary, but pronouns alone do not tell you someone's gender. Singular they is also common when speaking about an unknown person.",
    actions: [
      "Use: ‘They brought their bag. The bag is theirs.’",
      "Pair singular they with plural-style verbs: ‘They are’, not ‘they is’.",
      "Use the form a person shares rather than guessing from appearance.",
    ],
    related: ["Pronouns", "Multiple pronouns", "Non-binary"],
    sources: [
      {
        label: "The Trevor Project — Understanding gender identities and pronouns",
        url: "https://www.thetrevorproject.org/resources/article/understanding-gender-identities-and-pronouns/",
      },
    ],
  },
  {
    slug: "multiple-pronouns",
    name: "Multiple pronouns",
    aliases: ["she/they", "he/they", "mixed pronouns", "more than one pronoun"],
    category: "language",
    paths: ["support", "space"],
    type: "Pronoun pattern",
    summary:
      "Using more than one pronoun set, such as she/they, he/they or she/he/they.",
    nuance:
      "Different people mean different things when listing several sets. Some want them mixed equally; others have a preferred set or use different sets in different settings.",
    actions: [
      "Ask: ‘Do you want me to mix both, or do you have a preference?’",
      "If there is no stated preference, make a real effort to use every listed set.",
      "Do not consistently choose only the pronoun that feels easiest to you.",
    ],
    related: ["Pronouns", "Singular they", "Misgendering"],
    sources: [
      {
        label: "The Trevor Project — Pronoun usage and respect",
        url: "https://www.thetrevorproject.org/research-briefs/pronoun-usage-and-mental-health-impacts-of-pronoun-respect-in-tgnb-young-people/",
      },
    ],
  },
  {
    slug: "neopronouns",
    name: "Neopronouns",
    aliases: ["ze/hir", "xe/xem", "ve/ver", "neo-pronouns"],
    category: "language",
    paths: ["support", "space"],
    type: "Pronoun pattern",
    summary:
      "Pronoun sets beyond she/her, he/him and they/them, including forms such as ze/hir, xe/xem and ve/ver.",
    nuance:
      "Neopronouns are not one universal set, and forms can differ. If you are unsure how a set changes within a sentence, ask respectfully or look at the person's own example.",
    actions: [
      "Repeat the full set back when learning it: ‘xe, xem, xyr, xyrs, xemself.’",
      "Practice with short example sentences before you need to speak quickly.",
      "Do not debate whether someone's pronouns sound familiar to you.",
    ],
    related: ["Pronouns", "Multiple pronouns", "Misgendering"],
    sources: [
      {
        label: "The Trevor Project — Guide to being an ally to trans and nonbinary youth",
        url: "https://www.thetrevorproject.org/resources/guide/a-guide-to-being-an-ally-to-transgender-and-nonbinary-youth/",
      },
    ],
  },
  {
    slug: "intersex",
    name: "Intersex",
    aliases: ["intersex variation", "intersexualism"],
    category: "identity",
    paths: ["self", "support", "space"],
    type: "Body variation",
    summary:
      "An umbrella term for innate variations in sex characteristics that do not fit typical definitions of female or male bodies.",
    nuance:
      "Intersex is about sex characteristics, not a single gender identity or sexual orientation. Language preferences can differ between people and regions.",
    actions: [
      "Do not ask invasive questions about someone's body or medical history.",
      "Use the language the person uses for their own experience.",
      "Do not treat intersex as interchangeable with non-binary or trans.",
    ],
    related: ["LGBTQIA+", "Non-binary", "Gender identity"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "flinta",
    name: "FLINTA*",
    aliases: ["FLINTA", "FLINTA space", "FLINTA event"],
    category: "community",
    paths: ["support", "space"],
    type: "Regional acronym",
    summary:
      "A German-language acronym used by some organizers for spaces intended for women, lesbians, intersex, non-binary, trans and agender people.",
    nuance:
      "The acronym is not used everywhere and does not automatically explain who can attend. Organizers should describe their intended participants and access policy in plain language.",
    actions: [
      "Read the organizer's own access description.",
      "Do not infer anyone's identity from appearance.",
      "Ask the organizer a neutral question if the invitation is unclear.",
    ],
    related: ["Non-binary", "Intersex", "Safer space"],
    sources: [
      {
        label: "TU Dortmund — What does FLINTA* mean?",
        url: "https://gleichstellung.tu-dortmund.de/en/projects/klargestellt/flinta/",
      },
    ],
  },
  {
    slug: "asexual",
    name: "Asexual",
    aliases: ["ace", "asexuell"],
    category: "identity",
    paths: ["self", "support"],
    type: "Sexual orientation",
    summary:
      "An umbrella term for people who experience little or no sexual attraction, or whose experience of sexual attraction differs from common expectations.",
    nuance:
      "Asexuality is a spectrum. It does not determine romantic attraction, relationships, libido or whether someone has sex.",
    actions: [
      "Do not frame asexuality as something to fix.",
      "Avoid assumptions about relationships or sexual behavior.",
    ],
    related: ["Aromantic", "LGBTQIA+", "Sexual orientation"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "aromantic",
    name: "Aromantic",
    aliases: ["aro", "aromantisk"],
    category: "identity",
    paths: ["self", "support"],
    type: "Romantic orientation",
    summary:
      "An umbrella term for people who experience little or no romantic attraction, or experience it in ways outside common expectations.",
    nuance:
      "Romantic and sexual attraction are not the same. Aromantic people can have many kinds of close, committed or intimate relationships.",
    actions: [
      "Do not assume romance is necessary for a meaningful life.",
      "Let people define the importance and form of their relationships.",
    ],
    related: ["Asexual", "Chosen family", "Queerplatonic"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "bisexual",
    name: "Bisexual",
    aliases: ["bi", "bisexuell"],
    category: "identity",
    paths: ["self", "support"],
    type: "Sexual orientation",
    summary:
      "A sexual orientation commonly used by people who can be attracted to more than one gender.",
    nuance:
      "Bisexual does not imply only two genders, equal attraction to every gender, indecision or a particular relationship style.",
    actions: [
      "Do not redefine someone's orientation based on their current partner.",
      "Avoid stereotypes about indecision or faithfulness.",
    ],
    related: ["Pansexual", "Sexual orientation", "LGBTQIA+"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "pansexual",
    name: "Pansexual",
    aliases: ["pan", "pansexuell"],
    category: "identity",
    paths: ["self", "support"],
    type: "Sexual orientation",
    summary:
      "A sexual orientation often used by people whose capacity for attraction is not limited by gender.",
    nuance:
      "People distinguish bisexual and pansexual in different ways. Respect the person's chosen term instead of trying to correct it.",
    actions: [
      "Use the label the person chooses.",
      "Avoid treating one multi-gender orientation as more inclusive than another.",
    ],
    related: ["Bisexual", "Sexual orientation", "LGBTQIA+"],
    sources: [RFSL_GLOSSARY],
  },
  {
    slug: "lesbian",
    name: "Lesbian",
    aliases: ["lesbian woman", "gay woman"],
    category: "identity",
    type: "Sexual or romantic orientation",
    summary: "A term commonly used by women who are attracted to women. Some non-binary people also identify as lesbian.",
    nuance: "No relationship history, appearance or gender expression is required. People define their own relationship to the word.",
    actions: ["Use lesbian as an adjective or identity word, not as a stereotype.", "Do not infer someone's orientation from appearance.", "Follow the person's own wording."],
    related: ["Gay", "Sapphic", "Sexual orientation"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "gay",
    name: "Gay",
    aliases: ["gay man", "homosexual"],
    category: "identity",
    type: "Sexual or romantic orientation",
    summary: "A term often used by men attracted to men, and also more broadly by some people attracted to the same gender.",
    nuance: "Some women and non-binary people use gay too. Homosexual is more clinical and is not everyone's preferred identity word.",
    actions: ["Use the identity word a person chooses.", "Avoid using gay as an insult or synonym for something negative.", "Do not assume gender expression reveals orientation."],
    related: ["Lesbian", "Queer", "Sexual orientation"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "gender-identity",
    name: "Gender identity",
    aliases: ["gender", "gender identity meaning"],
    category: "identity",
    type: "Core concept",
    summary: "A person's internal sense of their own gender, such as woman, man, non-binary, another gender or no gender.",
    nuance: "Gender identity is different from gender expression, sexual orientation and sex assigned at birth.",
    actions: ["Let people name their own gender.", "Do not infer identity from clothing, voice or body.", "Keep identity information private unless the person says it can be shared."],
    related: ["Gender expression", "Non-binary", "Transgender"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "gender-expression",
    name: "Gender expression",
    aliases: ["gender presentation", "masculine", "feminine", "androgynous"],
    category: "identity",
    type: "Core concept",
    summary: "How someone presents or communicates gender through things such as clothing, hair, voice, behavior or name.",
    nuance: "Expression does not reliably reveal gender identity or sexual orientation. Cis, trans and non-binary people can have any expression.",
    actions: ["Avoid labeling someone's identity from their presentation.", "Respect different expressions without treating them as costumes.", "Use neutral language until you know a person's words."],
    related: ["Gender identity", "Gender non-conforming", "Butch / femme"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "agender",
    name: "Agender",
    aliases: ["genderless", "no gender"],
    category: "identity",
    type: "Gender identity",
    summary: "A term used by some people who do not identify with or experience a gender.",
    nuance: "Agender is not automatically the same as non-binary, although some agender people also use that umbrella term.",
    actions: ["Use the person's own pronouns and identity words.", "Do not assume agender means a particular appearance.", "Avoid pressuring anyone to explain or prove their gender."],
    related: ["Non-binary", "Gender identity", "Pronouns"],
    sources: [PFLAG_GLOSSARY],
  },
  {
    slug: "genderfluid",
    name: "Genderfluid",
    aliases: ["gender-fluid", "fluid gender"],
    category: "identity",
    type: "Gender identity",
    summary: "A term for a gender identity or experience that changes over time or in different contexts.",
    nuance: "The pace and meaning of change differs by person. Pronouns or presentation may change, but neither has to.",
    actions: ["Use the current name and pronouns a person shares.", "Ask privately when you genuinely need an update.", "Do not treat fluidity as indecision."],
    related: ["Non-binary", "Genderqueer", "Multiple pronouns"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "genderqueer",
    name: "Genderqueer",
    aliases: ["gender queer"],
    category: "identity",
    type: "Gender identity",
    summary: "A term used by some people whose gender sits outside, across or in resistance to conventional categories of woman and man.",
    nuance: "It overlaps with non-binary for some people but is not interchangeable for everyone. Queer can also carry different histories and comfort levels.",
    actions: ["Use genderqueer only for people who use it for themselves.", "Do not replace it automatically with non-binary.", "Respect the person's own definition."],
    related: ["Non-binary", "Queer", "Genderfluid"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "gender-non-conforming",
    name: "Gender non-conforming",
    aliases: ["GNC", "gender expansive", "gender nonconforming"],
    category: "identity",
    type: "Gender expression",
    summary: "A broad term for people whose gender expression does not follow the expectations associated with their gender or assigned sex.",
    nuance: "Gender non-conforming does not automatically mean non-binary or trans. Cis and trans people can be gender non-conforming.",
    actions: ["Do not turn presentation into an identity assumption.", "Use a person's preferred wording.", "Challenge dress codes and rules that punish gender difference."],
    related: ["Gender expression", "Non-binary", "Butch / femme"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "questioning",
    name: "Questioning",
    aliases: ["exploring identity", "questioning sexuality", "questioning gender"],
    category: "identity",
    type: "Identity exploration",
    summary: "The process of exploring or being unsure about one's sexual orientation, romantic orientation or gender identity.",
    nuance: "Questioning can be a temporary process, a long-term description or a word someone chooses not to use at all.",
    actions: ["Do not push someone to choose a label or timeline.", "Listen without trying to diagnose their identity.", "Protect what they share in confidence."],
    related: ["Queer", "Gender identity", "Sexual orientation"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "sexual-orientation",
    name: "Sexual orientation",
    aliases: ["sexuality", "sexual attraction", "orientation"],
    category: "identity",
    type: "Core concept",
    summary: "A way of describing sexual attraction to other people, more than one gender, or no people.",
    nuance: "Sexual orientation is not the same as romantic orientation, gender identity or sexual behavior. These may align for someone, or not.",
    actions: ["Use orientation rather than sexual preference when describing identity.", "Do not demand relationship or sexual history as proof.", "Let people choose how specific they want to be."],
    related: ["Romantic orientation", "Bisexual", "Asexual"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "romantic-orientation",
    name: "Romantic orientation",
    aliases: ["romantic attraction", "romantic identity"],
    category: "identity",
    type: "Core concept",
    summary: "A way of describing romantic attraction to other people, more than one gender, or no people.",
    nuance: "Romantic and sexual orientation can differ. For example, someone may be asexual and biromantic.",
    actions: ["Do not assume romance and sexual attraction are identical.", "Use combined labels only when a person uses them.", "Avoid treating aromantic people as incomplete."],
    related: ["Sexual orientation", "Aromantic", "Asexual"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "demisexual",
    name: "Demisexual",
    aliases: ["demi", "demisexuality", "demi-sexual"],
    category: "identity",
    type: "Asexual-spectrum orientation",
    summary: "A term used by some people who experience sexual attraction only after forming a strong emotional connection.",
    nuance: "Demisexuality describes how attraction is experienced, not a decision to wait before having sex. People may pair it with another orientation word.",
    actions: ["Do not frame demisexuality as being cautious or selective.", "Respect it as an orientation, not a rule about behavior.", "Follow the person's own combination of labels."],
    related: ["Asexual", "Romantic orientation", "Sexual orientation"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "coming-out",
    name: "Coming out",
    aliases: ["come out", "coming-out", "disclosure"],
    category: "community",
    type: "Personal process",
    summary: "A process in which someone shares their sexual orientation or gender identity with another person or group.",
    nuance: "Coming out is rarely one single event. It is optional, may happen repeatedly, and can carry different risks in different settings.",
    actions: ["Let the person choose whether, when and how to share.", "Ask what information may be repeated and to whom.", "Never pressure someone to come out for visibility or honesty."],
    related: ["Outing", "Questioning", "Chosen family"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "deadnaming",
    name: "Deadnaming",
    aliases: ["deadname", "old name", "birth name"],
    category: "language",
    type: "Harmful language practice",
    summary: "Referring to a trans or gender-expansive person by a former name they no longer use.",
    nuance: "A former name can expose private information and cause harm. Some people use a different term for their former name, so follow their language.",
    actions: ["Use the person's current name in conversation and records where possible.", "Correct mistakes briefly without centering yourself.", "Do not reveal or ask for a former name out of curiosity."],
    related: ["Misgendering", "Outing", "Transition"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "transition",
    name: "Transition",
    aliases: ["transitioning", "gender transition", "social transition", "medical transition"],
    category: "identity",
    type: "Personal process",
    summary: "Steps a trans person may take to live more fully as their gender, which can be social, legal, medical, or any combination.",
    nuance: "There is no required path. Not every trans person wants, needs or can access the same steps, and identity is valid without transition.",
    actions: ["Do not ask for medical details unless invited and relevant.", "Use the person's current name and language.", "Avoid describing transition as becoming a different person."],
    related: ["Transgender", "Deadnaming", "Gender identity"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "assigned-sex-at-birth",
    name: "Assigned sex at birth",
    aliases: ["ASAB", "AFAB", "AMAB", "assigned female at birth", "assigned male at birth"],
    category: "language",
    type: "Descriptive terminology",
    summary: "A description of the sex designation recorded for a person at birth. AFAB and AMAB are common abbreviations.",
    nuance: "These terms describe an assignment, not a complete identity. Referring to someone mainly as AFAB or AMAB can erase who they are and may disclose private information.",
    actions: ["Use this information only when it is genuinely relevant.", "Prefer a person's current identity words in ordinary conversation.", "Do not guess assigned sex from appearance or history."],
    related: ["Intersex", "Transgender", "Gender identity"],
    sources: [PFLAG_GLOSSARY],
  },
  {
    slug: "transmasculine-transfeminine",
    name: "Transmasculine / transfeminine",
    aliases: ["transmasc", "transfem", "transfemme", "trans masculine", "trans feminine"],
    category: "identity",
    type: "Gender umbrella terms",
    summary: "Broad terms some people use to describe a trans or non-binary experience oriented toward masculinity or femininity.",
    nuance: "Definitions and who uses these umbrellas vary. A trans man may not identify as transmasculine, and a trans woman may not identify as transfeminine.",
    actions: ["Use the term only when a person uses it for themself.", "Do not substitute it automatically for trans man or trans woman.", "Avoid inferring assigned sex when it is not relevant."],
    related: ["Transgender", "Non-binary", "Gender expression"],
    sources: [PFLAG_GLOSSARY],
  },
  {
    slug: "two-spirit",
    name: "Two-Spirit",
    aliases: ["2S", "Two Spirit", "2SLGBTQIA+"],
    category: "community",
    type: "Indigenous cultural term",
    summary: "An umbrella term used in some Indigenous North American communities for particular cultural, spiritual, gender and sexual identities.",
    nuance: "It is culturally specific, is not a synonym for LGBTQ+, and is not a label for non-Indigenous people to claim. Meanings differ among nations and individuals.",
    actions: ["Respect its Indigenous origins and community-specific meanings.", "Do not assign the term to someone.", "Follow the language of the nation or person being discussed."],
    related: ["LGBTQIA+", "Intersectionality", "Queer"],
    sources: [PFLAG_GLOSSARY],
  },
  {
    slug: "butch-femme",
    name: "Butch / femme",
    aliases: ["butch", "femme", "masculine lesbian", "feminine lesbian"],
    category: "community",
    type: "Community identity and expression",
    summary: "Terms with deep histories in lesbian and queer communities, often connected to masculine or feminine identity, expression and culture.",
    nuance: "They are not simply clothing styles or opposites, and their meanings differ by person, culture and community. Femme is also used beyond lesbian communities.",
    actions: ["Use these words as identities only when people claim them.", "Do not reduce them to stereotypes or relationship roles.", "Recognize their cultural and historical context."],
    related: ["Lesbian", "Gender expression", "Queer"],
    sources: [STONEWALL_GLOSSARY, PFLAG_GLOSSARY],
  },
  {
    slug: "chosen-family",
    name: "Chosen family",
    aliases: ["found family", "vald familj"],
    category: "community",
    paths: ["self", "support", "space"],
    type: "Community & relationships",
    summary:
      "People intentionally chosen for mutual care, belonging and support, whether or not they are legally or biologically related.",
    nuance:
      "Chosen family can exist alongside biological family or become especially important when relatives are absent, unsafe or rejecting.",
    actions: [
      "Ask who a person considers important rather than assuming family structure.",
      "Include chosen family where invitations and support policies allow it.",
    ],
    related: ["Coming out", "Community", "Aromantic"],
    sources: [
      {
        label: "UC Davis LGBTQIA Resource Center — Glossary",
        url: "https://lgbtqia.ucdavis.edu/educated/glossary",
      },
    ],
  },
  {
    slug: "misgendering",
    name: "Misgendering",
    aliases: ["misgender", "felkönande", "wrong pronouns"],
    category: "allyship",
    paths: ["support", "space"],
    type: "Respect in practice",
    summary:
      "Referring to someone with words, a name or pronouns that do not align with how they identify or wish to be addressed.",
    nuance:
      "Intent and impact are different. A brief correction and changed behavior usually help more than a long apology that shifts attention back to the mistake.",
    actions: [
      "Correct yourself briefly and continue.",
      "Practice privately if a name or pronoun is new to you.",
      "Correct others calmly when it is safe and useful.",
    ],
    related: ["Pronouns", "Ally / allyship", "Transgender"],
    sources: [
      {
        label: "GLAAD — Transgender glossary of terms",
        url: "https://glaad.org/reference/trans-terms/",
      },
    ],
  },
  {
    slug: "ally",
    name: "Ally / allyship",
    aliases: ["ally", "allyship", "being an ally"],
    category: "allyship",
    paths: ["support", "space"],
    type: "Respect & support",
    summary:
      "An ally supports LGBTQIA+ people through ongoing actions — listening, learning, challenging exclusion and taking responsibility for mistakes.",
    nuance:
      "Allyship is not a permanent badge someone awards themself. Trust comes from consistent behavior, and the person with less risk should not expect praise or private information in return.",
    actions: [
      "Listen before offering advice or speaking for someone.",
      "Challenge harmful language when it is safe to do so.",
      "Keep learning without making one LGBTQIA+ person your teacher.",
    ],
    related: ["Pronouns", "Misgendering", "Outing"],
    sources: [
      {
        label: "The Trevor Project — Allyship in action",
        url: "https://www.thetrevorproject.org/resources/guide/allyship-in-action/",
      },
    ],
  },
  {
    slug: "outing",
    name: "Outing",
    aliases: ["out someone", "outed"],
    category: "allyship",
    paths: ["support", "space"],
    type: "Privacy & consent",
    summary:
      "Sharing or revealing someone's sexual orientation, gender identity or trans status without their permission.",
    nuance:
      "A person may be open in one place and private in another. Being told something personally does not automatically give permission to share it elsewhere.",
    actions: [
      "Ask what information can be shared, with whom and in which settings.",
      "Do not tag, photograph or describe someone in ways that reveal private identity information.",
      "If unsure, keep the information private.",
    ],
    related: ["Ally / allyship", "Chosen family", "Pronouns"],
    sources: [
      {
        label: "The Trevor Project — Coming out handbook",
        url: "https://www.thetrevorproject.org/resources/guide/the-coming-out-handbook/",
      },
    ],
  },
  {
    slug: "inclusive-language",
    name: "Inclusive language",
    aliases: ["inclusive wording", "gender-inclusive language"],
    category: "allyship",
    paths: ["support", "space"],
    type: "Respect in practice",
    summary:
      "Language that avoids unnecessary assumptions and makes the people being addressed or described feel accurately included.",
    nuance:
      "Inclusive language is contextual. Clear everyday words such as ‘everyone’, ‘guests’ or ‘partners’ are often more useful than replacing one unexplained acronym with another.",
    actions: [
      "Use ‘everyone’ or ‘guests’ instead of assuming a group is ‘ladies and gentlemen’.",
      "Use ‘partner’ when someone's relationship term is unknown.",
      "Explain necessary specialist language the first time it appears.",
    ],
    related: ["Pronouns", "Ally / allyship", "FLINTA*"],
    sources: [
      {
        label: "W3C — Use clear words",
        url: "https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/",
      },
    ],
  },
  {
    slug: "intersectionality",
    name: "Intersectionality",
    aliases: ["intersektionalitet", "intersectional"],
    category: "community",
    paths: ["support", "space"],
    type: "Social framework",
    summary:
      "A way to understand how different identities and power structures overlap and shape a person's opportunities, barriers and experiences.",
    nuance:
      "Queer people are also shaped by race, disability, class, age, migration status, religion and many other factors. One queer experience cannot represent everyone.",
    actions: [
      "Ask whose experience may be missing from a decision.",
      "Design access around overlapping needs, not one imagined average user.",
      "Credit people with lived and local expertise.",
    ],
    related: ["Community", "Allyship", "Cisnormativity"],
    sources: [RFSL_GLOSSARY],
  },
];

export function findCompassTerm(slug) {
  return COMPASS_TERMS.find((term) => term.slug === slug) || null;
}
