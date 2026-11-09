import { FeedStory } from "@/components/design-system/FeedStoryCard";

export const INITIAL_FEED_STORIES: FeedStory[] = [
  {
    id: "card-1",
    category: "WEB",
    source: "Tom's Hardware",
    sourceDotColor: "bg-blue-400",
    readDuration: "4 min",
    isSaved: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2ELIt6BQwwriefPwv4tR8IuQ_PiX8gBKdppYALsSWpLrUJr2HHUzUB8twvEbp9zL5256EnYV41yQwAytuN1MBGzDmR9UK2Bi08RuMusUlbxlreU5AEIpnHqGrp5eBgXHRDNyTbzVuIYQ7OAwet2xmZaNVFJ1lv0wriRfOvTqYS4a1u9I2jaQksjWPs0-KMbmklp3phQY3Qoc3cyRMzzQMIL809EaQcvdiNwDgmKeI2M2papguLi869g",
    imageAlt: "TSMC semiconductor amber perfume",
    topicTag: "Semiconductors",
    metaLine: "2 hours ago · tomshardware.com",
    title: "TSMC denies exploring 3D DRAM at Nvidia's request.",
    description:
      "Foundry leadership clarified advanced packaging roadmaps, rejecting rumors of custom silicon memory stacking.",
  },
  {
    id: "card-2",
    category: "X / POST",
    source: "Anthropic Research",
    sourceDotColor: "bg-purple-400",
    readDuration: "6 min",
    isSaved: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5n6KBZ22aHr7q5-atGlmaMj3TvXuioDR5Ak46Yghqxo9q9Zdq3aKiBG48ZbDFw1vRUDiQIxm0ZQPoLJIz-EALaSC9y0Vy8cFKNfPfcgUoPUpQGFifatiumxJ7H5YyxQtb5KZfZB2MsE5O0vQZHz75GpZSU2cPx7eKKYOKOd27bmQmMYpCfua2bZwMU3OAx8Ob1FoBeJYLxOo-Ks-Na635-IaPbysHrOP404OPKFVujNf3jNkyxdRaYA",
    imageAlt: "Smeraldo emerald perfume",
    topicTag: "Foundation Models",
    metaLine: "4 hours ago · x.com/anthropicai",
    title: "Anthropic's AI acceleration is probably real, backed by...",
    description:
      "Independent mechanistic interpretability tests reveal autonomous code self-correction improving benchmark curves.",
  },
  {
    id: "card-3",
    category: "REDDIT",
    source: "r/technology",
    sourceDotColor: "bg-amber-400",
    readDuration: "8 min",
    isSaved: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9gbAcNhcpJYa6HPqJBxNy1vzktWQB6yTKDG0Zo4ikA6buqciBghJeMQgdwTp0ommuBvAmJKacwlOeZnOa8Bx5z8reXnnInB9UVgN30ljFeonwNdQFN8TSd5CM3kVEf4KV0-w2n-6qA0IEZ95CtiDOJiMARhWClli9wXFGvyKPQ79NDeoe3eH8q6TnhcKg7x_BYAT4Qx-4gintPUtFirZCcHoBluc0q9XYP0X-5MLTL46zYH86h_Oufg",
    imageAlt: "L'Aura Rosé luxury pink flacon",
    topicTag: "Policy & Law",
    metaLine: "9 hours ago · reddit.com/r/technology",
    title: "Tech companies face mounting child safety lawsuits.",
    description:
      "Federal court consolidated 140 state claims against social algorithms, forcing product architects to revisit feeds.",
  },
  {
    id: "card-4",
    category: "WEB",
    source: "Bloomberg Law",
    sourceDotColor: "bg-emerald-400",
    readDuration: "5 min",
    isSaved: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnQ3FMnBxO3R20-1CZR_7EN3pCWzQxUfTaxH1f6gs8DgWGYUsjtSvN8VIdQV25dgtDWsIwv4-eoLNfUvdT4INLFF0fv1JGqNlJbRMyq5rocY-avL6Va-ctoHly1vBgy0-JYtlUXFqRa1W7zoTlxz3oNjo0cZWb-D-KkWq7e1ZU1Hnv2r-J6rgBt0mwtg76UpVFWJQXM4bfQ-Y5v8aCBv6MmdakKSdEPAZKpFYSAjZ-ble-W2EU63Tx2w",
    imageAlt: "Baccarat Rouge ruby flacon",
    topicTag: "Fintech & Cyber",
    metaLine: "14 hours ago · bloomberg.com",
    title: "US charges three men over $129M scheme.",
    description:
      "DOJ indictment alleges orchestrated cloud computing infrastructure compromise to siphon algorithmic trading APIs.",
  },
  {
    id: "card-5",
    category: "SECURITY",
    source: "Wired Threat Level",
    sourceDotColor: "bg-cyan-400",
    readDuration: "7 min",
    isSaved: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhch7t76KiCjaMrB8mJ_QMsriFM3Oz77G31km8dKZtyvXOEHQnxixtblpg-pju1Nd4k8gUunqSJrhyB0VeGi-YpK8nzRQghem7AjIvp9x21boLo40k5ZGiYM8SCbbTxELd583woTkggi93_6k10zl7S_9O6OAR1hyoBOMW5FR55eiNiTO-zJDvgeUS64r0IuBtLk_sGoW9OCccvDycdbZsT8TzKvLjTsQpESiGT2vCuDUyrbR0xlgvzA",
    imageAlt: "Amouage beige flacon perfume",
    topicTag: "Connected Fleet",
    metaLine: "18 hours ago · wired.com",
    title: "Unlocking any car from X brand in most of the world.",
    description:
      "Security researchers demonstrated keyless relay flaws over API token authentication gateways, unlocking doors.",
  },
  {
    id: "card-6",
    category: "RESEARCH",
    source: "OpenAI Official",
    sourceDotColor: "bg-brand-lime",
    readDuration: "10 min",
    isSaved: false,
    topicTag: "o1 Systems Release",
    conceptPreview: {
      type: "icon",
      sublabel: "o1 Systems Release",
    },
    metaLine: "21 hours ago · openai.com/index",
    title: "Learning to reason with chain-of-thought reinforcement.",
    description:
      "New benchmark comparisons indicate a 400% surge in competitive programming percentile ranking when models allocate test-time compute.",
  },
  {
    id: "card-7",
    category: "NEWSLETTER",
    source: "TLDR Founders",
    sourceDotColor: "bg-pink-400",
    readDuration: "3 min",
    isSaved: false,
    topicTag: "Founder Playbooks",
    conceptPreview: {
      type: "badge",
      badgeText: "TL;DR",
      sublabel: "Founder Playbooks",
    },
    metaLine: "1 day ago · tldr.tech/founders",
    title: "Bootstrapping to $10M ARR in the age of agentic workflows.",
    description:
      "How lean 3-person SaaS engineering teams are replacing SDR agencies with multi-channel social intelligence.",
  },
  {
    id: "card-8",
    category: "AI SYNTHESIS",
    source: "✦ Concept Engine",
    sourceDotColor: "bg-brand-lime",
    readDuration: "Ready",
    isSaved: true,
    isAiSynthesis: true,
    conceptPreview: {
      type: "narrative",
      hookText: 'Hook: "Why 90% of luxury perfume launches fail"',
      takeawayText:
        "Key takeaway: Moats have shifted to sensory distribution & narrative.",
      progressPercent: 80,
    },
    metaLine: "Synthesized from 3 sources · Just now",
    title: "The Death of Shallow AI: How luxury founders rebuild their...",
    description:
      "Synthesized angle comparing Anthropic reasoning benchmarks with real founder churn metrics across 50 enterprise pilots.",
  },
];

export const CATEGORIES_LIST = [
  "All Feeds",
  "Tech & AI",
  "Semiconductors",
  "Marketing",
  "Founders",
  "Luxury & Fragrance",
  "Policy & Law",
  "Cybersecurity",
  "Business",
  "Finance",
  "Fitness",
];

