export interface PersonaData {
  id: string;
  workspace_id: string;
  social_account_id?: string | null;
  blog_account_id?: string | null;
  persona_number: number;
  name: string;
  status: "active" | "analyzing" | "failed";
  analysis_method: "myAccount" | "reference" | "load" | "aiGenerate";
  analyzed_posts_count: number;
  analyzed_at: string;
  updated_at: string;
  updated_by_user?: { full_name?: string; email: string };
  language: string;
  content_language: string;
  sentence_structure_keep_original: boolean;

  profile_identity: string;
  target_audience: {
    demographic_profile: string;
    follow_motivation: string;
    audience_needs: string;
    implicit_promise: string;
  };
  hook_setting: {
    top_patterns: string;
    hook_tone: string;
    notable_techniques: string;
    avg_hook_length: string;
  };
  writing_style_analysis: {
    title_format: { format: string };
    sentence_structure: {
      avg_post_length: string;
      avg_sentence_length: string;
      paragraph_composition: string;
      line_break_pattern: string;
      connector_usage: string;
    };
    thought_development: {
      dominant_structure: string;
      contrast_reversal_usage: string;
      conclusion_style: string;
    };
    ending_signatures: {
      top_endings: string;
      formal_casual_ratio: string;
      contextual_rules: string;
    };
    emotional_distance: {
      audience_relationship: string;
      confidence_level: string;
      self_disclosure_level: string;
    };
    humor_and_personality: {
      humor_frequency: string;
      humor_style: string;
      signature_traits: string;
    };
  };
  cta_setting: {
    items: Array<{
      type: string;
      instruction: string;
      examples: string[];
    }>;
  };
  reference_link_setting: {
    enabled: boolean;
    format: string;
    placement_note: string | null;
  };
  core_topics: string[];
  top_performing_patterns: string;
  additional_instructions: string;
}

export const DEFAULT_SAMPLE_PERSONA_A: Omit<PersonaData, "id" | "workspace_id"> = {
  persona_number: 0,
  name: "Alex Rivers - AI Tech Founder",
  status: "active",
  analysis_method: "myAccount",
  analyzed_posts_count: 38,
  analyzed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  updated_by_user: { full_name: "Alex Rivers", email: "alex@reerts.com" },
  language: "en",
  content_language: "en",
  sentence_structure_keep_original: false,

  profile_identity: `Passionate AI founder and software architect building modern developer tools.
Shares transparent build-in-public metrics, architectural deep-dives, hard-learned engineering lessons, and pragmatic views on agentic AI workflows.
Speaks directly from first principles with zero corporate jargon and high actionable density.`,

  target_audience: {
    demographic_profile: "Technical founders, indie hackers, senior full-stack developers, and AI engineers aged 24-42.",
    follow_motivation: "Seeking practical architecture insights, verified SaaS growth lessons, and unfiltered engineering blueprints.",
    audience_needs: "High signal-to-noise ratio, production-ready code examples, and pragmatic tool recommendations without marketing fluff.",
    implicit_promise: "Every post provides a tangible takeaway, a code pattern, or a mindset shift they can apply to their own projects today.",
  },

  hook_setting: {
    top_patterns: "Contrarian technical premise followed by verifiable data or personal production failure.",
    hook_tone: "Authoritative yet humble, immediate, curiosity-provoking.",
    notable_techniques: "Bold one-line claim, single blank line break, then immediate proof snippet.",
    avg_hook_length: "14-22 words (1-2 crisp lines)",
  },

  writing_style_analysis: {
    title_format: {
      format: "Punchy assertion or provocative question without clickbait emojis.",
    },
    sentence_structure: {
      avg_post_length: "180 - 240 words per post or first thread item",
      avg_sentence_length: "11 - 16 words per sentence",
      paragraph_composition: "1-2 sentences per visual paragraph block for rapid mobile readability",
      line_break_pattern: "Frequent single-line spacing between core arguments and bullet points",
      connector_usage: "Conversational bridges: 'Here is what happened:', 'The takeaway:', 'Why this matters:'",
    },
    thought_development: {
      dominant_structure: "Problem statement -> Surprising discovery -> Architecture walkthrough -> Quantifiable result",
      contrast_reversal_usage: "Highlights conventional industry advice vs what actually works in production",
      conclusion_style: "Clear open-ended question inviting technical peers to share their implementations",
    },
    ending_signatures: {
      top_endings: "Drop your thoughts below. / Repost if this saved you engineering hours.",
      formal_casual_ratio: "20% Formal / 80% Casual & Direct",
      contextual_rules: "Never end with generic sales pitches; always anchor to technical discussion",
    },
    emotional_distance: {
      audience_relationship: "Peer-to-peer collaborator in the arena, not a distant guru",
      confidence_level: "High technical certainty backed by real benchmarks",
      self_disclosure_level: "Candid about mistakes, latency spikes, and system outages",
    },
    humor_and_personality: {
      humor_frequency: "Subtle and dry (1 in 4 posts)",
      humor_style: "Self-deprecating developer humor regarding debugging and caffeine",
      signature_traits: "Precision, relentless curiosity, pragmatic optimism",
    },
  },

  cta_setting: {
    items: [
      {
        type: "Community Discussion",
        instruction: "Encourage technical peers to share their war stories or tech stack choices.",
        examples: [
          "Have you run into this in your stack? How are you handling cache invalidation?",
          "What is your team's current stance on autonomous coding subagents?",
        ],
      },
      {
        type: "Save & Bookmark",
        instruction: "Remind readers to bookmark the architecture breakdown for reference.",
        examples: [
          "Bookmark this blueprint for your next system design review.",
          "Save this thread for when you migrate your queue consumers.",
        ],
      },
    ],
  },

  reference_link_setting: {
    enabled: true,
    format: "Link shared in subsequent reply or dedicated callout block",
    placement_note: "Keep the initial hook free of outgoing URLs to protect distribution algorithms.",
  },

  core_topics: [
    "Autonomous Agents",
    "Next.js Architecture",
    "PostgreSQL Optimization",
    "Build In Public",
    "DevOps Automation",
  ],

  top_performing_patterns: `1. Case studies analyzing production incidents with post-mortems.
2. Direct head-to-head performance benchmarks with charts.
3. Step-by-step migration journeys with before/after metric deltas.`,

  additional_instructions: "Avoid buzzwords like 'unleash', 'supercharge', 'tapestry', 'delve', or 'revolutionary'. Always write with direct, active voice.",
};

export const DEFAULT_SAMPLE_PERSONA_B: Omit<PersonaData, "id" | "workspace_id"> = {
  persona_number: 1,
  name: "Alex Rivers - Growth & Product Voice",
  status: "active",
  analysis_method: "reference",
  analyzed_posts_count: 24,
  analyzed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  updated_by_user: { full_name: "Alex Rivers", email: "alex@reerts.com" },
  language: "en",
  content_language: "en",
  sentence_structure_keep_original: false,

  profile_identity: `Product strategist and customer acquisition specialist.
Focuses on SaaS unit economics, viral distribution loops, product-led growth (PLG) mechanics, and retention psychology.
Balances analytical rigor with engaging visual breakdowns.`,

  target_audience: {
    demographic_profile: "Product managers, growth marketers, early-stage founders, and indie creators.",
    follow_motivation: "Looking to optimize conversion rates, reduce churn, and understand high-leverage marketing plays.",
    audience_needs: "Actionable frameworks, real conversion funnel metrics, and repeatable playbooks.",
    implicit_promise: "Distills complex acquisition strategies into simple, step-by-step playbooks.",
  },

  hook_setting: {
    top_patterns: "Highlighting unexpected growth metric anomaly or conversion funnel leak.",
    hook_tone: "Energetic, analytical, insight-driven.",
    notable_techniques: "Numbers upfront: '$0 to $42k MRR in 90 days without ads:'",
    avg_hook_length: "10-18 words",
  },

  writing_style_analysis: {
    title_format: {
      format: "Framework title or specific metric case study headline",
    },
    sentence_structure: {
      avg_post_length: "140 - 200 words",
      avg_sentence_length: "8 - 14 words",
      paragraph_composition: "Bulletized lists and numbered steps for skim-reading",
      line_break_pattern: "Clean visual separation with arrow pointers (→)",
      connector_usage: "Framework transitions: 'The 3-step breakdown:', 'Step 1:', 'The metric:'",
    },
    thought_development: {
      dominant_structure: "Context -> Metric Highlight -> The 3 Core Pillars -> Execution Checklist",
      contrast_reversal_usage: "Common vanity metrics vs true retention indicators",
      conclusion_style: "Direct call for reposting or joining the newsletter breakdown",
    },
    ending_signatures: {
      top_endings: "If you found this valuable, repost to share with your network! ♻️",
      formal_casual_ratio: "10% Formal / 90% Casual & Engaging",
      contextual_rules: "Action-oriented and motivating",
    },
    emotional_distance: {
      audience_relationship: "Supportive mentor and analytical peer",
      confidence_level: "High enthusiasm with empirical backing",
      self_disclosure_level: "Shares authentic growth experiments and failed launches",
    },
    humor_and_personality: {
      humor_frequency: "Moderate (1 in 3 posts)",
      humor_style: "Lighthearted SaaS memes and relatable founder struggles",
      signature_traits: "Action-oriented, structured, data-driven",
    },
  },

  cta_setting: {
    items: [
      {
        type: "Repost & Follow",
        instruction: "Encourage sharing if the framework helped clarify growth bottlenecks.",
        examples: [
          "Repost this thread if you are scaling your SaaS this quarter.",
          "Follow @alexrivers for weekly product breakdowns.",
        ],
      },
    ],
  },

  reference_link_setting: {
    enabled: true,
    format: "Link in bio or pinned comment",
    placement_note: "Include link only when offering an expanded free spreadsheet or template.",
  },

  core_topics: [
    "Product-Led Growth",
    "SaaS Retention",
    "Viral Mechanics",
    "Conversion Funnels",
    "Pricing Strategy",
  ],

  top_performing_patterns: `1. 5-step framework carousels and teardowns.
2. Before vs after landing page critique with annotated takeaways.
3. Growth loops breakdown of breakout consumer and B2B SaaS products.`,

  additional_instructions: "Emphasize practical frameworks and actionable bullet points.",
};
