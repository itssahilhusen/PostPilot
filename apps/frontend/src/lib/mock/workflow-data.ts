export interface NodeTemplate {
  id: string;
  name: string;
  category: "input" | "generation" | "utility" | "model" | "export";
  iconType: "letter" | "svg";
  letter?: string;
  iconName?: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export interface WorkflowNodeData {
  id: string;
  title: string;
  type: "text-iterator" | "prompt" | "llm" | "image-gen" | "import" | "video-gen";
  selected?: boolean;
  model?: string;
  items?: string[];
  prompt?: string;
  output?: string;
  imageUrl?: string;
  imageAlt?: string;
  page?: number;
  totalPages?: number;
  credits?: number;
}

export const WORKFLOW_TEMPLATES: NodeTemplate[] = [
  {
    id: "prompt",
    name: "Prompt",
    category: "input",
    iconType: "letter",
    letter: "T",
    color: "#c5f52a",
    bg: "rgba(197, 245, 42, 0.15)",
    border: "rgba(197, 245, 42, 0.3)",
    description: "Structured prompt block with parameter bindings and tokens",
  },
  {
    id: "import",
    name: "Import",
    category: "utility",
    iconType: "svg",
    iconName: "import",
    color: "#71c4f5",
    bg: "rgba(113, 196, 245, 0.12)",
    border: "rgba(113, 196, 245, 0.25)",
    description: "Import raw assets, video sequences, or training weights",
  },
  {
    id: "export",
    name: "Export",
    category: "export",
    iconType: "svg",
    iconName: "export",
    color: "#a6b1c2",
    bg: "rgba(166, 177, 194, 0.12)",
    border: "rgba(166, 177, 194, 0.25)",
    description: "Multi-channel export pipeline with auto-resizing",
  },
  {
    id: "preview",
    name: "Preview",
    category: "utility",
    iconType: "svg",
    iconName: "preview",
    color: "#5eead4",
    bg: "rgba(94, 234, 212, 0.12)",
    border: "rgba(94, 234, 212, 0.25)",
    description: "Interactive real-time canvas preview monitor",
  },
  {
    id: "import-model",
    name: "Import Model",
    category: "model",
    iconType: "svg",
    iconName: "model",
    color: "#8ea4bd",
    bg: "rgba(142, 164, 189, 0.12)",
    border: "rgba(142, 164, 189, 0.25)",
    description: "Custom checkpoint or fine-tuned Safetensors checkpoint",
  },
  {
    id: "import-lora",
    name: "Import LoRA",
    category: "model",
    iconType: "svg",
    iconName: "lora",
    color: "#76c2af",
    bg: "rgba(118, 194, 175, 0.12)",
    border: "rgba(118, 194, 175, 0.25)",
    description: "Low-Rank Adaptation model adapter for specific art styles",
  },
  {
    id: "import-multiple-loras",
    name: "Import Multiple LoRAs",
    category: "model",
    iconType: "svg",
    iconName: "multi-lora",
    color: "#939baa",
    bg: "rgba(147, 155, 170, 0.12)",
    border: "rgba(147, 155, 170, 0.25)",
    description: "Weighted stack of style and character LoRAs",
  },
  {
    id: "runway-gen",
    name: "Runway Gen-4.5",
    category: "generation",
    iconType: "letter",
    letter: "R",
    color: "#f28da3",
    bg: "rgba(242, 141, 163, 0.15)",
    border: "rgba(242, 141, 163, 0.25)",
    description: "Ultra-realistic cinematic video synthesis from Runway",
  },
  {
    id: "chatgpt-images",
    name: "ChatGPT Images 2.0",
    category: "generation",
    iconType: "svg",
    iconName: "chatgpt",
    color: "#48c9aa",
    bg: "rgba(72, 201, 170, 0.12)",
    border: "rgba(72, 201, 170, 0.25)",
    description: "High-adherence visual generation with DALL-E 3.5 engine",
  },
  {
    id: "flux-dev",
    name: "Flux 2 Dev LoRA",
    category: "model",
    iconType: "svg",
    iconName: "flux",
    color: "#5cc7b2",
    bg: "rgba(92, 199, 178, 0.12)",
    border: "rgba(92, 199, 178, 0.25)",
    description: "Black Forest Labs FLUX.1 Dev adapter with text guidance",
  },
  {
    id: "style-mesh",
    name: "Style Mesh",
    category: "utility",
    iconType: "svg",
    iconName: "mesh",
    color: "#76c2af",
    bg: "rgba(118, 194, 175, 0.12)",
    border: "rgba(118, 194, 175, 0.25)",
    description: "Blend color grading and aesthetic tokens across nodes",
  },
  {
    id: "vector-synth",
    name: "Vector Synth",
    category: "generation",
    iconType: "svg",
    iconName: "synth",
    color: "#c5f52a",
    bg: "rgba(197, 245, 42, 0.12)",
    border: "rgba(197, 245, 42, 0.25)",
    description: "Mathematical SVG shape synthesizer and icon interpolator",
  },
];

export const INITIAL_WORKFLOW_STATE = {
  credits: 130,
  activeModelCount: 4,
  collaborator: {
    name: "Polina",
    color: "#c5f52a",
    status: "Viewing Text Iterator",
  },
  textIterator: {
    items: ["monarch", "monkey", "mountains of tibet"],
  },
  promptNode: {
    text: "Generate a prompt for a cartoon scene between a monk and a monkey in GTA low-poly style",
  },
  llmNode: {
    model: "Claude Opus 5",
    models: ["Claude Opus 5", "Gemini 2.0 Flash", "GPT-4o", "Claude 3.5 Sonnet"],
    page: 1,
    totalPages: 3,
    outputPages: [
      "Vertical video, pixelated low-poly 3D style (GTA 2 / early PS1 / early PC-game look). Heavier flat color fill so polygon facets are less visible, smoother surfaces, but with grainy analog noise creeping in at the frame edges like an old scanned photo. Affine texture mapping (textures slightly swim), subtle 1-2px vertex jitter. The monk's face is a flat GTA-style painted texture stretched onto the low-poly head (features drawn, not modeled). Bright saturated palette with sun-drenched Himalayan peaks.",
      "Alternate Scene 2: Low-poly rooftop chase across Lhasa monastery, vibrant saffron prayer flags flapping with low frame-rate step physics. Monk wearing vintage orange robe with blocky geometry, monkey perched on shoulder holding a digital camcorder. Cel-shaded outlines with 128-color dither.",
      "Alternate Scene 3: Wide cinematic angle overlooking mist valleys. GTA III style HUD map overlay in bottom left corner with lime health meter. Monk meditates peacefully while the monkey practices tai-chi karate punches in rapid 24fps pixel steps.",
    ],
  },
  imageGenNode: {
    model: "NanoBanana 2",
    models: ["NanoBanana 2", "FLUX.1 Dev", "Midjourney v6", "DALL-E 3"],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvpbWh-fwckgOrGTDp6EHCpWMjZglSlriyD6iLQdhYS-lmRO00d33pKUyWfjxB0xdCpaAGaqv9rB0IkZj-tjFnP5aEMdIw25xTCYl_5ST9tD0DI_ZcvNaYLTQ4nvS8uqkzqvGfaQSb3HCDfOBVhGwQxyAM8zz6gHiXBzkyzP0DIFRiEe2v7u96DpU0g9Mrt08DrUgQzC6qNSo0oXFe-caQPwTbZeZn_d7g41XLB4t_W0EAzLfXmLGRkA",
    alt: "Fox with sunglasses in low-poly synth style",
  },
  importNode: {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBREYJrI11s_PbbK_LiGBuXQ1Y4b5Z_IIy9tiiy7pW4sN_nVKM2jBEufTEJ-JZ1k2FPGvPH4ec0m2e3_5kZfxsyZ6rHGQYlxxyNONk8_Sh9qmDZkOcZYauEJhch5Po6mvbjRLZIP_q7En2YWQrezgk5fJ8Vn7i2FIY25G_EdCDqFUAPtvBHRmjiHHHlcjCsxOkqJisgdRXUG27QnY-1-IX1XRI66voZwrP1lLdyrpRUoLYBzG8hoVwRIg",
    alt: "Batman lighting cigarette reference asset",
  },
  videoGenNode: {
    model: "Seedance 2.0",
    models: ["Seedance 2.0", "Runway Gen-4.5", "Kling 1.5 Pro", "Luma Ray 2"],
    page: 1,
    totalPages: 3,
    variations: [
      {
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuATaRd6u4kXohtSeLHSb-N8wVuysZDUi81DC8lhBlOx3eY-2i5mf63UnVVNIbMhOT4XrA7RUcX82xtFym3DyM_C-1_yEetro5AlIElphrQgHG8bMz-a-mllAl7hpjNOmFCWhfe0GUZ0KHfyDQs22hvdX9QCkZ53-EZ7fxu8xkot7FdSSWf_p6yuTRE6J53PDagM8wkQk2yVHdmSjcNzMEdWMvyjJYCQNo9pwU_7ZE1TcJvV5zQqSKhsgw",
        alt: "Willem Dafoe No Plan B high motion generation",
        duration: "0:04",
        fps: 30,
      },
      {
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDvpbWh-fwckgOrGTDp6EHCpWMjZglSlriyD6iLQdhYS-lmRO00d33pKUyWfjxB0xdCpaAGaqv9rB0IkZj-tjFnP5aEMdIw25xTCYl_5ST9tD0DI_ZcvNaYLTQ4nvS8uqkzqvGfaQSb3HCDfOBVhGwQxyAM8zz6gHiXBzkyzP0DIFRiEe2v7u96DpU0g9Mrt08DrUgQzC6qNSo0oXFe-caQPwTbZeZn_d7g41XLB4t_W0EAzLfXmLGRkA",
        alt: "Alternate Camera angle: low-poly zoom",
        duration: "0:06",
        fps: 60,
      },
      {
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBREYJrI11s_PbbK_LiGBuXQ1Y4b5Z_IIy9tiiy7pW4sN_nVKM2jBEufTEJ-JZ1k2FPGvPH4ec0m2e3_5kZfxsyZ6rHGQYlxxyNONk8_Sh9qmDZkOcZYauEJhch5Po6mvbjRLZIP_q7En2YWQrezgk5fJ8Vn7i2FIY25G_EdCDqFUAPtvBHRmjiHHHlcjCsxOkqJisgdRXUG27QnY-1-IX1XRI66voZwrP1lLdyrpRUoLYBzG8hoVwRIg",
        alt: "Night ambiance street lighting transition",
        duration: "0:05",
        fps: 30,
      },
    ],
  },
};

