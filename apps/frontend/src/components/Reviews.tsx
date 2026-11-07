"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";

export function Reviews() {
  const reviews = [
    {
      handle: "manyjjju_yaksa",
      avatar: "/images/testimonials/manyjjju_yaksa.jpg",
      url: "https://www.threads.com/@manyjjju_yaksa/post/DbqelWak7D3",
      text: `Threads fam, have you tried REERTS?
I had no clue how to look back through my old Threads posts and organize them —
this tool was a total lifesaver.
Posts, views, shares, comments — all in one place. Seriously so convenient.
Not an ad! I just love it and had to recommend it ^^
Thank you to the founder 🫶🏻💕
@reerts.com_`,
    },
    {
      handle: "oliviandtilly",
      avatar: "/images/testimonials/oliviandtilly.jpg",
      url: "https://www.threads.com/@oliviandtilly/post/DZHZLO6mMEq",
      text: `1. It's fast - the moment I set up the account and linked my threads, it shows immediately the view of when/how I've posted. No load time. it was an instant access. impressive.

2. the UX/UI is clean and simple - easy to follow for neurodivergent me!

3. being able to filter out 'unanswered only' comment is genius - not seen this before elsewhere.

I will be considering this in as a contender against meticool and buffer!`,
    },
    {
      handle: "undertow.io",
      avatar: "/images/testimonials/undertow-io.jpg",
      url: "https://www.threads.com/@undertow.io/post/DOqPRf0k-iJ",
      text: `Ever had this experience?

Logging into every SNS separately,
using another tool just to schedule,
and exporting data… only to organize it in Excel.

At some point you realize:
"Wait, I'm spending more time managing content than creating it."

…

If running SNS is draining your time and energy,
it might be worth giving reerts a try.`,
    },
    {
      handle: "wolhavest",
      avatar: "/images/testimonials/wolhavest.jpg",
      url: "https://www.threads.com/@wolhavest/post/DScainqkjwi",
      text: `This one post might change how you manage Threads.

Current Threads pain points:
1. Finding old posts is a nightmare (biggest one)
2. Manual tracking for post time & volume
3. Engagement stats hidden behind too many clicks
4. Easy to miss replies when comments pile up
5. Hard to track specific Threaders

I've been managing all this in Notion 😭
Found a site that fixes all of it.

No affiliation. Used it for a week.
Highly recommend.`,
    },
    {
      handle: "iooo_ttt",
      avatar: "/images/testimonials/iooo_ttt.jpg",
      url: "https://www.threads.com/@iooo_tttt/post/DPqPCsJEjZT",
      text: `Lately, I've been loving this Threads companion tool: REERTS.

- Supports thread-style replies in comments
- Topic tagging built in
- Schedule posts with media attached

Threads' native scheduler has been flaky for me (lost posts more than once),
but REERTS hasn't failed me a single time.

The calendar helps me post steadily,
and the analytics are solid too.

100% honest review.
No strings attached 🙂`,
    },
    {
      handle: "homebodify",
      avatar: "/images/testimonials/homebodify.jpg",
      url: "https://www.threads.com/@homebodify/post/DSCXHdFEi3x",
      text: `I'm a big fan of scheduled posts.

Even when things get busy, having posts scheduled means I never miss publishing and staying visible.

I've wanted to post on my main account too, but I wanted those posts to be more polished.

Now, with @reerts_, I can do that via scheduled LinkedIn posts.

If you want to build consistency with scheduled posts, I'd definitely recommend it.`,
    },
    {
      handle: "figuwang",
      avatar: "/images/testimonials/figuwang.jpg",
      url: "https://www.threads.com/@figuwang/post/DO9m9PACltf",
      text: `Suddenly trying out a thread tool: reerts.

After getting into VibeCoding and doing some projects, I kept thinking I should make something myself too.

But then I realized:
I use SNS a lot, so maybe I should first build a tool I actually need.

I even added “thread publishing tool” to my to-do list…
but after trying reerts, looks like I don't need to make one myself lol.`,
    },
  ];

  return (
    <section
      id="reviews"
      className="relative w-full border-t border-border bg-muted/30 py-16 sm:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center">
              <ReertsLogo iconClassName="size-8 sm:size-9 object-contain" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              User Reviews
            </h2>
          </div>
        </div>
      </div>

      {/* Infinite Horizontal Marquee Carousel */}
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex shrink-0 animate-marquee py-2 hover:[animation-play-state:paused]">
          {reviews.concat(reviews).map((rev, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[360px] mx-2 sm:mx-3"
            >
              <a
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block h-full group"
                href={rev.url}
              >
                <article className="bg-card hover:bg-primary/5 rounded-xl p-4 sm:p-5 h-[420px] sm:h-[480px] shadow-none border border-border hover:border-primary/40 transition-colors flex flex-col cursor-pointer">
                  <header className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={rev.avatar}
                        alt={rev.handle}
                        width={40}
                        height={40}
                        className="rounded-full bg-muted flex-shrink-0 object-cover size-10"
                      />
                      <cite className="font-semibold text-sm text-foreground truncate not-italic">
                        {rev.handle}
                      </cite>
                    </div>
                  </header>

                  <blockquote className="flex-1 text-muted-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-line overflow-y-auto pr-1">
                    {rev.text}
                  </blockquote>

                  <footer className="mt-auto pt-3 text-xs text-primary flex items-center gap-1 font-medium border-t border-border/40">
                    View full content
                    <ExternalLink className="size-3.5" />
                  </footer>
                </article>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
