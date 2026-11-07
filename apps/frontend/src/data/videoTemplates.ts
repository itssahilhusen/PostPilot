export interface VideoTemplate {
  id: string;
  name: string;
  internalName?: string;
  group: 'face' | 'faceless' | 'pack';
  input: 'talking-head' | 'faceless' | 'face' | 'either';
  aspect: '9:16' | '16:9' | '1:1';
  length: string;
  pitch: string;
  bestFor?: string;
  tags: string[];
  order?: number;
  preview: string;
  previewSound: string;
  poster: string;
  available?: boolean;
  comingSoon?: boolean;
  pickerTags?: string[];
  styleId?: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: {
    accent: string;
    accentHi: string;
    accent2: string;
    bg: string;
    panel: string;
    panel2: string;
    ink: string;
    dim: string;
    line: string;
  };
}

export interface FontPreset {
  id: string;
  name: string;
  display: string;
  body: string;
  serif: string;
  mono?: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export interface BrandKitSettings {
  id?: string;
  accent?: string;
  accentHi?: string;
  accent2?: string;
  bg?: string;
  panel?: string;
  panel2?: string;
  ink?: string;
  dim?: string;
  line?: string;
  font?: {
    display?: string;
    body?: string;
    serif?: string;
    mono?: string;
  };
  motion?: {
    tempo?: number;
    intensity?: number;
  };
  caption?: {
    style?: 'word' | 'line' | 'karaoke' | 'none';
    size?: number;
    y?: number;
    case?: 'natural' | 'upper';
    box?: boolean;
  };
  speed?: 1 | 1.1 | 1.2 | 1.3;
  motionTempo?: number;
  motionIntensity?: number;
  captionStyle?: 'word' | 'line' | 'karaoke' | 'none';
  music?: {
    on: boolean;
    volume: number;
  };
  sfx?: {
    on: boolean;
    volume: number;
  };
  hook?: {
    mode: 'auto' | 'cold_open' | 'none';
  };
  visualsPreference?: 'real_first' | 'balanced' | 'graphics_first';
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    "id": "classified-yt",
    "name": "Glitch",
    "internalName": "Kallaway Marketing Classified YT",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "40-70 s",
    "pitch": "Your face on the bottom half, dense hand-built motion graphics up top. The split-screen look of the big tech-explainer channels.",
    "bestFor": "Tech & AI explainers with your face",
    "tags": [
      "split-screen",
      "motion graphics",
      "explainer",
      "tech",
      "captions",
      "music + sfx"
    ],
    "preview": "https://makerzz.space/showcase/face/classified-yt/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/face/classified-yt/sound.mp4",
    "poster": "https://makerzz.space/showcase/face/classified-yt/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending",
      "polished"
    ],
    "order": 1
  },
  {
    "id": "limeslides",
    "name": "Lime Slides",
    "internalName": "Animation pack: limeslides",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Acid-lime brand world built around you: you're cut out onto lime with rings spinning behind your head, lime panels drop over the frame, and a new drawn visual lands every 1–2 s – posts, charts, logos, calendars, phones.",
    "bestFor": "Brand slides · Acid lime",
    "tags": [
      "brand slides",
      "acid lime",
      "education",
      "talking head",
      "screenshot grid"
    ],
    "preview": "https://makerzz.space/showcase/packs/limeslides/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/limeslides/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/limeslides/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 2
  },
  {
    "id": "cap-forest",
    "name": "Forest Edit",
    "internalName": "Animation pack: cap-forest",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The editorial creator edit: forest-green title zone with words rolling up letter by letter behind your head (condensed serif caps, heavy grotesk with a running timecode, italic serif with a gold word), serif captions in a dark-green box that light up as you speak, a prompt card that types, floating photo cards, a flip counter and a before / after wipe.",
    "bestFor": "Captions · Editorial",
    "tags": [
      "captions",
      "editorial",
      "serif",
      "forest green",
      "magazine",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-forest/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-forest/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-forest/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "minimal"
    ],
    "order": 3
  },
  {
    "id": "cap-paper",
    "name": "Paper Studio",
    "internalName": "Animation pack: cap-paper",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The design-studio edit: cream grid paper where your take lives in sharp cards that glide between card, full bleed and top strip, mono metadata on the edges, heavy black headers with 01 / 04 numbers, a yellow dot accent, karaoke captions, tiles that build in a grid, a counter with tint flashes, keyframe tracks and a typed comment box at the end.",
    "bestFor": "Captions · Design system",
    "tags": [
      "captions",
      "design system",
      "paper",
      "editorial",
      "fast",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-paper/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-paper/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-paper/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 4
  },
  {
    "id": "fmt-countdown",
    "name": "Rank Rush",
    "internalName": "Animation pack: fmt-countdown",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Top-5 countdown with impact: every rank smashes in as a giant numeral over a drawn visual of the thing itself (apps, sites, AI creators, charts), yellow-on-black hype with you live in the corner.",
    "bestFor": "Countdown · Top 5",
    "tags": [
      "countdown",
      "top 5",
      "ranking",
      "list",
      "hype",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-countdown/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-countdown/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-countdown/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 5
  },
  {
    "id": "split-act",
    "name": "Three Act",
    "internalName": "Animation pack: split-act",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Rapid-fire acts: you full screen, then a drawn product visual on every line (UI, 3D site, chart, lesson grid), each slammed in by a magenta shutter, about one a second.",
    "bestFor": "Rhythm · Shutter transition",
    "tags": [
      "rhythm",
      "shutter transition",
      "magenta",
      "bold",
      "condensed"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-act/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-act/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-act/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 6
  },
  {
    "id": "kinetic",
    "name": "Kinetic Type",
    "internalName": "Animation pack: kinetic",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Your words become the visuals: huge type slams, scales and stacks on every beat, with hard masked reveals.",
    "bestFor": "Kinetic typography · Bold",
    "tags": [
      "kinetic typography",
      "bold",
      "high energy",
      "words on the beat"
    ],
    "preview": "https://makerzz.space/showcase/packs/kinetic/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/kinetic/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/kinetic/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending",
      "bold"
    ],
    "order": 7
  },
  {
    "id": "frame-sketch",
    "name": "Sketchbook",
    "internalName": "Animation pack: frame-sketch",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A living sketchbook: you become a pencil drawing on warm paper and colour only comes back inside hand-drawn windows, every line boils, points are ticked, circled and hatched in blue and red pencil.",
    "bestFor": "Sketch · Pencil",
    "tags": [
      "sketch",
      "pencil",
      "hand-drawn",
      "teaching"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-sketch/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-sketch/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-sketch/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 8
  },
  {
    "id": "frame-dossier",
    "name": "Case File",
    "internalName": "Animation pack: frame-dossier",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Investigative documentary: you shrink into a small framed monitor on a newsprint page and zoom back in, typed archive cards, yellow highlighter, red pencil circles and red string between the evidence.",
    "bestFor": "Documentary · Case file",
    "tags": [
      "documentary",
      "case file",
      "newsprint",
      "zoom window"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-dossier/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-dossier/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-dossier/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 9
  },
  {
    "id": "swiss",
    "name": "Swiss Grid",
    "internalName": "Animation pack: swiss",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Minimal International Style: strict grid, giant numerals, hairline rules and clean wipes in red, black and white.",
    "bestFor": "Minimal · Swiss",
    "tags": [
      "minimal",
      "swiss",
      "editorial",
      "clean",
      "typographic"
    ],
    "preview": "https://makerzz.space/showcase/packs/swiss/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/swiss/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/swiss/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "minimal",
      "polished"
    ],
    "order": 10
  },
  {
    "id": "collage",
    "name": "Paper Collage",
    "internalName": "Animation pack: collage",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Handmade cut-outs: torn paper, tape, stickers and hand-drawn arrows that jitter like stop-motion.",
    "bestFor": "Collage · Handmade",
    "tags": [
      "collage",
      "handmade",
      "paper",
      "stop-motion",
      "playful"
    ],
    "preview": "https://makerzz.space/showcase/packs/collage/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/collage/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/collage/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 11
  },
  {
    "id": "kallaway-broll",
    "name": "Graphics First",
    "internalName": "Piyush Kallaway Marketing",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "45-65 s",
    "pitch": "Graphics take the whole stage and your face drops in as a small card every ~10 s. Built for fast, information-dense explainers.",
    "bestFor": "Fast explainers, works with AI avatars",
    "tags": [
      "avatar card",
      "motion graphics",
      "explainer",
      "type-on titles",
      "works with AI avatars"
    ],
    "preview": "https://makerzz.space/showcase/face/kallaway-broll/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/face/kallaway-broll/sound.mp4",
    "poster": "https://makerzz.space/showcase/face/kallaway-broll/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending",
      "bold"
    ],
    "order": 12
  },
  {
    "id": "splitstack",
    "name": "Split Stack",
    "internalName": "Split stack tool explainer (reference family B)",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-60 s",
    "pitch": "Real pages and proof in a clean browser card on top, your face below, one word at a time on the seam. The forest-and-mint tool-explainer split.",
    "bestFor": "Tool & repo explainers with your face",
    "tags": [
      "split-screen",
      "real pages",
      "forest and mint"
    ],
    "preview": "https://makerzz.space/showcase/packs/splitstack/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/splitstack/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/splitstack/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "minimal"
    ],
    "order": 13
  },
  {
    "id": "split-duo",
    "name": "Side by Side",
    "internalName": "Animation pack: split-duo",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A left/right split made for 4:5 takes: you in one tall column, the graphics in the other, a perforated ticket seam between, and the columns swap sides on every beat.",
    "bestFor": "Split-screen · Left/right",
    "tags": [
      "split-screen",
      "left/right",
      "4:5 friendly",
      "serif",
      "forest green"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-duo/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-duo/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-duo/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished",
      "minimal"
    ],
    "order": 14
  },
  {
    "id": "frame-blueprint",
    "name": "Blueprint",
    "internalName": "Animation pack: frame-blueprint",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A technical drawing that draws itself: Prussian-blue drafting sheet, white linework, dimension lines and numbered callouts, you as a cyanotype in a measured window, safety yellow for the one thing that matters.",
    "bestFor": "Blueprint · Technical",
    "tags": [
      "blueprint",
      "technical",
      "how it works",
      "engineering"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-blueprint/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-blueprint/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-blueprint/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 15
  },
  {
    "id": "frame-prism",
    "name": "Prism Glass",
    "internalName": "Animation pack: frame-prism",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Glass and light: frosted panes over you with spectrum hairlines, a clear lens that keeps you sharp, numbers split out of a prism beam and rainbow light sweeps that refract you on the key word.",
    "bestFor": "Glass · Prism",
    "tags": [
      "glass",
      "prism",
      "premium",
      "tech"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-prism/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-prism/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-prism/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 16
  },
  {
    "id": "frame-bento",
    "name": "Bento Box",
    "internalName": "Animation pack: frame-bento",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A living bento grid: you in one tile while tiles of real visuals (UI, scans, timers, charts) spring in and the whole grid reflows around what you're showing.",
    "bestFor": "Bento · Grid",
    "tags": [
      "bento",
      "grid",
      "boxes",
      "tech"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-bento/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-bento/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-bento/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "minimal"
    ],
    "order": 17
  },
  {
    "id": "split-deck",
    "name": "Card Deck",
    "internalName": "Animation pack: split-deck",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "You're the top card of a deck; every point you make is dealt as a card with its own live visual (ads, sites, code, quotes), then fanned into a hand.",
    "bestFor": "Cards · Stack",
    "tags": [
      "cards",
      "stack",
      "playful",
      "violet & coral",
      "rounded"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-deck/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-deck/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-deck/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending"
    ],
    "order": 18
  },
  {
    "id": "split-phone",
    "name": "Phone in Frame",
    "internalName": "Animation pack: split-phone",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Your clip opens on a phone, then the phone comes alive: screens swipe, UI flies out into the frame, the camera dives through the screen, and you break out to full screen.",
    "bestFor": "Phone mockup · Pastel",
    "tags": [
      "phone mockup",
      "pastel",
      "app",
      "notifications",
      "creator"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-phone/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-phone/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-phone/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending"
    ],
    "order": 19
  },
  {
    "id": "fmt-demo",
    "name": "Launch Demo",
    "internalName": "Animation pack: fmt-demo",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The product-demo format: glossy phone and laptop mockups glide in beside you, feature callouts draw leader lines to the UI, a cursor clicks the button, all in a violet-and-mint launch look.",
    "bestFor": "Product demo · Launch",
    "tags": [
      "product demo",
      "launch",
      "app",
      "saas",
      "features",
      "mockup",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-demo/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-demo/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-demo/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 20
  },
  {
    "id": "fmt-chalk",
    "name": "Chalk Talk",
    "internalName": "Animation pack: fmt-chalk",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The chalkboard-teacher format: big chalk words written behind you, a green board where steps get boxed and arrowed as you say them, yellow chalk circles and a homework note to close.",
    "bestFor": "Teacher · Chalkboard",
    "tags": [
      "teacher",
      "chalkboard",
      "whiteboard",
      "education",
      "lesson",
      "explainer",
      "hand-drawn",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-chalk/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-chalk/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-chalk/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 21
  },
  {
    "id": "cap-marker",
    "name": "Dry Erase",
    "internalName": "Animation pack: cap-marker",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Whiteboard captions: your words are handwritten in blue dry-erase marker on a small aluminium-framed board under your chin, key words in red with a scribbled underline, lists get ticked, numbers become hand-drawn charts on a full-screen board.",
    "bestFor": "Captions · Handwritten",
    "tags": [
      "captions",
      "handwritten",
      "whiteboard",
      "teacher",
      "explainer",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-marker/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-marker/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-marker/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 22
  },
  {
    "id": "sticker",
    "name": "Sticker Talk",
    "internalName": "Animation pack: sticker",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Your face fills the frame; torn-paper labels slap on, red marker circles and arrows draw on the spoken word, drawn emoji reactions pop in, keyword stamps and quick zoom-punches.",
    "bestFor": "Face-cam · Stickers",
    "tags": [
      "face-cam",
      "stickers",
      "torn paper",
      "marker",
      "playful",
      "face-full"
    ],
    "preview": "https://makerzz.space/showcase/packs/sticker/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/sticker/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/sticker/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 23
  },
  {
    "id": "editorial",
    "name": "Editorial Cards",
    "internalName": "Animation pack: editorial",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Magazine-grade face-cam: a serif cover title behind your head, drawn product visuals that land on every beat (browsers, prompts, 3D, invoices, charts) and full-page editorial spreads for the punchlines.",
    "bestFor": "Face-cam · Editorial",
    "tags": [
      "face-cam",
      "editorial",
      "serif",
      "pastel",
      "calm",
      "face-full"
    ],
    "preview": "https://makerzz.space/showcase/packs/editorial/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/editorial/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/editorial/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished",
      "minimal"
    ],
    "order": 24
  },
  {
    "id": "documentary",
    "name": "Documentary",
    "internalName": "Animation pack: documentary",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Ken Burns moves over real photos, serif titles, an archival frame and a timeline — calm, credible storytelling.",
    "bestFor": "Documentary · History",
    "tags": [
      "documentary",
      "history",
      "ken burns",
      "serif",
      "storytelling"
    ],
    "preview": "https://makerzz.space/showcase/packs/documentary/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/documentary/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/documentary/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "polished"
    ],
    "order": 25
  },
  {
    "id": "dashboard",
    "name": "SaaS Dashboard",
    "internalName": "Animation pack: dashboard",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Your story as a live product dashboard: KPI cards count up, charts draw, a cursor clicks through it.",
    "bestFor": "SaaS · Dashboard",
    "tags": [
      "saas",
      "dashboard",
      "data",
      "startup",
      "metrics"
    ],
    "preview": "https://makerzz.space/showcase/packs/dashboard/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/dashboard/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/dashboard/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "polished",
      "minimal"
    ],
    "order": 26
  },
  {
    "id": "faceless-explainer",
    "name": "Faceless Explainer",
    "internalName": "Kallaway Only Graphics",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "30-50 s",
    "pitch": "No camera needed. Give us a topic or script and get the same studio-grade motion graphics with a voiceover.",
    "bestFor": "Topic → reel, no camera",
    "tags": [
      "faceless",
      "voiceover",
      "motion graphics",
      "tech explainer",
      "diagrams"
    ],
    "preview": "https://makerzz.space/showcase/faceless/faceless-explainer/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/faceless/faceless-explainer/sound.mp4",
    "poster": "https://makerzz.space/showcase/faceless/faceless-explainer/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "polished",
      "minimal"
    ],
    "order": 27
  },
  {
    "id": "doodle-story",
    "name": "Doodle Story",
    "internalName": "doodle-style",
    "group": "faceless",
    "input": "faceless",
    "aspect": "16:9",
    "length": "1-13 min (also 9:16 shorts)",
    "pitch": "Hand-drawn stick-figure storytelling with chapter titles and a gripping narrator. Made for history and true-story channels.",
    "bestFor": "History & true stories, long-form",
    "tags": [
      "faceless",
      "long-form",
      "storytelling",
      "history",
      "illustrated",
      "narration"
    ],
    "preview": "https://makerzz.space/showcase/doodle-story-preview.mp4",
    "previewSound": "https://makerzz.space/showcase/doodle-story-sound.mp4",
    "poster": "https://makerzz.space/showcase/doodle-story-poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "minimal"
    ],
    "order": 28
  },
  {
    "id": "geoglobe",
    "name": "Geoglobe",
    "internalName": "geoglobe-style",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "70-85 s",
    "pitch": "Map stories on a spinning satellite globe: borders draw themselves, countries fill and the camera flies across the world.",
    "bestFor": "Geography & border stories",
    "tags": [
      "faceless",
      "maps",
      "geography",
      "history",
      "narration",
      "3D globe"
    ],
    "preview": "https://makerzz.space/showcase/geoglobe-preview.mp4",
    "previewSound": "https://makerzz.space/showcase/geoglobe-sound.mp4",
    "poster": "https://makerzz.space/showcase/geoglobe-poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending",
      "polished"
    ],
    "order": 29
  },
  {
    "id": "countryballs",
    "name": "Countryballs",
    "internalName": "countryballs-style",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "15-25 s",
    "pitch": "Punchy flag-ball cartoon shorts with giant counters and a trailer score. Turn any country fact or ranking into a 20-second hit.",
    "bestFor": "Country facts & rankings",
    "tags": [
      "faceless",
      "cartoon",
      "countries",
      "rankings",
      "no voice",
      "music-driven"
    ],
    "preview": "https://makerzz.space/showcase/countryballs-preview.mp4",
    "previewSound": "https://makerzz.space/showcase/countryballs-sound.mp4",
    "poster": "https://makerzz.space/showcase/countryballs-poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending",
      "bold"
    ],
    "order": 30
  },
  {
    "id": "catcharium",
    "name": "Field Guide 3D",
    "internalName": "Catcharium style",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "60-80 s",
    "pitch": "Gorgeous lit 3D how-to episodes: top-down and underwater shots, numbered tips and gold serif titles.",
    "bestFor": "Outdoor & fishing how-tos",
    "tags": [
      "faceless",
      "3D",
      "how-to",
      "outdoors",
      "narration",
      "cinematic"
    ],
    "preview": "https://makerzz.space/showcase/catcharium-preview.mp4",
    "previewSound": "https://makerzz.space/showcase/catcharium-sound.mp4",
    "poster": "https://makerzz.space/showcase/catcharium-poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "polished"
    ],
    "order": 31
  },
  {
    "id": "story",
    "name": "Story from clips",
    "internalName": "Story from clips",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "15-60 s",
    "pitch": "Drop in your clips and get a finished story: the best shots picked and cut to the beat, a hook title, labels and captions, music and sound.",
    "tags": [
      "your clips",
      "auto edit",
      "story",
      "captions",
      "music + sfx"
    ],
    "preview": "https://makerzz.space/showcase/faceless/story/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/faceless/story/sound.mp4",
    "poster": "https://makerzz.space/showcase/faceless/story/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending"
    ],
    "order": 32
  },
  {
    "id": "deskcollage",
    "name": "Desk Collage",
    "internalName": "Animation pack: deskcollage",
    "group": "faceless",
    "input": "faceless",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A faceless case-study story told on a top-down grid-paper desk: sticky notes, index cards, paper clips and polaroids of real images, hand-written notes, all at a 15 fps stop-motion step.",
    "bestFor": "Faceless · Stop-motion",
    "tags": [
      "faceless",
      "stop-motion",
      "paper",
      "story",
      "documentary"
    ],
    "preview": "https://makerzz.space/showcase/packs/deskcollage/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/deskcollage/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/deskcollage/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 33
  },
  {
    "id": "neon",
    "name": "Neon Glitch",
    "internalName": "Animation pack: neon",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A night street of real neon signs: you graded to night and lit by the colour spill of the sign that is on, words as glass tubes that stutter on and buzz, signs mounted on a wet brick wall, dead tubes for the loser.",
    "bestFor": "Neon · Night",
    "tags": [
      "neon",
      "night",
      "signs",
      "bold"
    ],
    "preview": "https://makerzz.space/showcase/packs/neon/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/neon/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/neon/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "bold"
    ],
    "order": 34
  },
  {
    "id": "newsroom",
    "name": "Breaking News",
    "internalName": "Animation pack: newsroom",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A real broadcast package over your full-screen take: network and LIVE bugs, BREAKING lower thirds, a ticker that never stops, plus full-screen rundown, figure and map graphics.",
    "bestFor": "News · Broadcast",
    "tags": [
      "news",
      "broadcast",
      "breaking",
      "announcement",
      "current events",
      "face-full"
    ],
    "preview": "https://makerzz.space/showcase/packs/newsroom/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/newsroom/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/newsroom/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "bold"
    ],
    "order": 35
  },
  {
    "id": "tutorial",
    "name": "Tutorial",
    "internalName": "Animation pack: tutorial",
    "group": "pack",
    "input": "either",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Whatever you say becomes a bright, app-style tutorial: you on camera, then clean white step cards with a progress rail, the real site with clicks and zooms, keycaps, copyable commands and a recap.",
    "bestFor": "Tutorial · How-to",
    "tags": [
      "tutorial",
      "how-to",
      "steps",
      "screen recording",
      "guide",
      "face-full"
    ],
    "preview": "https://makerzz.space/showcase/packs/tutorial/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/tutorial/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/tutorial/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "minimal"
    ],
    "order": 36
  },
  {
    "id": "vhs",
    "name": "Retro VHS",
    "internalName": "Animation pack: vhs",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "You on a home-video tape: soft oversaturated camcorder picture with chroma bleed, tracking wobble and the head-switching strip, a REC viewfinder OSD, beats that cut to the deck's blue-screen menu and a rounded CRT set.",
    "bestFor": "Retro · VHS",
    "tags": [
      "retro",
      "vhs",
      "camcorder",
      "90s"
    ],
    "preview": "https://makerzz.space/showcase/packs/vhs/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/packs/vhs/sound.mp4",
    "poster": "https://makerzz.space/showcase/packs/vhs/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "bold"
    ],
    "order": 37
  },
  {
    "id": "fmt-hottake",
    "name": "Hot Seat",
    "internalName": "Animation pack: fmt-hottake",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The hot-take / reaction format: your claim lands as a tilted quote card, red verdict stamps slam down, a heat meter fills, and the closer asks the viewer to pick a side.",
    "bestFor": "Hot take · Opinion",
    "tags": [
      "hot take",
      "opinion",
      "reaction",
      "debate",
      "quote",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-hottake/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-hottake/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-hottake/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 38
  },
  {
    "id": "fmt-storytime",
    "name": "Chapter Book",
    "internalName": "Animation pack: fmt-storytime",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The story-time format: cinematic letterbox bars, chapter cards with roman numerals, a contents page that fills in, typewriter date stamps and slow push-ins on your full-screen take.",
    "bestFor": "Story time · Storytelling",
    "tags": [
      "story time",
      "storytelling",
      "chapters",
      "cinematic",
      "journey",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-storytime/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-storytime/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-storytime/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 39
  },
  {
    "id": "fmt-mythfact",
    "name": "Myth Buster",
    "internalName": "Animation pack: fmt-mythfact",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The myth-vs-fact format: the myth lands on a red card and gets struck out, the card flips to the green fact, claims get ticked or crossed, and a BUSTED stamp closes it.",
    "bestFor": "Myth vs fact · Myth busting",
    "tags": [
      "myth vs fact",
      "myth busting",
      "facts",
      "education",
      "debunk",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-mythfact/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-mythfact/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-mythfact/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 40
  },
  {
    "id": "fmt-deal",
    "name": "Just Landed",
    "internalName": "Animation pack: fmt-deal",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The milestone / just-landed announcement format: a gold corner ribbon, split-flap boards that clatter your numbers into place, a confetti pop and a seal stamp to close. No prices needed: it flips followers, days, wins.",
    "bestFor": "Announcement · Milestone",
    "tags": [
      "announcement",
      "milestone",
      "launch",
      "results",
      "just landed",
      "stats",
      "face-full",
      "format"
    ],
    "preview": "https://makerzz.space/showcase/formats/fmt-deal/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/formats/fmt-deal/sound.mp4",
    "poster": "https://makerzz.space/showcase/formats/fmt-deal/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 41
  },
  {
    "id": "cap-glowline",
    "name": "Glowline",
    "internalName": "Animation pack: cap-glowline",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Karaoke captions: three heavy caps words at a time with a violet highlight block that jumps word to word as you speak, highlight-bar titles over the head and violet full-screen number beats.",
    "bestFor": "Captions · Karaoke",
    "tags": [
      "captions",
      "karaoke",
      "word highlight",
      "face-cam",
      "bold",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-glowline/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-glowline/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-glowline/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 42
  },
  {
    "id": "cap-slap",
    "name": "Slapword",
    "internalName": "Animation pack: cap-slap",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Every word is a glossy die-cut vinyl sticker: chunky rounded type in candy colours with a thick white edge and a hard drop shadow, slapped on beside your face as you say it, on halftone-comic full-screen beats.",
    "bestFor": "Captions · Stickers",
    "tags": [
      "captions",
      "stickers",
      "pop",
      "playful",
      "bold",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-slap/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-slap/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-slap/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 43
  },
  {
    "id": "cap-velvet",
    "name": "Velvet",
    "internalName": "Animation pack: cap-velvet",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Quiet luxury: two-line serif-italic captions in ivory and champagne set left of your face, words that ink in softly, a giant italic word behind your head, oxblood full-screen beats framed by thin gold rules.",
    "bestFor": "Captions · Serif",
    "tags": [
      "captions",
      "serif",
      "italic",
      "luxury",
      "elegant",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-velvet/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-velvet/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-velvet/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished",
      "minimal"
    ],
    "order": 44
  },
  {
    "id": "cap-receipt",
    "name": "Receipt Roll",
    "internalName": "Animation pack: cap-receipt",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Your words print out on a thermal receipt: a tilted paper strip under your chin types each line in mono caps, key words get inverted ink, lists become itemised bills, numbers a TOTAL line with a barcode and a red PAID stamp.",
    "bestFor": "Captions · Typewriter",
    "tags": [
      "captions",
      "typewriter",
      "receipt",
      "mono",
      "retail",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-receipt/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-receipt/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-receipt/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "minimal"
    ],
    "order": 45
  },
  {
    "id": "cap-nightline",
    "name": "Nightline",
    "internalName": "Animation pack: cap-nightline",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Shop-window neon: the whole line hangs as unlit glass tubes and each word buzzes alight in hot pink or warm orange as you say it, with mounting brackets and wires, key words in cyan, full-screen beats on a dark brick wall.",
    "bestFor": "Captions · Neon sign",
    "tags": [
      "captions",
      "neon sign",
      "night",
      "glow",
      "moody",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-nightline/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-nightline/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-nightline/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 46
  },
  {
    "id": "cap-dealtag",
    "name": "Price Drop",
    "internalName": "Animation pack: cap-dealtag",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Retail-sale energy: tall condensed caps with a heavy black outline, every number turns into a swinging yellow price tag, titles on a red sale banner, full-screen WAS / NOW beats with a struck-through old figure and a starburst.",
    "bestFor": "Captions · Numbers",
    "tags": [
      "captions",
      "numbers",
      "sale",
      "retail",
      "bold",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-dealtag/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-dealtag/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-dealtag/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 47
  },
  {
    "id": "cap-chrome",
    "name": "Chrome Candy",
    "internalName": "Animation pack: cap-chrome",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Y2K: captions float in glossy iridescent bubble pills with twinkling sparkles, key words turn liquid chrome, a giant chrome word sits behind your head, full-screen beats are pastel holographic pop-up windows.",
    "bestFor": "Captions · Y2k",
    "tags": [
      "captions",
      "y2k",
      "chrome",
      "bubble",
      "pastel",
      "caption-led"
    ],
    "preview": "https://makerzz.space/showcase/caps/cap-chrome/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/caps/cap-chrome/sound.mp4",
    "poster": "https://makerzz.space/showcase/caps/cap-chrome/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "polished"
    ],
    "order": 48
  },
  {
    "id": "frame-orbit",
    "name": "Orbit",
    "internalName": "Animation pack: frame-orbit",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Rings in 3D around you: tool logos and your key words orbit your head, passing behind you and in front, items launch as satellites, numbers become the sun of a little system. Deep-space grade, wide type.",
    "bestFor": "Orbit · 3D",
    "tags": [
      "orbit",
      "3D",
      "logos",
      "tech"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-orbit/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-orbit/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-orbit/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 49
  },
  {
    "id": "frame-elevate",
    "name": "Cover Story",
    "internalName": "Animation pack: frame-elevate",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A premium print magazine: you become the cover inside a thin ivory border with a didone masthead, beats turn into spreads (contents page, giant italic numerals, pull quotes), champagne-gold hairlines and slow cinematic bars.",
    "bestFor": "Magazine · Premium",
    "tags": [
      "magazine",
      "premium",
      "editorial",
      "luxury"
    ],
    "preview": "https://makerzz.space/showcase/frames/frame-elevate/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/frames/frame-elevate/sound.mp4",
    "poster": "https://makerzz.space/showcase/frames/frame-elevate/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 50
  },
  {
    "id": "split-seam",
    "name": "Sliding Seam",
    "internalName": "Animation pack: split-seam",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "Top/bottom split where the seam itself moves: a tangerine ticker bar slides up and down between beats, giving the graphics more or less of the frame while you keep talking below it.",
    "bestFor": "Split-screen · Ticker",
    "tags": [
      "split-screen",
      "ticker",
      "navy",
      "tangerine",
      "4:5 friendly"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-seam/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-seam/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-seam/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "bold"
    ],
    "order": 51
  },
  {
    "id": "split-slash",
    "name": "Diagonal Cut",
    "internalName": "Animation pack: split-slash",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "The frame is cut on a hard diagonal: you on one side, black-and-yellow graphics on the other, a hazard-striped slash that flips its angle and sweeps across with a white flash on every beat.",
    "bestFor": "Split-screen · Diagonal",
    "tags": [
      "split-screen",
      "diagonal",
      "bold",
      "black & yellow",
      "condensed"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-slash/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-slash/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-slash/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "trending",
      "bold"
    ],
    "order": 52
  },
  {
    "id": "split-pip",
    "name": "Corner Cam",
    "internalName": "Animation pack: split-pip",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "You open full screen, then shrink into a corner cam with a live ring while dark product UI takes over the frame; the cam zips between corners with a light trail on every beat.",
    "bestFor": "Picture-in-picture · Product UI",
    "tags": [
      "picture-in-picture",
      "product UI",
      "dark",
      "mint",
      "tech"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-pip/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-pip/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-pip/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished"
    ],
    "order": 53
  },
  {
    "id": "split-mag",
    "name": "Magazine Spread",
    "internalName": "Animation pack: split-mag",
    "group": "face",
    "input": "face",
    "aspect": "9:16",
    "length": "30-70 s",
    "pitch": "A printed-magazine layout: masthead, column rules and serif headlines, with you cut into a tall column photo, breaking out of its frame, or tucked into a spread beside a big red numeral.",
    "bestFor": "Editorial · Magazine",
    "tags": [
      "editorial",
      "magazine",
      "serif",
      "newsprint",
      "two-column"
    ],
    "preview": "https://makerzz.space/showcase/splits/split-mag/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/splits/split-mag/sound.mp4",
    "poster": "https://makerzz.space/showcase/splits/split-mag/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "new",
      "polished",
      "minimal"
    ],
    "order": 54
  },
  {
    "id": "ugc",
    "name": "AI-UGC in Sticker Talk",
    "internalName": "AI-UGC in Sticker Talk",
    "group": "face",
    "input": "talking-head",
    "aspect": "9:16",
    "length": "25-40 s",
    "pitch": "Two AI-UGC selfie takes joined and edited in Sticker Talk: torn-paper labels, marker circles and emoji reactions over the presenter, cut on the spoken word.",
    "tags": [
      "ai ugc",
      "ai presenter",
      "stickers",
      "selfie",
      "captions"
    ],
    "preview": "https://makerzz.space/showcase/face/ugc/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/face/ugc/sound.mp4",
    "poster": "https://makerzz.space/showcase/face/ugc/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending"
    ],
    "styleId": "sticker",
    "order": 55
  },
  {
    "id": "ugc-2",
    "name": "AI-UGC in Editorial Cards",
    "internalName": "AI-UGC in Editorial Cards",
    "group": "face",
    "input": "talking-head",
    "aspect": "9:16",
    "length": "25-40 s",
    "pitch": "Two different AI-UGC presenters joined and edited in Editorial Cards: serif titles, numbered pastel tiles and a calm link-in-bio card over the face.",
    "tags": [
      "ai ugc",
      "ai presenter",
      "editorial",
      "serif",
      "captions"
    ],
    "preview": "https://makerzz.space/showcase/face/ugc-2/preview.mp4",
    "previewSound": "https://makerzz.space/showcase/face/ugc-2/sound.mp4",
    "poster": "https://makerzz.space/showcase/face/ugc-2/poster.jpg",
    "available": true,
    "comingSoon": false,
    "pickerTags": [
      "trending"
    ],
    "styleId": "editorial",
    "order": 56
  }
];

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "house",
    name: "House red",
    colors: {
      accent: "#AE0006",
      accentHi: "#FF3B4E",
      accent2: "#FF2A3C",
      bg: "#000000",
      panel: "#19191b",
      panel2: "#0b0b0c",
      ink: "#ffffff",
      dim: "#8f8f8f",
      line: "rgba(255,255,255,.3)",
    },
  },
  {
    id: "electric",
    name: "Electric blue",
    colors: {
      accent: "#1F4FFF",
      accentHi: "#5C7CFF",
      accent2: "#3A66FF",
      bg: "#05070F",
      panel: "#141A2B",
      panel2: "#0A0E1A",
      ink: "#F4F6FF",
      dim: "#8A93AD",
      line: "rgba(244,246,255,.28)",
    },
  },
  {
    id: "lime",
    name: "Acid lime",
    colors: {
      accent: "#7BC500",
      accentHi: "#C6FF3D",
      accent2: "#A6F000",
      bg: "#070806",
      panel: "#181B14",
      panel2: "#0D0F0B",
      ink: "#F7FFE8",
      dim: "#8E967F",
      line: "rgba(247,255,232,.28)",
    },
  },
  {
    id: "sunset",
    name: "Sunset orange",
    colors: {
      accent: "#E0480B",
      accentHi: "#FF8A3D",
      accent2: "#FF6A1F",
      bg: "#0C0705",
      panel: "#211612",
      panel2: "#120C09",
      ink: "#FFF5EE",
      dim: "#A08C80",
      line: "rgba(255,245,238,.28)",
    },
  },
  {
    id: "violet",
    name: "Violet night",
    colors: {
      accent: "#6B2BFF",
      accentHi: "#A77BFF",
      accent2: "#8650FF",
      bg: "#07050E",
      panel: "#1A1428",
      panel2: "#0E0A18",
      ink: "#F6F2FF",
      dim: "#9189A8",
      line: "rgba(246,242,255,.28)",
    },
  },
  {
    id: "paper",
    name: "Paper light",
    colors: {
      accent: "#2F5BFF",
      accentHi: "#6E8BFF",
      accent2: "#4C6FFF",
      bg: "#F5F2EA",
      panel: "#FFFFFF",
      panel2: "#ECE7DC",
      ink: "#14141A",
      dim: "#6B6B73",
      line: "rgba(20,20,26,.22)",
    },
  },
  {
    id: "mint",
    name: "Mint clean",
    colors: {
      accent: "#0E9F6E",
      accentHi: "#34D399",
      accent2: "#10B981",
      bg: "#F3FAF6",
      panel: "#FFFFFF",
      panel2: "#E3F1EA",
      ink: "#0B1F17",
      dim: "#5D7268",
      line: "rgba(11,31,23,.2)",
    },
  },
  {
    id: "gold",
    name: "Black gold",
    colors: {
      accent: "#B8860B",
      accentHi: "#F5C542",
      accent2: "#E0A82E",
      bg: "#000000",
      panel: "#1A1710",
      panel2: "#0D0B07",
      ink: "#FFF8E6",
      dim: "#9A8F75",
      line: "rgba(255,248,230,.28)",
    },
  },
];

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "house",
    name: "House",
    display: "Inter Tight",
    body: "Inter Tight",
    serif: "Instrument Serif",
  },
  {
    id: "loud",
    name: "Loud",
    display: "Anton",
    body: "Inter",
    serif: "Playfair Display",
  },
  {
    id: "poster",
    name: "Poster",
    display: "Bebas Neue",
    body: "Montserrat",
    serif: "DM Serif Display",
  },
  {
    id: "editorial",
    name: "Editorial",
    display: "DM Serif Display",
    body: "Inter",
    serif: "Instrument Serif",
  },
  {
    id: "startup",
    name: "Startup",
    display: "Sora",
    body: "Sora",
    serif: "Instrument Serif",
  },
  {
    id: "friendly",
    name: "Friendly",
    display: "Poppins",
    body: "Poppins",
    serif: "Playfair Display",
  },
  {
    id: "tech",
    name: "Tech",
    display: "Space Grotesk",
    body: "Space Grotesk",
    serif: "Instrument Serif",
  },
  {
    id: "heavy",
    name: "Heavy",
    display: "Archivo Black",
    body: "Inter",
    serif: "DM Serif Display",
  },
  {
    id: "warm",
    name: "Warm",
    display: "Fustat",
    body: "Fustat",
    serif: "Playfair Display",
  },
  {
    id: "classic",
    name: "Classic",
    display: "Montserrat",
    body: "Montserrat",
    serif: "Playfair Display",
  },
];

export const SPOKEN_LANGUAGES: LanguageOption[] = [
  { code: "auto", label: "Detect automatically" },
  { code: "en", label: "English" },
  { code: "hinglish", label: "Hinglish (Roman)" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "uk", label: "Ukrainian" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "el", label: "Greek" },
  { code: "ar", label: "Arabic" },
  { code: "he", label: "Hebrew" },
  { code: "ur", label: "Urdu" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "th", label: "Thai" },
  { code: "vi", label: "Vietnamese" },
  { code: "id", label: "Indonesian" },
  { code: "ms", label: "Malay" },
  { code: "fil", label: "Filipino" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese (Simplified)" },
];

export const OUTPUT_FORMATS = [
  { value: "9:16", label: "Vertical 9:16 (Reels, TikTok, Shorts)", icon: "smartphone" },
  { value: "16:9", label: "Horizontal 16:9 (YouTube, Desktop)", icon: "monitor" },
  { value: "1:1", label: "Square 1:1 (Instagram Feed, LinkedIn)", icon: "square" },
];

export const PLATFORMS_LIST = [
  { id: "instagram", name: "Instagram Reels", icon: "instagram" },
  { id: "tiktok", name: "TikTok", icon: "tiktok" },
  { id: "youtube", name: "YouTube Shorts", icon: "youtube" },
  { id: "linkedin", name: "LinkedIn Video", icon: "linkedin" },
  { id: "x", name: "X / Twitter", icon: "x" },
  { id: "threads", name: "Threads", icon: "threads" },
  { id: "facebook", name: "Facebook Reels", icon: "facebook" },
];

export const DEFAULT_BRAND_KIT: BrandKitSettings = {
  accent: "#AE0006",
  accentHi: "#FF3B4E",
  accent2: "#FF2A3C",
  bg: "#000000",
  panel: "#19191b",
  panel2: "#0b0b0c",
  ink: "#ffffff",
  dim: "#8f8f8f",
  line: "rgba(255,255,255,.3)",
  font: {
    display: "Inter Tight",
    body: "Inter Tight",
    serif: "Instrument Serif",
    mono: "JetBrains Mono",
  },
  speed: 1,
  motionTempo: 1,
  motionIntensity: 0.5,
  captionStyle: "word",
  music: { on: true, volume: 0.35 },
  sfx: { on: true, volume: 0.5 },
  hook: { mode: "auto" },
  visualsPreference: "balanced",
  caption: {
    style: "word",
    size: 58,
    y: 0.72,
    case: "natural",
    box: false,
  },
};
