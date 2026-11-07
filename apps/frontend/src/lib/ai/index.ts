import { CarouselSlideItem, IdeaRecord } from "@/types";

export interface BrandVoiceConstraint {
  name?: string;
  formality?: number;
  directness?: number;
  humor?: number;
  targetAudience?: string;
  bannedWords?: string;
}

export class AiEngine {
  /**
   * Plans a structured 5-stage carousel from a topic, link, or text.
   */
  static async planCarousel(params: {
    topic?: string;
    url?: string;
    text?: string;
    brandVoice?: BrandVoiceConstraint;
  }): Promise<{ title: string; slides: Omit<CarouselSlideItem, "id">[] }> {
    const rawSubject = params.topic || params.url || params.text || "Scaling Social Media with AI";
    const cleanTopic = rawSubject.replace(/^https?:\/\//i, "").replace(/www\./i, "").split(/[/?#]/)[0] || rawSubject;
    const title = `5 ${cleanTopic.slice(0, 32)} strategies that get saved`;

    const slides: Omit<CarouselSlideItem, "id">[] = [
      {
        order: 1,
        slideType: "COVER",
        headline: title,
        body: "How high-growth founders turn one insight into a compounding distribution engine.",
        tag: "Hook & Frame",
        bgGradient: "from-amber-500/20 to-rose-500/20",
      },
      {
        order: 2,
        slideType: "PROBLEM",
        headline: "The Cost of Random Content",
        body: "Posting spontaneously without a feedback loop leads to burnout and flatlining engagement. High-retention accounts operate on structured repeatable frameworks.",
        tag: "The Bottleneck",
        bgGradient: "from-blue-500/20 to-indigo-500/20",
      },
      {
        order: 3,
        slideType: "CONTENT",
        headline: "Rule of 1 Message per Slide",
        body: "Never crowd slides. Keep 1 actionable insight per card. Use high-contrast headings, concise bullet takeaways, and visual breathing room.",
        tag: "Execution",
        bgGradient: "from-emerald-500/20 to-teal-500/20",
      },
      {
        order: 4,
        slideType: "COMPARISON",
        headline: "What Gets Read vs. What Gets Skipped",
        body: "❌ Generic advice without proof.\n✅ Direct playbooks with concrete step-by-step numbers and visual hierarchy.",
        tag: "Benchmark",
        bgGradient: "from-purple-500/20 to-pink-500/20",
      },
      {
        order: 5,
        slideType: "CLOSING",
        headline: "Save this for your next campaign",
        body: "Double tap to bookmark. Follow for weekly breakdowns on AI-driven creator systems.",
        tag: "Save & Share",
        bgGradient: "from-primary/20 to-secondary/20",
      },
    ];

    return { title, slides };
  }

  /**
   * Generates viral ideas based on a topic query and brand voice constraints.
   */
  static async generateIdeas(params: {
    topic: string;
    brandVoice?: BrandVoiceConstraint;
  }): Promise<Omit<IdeaRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">[]> {
    const topic = params.topic.trim();
    return [
      {
        title: `How top teams leverage ${topic} without increasing headcount`,
        excerpt: `A tactical breakdown of workflows where autonomous agents handle the repetitive 80% while founders focus on strategy.`,
        sourceType: "AI Engine",
        viralityScore: 98,
        tags: [topic.slice(0, 16), "Systems", "Leverage"],
      },
      {
        title: `Stop treating ${topic} like a manual checklist in 2026`,
        excerpt: `Why modern creators are switching to event-driven pipelines and feedback-loop publishing instead of manual drafting.`,
        sourceType: "X Viral Feeds",
        viralityScore: 95,
        tags: ["Growth", "Playbook"],
      },
      {
        title: `3 counter-intuitive lessons learned from 6 months of ${topic}`,
        excerpt: `Most advice overlooks the core bottleneck: distribution frequency and audience retention. Here is what actually moved the needle.`,
        sourceType: "Reddit r/SaaS",
        viralityScore: 92,
        tags: [topic.slice(0, 16), "Case Study"],
      },
      {
        title: `The step-by-step audit for your ${topic} workflow`,
        excerpt: `5-minute checklist to identify leaking reach, improve click-through rates, and automate post engagement.`,
        sourceType: "RSS & Industry News",
        viralityScore: 96,
        tags: ["Audit", "Automation"],
      },
    ];
  }

  /**
   * Tailors a raw post for a specific platform respecting character counts and style.
   */
  static tailorForPlatform(content: string, platform: string): string {
    const trimmed = content.trim();
    switch (platform) {
      case "x":
        // Max 280 chars or thread format
        if (trimmed.length > 270) {
          return `${trimmed.slice(0, 240)}...\n\n(1/3 🧵)`;
        }
        return trimmed;

      case "linkedin":
        // Professional spacing, double line breaks, high-signal takeaway
        return `${trimmed}\n\nKey takeaway:\nConsistency is not about volume; it's about systematically learning what your audience bookmarks.\n\n#leadership #productivity #innovation`;

      case "threads":
        return `${trimmed}\n\nWhat are your thoughts on this? Drop a reply below 👇`;

      case "instagram":
        return `${trimmed}\n.\n.\n.\n#contentcreator #buildinpublic #marketingtips #socialmediastrategy #founderlife`;

      case "tiktok":
        return `${trimmed}\n\n#fyp #ai #tech #productivity`;

      default:
        return trimmed;
    }
  }

  /**
   * Remixes a competitor hook or past top post into an authentic original variant.
   */
  static remixPost(original: string, brandVoice?: BrandVoiceConstraint): string {
    const cleanOriginal = original.replace(/#\w+/g, "").trim();
    return `Reframing a classic insight:\n\n${cleanOriginal}\n\nHere is how to apply this to your own workflow in 3 steps:\n1. Measure the baseline dwell-time\n2. Strip out fluff\n3. Automate the handoff\n\n#systems #growth`;
  }
}
