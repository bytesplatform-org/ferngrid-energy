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

/* ------------------------------------------------------------------ */
/* FAQ page — verbatim from ferngrid-energy.com/FAQ                    */
/* (The live R6 answer ends with leftover Wix template text — "FAQs are */
/* a great way to help site visitors…" — which is not included.)       */
/* ------------------------------------------------------------------ */

export type FaqLink = { text: string; href: string };
/** A paragraph: plain text, or text with inline links. */
export type FaqPara = { type: "p"; parts: readonly (string | FaqLink)[] };
/** A bulleted list; an item can carry a nested list. */
export type FaqList = { type: "list"; items: readonly (string | { text: string; sub: readonly string[] })[] };
export type FaqBlock = FaqPara | FaqList;
export type FaqItem = { id: string; q: string; a: readonly FaqBlock[]; sources: readonly FaqLink[] };
export type FaqCategory = { id: string; label: string; items: readonly FaqItem[] };

const NERC_STD: FaqLink = {
  text: "BAL-007-1 Standard",
  href: "https://www.nerc.com/globalassets/standards/projects/2022-03/bal-007-1.1-errata-clean.pdf",
};
const NERC_RATIONALE: FaqLink = {
  text: "BAL-007-1 Technical Rationale",
  href: "https://www.nerc.com/globalassets/standards/projects/2022-03/2022-03_technical_rationale_112524.pdf",
};
const p = (...parts: (string | FaqLink)[]): FaqPara => ({ type: "p", parts });

export const FAQ: { title: string; categories: readonly FaqCategory[] } = {
  title: "Frequently Asked Questions",
  categories: [
    {
      id: "bal-007-1",
      label: "NERC BAL-007-1",
      items: [
        {
          id: "effective-date",
          q: "When does the new NERC BAL-007-1 compliance standard go into effect?",
          a: [p("The new NERC BAL-007-1 compliance requirements go into effect on April 1st, 2027.")],
          sources: [{ text: "NERC BAL-007-1", href: "https://www.nerc.com/standards/reliability-standards/bal/bal-007-1.1" }],
        },
        {
          id: "requirements",
          q: "What are the new NERC BAL-007-1 compliance requirements for Balancing Authorities?",
          a: [
            p("R1. BAs must document study assumptions, duration, and frequency for running Near-Term ERAs."),
            p("R2. BAs must document a set of Near-Term ERA Scenarios to study."),
            p("R3. BAs must document Operating Plan(s) to implement in response to and notify RC of Near-Term ERA's forecasted EEAs."),
            p("R4. BAs must perform Near-Term ERAs documented in R1 & R2."),
            p("R5. BAs must implement its Operating Plan(s) Documented in R3 when Near-Term ERAs forecast EEA2 or EEA3."),
            p(
              "R6. BAs must review, update, and (if needed) provide its RC with their Near-Term ERA process, Scenarios, and Operating Plan(s) least once every 24 calendar months.",
            ),
          ],
          sources: [NERC_STD],
        },
        {
          id: "penalties",
          q: "What are the penalties for not meeting the new NERC BAL-007-1 compliance requirements?",
          a: [p("Noncompliance may result in fines of up to $443,038 per compliance gap.")],
          sources: [
            {
              text: "NERC Compliance Penalties",
              href: "https://www.nerc.com/globalassets/programs/enforcement/enforcement-resources/penalty-inflation-adjustment-notice_final.pdf",
            },
          ],
        },
      ],
    },
    {
      id: "near-term-era",
      label: "Near-Term Energy Reliability Assessments",
      items: [
        {
          id: "definition",
          q: "What is the NERC definition of a Near-Term Energy Reliability Assessment (ERA)?",
          a: [
            p(
              "Near-Term Energy Reliability Assessment: An Energy Reliability Assessment with an assessment period that begins no later than two days after the operating day and has a minimum duration of five days and a maximum duration of six weeks.",
            ),
          ],
          sources: [{ text: "NERC Near-Term ERA Definition", href: "https://www.nerc.com/glossary-of-terms?alpha=N" }],
        },
        {
          id: "assumptions",
          q: "What assumptions or constraints must Near-Term ERAs model?",
          a: [
            p(
              "ERA “modeling includes constrained fuel supplies such as natural gas, inventoried fuels such as oil, coal, liquefied natural gas and some hydro, and just-in-time fuels like wind, solar, and run-of-river hydro. ERAs look at the production from generating resources over a period of time, which will impact their operation. Constrained fuels will deplete, limiting the operation of generation (i.e., fuel). All of these considerations go into modeling resource capabilities and operational limitations, including fuel supply.”",
            ),
            p("These modeling consideration include:"),
            {
              type: "list",
              items: [
                "Forecasted or assumed demand profiles",
                "Generator limitations such as fuel supply and temperature operating limits",
                "Energy transfers with other Balancing Authorities",
                "Known Bulk Electric System transfer limits",
                "Higher-than-forecasted demand",
                {
                  text: "Energy supply contingencies, examples include:",
                  sub: [
                    "Curtailed imports from neighboring systems",
                    "Unexpected outages of large generators",
                    "Variable forecasted resources like renewable generation",
                  ],
                },
                {
                  text: "Fuel supply contingencies examples include:",
                  sub: [
                    "Natural Gas pipeline derates or MWh limitation due to extreme weather",
                    "Inability to refuel oil or coal storage",
                  ],
                },
                "Other historically credible stressed conditions relevant to the BA's system",
              ],
            },
          ],
          sources: [NERC_RATIONALE, NERC_STD],
        },
        {
          id: "vs-capacity",
          q: "How are Near-Term ERA Studies different from conventional capacity assessments?",
          a: [
            p(
              "“ERAs go beyond the existing scope of the capacity assessments that have traditionally been performed to look more closely at energy needs.” Instead of merely evaluating if the system has enough MWs of capacity to meet the system's peak demand over the next 24 hours, Near-Term ERA studies determine if there are enough MWhs to serve the system's hourly demand over a 5 day to 6 week time horizon.",
            ),
          ],
          sources: [NERC_RATIONALE],
        },
        {
          id: "vs-adequacy",
          q: "How are Near-Term ERA Studies different from traditional resource adequacy studies?",
          a: [
            p(
              "Near-Term ERAs evaluate how fuel scarcity impacts a system’s ability to meet demand. While traditional resource adequacy software may account for natural gas constraints, it generally cannot track on-site fuel inventories or consumption. FernGrid Energy’s Fuel and Energy Security Tool (FEST) not only tracks on-site fuel storage and consumption, but also models scheduled fuel refills.",
            ),
          ],
          sources: [NERC_RATIONALE],
        },
        {
          id: "own-software",
          q: "Can I run my own Near-Term ERA Studies using my existing software?",
          a: [
            p(
              "Yes, it is possible to conduct Near-Term Energy Reliability Assessments (ERAs) using tools such as Excel with macros or custom Python scripts. However, accurately modeling the numerous variables required for BAL-007-1 compliance can be complex and challenging.",
            ),
            p(
              "Near-Term ERAs must forecast potential Emergency Energy Alerts for activation of Demand Response programs and failure to meet operating reserves. These assessments must also account for:",
            ),
            {
              type: "list",
              items: [
                "Generator fuel procurement, consumption, and depletion",
                "Fuel delivery schedules and availability",
                "Generator operational constraints",
                "Energy transfers with neighboring systems",
                "Known BES transfer limits",
              ],
            },
            p(
              "Rather than developing and maintaining your own complex modeling solution, consider FernGrid Energy's Fuel and Energy Security Tool (FEST) which was specifically designed to model the assumptions outlined in NERC BAL-007-1. FEST streamlines the Near-Term ERA process and helps Balancing Authorities evaluate their energy and fuel security requirements.",
            ),
          ],
          sources: [],
        },
        {
          id: "best-software",
          q: "What is the best software to run Near-Term ERA Studies?",
          a: [
            p(
              "Fuel scarcity is a critical consideration in Near-Term ERAs, yet most traditional capacity and resource adequacy software is not designed to track inventoried fuel storage, such as oil and coal, as they deplete over time. FernGrid Energy’s Fuel and Energy Security Tool (FEST) is specifically built to fill this gap to help Balancing Authorities accurately assess fuel availability.",
            ),
            p(
              "FEST tracks generators’ initial on-site fuel inventory, calculates hourly fuel consumption based on dispatch, models scheduled or disrupted fuel deliveries, and determines when the unit becomes fuel-constrained during a chronological Near-Term ERA.",
            ),
          ],
          sources: [],
        },
        {
          id: "start-planning",
          q: "How do I start planning my Near-Term ERA assumptions?",
          a: [
            p(
              "If you need help determining your Near-Term ERA base case and contingency scenario assumptions, feel free to ",
              { text: "contact us", href: "/contact" },
              " for a complimentary Near-Term ERA Assumptions Questionnaire. FernGrid Energy has developed a practical questionnaire to help BAs define the assumptions needed for Near-Term ERA scenarios and demystify BAL-007-1 compliance planning.",
            ),
          ],
          sources: [],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Contact page — verbatim from ferngrid-energy.com/contact-us         */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  title: "Contact Us",
  intro:
    "If you’re interested in exploring the potential of the Fuel and Energy Security Tool or FernGrid Energy’s consulting services, please provide your information, and we will contact you soon.",
  outro: "We look forward to connecting with you.",
  form: {
    heading: "Contact Us",
    fields: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      business: "Business Name",
      message: "Additional Message",
    },
    interestsLabel: "I'm interested in ...",
    interests: [
      "A free Near-Term ERA Assumptions Questionnaire designed to plan Near-Term ERA Study Scenarios",
      "One year license of Fuel and Energy Security Tool (FEST)",
      "Assistance developing initial NERC BAL 007-1 Near Term ERAs assumptions for FEST",
      "FernGrid Energy run NERC BAL 007-1 Near Term ERAs",
      "Fuel and Energy Security Tool (FEST) Training",
      "General Power Systems Training",
      "Steady State Power Systems Studies",
      "Other",
    ],
    submit: "Submit",
  },
} as const;
