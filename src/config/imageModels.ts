// ============================================================
// IMAGE GENERATION MODEL REGISTRY
// ============================================================
//
// PURPOSE:
//
// Frontend-এর available image-generation models
// এক জায়গায় centrally define করা.
//
// IMPORTANT:
//
// Composer-এর ভিতরে model list hardcode করা হবে না.
//
// Future:
// - নতুন model add
// - existing model disable
// - label change
// - default model change
//
// সব এই file থেকেই করা যাবে.
// ============================================================

export interface ImageModelOption {
    id: string;
    label: string;
    provider: "system" | "higgsfield";
    enabled: boolean;
}

export const AUTO_IMAGE_MODEL: ImageModelOption = {
    id: "auto",
    label: "Auto",
    provider: "system",
    enabled: true,
};

export const ALL_IMAGE_MODELS: ImageModelOption = {
    id: "all_image_models",
    label: "All Image Models",
    provider: "system",
    enabled: true,
};

export const CODE_IMAGE_MODEL: ImageModelOption = {
    id: "code_image",
    label: "Code Image (OpenAI SVG)",
    provider: "system",
    enabled: true,
};

export const IMAGE_TO_VECTOR_MODEL: ImageModelOption = {
    id: "image_to_vector",
    label: "Image-to-Vector Reconstruction (SVG)",
    provider: "system",
    enabled: true,
};

export const HYBRID_SVG_MODEL: ImageModelOption = {
    id: "hybrid_svg",
    label: "Hybrid SVG — Raster Background + Vector Design",
    provider: "system",
    enabled: true,
};


// ============================================================
// AVAILABLE IMAGE MODELS
// ============================================================
//
// id MUST match backend/Higgsfield model identifier.
//
// ============================================================

export const IMAGE_MODELS: ImageModelOption[] = [

    AUTO_IMAGE_MODEL,
    CODE_IMAGE_MODEL,
    IMAGE_TO_VECTOR_MODEL,
    HYBRID_SVG_MODEL,
    ALL_IMAGE_MODELS,

    { id: "bytedance_image_upscale", label: "Bytedance Image Upscale", provider: "higgsfield", enabled: true },
    { id: "flux_3_image", label: "FLUX 3 Image", provider: "higgsfield", enabled: true },
    { id: "flux_2", label: "FLUX.2", provider: "higgsfield", enabled: true },
    { id: "flux_2_pro_outpaint", label: "FLUX.2 Pro Outpaint", provider: "higgsfield", enabled: true },
    { id: "flux_kontext", label: "Flux Kontext", provider: "higgsfield", enabled: true },
    { id: "gpt_image_2", label: "GPT Image 2", provider: "higgsfield", enabled: true },
    { id: "gpt_image_2_5", label: "GPT Image 2.5", provider: "higgsfield", enabled: true },
    { id: "grok_image", label: "Grok Image", provider: "higgsfield", enabled: true },
    { id: "grok_image_2_0", label: "Grok Image 2.0", provider: "higgsfield", enabled: true },
    { id: "text2image_soul_v2", label: "Higgsfield Soul 2.0", provider: "higgsfield", enabled: true },
    { id: "ideogram_4_5", label: "Ideogram 4.5", provider: "higgsfield", enabled: true },
    { id: "image_background_remover", label: "Image Background Remover", provider: "higgsfield", enabled: true },
    { id: "kling_omni_image", label: "Kling O1 Image", provider: "higgsfield", enabled: true },
    { id: "nano_banana", label: "Nano Banana", provider: "higgsfield", enabled: true },
    { id: "nano_banana_flash", label: "Nano Banana 2", provider: "higgsfield", enabled: true },
    { id: "nano_banana_2_lite", label: "Nano Banana 2 Lite", provider: "higgsfield", enabled: true },
    { id: "nano_banana_pro", label: "Nano Banana Pro", provider: "higgsfield", enabled: true },
    { id: "nano_banana_2_ai_stylist", label: "Nano Banana Pro — AI Stylist", provider: "higgsfield", enabled: true },
    { id: "nano_banana_2_relight", label: "Nano Banana Pro — Relight", provider: "higgsfield", enabled: true },
    { id: "nano_banana_2_skin_enhancer", label: "Nano Banana Pro — Skin Enhancer", provider: "higgsfield", enabled: true },
    { id: "nano_banana_2_shots", label: "Nano Banana Pro — Shots", provider: "higgsfield", enabled: true },
    { id: "openai_hazel", label: "OpenAI Hazel", provider: "higgsfield", enabled: true },
    { id: "outpaint", label: "Outpaint", provider: "higgsfield", enabled: true },
    { id: "recraft_v4_1", label: "Recraft V4.1", provider: "higgsfield", enabled: true },
    { id: "seedream_v4_5", label: "Seedream 4.5", provider: "higgsfield", enabled: true },
    { id: "seedream_5_0_flash", label: "Seedream 5.0 Flash", provider: "higgsfield", enabled: true },
    { id: "seedream_v5_lite", label: "Seedream 5.0 Lite", provider: "higgsfield", enabled: true },
    { id: "seedream_v5_pro", label: "Seedream 5.0 Pro", provider: "higgsfield", enabled: true },
    { id: "soul_cast", label: "Soul Cast", provider: "higgsfield", enabled: true },
    { id: "soul_cinematic", label: "Soul Cinematic", provider: "higgsfield", enabled: true },
    { id: "soul_location", label: "Soul Location", provider: "higgsfield", enabled: true },
    { id: "topaz_image", label: "Topaz", provider: "higgsfield", enabled: true },
    { id: "topaz_image_generative", label: "Topaz Generative", provider: "higgsfield", enabled: true },
    { id: "z_image", label: "Z Image", provider: "higgsfield", enabled: true },

];


// ============================================================
// DEFAULT IMAGE MODEL
// ============================================================

export const DEFAULT_IMAGE_MODEL_ID =
    "auto";


// ============================================================
// ENABLED MODELS ONLY
// ============================================================

export const ENABLED_IMAGE_MODELS =
    IMAGE_MODELS.filter(
        (model) => model.enabled
    );
