import {
    ArrowUp,
    Mic,
    Paperclip,
    Plus,
    X,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    Attachment,
} from "../types/chat";

import { authorizedFetch } from "../services/authApi";
import { getApiBaseUrl } from "../services/apiBase";

import UploadMenu from "./UploadMenu";

import {
    createSpeechRecognition,
    isSpeechRecognitionSupported,
} from "../services/speechRecognitionService";

import {
    DEFAULT_IMAGE_MODEL_ID,
    ENABLED_IMAGE_MODELS,
    AUTO_IMAGE_MODEL,
    CODE_IMAGE_MODEL,
    IMAGE_TO_VECTOR_MODEL,
    HYBRID_SVG_MODEL,
    ALL_IMAGE_MODELS,
    type ImageModelOption,
} from "../config/imageModels";

import {
    DEFAULT_VIDEO_MODEL_ID,
    ENABLED_VIDEO_MODELS,
} from "../config/videoModels";

interface ComposerProps {
    loading: boolean;
    onSubmit: (
        prompt: string,
        attachments: Attachment[],
        imageModel: string,
        videoModel: string,
    ) => void;
}

// ========================================
// PROMPT COMPOSER
// ========================================

export default function Composer({
    loading,
    onSubmit,
}: ComposerProps) {

    // ============================================================
    // VOICE INPUT STATE
    // ============================================================

    const [
        isListening,
        setIsListening,
    ] = useState(false);


    const [
        voiceError,
        setVoiceError,
    ] = useState<string | null>(
        null
    );


    // Interim text = user speaking right now
    const [
        interimTranscript,
        setInterimTranscript,
    ] = useState("");


    // Current browser speech-recognition instance
    const recognitionRef =
        useRef<ReturnType<
            typeof createSpeechRecognition
        >>(null);


    const [prompt, setPrompt] = useState("");

    // ============================================================
    // IMAGE MODEL SELECTION
    // ============================================================
    //
    // User কোনো model manually select না করলে
    // DEFAULT_IMAGE_MODEL_ID use হবে.

    const [
        selectedImageModel,
        setSelectedImageModel,
    ] = useState(
        DEFAULT_IMAGE_MODEL_ID
    );

    const [imageModels, setImageModels] =
        useState<ImageModelOption[]>(ENABLED_IMAGE_MODELS);

    const [
        selectedVideoModel,
        setSelectedVideoModel,
    ] = useState(
        DEFAULT_VIDEO_MODEL_ID
    );


    const [uploadOpen, setUploadOpen] =
        useState(false);

    const [attachments, setAttachments] =
        useState<Attachment[]>([]);

    const fileInputRef =
        useRef<HTMLInputElement>(null);

    const selectedTypeRef =
        useRef<Attachment["type"]>("file");

    useEffect(() => {
        authorizedFetch(`${getApiBaseUrl()}/api/models?media_type=image`)
            .then((response) => response.ok ? response.json() : Promise.reject(new Error("Model catalog unavailable")))
            .then((payload) => {
                const liveModels: ImageModelOption[] = (payload.models || [])
                    .filter((model: { model_id: string; provider?: string }) => model.provider === "higgsfield")
                    .map((model: { model_id: string; model_name: string }) => ({
                    id: model.model_id,
                    label: model.model_name,
                    provider: "higgsfield",
                    enabled: true,
                }));
                const uniqueModels = Array.from(new Map(liveModels.map((model) => [model.id, model])).values());
                setImageModels([AUTO_IMAGE_MODEL, CODE_IMAGE_MODEL, IMAGE_TO_VECTOR_MODEL, HYBRID_SVG_MODEL, ALL_IMAGE_MODELS, ...uniqueModels]);
            })
            .catch((error) => console.warn("[FRONTEND] Image model catalog unavailable:", error));
    }, []);


    // ============================================================
    // CLEANUP SPEECH RECOGNITION
    // ============================================================

    useEffect(() => {

        return () => {

            recognitionRef.current?.abort();

        };

    }, []);

    // ============================================================
    // START / STOP VOICE INPUT
    // ============================================================

    const handleMicClick = () => {

        setVoiceError(null);


        // ----------------------------------------------------------
        // If currently listening:
        // second mic click stops recognition.
        // ----------------------------------------------------------

        if (isListening) {

            recognitionRef.current?.stop();

            return;
        }


        // ----------------------------------------------------------
        // Browser support check
        // ----------------------------------------------------------

        if (
            !isSpeechRecognitionSupported()
        ) {

            setVoiceError(
                "Voice input is not supported in this browser."
            );

            return;
        }


        // Clear old interim transcript
        setInterimTranscript("");


        const recognition =
            createSpeechRecognition(
                {

                    // ====================================================
                    // START
                    // ====================================================

                    onStart: () => {

                        setIsListening(true);

                        setVoiceError(null);

                    },


                    // ====================================================
                    // INTERIM TRANSCRIPT
                    //
                    // Shows what user is currently saying.
                    // ====================================================

                    onInterimText: (
                        text
                    ) => {

                        setInterimTranscript(
                            text
                        );

                    },


                    // ====================================================
                    // FINAL TRANSCRIPT
                    //
                    // Append final voice text into normal prompt.
                    // ====================================================

                    onFinalText: (
                        text
                    ) => {

                        const cleanedText =
                            text.trim();


                        if (!cleanedText) {
                            return;
                        }


                        setPrompt(
                            (
                                previousPrompt
                            ) => {

                                const existing =
                                    previousPrompt.trim();


                                if (!existing) {

                                    return cleanedText;

                                }


                                return (
                                    existing +
                                    " " +
                                    cleanedText
                                );

                            }
                        );


                        // Final text has now moved
                        // into normal Composer prompt.
                        setInterimTranscript("");

                    },


                    // ====================================================
                    // END
                    // ====================================================

                    onEnd: () => {

                        setIsListening(false);

                        setInterimTranscript("");

                        recognitionRef.current =
                            null;

                    },


                    // ====================================================
                    // ERROR
                    // ====================================================

                    onError: (
                        message
                    ) => {

                        setVoiceError(
                            message
                        );

                        setIsListening(false);

                        setInterimTranscript("");

                    },

                },

                // Default language
                "en-US"
            );


        if (!recognition) {
            return;
        }


        recognitionRef.current =
            recognition;


        try {

            recognition.start();

        } catch (error) {

            console.error(
                "[VOICE INPUT] Failed to start:",
                error
            );


            setVoiceError(
                "Voice input could not be started. Please try again."
            );

        }

    };

    // ========================================
    // Submit prompt
    // ========================================

    const handleSubmit = () => {

        // ----------------------------------------
        // Stop microphone if still listening.
        //
        // IMPORTANT:
        // Voice text already entered into prompt.
        // Submission still uses normal text flow.
        // ----------------------------------------

        if (isListening) {

            recognitionRef.current?.stop();

        }


        const trimmedPrompt = prompt.trim();

        if (
            !trimmedPrompt &&
            attachments.length === 0
        ) {
            return;
        }

        onSubmit(
            trimmedPrompt,
            attachments,
            selectedImageModel,
            selectedVideoModel,
        );

        setPrompt("");

        setAttachments([]);

        setUploadOpen(false);
    };

    // ========================================
    // Enter sends prompt.
    // Shift + Enter creates new line.
    // ========================================

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            handleSubmit();
        }
    };

    // ========================================
    // Select upload category
    // ========================================

    const handleChooseFile = (
        type: Attachment["type"],
    ) => {
        selectedTypeRef.current = type;

        setUploadOpen(false);

        fileInputRef.current?.click();
    };

    // ========================================
    // User selected local file
    // ========================================

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const attachment: Attachment = {
            id: crypto.randomUUID(),
            name: file.name,
            type: selectedTypeRef.current,
            file,
        };

        setAttachments((previous) => [
            ...previous,
            attachment,
        ]);

        // Allow re-selecting same file later
        event.target.value = "";
    };

    return (
        <div className="composer-wrapper">
            {/* ================================
          ATTACHMENT PREVIEW
         ================================ */}

            {attachments.length > 0 && (
                <div className="attachment-list">
                    {attachments.map(
                        (attachment) => (
                            <div
                                className="attachment-chip"
                                key={attachment.id}
                            >
                                <Paperclip size={13} />

                                <span>{attachment.name}</span>

                                <button
                                    onClick={() =>
                                        setAttachments(
                                            (previous) =>
                                                previous.filter(
                                                    (item) =>
                                                        item.id !==
                                                        attachment.id,
                                                ),
                                        )
                                    }
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        ),
                    )}
                </div>
            )}

            

            <div className="composer">
                {/* Upload + button */}

                <div className="upload-container">
                    <button
                        className="composer-icon-button"
                        onClick={() =>
                            setUploadOpen(
                                (previous) => !previous,
                            )
                        }
                        aria-label="Upload"
                    >
                        <Plus size={21} />
                    </button>

                    {uploadOpen && (
                        <UploadMenu
                            onChooseFile={
                                handleChooseFile
                            }
                        />
                    )}
                </div>

                {/* Hidden native file input */}

                <input
                    ref={fileInputRef}
                    className="hidden-file-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileChange}
                />

                {/* Prompt textarea */}

                <div className="prompt-input-wrapper">

                    <textarea
                        className="prompt-input"

                        value={prompt}

                        onChange={(event) =>
                            setPrompt(
                                event.target.value
                            )
                        }

                        onKeyDown={handleKeyDown}

                        placeholder={
                            isListening
                                ? "Listening..."
                                : "Ask anything..."
                        }

                        rows={1}

                        disabled={loading}
                    />


                    {/* ==================================
      LIVE INTERIM SPEECH TEXT
      ================================== */}

                    {isListening &&
                        interimTranscript && (

                            <div className="voice-interim-text">

                                {interimTranscript}

                            </div>

                        )}

                </div>

                {/* MODEL SELECTORS */}
                <div className="composer-model-row">
                    <label className="model-selector" aria-label="Image generation model">
                        <span className="model-selector-label">Image Model</span>
                        <select
                            value={selectedImageModel}
                            onChange={(event) => setSelectedImageModel(event.target.value)}
                            disabled={loading}
                        >
                            {imageModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="model-selector" aria-label="Video generation model">
                        <span className="model-selector-label">Video Model</span>
                        <select
                            value={selectedVideoModel}
                            onChange={(event) => setSelectedVideoModel(event.target.value)}
                            disabled={loading}
                        >
                            {ENABLED_VIDEO_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>



                {/* Voice - UI placeholder for now */}
                {/* Voice button */} 
                <button
                    className={`composer-icon-button ${isListening
                        ? "mic-button-listening"
                        : ""
                        }`}
                    aria-label={
                        isListening
                            ? "Stop voice input"
                            : "Start voice input"
                    }
                    title={
                        isListening
                            ? "Stop listening"
                            : "Voice input"
                    }
                    type="button"
                    onClick={handleMicClick}
                >
                    <Mic size={20} />
                </button>

                {/* Submit */}

                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={loading}
                    aria-label="Submit prompt"
                >
                    <ArrowUp size={18} />
                </button>
            </div>

            {/* ========================================================
    VOICE STATUS
   ======================================================== */}

            {isListening && (

                <div className="voice-status">

                    <span className="voice-status-dot" />

                    Listening...

                </div>

            )}


            {/* ========================================================
                VOICE ERROR
               ======================================================== */}

            {voiceError && (

                <div className="voice-error">

                    {voiceError}

                </div>

            )}

            <div className="composer-note">
                AI can make mistakes. Verify important
                design details.
            </div>
        </div>
    );
}
