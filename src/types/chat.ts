// ========================================
// FRONTEND CHAT TYPES
// These types belong ONLY to frontend.
// They do not import backend schemas.
// ========================================

export type MessageRole = "user" | "assistant";

export type MessageStatus =
  | "sending"
  | "success"
  | "error";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "file" | "pdf";
  file: File;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  conversationId: string;

  // Optional generated image returned by agent/backend
  imageUrl?: string;

  downloadUrl?: string;
  artifactFormat?: string;
  artifactFilename?: string;

  status?: MessageStatus;

  createdAt: Date;
}



export interface Conversation {
  id: string;
  title: string;
  pinned?: boolean;
}

export interface AgentApiResponse {
  success: boolean;

  message?: string;

  // Future generated artifact
  image_url?: string;

  download_url?: string;

  artifact_format?: string;
  artifact_filename?: string;

  // Backend may send useful error information
  error?: string;

  error_code?: string;

  detail?: string | Array<{ msg?: string; detail?: string }>;

  status?: string;

  request_id?: string;
  stage?: string;
  workflow?: {
    request_id?: string;
    status?: string;
    selected_model?: string;
    complexity?: boolean;
    outputs?: Array<{
      uri: string;
      format: string;
      editable?: boolean;
      native_editable?: boolean;
    }>;
    verification?: {
      status?: string;
      passed?: boolean;
    };
  };
}

// ========================================
// IMAGE GENERATION MODEL
// ========================================

export interface ImageModelSelection {
    id: string;
    provider: "higgsfield";
}

export interface ChatExecutionOptions {

    selectedImageModel?: string;

}
