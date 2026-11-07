import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Reerts initial database...");

  // 1. Create or upsert Default Workspace
  const workspace = await prisma.workspace.upsert({
    where: { handle: "my-workspace" },
    update: {},
    create: {
      id: "ws-default-1",
      name: "My Workspace",
      handle: "my-workspace",
      timezone: "Asia/Calcutta",
      plan: "Pro",
      creditsUsed: 111,
      creditsMax: 500,
    },
  });

  // 2. Create Default Brand Voice
  const existingVoice = await prisma.brandVoice.findFirst({
    where: { workspaceId: workspace.id },
  });

  if (!existingVoice) {
    await prisma.brandVoice.create({
      data: {
        workspaceId: workspace.id,
        name: "Alex Rivers - AI Tech Founder",
        formality: 30,
        directness: 85,
        humor: 45,
        targetAudience: "Founders, creators, engineers, and digital entrepreneurs looking to scale with automation.",
        bannedWords: "delve, tapestry, synergy, revolutionize, unleash, testament",
        isDefault: true,
      },
    });
  }

  // 3. Create Sample Connected Social Accounts
  const initialAccounts = [
    { provider: "x", name: "Alex Rivers", handle: "alexrivers_ai", status: "active", avatar: "/images/platforms/x-light.svg" },
    { provider: "linkedin", name: "Alex Rivers", handle: "alex-rivers", status: "active", avatar: "/images/platforms/linkedin.svg" },
    { provider: "threads", name: "Alex Rivers", handle: "alexrivers.ai", status: "active", avatar: "/images/platforms/threads.svg" },
    { provider: "instagram", name: "The AI Seed", handle: "theaiseed", status: "active", avatar: "/images/platforms/instagram.svg" },
    { provider: "tiktok", name: "The AI Seed", handle: "@theaiseed", status: "updating", avatar: "/images/platforms/tiktok-light.svg" },
  ];

  for (const acc of initialAccounts) {
    await prisma.socialAccount.upsert({
      where: {
        workspaceId_provider_handle: {
          workspaceId: workspace.id,
          provider: acc.provider,
          handle: acc.handle,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        provider: acc.provider,
        name: acc.name,
        handle: acc.handle,
        avatar: acc.avatar,
        status: acc.status,
      },
    });
  }

  // 4. Create Sample Posts across statuses
  const samplePosts = [
    {
      title: "Reerts 2.0 is officially live! 🚀",
      content: "Autonomous multi-platform publishing with your unique brand voice. Write once, tailor to every channel, and schedule on autopilot.\n\n#buildinpublic #ai #saas",
      platforms: JSON.stringify(["x", "linkedin", "threads", "instagram"]),
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000 * 2),
      impressions: 14200,
      engagements: 680,
    },
    {
      title: "Why carousel posts get 3x higher dwell time on LinkedIn",
      content: "Data breakdown from over 10,000 posts analyzed with our analytics engine. High dwell time comes down to 3 factors:\n\n1. Stop-scrolling hook on Slide 1\n2. Single idea per slide\n3. High-utility save CTA on final slide.\n\n#linkedin #creator",
      platforms: JSON.stringify(["linkedin"]),
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000 * 4),
      impressions: 28500,
      engagements: 1760,
    },
    {
      title: "5 AI tools that will save you 20 hours this week",
      content: "From autonomous content engines to automatic lead DM responses. Here is the breakdown:\n\n1. Reerts for automated publishing\n2. Cursor for agentic coding\n3. Whisper for voice capture\n4. Claude 3.5 Sonnet for deep research\n5. Perplexity for fast search\n\n#productivity #ai",
      platforms: JSON.stringify(["x", "threads", "linkedin"]),
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000 * 1),
      impressions: 0,
      engagements: 0,
    },
    {
      title: "Behind the scenes of building Reerts in public",
      content: "Here is the exact tech stack we used to achieve 100% UI fidelity in record time with Next.js 14, Tailwind, PostgreSQL, Prisma, and autonomous agents.",
      platforms: JSON.stringify(["x", "linkedin"]),
      status: "DRAFT",
      impressions: 0,
      engagements: 0,
    },
  ];

  for (const postData of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { workspaceId: workspace.id, title: postData.title },
    });
    if (!existing) {
      await prisma.post.create({
        data: {
          workspaceId: workspace.id,
          ...postData,
        },
      });
    }
  }

  // 5. Create Sample Ideas
  const sampleIdeas = [
    {
      title: "Why consistency on 1 platform is obsolete in 2026",
      excerpt: "Cross-pollinating content across X, Threads, and LinkedIn gives 4x organic compounding without 4x the effort.",
      sourceType: "X Viral",
      viralityScore: 98,
      tags: JSON.stringify(["Strategy", "Multi-Platform"]),
    },
    {
      title: "How I turn 1 technical commit into a LinkedIn carousel and a Twitter breakdown",
      excerpt: "Step-by-step framework to repurpose engineering work into high-engagement creator assets.",
      sourceType: "Reddit",
      viralityScore: 94,
      tags: JSON.stringify(["Repurposing", "Developer"]),
    },
    {
      title: "Stop posting at random times: the real data behind dwell-time algorithms",
      excerpt: "Why morning slots (8:30 - 10:00 AM) outperform evening spikes for B2B engagement.",
      sourceType: "RSS Feed",
      viralityScore: 91,
      tags: JSON.stringify(["Analytics", "Growth"]),
    },
    {
      title: "The feedback loop playbook: how to make past winners generate future winners",
      excerpt: "Using top 10% analytics outliers to seed next month's content calendar automatically.",
      sourceType: "AI Engine",
      viralityScore: 96,
      tags: JSON.stringify(["AI", "Feedback Loop"]),
    },
  ];

  for (const idea of sampleIdeas) {
    const existing = await prisma.idea.findFirst({
      where: { workspaceId: workspace.id, title: idea.title },
    });
    if (!existing) {
      await prisma.idea.create({
        data: {
          workspaceId: workspace.id,
          ...idea,
        },
      });
    }
  }

  // 6. Create Sample Automation
  const existingAuto = await prisma.automation.findFirst({
    where: { workspaceId: workspace.id },
  });

  if (!existingAuto) {
    await prisma.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "Lead DM - Free Growth Playbook",
        active: true,
        triggerType: "comment",
        keywords: "guide, link, ready, send",
        actionType: "dm",
        dmContent: "Hey {{username}}! Thanks for commenting. Here is your free copy of our 2026 Social Scaling Guide: https://reerts.in/playbook",
        buttonLabel: "Open Free Guide",
        buttonUrl: "https://reerts.in/playbook",
        replyVariants: JSON.stringify([
          "Sent you a DM! Check your inbox 😊",
          "Just sent the details to your DMs!",
          "Check your DMs {{username}}! Enjoy 🚀",
        ]),
        requireFollow: true,
        followGateText: "Please follow me first so I can send the link! Tap the button below once you do 😊",
        captureEmail: false,
        sentCount: 142,
        clicksCount: 98,
      },
    });
  }

  // 7. Create Sample Competitors
  const sampleCompetitors = [
    { platform: "threads", handle: "alexandrabrand", name: "Alexandra | Tech & AI", followers: 42800, growthRate: "+12.4%" },
    { platform: "tiktok", handle: "@growthops", name: "GrowthOps Weekly", followers: 89400, growthRate: "+8.9%" },
    { platform: "threads", handle: "saas_daily", name: "SaaS Daily Insights", followers: 23100, growthRate: "+4.2%" },
  ];

  for (const comp of sampleCompetitors) {
    const existing = await prisma.competitor.findFirst({
      where: { workspaceId: workspace.id, handle: comp.handle },
    });
    if (!existing) {
      await prisma.competitor.create({
        data: {
          workspaceId: workspace.id,
          ...comp,
        },
      });
    }
  }

  // 8. Create Sample Media Assets
  const sampleMedia = [
    { name: "reerts-hero-cover.png", url: "/apple-icon.png", mimeType: "image/png", sizeBytes: 17934 },
    { name: "brand-logo-symbol.png", url: "/icon.png", mimeType: "image/png", sizeBytes: 919 },
  ];

  for (const media of sampleMedia) {
    const existing = await prisma.mediaAsset.findFirst({
      where: { workspaceId: workspace.id, name: media.name },
    });
    if (!existing) {
      await prisma.mediaAsset.create({
        data: {
          workspaceId: workspace.id,
          ...media,
        },
      });
    }
  }

  // 7. Seed Sample Personas A & B for Personas Clone
  const sampleThreads = await prisma.socialAccount.findFirst({
    where: { workspaceId: workspace.id, provider: "threads" },
  });

  const existingPersonas = await prisma.persona.findMany({
    where: { workspaceId: workspace.id },
  });

  if (existingPersonas.length === 0) {
    await prisma.persona.create({
      data: {
        workspaceId: workspace.id,
        socialAccountId: sampleThreads?.id ?? null,
        personaNumber: 0,
        name: "Alex Rivers - AI Tech Founder",
        status: "active",
        analysisMethod: "myAccount",
        analyzedPostsCount: 38,
        language: "en",
        contentLanguage: "en",
        sentenceStructureKeepOriginal: false,
        profileIdentity: `Passionate AI founder and software architect building modern developer tools.
Shares transparent build-in-public metrics, architectural deep-dives, hard-learned engineering lessons, and pragmatic views on agentic AI workflows.
Speaks directly from first principles with zero corporate jargon and high actionable density.`,
        targetAudience: JSON.stringify({
          demographic_profile: "Technical founders, indie hackers, senior full-stack developers, and AI engineers aged 24-42.",
          follow_motivation: "Seeking practical architecture insights, verified SaaS growth lessons, and unfiltered engineering blueprints.",
          audience_needs: "High signal-to-noise ratio, production-ready code examples, and pragmatic tool recommendations without marketing fluff.",
          implicit_promise: "Every post provides a tangible takeaway, a code pattern, or a mindset shift they can apply to their own projects today.",
        }),
        hookSetting: JSON.stringify({
          top_patterns: "Contrarian technical premise followed by verifiable data or personal production failure.",
          hook_tone: "Authoritative yet humble, immediate, curiosity-provoking.",
          notable_techniques: "Bold one-line claim, single blank line break, then immediate proof snippet.",
          avg_hook_length: "14-22 words (1-2 crisp lines)",
        }),
        writingStyleAnalysis: JSON.stringify({
          title_format: { format: "Punchy assertion or provocative question without clickbait emojis." },
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
        }),
        ctaSetting: JSON.stringify({
          items: [
            {
              type: "Community Discussion",
              instruction: "Encourage technical peers to share their war stories or tech stack choices.",
              examples: [
                "Have you run into this in your stack? How are you handling cache invalidation?",
                "What is your team's current stance on autonomous coding subagents?",
              ],
            },
          ],
        }),
        referenceLinkSetting: JSON.stringify({
          enabled: true,
          format: "Link shared in subsequent reply or dedicated callout block",
          placement_note: "Keep the initial hook free of outgoing URLs to protect distribution algorithms.",
        }),
        coreTopics: JSON.stringify([
          "Autonomous Agents",
          "Next.js Architecture",
          "PostgreSQL Optimization",
          "Build In Public",
          "DevOps Automation",
        ]),
        topPerformingPatterns: `1. Case studies analyzing production incidents with post-mortems.\n2. Direct head-to-head performance benchmarks with charts.\n3. Step-by-step migration journeys with before/after metric deltas.`,
        additionalInstructions: "Avoid buzzwords like 'unleash', 'supercharge', 'tapestry', 'delve', or 'revolutionary'. Always write with direct, active voice.",
      },
    });

    await prisma.persona.create({
      data: {
        workspaceId: workspace.id,
        socialAccountId: sampleThreads?.id ?? null,
        personaNumber: 1,
        name: "Alex Rivers - Growth & Product Voice",
        status: "active",
        analysisMethod: "reference",
        analyzedPostsCount: 24,
        language: "en",
        contentLanguage: "en",
        sentenceStructureKeepOriginal: false,
        profileIdentity: `Product strategist and customer acquisition specialist.\nFocuses on SaaS unit economics, viral distribution loops, product-led growth (PLG) mechanics, and retention psychology.\nBalances analytical rigor with engaging visual breakdowns.`,
        targetAudience: JSON.stringify({
          demographic_profile: "Product managers, growth marketers, early-stage founders, and indie creators.",
          follow_motivation: "Looking to optimize conversion rates, reduce churn, and understand high-leverage marketing plays.",
          audience_needs: "Actionable frameworks, real conversion funnel metrics, and repeatable playbooks.",
          implicit_promise: "Distills complex acquisition strategies into simple, step-by-step playbooks.",
        }),
        hookSetting: JSON.stringify({
          top_patterns: "Highlighting unexpected growth metric anomaly or conversion funnel leak.",
          hook_tone: "Energetic, analytical, insight-driven.",
          notable_techniques: "Numbers upfront: '$0 to $42k MRR in 90 days without ads:'",
          avg_hook_length: "10-18 words",
        }),
        writingStyleAnalysis: JSON.stringify({
          title_format: { format: "Framework title or specific metric case study headline" },
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
        }),
        ctaSetting: JSON.stringify({
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
        }),
        referenceLinkSetting: JSON.stringify({
          enabled: true,
          format: "Link in bio or pinned comment",
          placement_note: "Include link only when offering an expanded free spreadsheet or template.",
        }),
        coreTopics: JSON.stringify([
          "Product-Led Growth",
          "SaaS Retention",
          "Viral Mechanics",
          "Conversion Funnels",
          "Pricing Strategy",
        ]),
        topPerformingPatterns: `1. 5-step framework carousels and teardowns.\n2. Before vs after landing page critique with annotated takeaways.\n3. Growth loops breakdown of breakout consumer and B2B SaaS products.`,
        additionalInstructions: "Emphasize practical frameworks and actionable bullet points.",
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
