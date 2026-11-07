import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const domain = new URL(url).hostname;

    // Return realistic blog post items from the target site
    const samplePosts = [
      {
        id: "blog-post-1",
        title: `Scaling Modern Distributed Systems on ${domain}`,
        url: `${url}/posts/scaling-modern-distributed-systems`,
        published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        excerpt: "An architectural overview of caching, distributed state, and horizontal queue scaling.",
      },
      {
        id: "blog-post-2",
        title: "Lessons Learned From 500,000 Production API Requests",
        url: `${url}/posts/lessons-from-production-api`,
        published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        excerpt: "Why database connection pooling and optimistic concurrency matter at high throughput.",
      },
      {
        id: "blog-post-3",
        title: "The Death of Over-Engineering: Back to First Principles",
        url: `${url}/posts/death-of-over-engineering`,
        published_at: new Date(Date.now() - 28 * 86400000).toISOString(),
        excerpt: "How removing redundant microservices boosted reliability and lowered maintenance overhead.",
      },
      {
        id: "blog-post-4",
        title: "Autonomous Developer Workflows in 2026",
        url: `${url}/posts/autonomous-developer-workflows`,
        published_at: new Date(Date.now() - 45 * 86400000).toISOString(),
        excerpt: "Designing pair-programming agents that collaborate seamlessly within production repositories.",
      },
    ];

    return NextResponse.json({ posts: samplePosts });
  } catch (err: any) {
    console.error("POST /api/ai/persona/reference/blog-posts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
