// ============================================================
// VIDEO GENERATION MODEL REGISTRY
// ============================================================
//
// PURPOSE:
// Frontend available video generation models defined centrally.
// ============================================================

export interface VideoModelOption {
    id: string;
    label: string;
    provider: "higgsfield";
    enabled: boolean;
}

export const VIDEO_MODELS: VideoModelOption[] = [
    {
        id: "seedance_2_5",
        label: "Seedance 2.5",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "seedance_2_0",
        label: "Seedance 2.0",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "seedance_2_0_mini",
        label: "Seedance 2.0 Mini",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "seedance1_5",
        label: "Seedance 1.5 Pro",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "veo3_1",
        label: "Google Veo 3.1",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "veo3_1_lite",
        label: "Google Veo 3.1 Lite",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "veo3",
        label: "Google Veo 3",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "wan3_0_prime",
        label: "Wan 3.0 Prime",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "wan3_0",
        label: "Wan 3.0",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "wan2_7",
        label: "Wan 2.7",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "wan2_6",
        label: "Wan 2.6 Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "kling3_0",
        label: "Kling v3.0",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "kling3_0_turbo",
        label: "Kling 3.0 Turbo",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "kling2_6",
        label: "Kling 2.6 Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "grok_video_v15",
        label: "Grok Video 1.5",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "grok_video",
        label: "Grok Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "gemini_omni_flash_1_1",
        label: "Gemini Omni Flash 1.1",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "gemini_omni",
        label: "Gemini Omni Flash",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "minimax_h3_max",
        label: "MiniMax H3 Max",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "minimax_h3",
        label: "MiniMax H3",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "minimax_hailuo",
        label: "Minimax Hailuo",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "flux_3_video",
        label: "FLUX 3 Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "flux_3_video_edit",
        label: "FLUX 3 Video Edit",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "ad_multiplier",
        label: "Ad Multiplier",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "bytedance_video_upscale",
        label: "Bytedance Video Upscale",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "clipify",
        label: "Clipify",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "depth_anything_video",
        label: "Depth Anything Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "fps_boost",
        label: "FPS Boost",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "hf_mult_motion_control",
        label: "Genjutsu Motion",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "happy_horse_video",
        label: "Happy Horse Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "sam_3_video",
        label: "Remove Video Background",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "topaz_video",
        label: "Topaz Video",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "video_background_remover",
        label: "Video Background Remover",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "video_deflicker",
        label: "Video Deflicker",
        provider: "higgsfield",
        enabled: true,
    },
    {
        id: "video_upscale",
        label: "Video Upscale",
        provider: "higgsfield",
        enabled: true,
    },
];

export const DEFAULT_VIDEO_MODEL_ID = "seedance_2_5";

export const ENABLED_VIDEO_MODELS = VIDEO_MODELS.filter(
    (model) => model.enabled
);
