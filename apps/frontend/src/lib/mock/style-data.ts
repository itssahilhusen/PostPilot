export interface StyleTemplate {
  id: string;
  sectionId: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
  slideCountText: string;
  slideCount: number;
  title?: string;
  subtitle?: string;
  heading?: string;
  accentDivider?: boolean;
  accentDividerColor?: string;
  quote?: string;
  emojis?: string[];
  iconType?: "bulb" | "bolt" | "target" | "none";
  views: string;
  likes: string;
  isLight?: boolean;
  cardBgClass: string;
  slideIndicators: (string | number)[];
  extraTagLeft?: string;
  extraTagRight?: string;
  previewSlides?: {
    slideNumber: number;
    title: string;
    body: string;
    bullets?: string[];
  }[];
}

export interface StyleSectionData {
  id: string;
  title: string;
  description: string;
  templateCountText: string;
  badgeText?: string;
  iconType: "tips" | "cartoon" | "quotes";
  iconBgClass: string;
  iconBorderClass: string;
  iconColorClass: string;
  templates: StyleTemplate[];
}

export const STYLE_SECTIONS: StyleSectionData[] = [
  {
    id: "step-by-step",
    title: "Step-by-Step Tips & Actionable Guides",
    description: "High-retention swipe carousels broken into 5–10 bite-sized actionable slides.",
    templateCountText: "5 templates",
    badgeText: "Pick 2",
    iconType: "tips",
    iconBgClass: "bg-amber-400/10",
    iconBorderClass: "border-amber-400/20",
    iconColorClass: "text-amber-300",
    templates: [
      {
        id: "habits-psychology",
        sectionId: "step-by-step",
        category: "HABITS",
        categoryColor: "text-brand-lime",
        categoryBg: "bg-black/60 backdrop-blur-md",
        categoryBorder: "border-brand-lime/30",
        slideCountText: "7 slides",
        slideCount: 7,
        subtitle: "Psychology",
        heading: "5 SCIENCE-PROVEN HABITS",
        accentDivider: true,
        accentDividerColor: "bg-brand-lime",
        views: "2.1M",
        likes: "36.3K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4, 5, 6, 7],
        previewSlides: [
          {
            slideNumber: 1,
            title: "5 SCIENCE-PROVEN HABITS",
            body: "How elite performers lock in high dopamine baselines without burnout.",
            bullets: ["Habit stacking with morning cues", "Implementation intentions", "Zero-friction environments"]
          },
          {
            slideNumber: 2,
            title: "1. The 2-Minute Rule",
            body: "When you start a new habit, it should take less than two minutes to do.",
            bullets: ["Read one page", "Do two pushups", "Fold one piece of clothing"]
          },
          {
            slideNumber: 3,
            title: "2. Environment Over Willpower",
            body: "Design your space so positive actions require the least physical effort.",
            bullets: ["Phone in another room during deep work", "Water bottle on your desk", "Gym clothes laid out the night before"]
          }
        ]
      },
      {
        id: "career-lessons",
        sectionId: "step-by-step",
        category: "CAREER",
        categoryColor: "text-neutral-300",
        categoryBg: "bg-white/10 backdrop-blur-md",
        categoryBorder: "border-white/10",
        slideCountText: "11 slides",
        slideCount: 11,
        subtitle: "Lessons",
        heading: "TOP 10 CAREER ADVICE",
        quote: '"You can\'t skip the rep"',
        views: "2.5M",
        likes: "43.3K",
        cardBgClass: "bg-[#0A0D0E]",
        slideIndicators: [1, 2, 3, 4, 5, "+6"],
        previewSlides: [
          {
            slideNumber: 1,
            title: "TOP 10 CAREER ADVICE",
            body: "Unfiltered truths I learned going from junior dev to founder.",
            bullets: ['"You can\'t skip the rep"', "Optimize for learning velocity", "Build in public"]
          },
          {
            slideNumber: 2,
            title: "1. Pick Growth Over Comfort",
            body: "A high-velocity startup will teach you 3x more than a slow corporate ladder.",
            bullets: ["Exposure to cross-functional problems", "High ownership of outcomes"]
          }
        ]
      },
      {
        id: "communication-traps",
        sectionId: "step-by-step",
        category: "COMMUNICATION",
        categoryColor: "text-neutral-800",
        categoryBg: "bg-neutral-300/80 backdrop-blur-md",
        categoryBorder: "border-neutral-400/40",
        slideCountText: "7 slides",
        slideCount: 7,
        heading: "5 SPEAKING TRAPS THAT MAKE SMART PEOPLE LOOK INSECURE",
        subtitle: "And how to speak with poise",
        views: "983.9K",
        likes: "8.6K",
        isLight: true,
        cardBgClass: "bg-white text-neutral-900",
        slideIndicators: [1, 2, 3, 4, 5, "+2"],
        previewSlides: [
          {
            slideNumber: 1,
            title: "5 SPEAKING TRAPS THAT MAKE SMART PEOPLE LOOK INSECURE",
            body: "And how to speak with poise in high-stakes meetings.",
            bullets: ["Eliminate upward inflection", "Stop opening with apologies", "Embrace strategic pauses"]
          },
          {
            slideNumber: 2,
            title: "Trap #1: 'Does that make sense?'",
            body: "Replace with: 'I'd love your perspective on this.'",
            bullets: ["Signals confidence rather than seeking permission", "Invites constructive dialogue"]
          }
        ]
      },
      {
        id: "productivity-consistent",
        sectionId: "step-by-step",
        category: "PRODUCTIVITY",
        categoryColor: "text-cyan-300",
        categoryBg: "bg-cyan-950/60",
        categoryBorder: "border-cyan-800/40",
        slideCountText: "9 slides",
        slideCount: 9,
        iconType: "bolt",
        heading: "HOW TO BE CONSISTENT",
        subtitle: "(Without Burnout)",
        views: "763.7K",
        likes: "13.3K",
        cardBgClass: "bg-[#161a1d]",
        slideIndicators: [1, 2, 3, 4, "+5"],
        previewSlides: [
          {
            slideNumber: 1,
            title: "HOW TO BE CONSISTENT",
            body: "The non-linear engine behind sustainable 10x output.",
            bullets: ["Protect your 90-minute morning deep block", "Energy audits over time audits", "Recovery is part of the work"]
          }
        ]
      },
      {
        id: "discipline-routines",
        sectionId: "step-by-step",
        category: "DISCIPLINE",
        categoryColor: "text-emerald-300",
        categoryBg: "bg-emerald-950/60",
        categoryBorder: "border-emerald-800/40",
        slideCountText: "8 slides",
        slideCount: 8,
        subtitle: "Routines",
        heading: "5 DISCIPLINE HABITS HIGH ACHIEVERS SWEAR BY",
        quote: "Swipe →",
        views: "7.1M",
        likes: "184.5K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4, "+4"],
        previewSlides: [
          {
            slideNumber: 1,
            title: "5 DISCIPLINE HABITS HIGH ACHIEVERS SWEAR BY",
            body: "Why consistency outperforms talent every single week.",
            bullets: ["Strict shutdown ritual", "Accountability contracts", "Default-to-action bias"]
          }
        ]
      }
    ]
  },
  {
    id: "cartoon-style",
    title: "Cartoon-Style Storytelling & Visual Analogies",
    description: "Comic panels with viral emotional tension and contrasting illustrated outcomes.",
    templateCountText: "15 templates",
    iconType: "cartoon",
    iconBgClass: "bg-pink-400/10",
    iconBorderClass: "border-pink-400/20",
    iconColorClass: "text-pink-300",
    templates: [
      {
        id: "cartoon-relationship",
        sectionId: "cartoon-style",
        category: "RELATIONSHIP",
        categoryColor: "text-neutral-300",
        categoryBg: "bg-black/60",
        categoryBorder: "border-white/10",
        slideCountText: "4 slides",
        slideCount: 4,
        emojis: ["👦", "💔", "👨"],
        heading: "5 Years of Happiness for...",
        subtitle: "The choice between 2 paths",
        views: "830.0K",
        likes: "14.4K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4],
        previewSlides: [
          {
            slideNumber: 1,
            title: "5 Years of Happiness for...",
            body: "A poignant visual story about sacrifice, delayed gratification, and partnership.",
            bullets: ["The easy path vs the enduring path", "Choosing what matters long-term"]
          }
        ]
      },
      {
        id: "cartoon-hard-truth",
        sectionId: "cartoon-style",
        category: "HARD TRUTH",
        categoryColor: "text-rose-400",
        categoryBg: "bg-rose-950/60",
        categoryBorder: "border-rose-900/40",
        slideCountText: "4 slides",
        slideCount: 4,
        iconType: "bolt",
        heading: "GET IN SHAPE NOW OR...",
        subtitle: "Pay the high cost later",
        views: "4.1M",
        likes: "106.4K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4],
        previewSlides: [
          {
            slideNumber: 1,
            title: "GET IN SHAPE NOW OR...",
            body: "The compounding toll of neglecting your physical foundation.",
            bullets: ["Health debt compounds like financial debt", "Start with 20 minutes daily"]
          }
        ]
      },
      {
        id: "cartoon-mental-health",
        sectionId: "cartoon-style",
        category: "MENTAL HEALTH",
        categoryColor: "text-sky-300",
        categoryBg: "bg-sky-950/60",
        categoryBorder: "border-sky-800/40",
        slideCountText: "5 slides",
        slideCount: 5,
        emojis: ["🌧️", "🏃", "☀️"],
        heading: "FEELING STRESSED? GO FOR A RUN",
        subtitle: "Resetting brain chemistry",
        views: "678.7K",
        likes: "5.9K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4, 5],
        previewSlides: [
          {
            slideNumber: 1,
            title: "FEELING STRESSED? GO FOR A RUN",
            body: "Move the body to calm the mind. Biomechanics of state shifting.",
            bullets: ["Endorphin surge in 12 minutes", "Cortisol clearance", "Mental clarity"]
          }
        ]
      },
      {
        id: "cartoon-fitness",
        sectionId: "cartoon-style",
        category: "FITNESS",
        categoryColor: "text-amber-400",
        categoryBg: "bg-amber-950/60",
        categoryBorder: "border-amber-800/40",
        slideCountText: "4 slides",
        slideCount: 4,
        emojis: ["🛋️", "VS", "🏋️"],
        heading: "GOING TO THE GYM IS HARD",
        subtitle: "Regret is even harder",
        views: "955.4K",
        likes: "8.3K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4],
        previewSlides: [
          {
            slideNumber: 1,
            title: "GOING TO THE GYM IS HARD",
            body: "Choose your hard: the discipline of practice or the regret of stagnation.",
            bullets: ["Show up on low-motivation days", "The rep counts most when you don't feel like it"]
          }
        ]
      },
      {
        id: "cartoon-metaphor",
        sectionId: "cartoon-style",
        category: "METAPHOR",
        categoryColor: "text-purple-300",
        categoryBg: "bg-purple-950/60",
        categoryBorder: "border-purple-800/40",
        slideCountText: "4 slides",
        slideCount: 4,
        emojis: ["🪵", "🧱", "🏰"],
        heading: "WHY IS BRO CARRYING LOGS?",
        subtitle: "Building foundations in private",
        views: "609.4K",
        likes: "10.6K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4],
        previewSlides: [
          {
            slideNumber: 1,
            title: "WHY IS BRO CARRYING LOGS?",
            body: "The invisible grind before the public breakthrough.",
            bullets: ["Nobody sees the foundation", "They only see the fortress", "Keep laying bricks"]
          }
        ]
      }
    ]
  },
  {
    id: "minimalist-quotes",
    title: "Minimalist Quotes & Visual Frameworks",
    description: "Aesthetic typographic posters and striking aphorisms built for maximal shares.",
    templateCountText: "9 templates",
    iconType: "quotes",
    iconBgClass: "bg-indigo-400/10",
    iconBorderClass: "border-indigo-400/20",
    iconColorClass: "text-indigo-300",
    templates: [
      {
        id: "quotes-perspective",
        sectionId: "minimalist-quotes",
        category: "PERSPECTIVE",
        categoryColor: "text-neutral-400",
        categoryBg: "bg-white/5",
        categoryBorder: "border-white/10",
        slideCountText: "",
        slideCount: 1,
        quote: '"A lot goes wrong before everything goes right."',
        subtitle: "Stay the course",
        extraTagLeft: "SINGLE POST",
        extraTagRight: "1080x1350",
        views: "612.0K",
        likes: "10.6K",
        cardBgClass: "bg-[#0a0c0e]",
        slideIndicators: [],
        previewSlides: [
          {
            slideNumber: 1,
            title: '"A lot goes wrong before everything goes right."',
            body: "Stay the course. Every failure is tuition toward the ultimate outcome.",
            bullets: ["High conviction", "Low attachment to daily variance"]
          }
        ]
      },
      {
        id: "quotes-viral-virtuoso",
        sectionId: "minimalist-quotes",
        category: "VIRAL VIRTUOSO",
        categoryColor: "text-brand-lime",
        categoryBg: "bg-brand-lime/10",
        categoryBorder: "border-brand-lime/20",
        slideCountText: "Single",
        slideCount: 1,
        subtitle: "Rule #1",
        heading: "LET THEM BE WRONG ABOUT YOU. THERE'S NOTHING TO PROVE.",
        extraTagLeft: "MOODY LANDSCAPE",
        extraTagRight: "EDITORIAL",
        views: "9.3M",
        likes: "241.5K",
        cardBgClass: "bg-[#101418]",
        slideIndicators: [],
        previewSlides: [
          {
            slideNumber: 1,
            title: "LET THEM BE WRONG ABOUT YOU. THERE'S NOTHING TO PROVE.",
            body: "Quiet competence speaks louder than defensive explanations.",
            bullets: ["Do the work in silence", "Let the results create the noise"]
          }
        ]
      },
      {
        id: "quotes-marketing",
        sectionId: "minimalist-quotes",
        category: "MARKETING",
        categoryColor: "text-neutral-300",
        categoryBg: "bg-white/10",
        categoryBorder: "border-white/10",
        slideCountText: "",
        slideCount: 1,
        iconType: "target",
        heading: "MARKET FROM THE PERSPECTIVE OF YOUR TARGET AUDIENCE",
        extraTagLeft: "HIGH CONVERSION",
        extraTagRight: "CAROUSEL COVER",
        views: "639.9K",
        likes: "11.1K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [],
        previewSlides: [
          {
            slideNumber: 1,
            title: "MARKET FROM THE PERSPECTIVE OF YOUR TARGET AUDIENCE",
            body: "Nobody buys features. They buy transformations and status elevation.",
            bullets: ["Focus on the pain point", "Show the before/after contrast", "Clear low-friction CTA"]
          }
        ]
      },
      {
        id: "quotes-growth",
        sectionId: "minimalist-quotes",
        category: "GROWTH",
        categoryColor: "text-neutral-400",
        categoryBg: "bg-white/5",
        categoryBorder: "border-white/10",
        slideCountText: "5 slides",
        slideCount: 5,
        heading: "",
        subtitle: "FAIL / WIN.",
        views: "1.3M",
        likes: "22.8K",
        cardBgClass: "bg-neutral-900",
        slideIndicators: [1, 2, 3, 4, 5],
        previewSlides: [
          {
            slideNumber: 1,
            title: "FAIL -> WIN.",
            body: "Failure is not the opposite of success; it is the prerequisite stepping stone.",
            bullets: ["Rapid iteration loops", "Fail small, learn fast", "Double down on what works"]
          }
        ]
      },
      {
        id: "quotes-framework",
        sectionId: "minimalist-quotes",
        category: "FRAMEWORK",
        categoryColor: "text-purple-300",
        categoryBg: "bg-purple-950/60",
        categoryBorder: "border-purple-800/40",
        slideCountText: "6 slides",
        slideCount: 6,
        subtitle: "Mental Model",
        heading: "INVERSION: THINKING FORWARD BY THINKING BACKWARD",
        quote: "Avoid stupidity first",
        views: "845.2K",
        likes: "19.4K",
        cardBgClass: "bg-[#101418]",
        slideIndicators: [1, 2, 3, 4, "+2"],
        previewSlides: [
          {
            slideNumber: 1,
            title: "INVERSION: THINKING FORWARD BY THINKING BACKWARD",
            body: "Charlie Munger's favorite thinking tool: avoid what guarantees disaster.",
            bullets: ["How can this project fail completely?", "Eliminate those failure modes systematically"]
          }
        ]
      }
    ]
  }
];

