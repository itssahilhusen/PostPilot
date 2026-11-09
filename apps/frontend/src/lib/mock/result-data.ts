export interface ResultSlide {
  id: string;
  slideNumber: number;
  totalSlides: number;
  type: string;
  tag: string;
  tagColor: string;
  handle?: string;
  heading: string;
  body?: string;
  image: string;
  brandName?: string;
  footerNote?: string;
}

export const INITIAL_RESULT_SLIDES: ResultSlide[] = [
  {
    id: "slide-1",
    slideNumber: 1,
    totalSlides: 5,
    type: "HOOK",
    tag: "The Art of Fragrance",
    tagColor: "text-brand-lime",
    heading: "Why modern niche perfumery changed everything",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-F6UzOkFjELmAn1CXQvOFzeEr7afISU3RZFzrV99PeNqt8bAxwhIwBPB1mfJMbg81rSq61g25IrxOnWO2MlfoFGw0P1djGd-WIo1YwncVWyTPm4N6CJ3FEDLMsZxLA-gsp4jDTVOY654thxYsVlp4lmBRys5n9fM96-H57EvGHiZ9U6P8iQzcMe_SVFeF1md4UW_nZ4m104jq35wn0-U0DwGlJeJiZg3y4iDtOOeP9FhgvYobkMKrQA",
  },
  {
    id: "slide-2",
    slideNumber: 2,
    totalSlides: 5,
    type: "INSIGHT",
    tag: "Extrait Signature",
    tagColor: "text-brand-lime",
    handle: "@halcyon.studio",
    heading: "The emerald emerald formula: balance over intensity",
    body: "Rare ingredients define genuine luxury. Crafting scents that last over 18 hours requires architectural heart notes rather than synthetic enhancers.",
    brandName: "Halcyon & Co",
    footerNote: "SWIPE FOR THE NOTES →",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUYjcuxw34eW8TrP39XA_fcpdWX4indPrupgU1rxfNethwhPa1rBW6m_zU5V7v3hKLWYgb6D3BN4L3RCitH34WLzNUkKtceXbuvBki6ThSutaWcnEXtAQN3BgUmQHbh7zgBSGM4kAc1BEng3zxWjAxeRXoO7tWWZKM49iHM8XQWVFcHezzIK1Zoj_u9Q18Y6Id35ft3_nxKoxkBWnCeIiVN8O0twLPkbrfumMW2uf_H8Cpulaoz5jkRg",
  },
  {
    id: "slide-3",
    slideNumber: 3,
    totalSlides: 5,
    type: "DEEP DIVE",
    tag: "Amber & Silk",
    tagColor: "text-amber-400",
    heading: "The secret alchemy behind golden resin amber",
    body: "Liquid warmth captured in hand-blown crystal flacons.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFmpdd3keqIE6YVOPoaEmf20KHYUyMO9W7or1J0xoeNYeTzM5o3SOVcfSqZPRAZLyw62sEhdKei6cYORzW9Ziqc7YHJzT6kglLZLX-5adEsJf-LcfIlHH1POn-oUfQnTD72X1pP4a4Pi01450a0op5BQiw_BobW-OpOZnKZa5aUeZl9ykbOlCoJnJUL40ikIOYB9ubpTarrA5aKjMRO7mMIZ1T5iPiQlEhtVgeic8hCdEz7jdZAwBb7w",
  },
  {
    id: "slide-4",
    slideNumber: 4,
    totalSlides: 5,
    type: "MINIMALIST",
    tag: "Porcelain Line",
    tagColor: "text-neutral-400",
    heading: "Tactile flacons and timeless stone aesthetics",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbqYWMN_1KdiFnIL8BcB2K5w2qtk_CQjAN37ac2n98bqv96wyJDif9HK0lI2Cu9_75J45bLp58a7nopGozI9Y_20egkMslg2GNEJhDCNNakKnVFBoBFU72wc6-va3eMMONVYz8jUEHSf3Svrsvcls78d0qO8ip4rVCWQXfv_63xh-skOQOp8OSzOkeq9xkN_37pGqhkgiK9d-PMAtVKd0WP-IrNMn04gVZbstUzwFANsKESU9L2OjLqQ",
  },
  {
    id: "slide-5",
    slideNumber: 5,
    totalSlides: 5,
    type: "CALL TO ACT",
    tag: "Final Hook",
    tagColor: "text-pink-400",
    heading: "Save this guide to master luxury curation",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4SIqWZKquIYqoJ95Z0cPWzN06gD5dRk3euf99hpD9VptN0BYK6v9DPzOrci4tDDfT7rn9gGNv_EotMr7SH10Yb3PdVaZo560npv7qcJm9JTNdkzUPPMv1PQEElnmWKxieL4a7G4-ueP1eQbfcFd4SBdGvOJ7_RRJ0BUgMjGK57T-K2hObndW7yNkEddckPwcFW9Y3zVEKmhTLDoTOz2OFSfOEnPbQCpdaxLXnhe6KYcZoFDPT6JAiMg",
  },
];

