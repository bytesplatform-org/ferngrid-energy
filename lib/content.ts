/**
 * All FernGrid site copy, verbatim from ferngrid-energy.com.
 *
 * Allowed normalizations only: "NERC BAL 007-1" → "NERC BAL-007-1",
 * "Contact US" → "Contact Us". Do not rewrite, summarize or extend this copy.
 * Short structural labels (section indexes, "Scroll", etc.) live next to the
 * components that use them and are marked as labels.
 */

export type NavItem = { label: string; href: string };

export const SITE = {
  name: "FernGrid Energy LLC",
  shortName: "FernGrid Energy",
  url: "https://ferngrid-energy.com",
  email: "help@ferngrid-energy.com",
  phone: "518-227-0290",
  phoneHref: "tel:+15182270290",
  copyright: "Copyright © 2026 FERNGRID ENERGY. All Rights Reserved",
} as const;

export const ROUTES = {
  home: "/",
  about: "/about",
  nerc: "/nerc-bal-007-1",
  fest: "/fest",
  faq: "/faq",
  contact: "/contact",
} as const;

/** Site nav, in the live site's order: HOME · ABOUT · NERC BAL-007-1 · FEST · FAQ · CONTACT */
export const NAV: readonly NavItem[] = [
  { label: "Home", href: ROUTES.home },
  { label: "About", href: ROUTES.about },
  { label: "NERC BAL-007-1", href: ROUTES.nerc },
  { label: "FEST", href: ROUTES.fest },
  { label: "FAQ", href: ROUTES.faq },
  { label: "Contact", href: ROUTES.contact },
];

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export const HOME = {
  hero: {
    title: "FernGrid Energy LLC",
    tagline: "Reliable Software Starts with Reliable Engineering",
    buttons: {
      learn: { label: "Learn BAL-007-1", href: ROUTES.nerc },
      explore: { label: "Explore FEST", href: ROUTES.fest },
      contact: { label: "Contact Us", href: ROUTES.contact },
    },
  },

  ourSoftware: {
    title: "Our Software",
    body: "FernGrid Energy’s Fuel and Energy Security Tool (FEST) simplifies Near Term Energy Reliability Assessments (ERA), helping Balancing Authorities prepare for their upcoming NERC compliance requirements. Beginning April 2027, Balancing Authorities will now be required to conduct Near Term ERAs to maintain compliance with NERC BAL-007-1.",
  },

  ourServices: {
    title: "Our Services",
    body: "Leverage FernGrid Energy’s technical expertise to confidently run Near Term ERAs required by NERC’s BAL-007-1 standard. From developing study assumptions and executing FEST studies, to analyzing and validating ERA results, FernGrid Energy provides the support you need to streamline your fuel security assessments and meet evolving reliability requirements.",
  },

  trainingServices: {
    title: "Training Services",
    body: "FernGrid Energy provides comprehensive training and resources to help customers confidently use FEST, allowing them to study their power system’s fuel security for NERC BAL-007-1 Near Term ERAs. Offerings include detailed FEST documentation, on-demand demonstration videos, and General Power Systems Training tailored to your needs by request. Equip your team with the practical knowledge and skills to effectively use FEST, evaluate fuel security, and navigate the challenges of today’s evolving grid.",
  },

  closing: {
    lines: ["At FernGrid Energy,", "we believe reliable software", "starts with reliable engineering."],
    body: "Schedule a 30-minute technical consultation to review your current NERC BAL-007-1 Near Term ERA workflow and explore the possibilities of our Fuel and Energy Security Tool.",
    buttons: {
      explore: { label: "Explore FEST ➔", href: ROUTES.fest },
      contact: { label: "Contact Us", href: ROUTES.contact },
    },
  },

  footer: {
    email: "Email - help@ferngrid-energy.com",
    call: "Call - 518-227-0290",
    copyright: SITE.copyright,
  },
} as const;

/* ------------------------------------------------------------------ */
/* NERC BAL-007-1 page (supporting copy, partly used on the homepage)  */
/* ------------------------------------------------------------------ */

export const NERC = {
  title: "NERC BAL-007-1",
  eraDifference: {
    heading: "How are Energy Reliability Assessments Different than Existing Studies?",
    body: "Unlike traditional capacity studies, which primarily assess whether sufficient generation capacity is available at a point in time, a Near-Term ERA evaluates hourly energy availability sequentially over the study’s time horizon. Evaluating generator fuel storage levels must occur sequentially through time, making Near-Term ERAs inherently different from conventional capacity assessments. Traditional capacity studies evaluate if there is enough capacity. Near-Term ERAs assess if there is enough energy for every hour throughout the study period.",
  },

  festAndEra: {
    heading: "FernGrid Energy and Energy Reliability Assessments",
    body: "FernGrid Energy’s Fuel and Energy Security Tool (FEST) was explicitly developed to run Near-Term ERAs for Balancing Authorities, developing generation dispatches for each hour to meet demand and maintain adequate operating reserves. Simultaneously, FEST accounts for interface limits, demand response programs, site generator fuel storage constraints, natural gas pipeline fuel scarcity, and generators’ operating temperature limits. These dispatches are then evaluated to forecast potential Energy Emergencies.",
  },

  requirements: {
    heading: "New BAL-007-1 Requirements",
    intro:
      "As of April 2027, NERC Standard BAL-007-1 will require Balancing Authorities (BAs) to conduct Near Term Energy Reliability Assessments (ERA) that account for:",
    accountFor: [
      "Forecasted or assumed hourly load profiles",
      "Generation operational limitations (including fuel supply and temperature considerations)",
      "Energy transfers with other BAs",
      "Known Bulk Electric System (BES) Transmission constraints that limit the transfer of generated power to loads.",
    ],
    scenariosIntro:
      "These Near Term ERAs must forecast level 2 and 3 Energy Emergency Alerts and consist of a set of Scenarios, starting with a base Scenario developed from expected system conditions then considering other Scenarios that stress the system due with the following assumptions:",
    stressScenarios: [
      "Higher than forecasted load profiles",
      "The effects of an energy supply contingency",
      "The effects of a fuel supply contingency",
      "Other stressed conditions with historical precedent",
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* Display fragments lifted verbatim from the copy above               */
/* ------------------------------------------------------------------ */

export const FRAGMENTS = {
  /** From the hero tagline. */
  statement: "Reliable Software Starts with Reliable Engineering.",
  /** From the Our Software paragraph. */
  beginningApril: "Beginning April 2027.",
  /** From the ERA-difference paragraph. */
  enoughEnergy: "Enough energy for every hour.",
  /** From the BAL-007-1 requirements paragraph. */
  eeaForecast: "These Near Term ERAs must forecast level 2 and 3 Energy Emergency Alerts.",
  /** Fuel and Energy Security Tool (FEST), from the Our Software paragraph. */
  festName: "Fuel and Energy Security Tool",
  /** Sub-steps lifted from the Our Services paragraph. */
  serviceSteps: [
    "Developing study assumptions",
    "Executing FEST studies",
    "Analyzing ERA results",
    "Validating ERA results",
  ],
  /** Offerings lifted from the Training Services paragraph. */
  trainingOfferings: ["FEST documentation", "On-demand demonstration videos", "General Power Systems Training"],
} as const;

/* ------------------------------------------------------------------ */
/* FEST data model (rebuilt from client's "Simple Model.png")          */
/* ------------------------------------------------------------------ */

export type FestNodeId = "areas" | "topology" | "generators" | "shape" | "gas" | "oilcoal" | "dual";

export type FestNode = { id: FestNodeId; title: string; items: readonly string[] };

export const FEST_MODEL: readonly FestNode[] = [
  {
    id: "areas",
    title: "Areas",
    items: ["Load Profiles", "Temp Profiles", "Operating Reserves", "Demand Response Programs", "Generators"],
  },
  { id: "topology", title: "Topology", items: ["Internal Interfaces", "External Interfaces"] },
  { id: "generators", title: "Generators", items: ["Fuel Type", "Operating Limits", "Derate", "Temp Limits"] },
  { id: "shape", title: "Nuke & Historical/Generation Shape", items: ["Generation Shapes"] },
  { id: "gas", title: "Natural Gas", items: ["Firm Gas", "Natural Gas Pipeline"] },
  { id: "oilcoal", title: "Oil/Coal", items: ["Current Fuel Storage Level", "Refuel Method"] },
  {
    id: "dual",
    title: "Dual Fuel",
    items: ["Simultaneous or One Fuel Model", "Gas Constraints", "Oil/Coal Constraints"],
  },
];

/* ------------------------------------------------------------------ */
/* About page — verbatim from ferngrid-energy.com/about-us             */
/* ------------------------------------------------------------------ */

export const ABOUT = {
  title: "About Us",
  expertise: {
    heading: "Built on Power Systems Expertise",
    paragraphs: [
      "Founded in 2026, FernGrid Energy brings more than a decade of power industry experience to the development of reliable, practical power systems software. With Masters of Science in Electrical Engineering and Data Science, our leadership team combines technical expertise with extensive industry experience.",
      "FernGrid Energy’s experience spans the power industry including work with Utilities, Independent System Operators, and Power Systems software companies. This broad perspective includes supporting control center operators in real time, conducting long-range compliance planning studies, and developing/maintaining the software used to perform those studies. This hands-on industry experience includes developing custom tools to assess a system’s fuel security, which eventually evolved into software with the ability to support the upcoming NERC BAL-007-1 compliance requirements.",
      "By combining operational experience, power systems expertise, and software development knowledge, FernGrid Energy understands both the technical requirements behind reliability studies and the practical challenges faced by the professionals responsible for completing them.",
    ],
  },
  trust: {
    heading: "Engineering You Can Trust",
    /** Split around the phrase the live page underlines. */
    before:
      "While our team has experience applying Data Science, Machine Learning, and Artificial Intelligence techniques, FernGrid Energy’s Fuel and Energy Security Tool (FEST) is built on a firm foundation of power systems engineering expertise. FEST was written, developed, and tested by a Power Systems Engineer with ",
    emphasis: "no assistance from Large Language Models (LLMs)",
    after:
      ". Customers can trust that our software is built with a deep understanding of power system operations, reliability requirements, and the practical needs of the industry.",
  },
} as const;

/** Display fragments lifted from the About copy (labels and big type only). */
export const ABOUT_FRAGMENTS = {
  founded: "Founded in",
  year: "2026",
  decade: "More than a decade of power industry experience",
  sectors: ["Utilities", "Independent System Operators", "Power Systems software companies"],
  evolution: ["Custom tools to assess a system’s fuel security", "Software", "NERC BAL-007-1 compliance requirements"],
  combine: ["Operational experience", "Power systems expertise", "Software development knowledge"],
  verbs: ["Written.", "Developed.", "Tested."],
} as const;

/** Display fragments lifted from the NERC BAL-007-1 copy (labels and big type only). */
export const NERC_FRAGMENTS = {
  /** First clause of the requirements intro. */
  requireLine:
    "As of April 2027, NERC Standard BAL-007-1 will require Balancing Authorities (BAs) to conduct Near Term Energy Reliability Assessments (ERA)",
  asOf: "As of April 2027",
  accountFor: "That account for",
  baseScenario: "Base Scenario",
  expected: "Expected system conditions",
  stress: "Stress the system",
  eea: "level 2 and 3 Energy Emergency Alerts",
  pointInTime: "At a point in time",
  everyHour: "Every hour",
  capacityLine: "Traditional capacity studies evaluate if there is enough capacity.",
  energyLine: "Near-Term ERAs assess if there is enough energy for every hour throughout the study period.",
  festFactors: [
    "Interface limits",
    "Demand response programs",
    "Site generator fuel storage constraints",
    "Natural gas pipeline fuel scarcity",
    "Generators’ operating temperature limits",
  ],
  dispatches: "Generation dispatches for each hour",
  emergencies: "Forecast potential Energy Emergencies",
} as const;

/* ------------------------------------------------------------------ */
/* FEST page — verbatim from ferngrid-energy.com/fest                  */
/* ------------------------------------------------------------------ */

export type FestPackage = {
  id: "basic" | "standard" | "premium";
  /** Card title (as on the live page). */
  title: string;
  featured?: boolean;
  items: readonly string[];
  /** Description label and text (as on the live page). */
  label: string;
  body: string;
};

export const FEST_PAGE = {
  title: "Fuel and Energy Security Tool",
  acronym: "FEST",
  pricingCta: "Contact Us for Details on Package Pricing",
  modelHeading: "Fuel and Energy Security Tool (FEST) and Near Term ERAs",
  packagesHeading: "Our Packages",
  /** Card order as on the live page; descriptions map by retainer (0 / 1 / 12 months). */
  packages: [
    {
      id: "basic",
      title: "Standard Software License",
      items: [
        "One Year of FEST License",
        "10 Free Hours of Support",
        "Number of Retainer Months: 0",
        "Retainer Discount: 0%",
        "Customer Run ERAs",
      ],
      label: "Basic Package:",
      body: "FernGrid Energy’s Basic Package is ideal for customers with a technically savvy Subject Matter Expert (SME) on staff. This SME will be responsible for updating key study inputs like Generator Fuel Survey Results and Forecasted Load/Temperature Shapes to maintain accurate Near Term ERA results. The customer will be responsible for running NERC BAL-007-1 Near Term ERAs using FEST.",
    },
    {
      id: "standard",
      title: "Software License + Set-Up Retainer",
      featured: true,
      items: [
        "One Year of FEST License",
        "10 Free Hours of Support",
        "Number of Retainer Months: 1",
        "Retainer Discount: 10%",
        "Customer Run ERAs",
      ],
      label: "Standard Package:",
      body: "The Standard Package includes dedicated monthly support hours with FernGrid Energy to help configure and automate customer-specific study inputs, such as Generator Fuel Survey Results and Forecasted Load/Temperature Shapes. This package is well suited for customers with an in-house Subject Matter Expert (SME) who can collaborate with FernGrid Energy to establish study assumptions, provide representative input data, and learn the automated workflow. The customer SME will ultimately run NERC BAL-007-1 Near Term ERAs using FEST.",
    },
    {
      id: "premium",
      title: "FernGrid Energy Run BAL-007-1 Studies",
      items: [
        "One Year of FEST License",
        "10 Free Hours of Support",
        "Number of Retainer Months: 12",
        "Retainer Discount: 15%",
        "FernGrid Energy Run ERAs",
      ],
      label: "Premium Package:",
      body: "The Premium Package provides dedicated monthly support from FernGrid Energy for one year to manage your Near Term ERA process from start to finish. Our team will establish study assumptions with your SME, run/review FEST's Near Term ERA results, and deliver Near Term ERA results for NERC BAL-007-1 compliance. FernGrid Energy will be responsible for running NERC BAL 007-1 Near Term ERAs using FEST.",
    },
  ] as readonly FestPackage[],
} as const;
