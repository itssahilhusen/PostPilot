import { NewsArticleItem } from "./news-sources-service";

export interface AIProcessedNewsResult {
  ai_summary: string;
  main_event: string;
  announcement_type: "product_launch" | "funding" | "research_breakthrough" | "acquisition" | "update" | "industry_development" | "other";
  importance_score: number; // 1-100
  credibility_score: number; // 1-100
  verification_status: "verified" | "unverified" | "disputed";
  extracted_entities: {
    companies: string[];
    products: string[];
    people: string[];
  };
  potential_concerns: string | null;
}

// Known entity dictionaries for fast deterministic entity identification
const KNOWN_COMPANIES = [
  "OpenAI", "Anthropic", "Google", "DeepMind", "Meta", "Microsoft", "NVIDIA", "Amazon",
  "Apple", "Mistral", "Stability AI", "Hugging Face", "Tesla", "xAI", "Cisco", "IBM",
  "Oracle", "Intel", "AMD", "TSMC", "Qualcomm", "Cloudflare", "GitHub", "Docker", "GitLab"
];

const KNOWN_PRODUCTS = [
  "ChatGPT", "GPT-4o", "GPT-5", "Claude 3.5", "Claude 3.7", "Gemini 2.0", "Gemini 1.5",
  "Llama 3", "Llama 4", "Mistral Large", "Sora", "Copilot", "Blackwell", "H100", "B200",
  "Kubernetes", "Docker", "TensorFlow", "PyTorch", "vLLM", "Ollama"
];

const KNOWN_PEOPLE = [
  "Sam Altman", "Dario Amodei", "Demis Hassabis", "Jensen Huang", "Mark Zuckerberg",
  "Satya Nadella", "Sundar Pichai", "Elon Musk", "Yann LeCun", "Ilya Sutskever",
  "Andrej Karpathy", "Geoffrey Hinton", "Mira Murati", "Arthur Mensch"
];

export class NewsAIProcessor {
  /**
   * Process a single article through the AI intelligence pipeline.
   * Leverages Gemini API when GEMINI_API_KEY is available, with deterministic fallback.
   */
  static async processArticle(article: {
    title: string;
    description: string;
    article_content?: string;
    source_name: string;
    category: string;
  }): Promise<AIProcessedNewsResult> {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey.trim()) {
      try {
        const aiResult = await this.callGeminiProcessor(article, geminiKey.trim());
        if (aiResult) return aiResult;
      } catch (err: any) {
        console.warn("Gemini AI News Processing fallback triggered:", err.message);
      }
    }

    // High-Fidelity Rule-Based Intelligence Engine (Zero external dependencies)
    return this.deterministicProcessor(article);
  }

  /**
   * Gemini API processing
   */
  private static async callGeminiProcessor(
    article: { title: string; description: string; source_name: string; category: string },
    apiKey: string
  ): Promise<AIProcessedNewsResult | null> {
    const prompt = `You are a senior tech news intelligence analyst for 'The AI Seed'.
Analyze this news story accurately and return ONLY a strict JSON object.

ARTICLE:
Title: ${article.title}
Source: ${article.source_name}
Category: ${article.category}
Context: ${article.description.slice(0, 800)}

JSON FORMAT:
{
  "ai_summary": "2-3 clear sentences summarizing the core development and why it matters.",
  "main_event": "One concise sentence naming the main news event.",
  "announcement_type": "product_launch" | "funding" | "research_breakthrough" | "acquisition" | "update" | "industry_development" | "other",
  "importance_score": 1-100 (integer representing industry impact),
  "credibility_score": 1-100 (integer representing verification level),
  "verification_status": "verified" | "unverified" | "disputed",
  "extracted_entities": {
    "companies": ["Company1", ...],
    "products": ["Product1", ...],
    "people": ["Person1", ...]
  },
  "potential_concerns": null or "Note on unverified rumor, anonymous source, or limitation"
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    return {
      ai_summary: parsed.ai_summary || article.description.slice(0, 200),
      main_event: parsed.main_event || article.title,
      announcement_type: parsed.announcement_type || "industry_development",
      importance_score: typeof parsed.importance_score === "number" ? parsed.importance_score : 70,
      credibility_score: typeof parsed.credibility_score === "number" ? parsed.credibility_score : 85,
      verification_status: parsed.verification_status || "verified",
      extracted_entities: {
        companies: Array.isArray(parsed.extracted_entities?.companies) ? parsed.extracted_entities.companies : [],
        products: Array.isArray(parsed.extracted_entities?.products) ? parsed.extracted_entities.products : [],
        people: Array.isArray(parsed.extracted_entities?.people) ? parsed.extracted_entities.people : [],
      },
      potential_concerns: parsed.potential_concerns || null,
    };
  }

  /**
   * Deterministic NLP and Pattern Analysis Engine
   */
  private static deterministicProcessor(article: {
    title: string;
    description: string;
    source_name: string;
    category: string;
  }): AIProcessedNewsResult {
    const textToScan = `${article.title} ${article.description}`.toLowerCase();

    // 1. Determine Announcement Type
    let announcement_type: AIProcessedNewsResult["announcement_type"] = "industry_development";
    if (/\b(launches|launches|unveils|releases|introduces|debuts|announces new)\b/i.test(article.title)) {
      announcement_type = "product_launch";
    } else if (/\b(funding|raises|valuation|series [a-d]|seed round|invests|investment)\b/i.test(article.title)) {
      announcement_type = "funding";
    } else if (/\b(breakthrough|paper|architecture|discovers|researchers find|model weights)\b/i.test(article.title)) {
      announcement_type = "research_breakthrough";
    } else if (/\b(acquires|acquisition|merger|bought|buys)\b/i.test(article.title)) {
      announcement_type = "acquisition";
    } else if (/\b(update|v\d+|\.0|patch|feature|upgrade|now available)\b/i.test(article.title)) {
      announcement_type = "update";
    }

    // 2. Extract Entities
    const companies = KNOWN_COMPANIES.filter(c => new RegExp(`\\b${c}\\b`, "i").test(textToScan));
    const products = KNOWN_PRODUCTS.filter(p => new RegExp(`\\b${p}\\b`, "i").test(textToScan));
    const people = KNOWN_PEOPLE.filter(p => new RegExp(`\\b${p}\\b`, "i").test(textToScan));

    // 3. Compute Importance Score (1-100)
    let importance = 60;
    if (companies.some(c => ["OpenAI", "DeepMind", "Anthropic", "NVIDIA", "Meta"].includes(c))) {
      importance += 18;
    }
    if (announcement_type === "product_launch" || announcement_type === "research_breakthrough") {
      importance += 12;
    }
    if (article.category.includes("AI")) {
      importance += 6;
    }
    importance = Math.min(Math.max(importance, 45), 98);

    // 4. Verification & Misleading Claims Check
    let verification_status: "verified" | "unverified" | "disputed" = "verified";
    let potential_concerns: string | null = null;

    if (/\b(rumor|reportedly|alleged|anonymous sources|insiders claim|leak|unconfirmed)\b/i.test(textToScan)) {
      verification_status = "unverified";
      potential_concerns = "Based on unconfirmed reports or anonymous insider sources. Awaiting official confirmation.";
    }

    // 5. Build Concise Summary
    const cleanDesc = article.description.replace(/\s+/g, " ").trim();
    let ai_summary = cleanDesc;
    if (cleanDesc.length > 240) {
      const firstSentence = cleanDesc.split(/[.?!]\s+/)[0];
      const secondSentence = cleanDesc.split(/[.?!]\s+/)[1];
      ai_summary = secondSentence ? `${firstSentence}. ${secondSentence}.` : `${firstSentence}.`;
    }
    if (!ai_summary || ai_summary.length < 30) {
      ai_summary = `${article.title}. Reported by ${article.source_name} regarding recent developments in ${article.category}.`;
    }

    return {
      ai_summary,
      main_event: article.title,
      announcement_type,
      importance_score: importance,
      credibility_score: verification_status === "verified" ? 88 : 65,
      verification_status,
      extracted_entities: {
        companies,
        products,
        people,
      },
      potential_concerns,
    };
  }
}

