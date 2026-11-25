"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewDraft { id: string; title: string; content: string; mediaUrls: string[]; rawThreads: unknown[] }

export function AutoAntsReview({ onReview }: { onReview: (draft: ReviewDraft) => void }) {
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/posts?status=PENDING_APPROVAL", { signal: controller.signal, cache: "no-store" })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (!controller.signal.aborted) setDrafts(data.posts); })
      .catch(() => { if (!controller.signal.aborted) toast.error("Could not load the review queue"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  async function submit(postId?: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/automations/daily-pipeline/" + (postId ? "review" : "run"), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(postId ? { postId, action: "reject" } : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update the review queue");
      toast.success(postId ? "Returned to drafts" : data.generated === false ? "No new stories" : "Draft ready for review");
      setRevision(n => n + 1);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); }
  }
  return <section className="mt-4 space-y-4 text-sm">
    <button disabled={busy} onClick={() => void submit()} className="rounded-lg bg-brand-lime px-3 py-2 text-black">{busy ? "Working…" : "Generate from RSS"}</button>
    <h4 className="font-semibold">Awaiting approval</h4>
    <div className="max-h-[55vh] overflow-y-auto space-y-4">
      {loading ? "Loading drafts…" : !drafts.length && "No drafts awaiting review."}
      {drafts.map(d => <article key={d.id} className="border-t border-white/15 pt-3">
        <strong>{d.title}</strong><p className="my-2 whitespace-pre-wrap">{d.content}</p>
        {d.rawThreads.map((s, i) => typeof s === "object" && s && "title" in s && typeof s.title === "string" &&
          <p key={i} className="text-xs mb-1">{i + 1}. {s.title} {"body" in s && typeof s.body === "string" && s.body}</p>)}
        <div className="flex gap-4 mt-3"><button disabled={busy} onClick={() => onReview(d)} className="text-brand-lime">Review schedule</button>
        <button disabled={busy} onClick={() => void submit(d.id)}>Return to drafts</button></div>
      </article>)}
    </div>
  </section>;
}

