"use client";

import React, { useEffect } from "react";

export default function SwiperaLanding() {
  useEffect(() => {
    // Initialize Swipera window.APP config
    if (typeof window !== "undefined") {
      (window as any).APP = {
        name: "Swipera",
        handle: "",
        url: "https://swipera.io",
        tagline: "넘기면, 팔로우.",
        taglineEn: "Every swipe, a follow.",
        lang: "en",
      };
    }

    // Ensure body allows natural page scrolling and sticky navigation
    document.body.classList.add("lang-en");
    document.body.classList.remove("studio-mode");
    document.documentElement.classList.remove("studio-mode");
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";
    document.body.style.overflowY = "visible";
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowY = "auto";

    // Helper to load scripts sequentially and safely
    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement;
        if (existing) {
          if (existing.dataset.loaded === "true") {
            return resolve();
          }
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", (e) => reject(e), { once: true });
          return;
        }
        const s = document.createElement("script");
        s.id = id;
        s.src = src;
        s.async = false;
        s.onload = () => {
          s.dataset.loaded = "true";
          resolve();
        };
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    };

    // Load templates, platforms, landing, landing-fx in sequence
    (async () => {
      try {
        await loadScript("/swipera/templates.js", "sw-tpl-js");
        await loadScript("/swipera/platforms.js", "sw-plt-js");
        await loadScript("/swipera/landing.js", "sw-lnd-js");
        await loadScript("/swipera/landing-fx.js", "sw-fx-js");
      } catch (err) {
        console.error("Swipera script load error:", err);
      }
    })();

    return () => {
      document.body.classList.remove("lang-en");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/swipera/templates.css" />
      <link rel="stylesheet" href="/swipera/landing.css" />
      <div className="swipera-wrapper" style={{ minHeight: "100vh", position: "relative" }}>
      <a className="skip" href="#try">
        Skip to content
      </a>

      {/* ============ BETA BAR ============ */}
      <div className="beta-bar" id="beta-bar">
        <span className="mono">OPEN BETA</span>
        Everything is free during beta · only a small logo in the card corner
      </div>

      {/* ============ NAVIGATION ============ */}
      <header className="nav" id="nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <a className="logo" href="/">
          <span className="mark">S</span>
          <span className="word">Swipera</span>
        </a>
        <nav className="nav-links" aria-label="Main menu">
          <a href="#how">How it works</a>
          <a href="#ba">Examples</a>
          <a href="#styles">Styles</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="/guide">
            Guides{" "}
            <span className="mono" style={{ fontSize: "9px", opacity: 0.6 }}>
              KO
            </span>
          </a>
        </nav>
        <div className="nav-cta">
          <a
            className="lang-sw mono"
            href="/?lang=ko"
            id="lang-sw"
            title="한국어로 보기"
            aria-label="Switch to Korean"
          >
            <i className="fas fa-globe"></i> KO
          </a>
          <a className="btn ghost" href="/studio?lang=en" data-login>
            Log in
          </a>
          <a className="btn solid" href="/studio?lang=en#try">
            Try with my text
          </a>
        </div>
      </header>

      {/* ============ SCROLL PROGRESS & CURSOR TAG ============ */}
      <div className="progress" id="progress" aria-hidden="true"></div>
      <div className="cursor-tag mono" id="cursor-tag" aria-hidden="true">
        DRAG ↔
      </div>

      <main>
        {/* ============ HERO SECTION ============ */}
        <section className="hero" id="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="kicker mono">
                <span className="dot"></span> AI carousel maker · no sign-up · free
              </p>
              <h1 className="h-display">
                Paste your text.
                <br />
                <mark>Carousel done.</mark>
              </h1>
              <p className="lede">
                Drop in a blog post, notes or an article link.
                <br />A minute later you have an <strong>AI carousel</strong> ready for
                Instagram, Threads and LinkedIn.
              </p>
              <div className="hero-cta2">
                <a className="btn solid big" href="#try" id="cta-paste">
                  <i className="fas fa-wand-magic-sparkles"></i> Try with my text
                </a>
                <span className="or">OR</span>
                <a className="btn big" href="#ba" id="cta-sample">
                  <i className="fas fa-eye"></i> See finished examples
                </a>
              </div>
              <form
                className="try"
                id="try"
                action="/studio"
                method="get"
                autoComplete="off"
              >
                <label className="mono" htmlFor="try-text">
                  01 — Paste here
                </label>
                <textarea
                  id="try-text"
                  name="q"
                  rows={5}
                  placeholder="e.g. 5 morning habits for busy professionals – a glass of water right after waking, 10 minutes of stretching, write down 3 priorities, no phone for 30 minutes, a protein breakfast. Small habits change the whole day."
                ></textarea>
                <div className="try-row">
                  <div
                    className="pf-row"
                    role="radiogroup"
                    aria-label="Platform"
                    id="try-pf"
                  >
                    <button
                      type="button"
                      className="pf active"
                      role="radio"
                      data-pf="instagram"
                      aria-label="Instagram"
                      title="Instagram"
                      aria-checked="true"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </button>
                    <button
                      type="button"
                      className="pf"
                      role="radio"
                      data-pf="threads"
                      aria-label="Threads"
                      title="Threads"
                      aria-checked="false"
                    >
                      <i className="fa-brands fa-threads"></i>
                    </button>
                    <button
                      type="button"
                      className="pf"
                      role="radio"
                      data-pf="linkedin"
                      aria-label="LinkedIn"
                      title="LinkedIn"
                      aria-checked="false"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </button>
                    <button
                      type="button"
                      className="pf"
                      role="radio"
                      data-pf="tiktok"
                      aria-label="TikTok"
                      title="TikTok"
                      aria-checked="false"
                    >
                      <i className="fa-brands fa-tiktok"></i>
                    </button>
                    <button
                      type="button"
                      className="pf"
                      role="radio"
                      data-pf="facebook"
                      aria-label="Facebook"
                      title="Facebook"
                      aria-checked="false"
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </button>
                    <button
                      type="button"
                      className="pf"
                      role="radio"
                      data-pf="x"
                      aria-label="X"
                      title="X"
                      aria-checked="false"
                    >
                      <i className="fa-brands fa-x-twitter"></i>
                    </button>
                  </div>
                  <input type="hidden" name="pf" id="try-pf-val" value="instagram" />
                  <input type="hidden" name="lang" value="en" />
                  <button className="btn solid big" type="submit" id="try-go">
                    <i className="fas fa-wand-magic-sparkles"></i> Try with my text
                  </button>
                </div>
                <p className="fine">
                  A short note is fine. No account needed — we ask for an email once,
                  only when you export.{" "}
                  <span className="badge-free">
                    <i className="fas fa-check"></i> Free in beta
                  </span>
                </p>
                <button type="button" className="link mono" id="try-sample">
                  Fill with a sample →
                </button>
              </form>
            </div>
            <div
              className="hero-stage has-video mode-video"
              id="hero-stage"
              tabIndex={0}
              aria-label="Swipera promo video and live preview deck"
            >
              <figure
                className="hero-video"
                id="hero-video"
                data-base="/swipera/hero-promo-"
                data-v="4.16.0"
              >
                <video
                  id="hero-vid"
                  muted
                  playsInline
                  loop
                  preload="none"
                  disablePictureInPicture
                  poster="/swipera/hero-promo-poster.webp"
                  aria-label="30-second Swipera promo — one text, 28 styles, carousels for six platforms"
                ></video>
                <button
                  type="button"
                  className="hv-play"
                  id="hero-play"
                  aria-label="Play promo video"
                  hidden
                >
                  <i className="fas fa-play"></i>
                </button>
                <button
                  type="button"
                  className="hv-sound mono"
                  id="hero-sound"
                  aria-pressed="false"
                >
                  <i className="fas fa-volume-xmark"></i> <span>Sound on</span>
                </button>
              </figure>
              <button
                type="button"
                className="sticker mode mono"
                id="hero-mode"
                aria-controls="hero-stack"
              >
                <span className="m-deck">Swipe the cards yourself →</span>
                <span className="m-video">
                  <i className="fas fa-play"></i> Watch the promo
                </span>
              </button>
              <div className="stack" id="hero-stack"></div>
              <button type="button" className="sticker lime" id="hero-swipe">
                SWIPE →
              </button>
              <div className="sticker ink mono" id="hero-ratio">
                4:5 · 1080×1350
              </div>
              <div className="sticker live mono" id="hero-live">
                <span className="dot"></span> drawing from your text
              </div>
              <div className="hint-l mono" aria-hidden="true">
                ← prev
              </div>
              <div className="hint-r mono" aria-hidden="true">
                next →
              </div>
            </div>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="track">
              <span>INSTAGRAM</span>
              <span>THREADS</span>
              <span>LINKEDIN</span>
              <span>TIKTOK</span>
              <span>FACEBOOK</span>
              <span>X</span>
              <span>Every swipe, a follow.</span>
              <span>INSTAGRAM</span>
              <span>THREADS</span>
              <span>LINKEDIN</span>
              <span>TIKTOK</span>
              <span>FACEBOOK</span>
              <span>X</span>
              <span>Every swipe, a follow.</span>
            </div>
          </div>
        </section>

        {/* ============ PROOF STRIP ============ */}
        <section className="strip">
          <div className="cell">
            <b className="h-display count" data-to="28">
              28
            </b>
            <span>templates</span>
          </div>
          <div className="cell">
            <b className="h-display count" data-to="6">
              6
            </b>
            <span>platform presets</span>
          </div>
          <div className="cell">
            <b className="h-display">
              <span className="count" data-to="20" data-prefix="~">
                ~20
              </span>
              <small>s</small>
            </b>
            <span>average generation</span>
          </div>
          <div className="cell">
            <b className="h-display">0</b>
            <span>sign-ups · credit cards</span>
          </div>
        </section>

        {/* ============ DEFINITION (AEO) ============ */}
        <section className="define" id="what" aria-labelledby="what-h">
          <div className="define-grid">
            <div>
              <span className="mono">01 — In one line</span>
              <h2 id="what-h" className="h-display">
                What is an AI carousel maker?
              </h2>
              <p className="define-sub">
                Carousel, slide post, card news — different names, one way to make them:
                start from the text.
              </p>
            </div>
            <div className="define-body">
              <p>
                An <strong>AI carousel maker</strong> takes a piece of text and turns
                it into a multi-slide social post — picking the hook, splitting the
                content and laying it out on a template. Swipera does it from blog
                posts, notes, article links and PDFs, and hands you carousels plus
                captions for Instagram, Threads and LinkedIn{" "}
                <strong>in about a minute</strong>.
              </p>
              <ul className="define-facts">
                <li>
                  <b>28</b> templates × 4 color schemes
                </li>
                <li>
                  <b>6</b> platform presets (IG 4:5 PNG · LinkedIn PDF · TikTok 9:16)
                </li>
                <li>
                  <b>Auto-fit</b> — long text never spills off the card
                </li>
                <li>
                  <b>No sign-up</b> · free in beta · commercial use OK · never used for
                  training
                </li>
              </ul>
              <p className="define-links mono">
                <a href="#styles">Carousel vs card news</a> ·{" "}
                <a href="#platforms">Instagram carousel size</a> ·{" "}
                <a href="#platforms">LinkedIn carousel PDF</a> ·{" "}
                <span className="dim">guides are in Korean for now</span>
              </p>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="how" id="how">
          <div className="sec-head">
            <span className="mono">02 — How it works</span>
            <h2 className="h-display">
              Paste. Pick.
              <br />
              Post.
            </h2>
            <p className="lede">
              You wrote the blog post; there is nothing to put on Instagram. Three steps.
            </p>
          </div>
          <ol className="steps steps-3">
            <li>
              <span className="num mono">01</span>
              <h3>Paste</h3>
              <p>Notes, blog posts, article links, even PDFs. A short note is fine.</p>
            </li>
            <li>
              <span className="num mono">02</span>
              <h3>Pick a style</h3>
              <p>
                Tap one of 28 templates and every card restyles at once. Long text never
                spills off the card.
              </p>
            </li>
            <li>
              <span className="num mono">03</span>
              <h3>Export and post</h3>
              <p>
                Instagram and Threads get 4:5 PNGs, LinkedIn gets a PDF. The right
                format is pre-selected for each platform.
              </p>
            </li>
          </ol>
        </section>

        {/* ============ BEFORE / AFTER ============ */}
        <section className="ba" id="ba">
          <div className="sec-head">
            <span className="mono">03 — Before → after</span>
            <h2 className="h-display">
              This text
              <br />
              becomes this.
            </h2>
            <p className="lede">
              Left: what you pasted. Right: the finished cards. Headline, key lines,
              caption and hashtags — all in one go.
            </p>
          </div>
          <div className="ba-tabs" id="ba-tabs" role="tablist">
            <button className="bt on" role="tab" data-ba="cafe">
              <i className="fas fa-mug-hot"></i> Café owner's notice
            </button>
            <button className="bt" role="tab" data-ba="creator">
              <i className="fas fa-lightbulb"></i> Educational creator
            </button>
            <button className="bt" role="tab" data-ba="marketer">
              <i className="fas fa-bullhorn"></i> Marketer's product launch
            </button>
          </div>
          <div className="ba-grid">
            <div className="ba-src" id="ba-src">
              <span className="tag">BEFORE · source</span>
            </div>
            <div className="ba-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="ba-out" id="ba-out"></div>
          </div>
          <div className="ba-cap">
            <span className="pill">Headline</span>
            <span className="pill">Split into slides</span>
            <span className="pill">Fit the text</span>
            <span className="pill l">Caption + hashtags</span>
            <a
              className="btn solid"
              href="/studio?lang=en#try"
              style={{ marginLeft: "8px" }}
            >
              Try with my text
            </a>
          </div>
        </section>

        {/* ============ WHY IT WORKS ============ */}
        <section className="why" id="why">
          <div className="sec-head">
            <span className="mono">04 — Why people swipe to the end</span>
            <h2 className="h-display">
              First slide stops the scroll.
              <br />
              Last slide earns the save.
            </h2>
            <p className="lede">
              Carousels are read by swipe rhythm, not paragraph order. Swipera
              restructures your text to match.
            </p>
          </div>
          <div className="why-grid">
            <article className="wy rv">
              <span className="wn mono">Slide 1</span>
              <h3>A first slide that stops the thumb</h3>
              <p>
                We pick the single most curiosity-raising line as the headline. If there
                is a number, it goes first.
              </p>
              <span className="ex">
                e.g. &quot;5 morning habits for professionals&quot; →{" "}
                <b>Morning habits: just 5</b>
              </span>
            </article>
            <article className="wy rv">
              <span className="wn mono">Slides 2–N</span>
              <h3>One message per slide</h3>
              <p>
                Paragraphs and lists are split so every slide says one thing. Slides
                that run long get trimmed or rewritten.
              </p>
              <span className="ex">e.g. a 5-item list → 3 + 2 across two slides</span>
            </article>
            <article className="wy rv">
              <span className="wn mono">Last slide</span>
              <h3>An ending that asks for the save</h3>
              <p>
                One line of summary, one line of action. Caption and hashtags are
                written in the same tone.
              </p>
              <span className="ex">
                e.g. <b>Save this for tomorrow morning</b> · pick one and try it today
              </span>
            </article>
          </div>
          <p className="why-note mono">
            Nothing is invented beyond your text · your input is never used to train AI
          </p>
        </section>

        {/* ============ STYLES RAIL ============ */}
        <section className="styles" id="styles">
          <div className="sec-head">
            <span className="mono">05 — Styles</span>
            <h2 className="h-display">
              Doesn't look AI-made.
              <br />
              Looks like you.
            </h2>
            <p className="lede">
              These are real templates rendering live, not screenshots. Layouts hold
              when the text length changes. Add a logo and colors and it becomes your
              brand template.
            </p>
          </div>
          <div className="style-rail" id="style-rail"></div>
          <div className="style-ctl">
            <button className="btn ghost" id="style-prev" aria-label="Previous">
              <i className="fas fa-arrow-left"></i>
            </button>
            <button className="btn ghost" id="style-next" aria-label="Next">
              <i className="fas fa-arrow-right"></i>
            </button>
            <a className="btn solid" href="/studio?lang=en#try">
              Try with my text
            </a>
          </div>
        </section>

        {/* ============ PLATFORMS ============ */}
        <section className="platforms" id="platforms">
          <div className="sec-head">
            <span className="mono">06 — Platforms</span>
            <h2 className="h-display">
              Write once,
              <br />
              post in six places.
            </h2>
            <p className="lede">
              Instagram wants 4:5 PNGs, LinkedIn wants a PDF, Threads 1:1 — every
              platform has its own specs. Pick one and we match them.
            </p>
          </div>
          <div className="pf-grid" id="pf-grid"></div>
        </section>

        {/* ============ USE CASES ============ */}
        <section className="usecases" id="usecases">
          <div className="sec-head">
            <span className="mono">07 — Who uses it</span>
            <h2 className="h-display">
              Marketers, shop owners,
              <br />
              coaches — one minute each.
            </h2>
            <p className="lede">
              Every role writes a different kind of text. The cards below are those texts
              rendered in real styles. We will swap in real testimonials after beta.
            </p>
          </div>
          <div className="uc-grid" id="uc-grid"></div>
        </section>

        {/* ============ FIT DEMO ============ */}
        <section className="fit" id="fit">
          <div className="fit-grid">
            <div className="sec-head">
              <span className="mono">08 — Long text</span>
              <h2 className="h-display">
                Never spills
                <br />
                off the card.
              </h2>
              <p className="lede">
                However long the text, it stays inside the card. Overflowing slides are
                trimmed or rewritten by AI. Same when you switch ratio or platform.
              </p>
              <ul className="ticks">
                <li>Font size auto-adjusts to the card</li>
                <li>Shorter · fit · longer</li>
                <li>Fix only the overflowing slides in one click</li>
              </ul>
              <div className="fit-ctl">
                <label className="mono" htmlFor="fit-amt">
                  Drag the amount of text <b id="fit-chars"></b>
                </label>
                <input
                  type="range"
                  id="fit-amt"
                  min={1}
                  max={8}
                  defaultValue={6}
                  step={1}
                />
                <p className="fit-state" id="fit-state" aria-live="polite"></p>
              </div>
            </div>
            <div className="fit-demo" id="fit-demo" aria-hidden="true"></div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section className="pricing" id="pricing">
          <div className="sec-head">
            <span className="mono">09 — Pricing</span>
            <h2 className="h-display">
              Free for the whole
              <br />
              beta.
            </h2>
            <p className="lede">
              Right now everything works without an account. Paid plans will be
              announced after beta, and anyone who signs up during beta gets
              early-bird pricing first.
            </p>
          </div>
          <div
            className="price-table"
            role="region"
            aria-label="Plan comparison"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <span className="plan">Now · beta</span>
                    <b>Free</b>
                  </th>
                  <th>
                    <span className="plan">After beta · Free</span>
                    <b>$0</b>
                  </th>
                  <th className="hot">
                    <span className="plan">After beta · Pro</span>
                    <b>Coming soon</b>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Carousels</td>
                  <td>Unlimited</td>
                  <td>Monthly free quota</td>
                  <td>Generous</td>
                </tr>
                <tr>
                  <td>28 styles · your brand template</td>
                  <td>All</td>
                  <td>All</td>
                  <td>All + new styles first</td>
                </tr>
                <tr>
                  <td>PNG · PDF export</td>
                  <td>High-res 2x</td>
                  <td>Standard</td>
                  <td>High-res 2x</td>
                </tr>
                <tr>
                  <td>Watermark</td>
                  <td>Small logo</td>
                  <td>Small logo</td>
                  <td>
                    <b>None</b>
                  </td>
                </tr>
                <tr>
                  <td>Account</td>
                  <td>Not needed</td>
                  <td>Email</td>
                  <td>Email</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="price-note">
            Exact prices will be emailed before beta ends. Everything you made during
            beta stays yours.
          </p>
        </section>

        {/* ============ TRUST & TESTIMONIALS ============ */}
        <section className="trust" id="trust">
          <div className="sec-head">
            <span className="mono">10 — Early users</span>
            <h2 className="h-display">
              Posting weekly,
              <br />
              no designer needed.
            </h2>
            <p className="lede">Quotes from beta user interviews.</p>
          </div>
          <div className="quotes">
            <article className="q rv">
              <span className="role">Startup marketer</span>
              <h3>&quot;Pasted the meeting notes, posted before lunch.&quot;</h3>
              <p>
                The caption and hashtags come out together, so it&#39;s copy-paste. Not
                having to wait in the designer queue is the biggest thing.
              </p>
              <span className="who">K. · B2B SaaS</span>
            </article>
            <article className="q rv">
              <span className="role">Solo e-commerce owner</span>
              <h3>&quot;My product page text, straight into cards.&quot;</h3>
              <p>
                Drop in the product description and it pulls the key points into 4
                slides. Same post goes to Instagram and Threads at once.
              </p>
              <span className="who">P. · home &amp; living brand</span>
            </article>
            <article className="q rv">
              <span className="role">Instructor · coach</span>
              <h3>&quot;My lecture notes became a LinkedIn carousel.&quot;</h3>
              <p>
                It exports straight to PDF, so posting as a LinkedIn document is easy.
                The text never overflowing still surprises me.
              </p>
              <span className="who">L. · career coach</span>
            </article>
          </div>
          <p className="trust-note">* Excerpts from beta interviews · names withheld</p>
        </section>

        {/* ============ FAQ ============ */}
        <section className="faq" id="faq">
          <div className="sec-head">
            <span className="mono">11 — FAQ</span>
            <h2 className="h-display">Good questions</h2>
          </div>
          <details>
            <summary>What is an AI carousel maker?</summary>
            <p>
              An AI carousel maker takes a piece of text and automatically turns it into
              a multi-slide social post — picking the hook, splitting the content
              across slides and laying it out on a template. Swipera does this for
              Instagram, Threads, LinkedIn and TikTok in about a minute, from blog
              posts, notes, article links or PDFs.
            </p>
          </details>
          <details>
            <summary>Do I need an account?</summary>
            <p>
              No. Generating, styling, editing and exporting all work without an
              account. We ask for an email once, right before export — and you can skip
              it.
            </p>
          </details>
          <details>
            <summary>Is it free? How much will it cost later?</summary>
            <p>
              Everything is free and unlimited during the open beta. Paid plans will be
              announced after beta, and people who left an email during beta get
              early-bird pricing first.
            </p>
          </details>
          <details>
            <summary>What size should an Instagram carousel be?</summary>
            <p>
              Portrait 4:5 (1080×1350 px) is recommended — it takes up the most feed
              space. Square 1:1 (1080×1080 px) is also supported. Pick Instagram in
              Swipera and 4:5 is selected by default.
            </p>
          </details>
          <details>
            <summary>How do LinkedIn carousels work?</summary>
            <p>
              LinkedIn carousels are PDF documents, not multiple images. Choose LinkedIn
              in Swipera and the export is a single PDF you upload with &quot;Add a
              document&quot; in the post composer.
            </p>
          </details>
          <details>
            <summary>Can I use the carousels commercially?</summary>
            <p>
              Yes — personal, business and client work are all fine. Everything you make
              is yours. Built-in fonts and templates are licensed for commercial use;
              you must hold the rights to any photos or text you upload.
            </p>
          </details>
          <details>
            <summary>Will the AI make things up?</summary>
            <p>
              It only selects and rewrites what is in your text; it does not invent
              facts or numbers. Wording may change during summarization, so skim the
              result before posting.
            </p>
          </details>
          <details>
            <summary>Is my text used to train AI?</summary>
            <p>
              No. Your input is used only to produce your result and is never used for
              model training.
            </p>
          </details>
          <details>
            <summary>Can I edit what the AI produces?</summary>
            <p>
              Of course. Click any text on a card to edit it, and change template,
              colors, layout and images.
            </p>
          </details>
          <details>
            <summary>Does it work on mobile?</summary>
            <p>
              Yes. Paste, generate and export all work in a phone browser. Leave an
              email and you can start on your phone and finish on desktop.
            </p>
          </details>
          <details>
            <summary>What file formats do I get?</summary>
            <p>
              PNG (ZIP for multiple slides), PDF, or a single PNG. Choosing a
              platform pre-selects the recommended format — LinkedIn carousels export as
              PDF.
            </p>
          </details>
          <details>
            <summary>How do I remove the watermark?</summary>
            <p>
              During beta every card carries a small logo in the corner. After beta the
              Pro plan removes it.
            </p>
          </details>
          <details>
            <summary>Can it match my brand style?</summary>
            <p>
              Upload a reference image and Swipera reads its layout, colors and type to
              save a template of your own. After that you only change the text.
            </p>
          </details>
        </section>

        {/* ============ SUPPORT ============ */}
        <section className="support" id="support">
          <div className="sec-head">
            <span className="mono">12 — Need help?</span>
            <h2 className="h-display">Stuck? Just ask.</h2>
          </div>
          <div className="support-grid">
            <a className="sp rv" href="/studio?lang=en#try">
              <i className="fas fa-robot"></i>
              <h3>AI notice · copyright</h3>
              <p>
                Commercial use is allowed. Your input is never used for training. (English
                summary)
              </p>
            </a>
            <a className="sp rv" href="/studio?lang=en#try">
              <i className="fas fa-circle-play"></i>
              <h3>3-minute start</h3>
              <p>Open the studio and hit the sample button to see the whole flow instantly.</p>
            </a>
            <a className="sp rv" href="mailto:hello@swipera.io">
              <i className="fas fa-envelope"></i>
              <h3>Email us</h3>
              <p>hello@swipera.io · we reply within a day during beta.</p>
            </a>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="final">
          <h2 className="h-display">Every swipe, a follow.</h2>
          <p className="lede">Paste your text. Carousel done.</p>
          <a className="btn solid big mag" href="/studio?lang=en#try">
            <i className="fas fa-wand-magic-sparkles"></i> Try with my text
          </a>
          <p className="mono" style={{ margin: 0, opacity: 0.7 }}>
            Free in beta · no sign-up · small logo only
          </p>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="foot">
        <div className="foot-top">
          <div>
            <span className="mark small">S</span> <b>Swipera</b>{" "}
            <span className="mono">
              · AI carousel maker · Every swipe, a follow.
            </span>
          </div>
          <nav>
            <a href="#how">How it works</a>
            <a href="#ba">Examples</a>
            <a href="#styles">Styles</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:hello@swipera.io">Contact</a>
            <a href="/studio?lang=en">Studio</a>
            <a href="/?lang=ko" className="mono">
              한국어
            </a>
          </nav>
        </div>
        <div className="foot-biz" id="foot-biz">
          <div className="biz-pending">
            <span className="mono">Business details · coming soon</span>
            <p>
              Swipera is in <b>open beta</b> and does not offer paid plans yet. Company
              registration details will appear here once registered. Contact:{" "}
              <a href="mailto:hello@swipera.io">hello@swipera.io</a>
            </p>
          </div>
          <p className="copy">© 2026 Swipera. All rights reserved.</p>
        </div>
      </footer>

      {/* ============ FLOATING HELP ACTION BUTTON ============ */}
      <a
        className="help-fab"
        href="mailto:hello@swipera.io"
        id="help-fab"
        aria-label="Help · contact"
      >
        <i className="fas fa-comment-dots"></i>
        <span>Help · contact</span>
      </a>
    </div>
    </>
  );
}
