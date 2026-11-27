export const SITE = {
  name: "Wellspoken Institute",
  shortName: "Wellspoken Institute",
  url: "https://wellspokeninstitute.org",
  tagline: "Research and public education on spoken communication",
  description:
    "Wellspoken Institute is a nonprofit research organization studying why spoken communication skills matter for education, work, and economic mobility, and publishing free resources so anyone can build them.",
  email: "hello@wellspokeninstitute.org",
  legalName: "Wellspoken Institute",
  ein: "37-2246201",
  taxStatus: "501(c)(3) public charity",
  foundationClass: "Public charity under sections 509(a)(1) and 170(b)(1)(A)(vi)",
  determinationLetterDate: "2026-10-19",
  exemptionEffectiveDate: "2026-07-10",
  incorporated: "2026-07-10",
  stateOfIncorporation: "Virginia",
  entityType: "Virginia nonstock corporation",
  address: {
    street: "1717 E Cary St",
    city: "Richmond",
    region: "VA",
    postalCode: "23223",
    country: "US",
  },
  researchTeamByline: "Wellspoken Institute Research Team",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  newsletterAction: process.env.NEXT_PUBLIC_NEWSLETTER_ACTION || "",
  productionHost: "wellspokeninstitute.org",
} as const;

export interface Person {
  id: string;
  name: string;
  role: string;
  bio: string;
}

/** Real people only. Never add invented staff. */
export const PEOPLE: Record<string, Person> = {
  "felix-yu": {
    id: "felix-yu",
    name: "Felix Yu",
    role: "President and Director",
    bio: "Felix Yu is a co-founder of Wellspoken Institute. He studied at the University of California, Berkeley, and builds software for speaking practice and assessment.",
  },
  "linfeng-du": {
    id: "linfeng-du",
    name: "Linfeng (Liam) Du",
    role: "Secretary, Treasurer, and Director",
    bio: "Linfeng (Liam) Du is a co-founder of Wellspoken Institute. He studied at Cornell University and is based in Richmond, Virginia.",
  },
};

export const BOARD = [PEOPLE["felix-yu"], PEOPLE["linfeng-du"]];

export const NAV = [
  { href: "/research", label: "Research" },
  { href: "/data/speaking-by-occupation", label: "Data" },
  { href: "/professions", label: "By profession" },
  { href: "/statistics", label: "Statistics" },
  { href: "/tools", label: "Free tools" },
  { href: "/learn", label: "Learn" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/about", label: "About" },
] as const;
