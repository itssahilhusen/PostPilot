export interface BrandVoiceConstraint {
  name?: string;
  formality?: number;
  directness?: number;
  humor?: number;
  targetAudience?: string;
  bannedWords?: string;
}

export interface CarouselSlidePlan {
  order: number;
  slideType: "COVER" | "PROBLEM" | "FRAMEWORK" | "SOLUTION" | "CALL_TO_ACTION";
  headline: string;
  body: string;
  tag: string;
  bgGradient: string;
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
  }): Promise<{ title: string; slides: CarouselSlidePlan[] }> {
    const rawSubject = params.topic || params.url || params.text || "Scaling Social Media with AI";
    const cleanTopic = rawSubject.replace(/^https?:\/\//i, "").replace(/www\./i, "").split(/[/?#]/)[0] || rawSubject;
    const title = `5 ${cleanTopic.slice(0, 32)} strategies that get saved`;

    const slides: CarouselSlidePlan[] = [
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
        bgGradient: "from-rose-500/20 to-purple-500/20",
      },
      {
        order: 3,
        slideType: "FRAMEWORK",
        headline: "The 3-Tier Distribution Flywheel",
        body: "1. Capture raw observation in real-time.\n2. Condense into high-signal persona voice.\n3. Distribute across text (X/LI) and visual carousels.",
        tag: "Core Mechanics",
        bgGradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        order: 4,
        slideType: "SOLUTION",
        headline: "Systematize Voice & Consistency",
        body: "Keep tone fidelity high using pre-calibrated persona parameters (directness: 85%, formality: 30%). Never compromise brand identity for volume.",
        tag: "Execution Playbook",
        bgGradient: "from-emerald-500/20 to-teal-500/20",
      },
      {
        order: 5,
        slideType: "CALL_TO_ACTION",
        headline: "Steal This System",
        body: "Save this carousel for your next content sprint. Follow for actionable founder frameworks.",
        tag: "Next Step",
        bgGradient: "from-indigo-500/20 to-violet-500/20",
      },
    ];

    return { title, slides };
  }
}

