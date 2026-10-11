import {
  Bot,
  Download,
  LoaderCircle,
  User,
} from "lucide-react";

import type {
  ChatMessage,
} from "../types/chat";

interface ChatAreaProps {
  messages: ChatMessage[];
  loading: boolean;
}

// ========================================
// MAIN CHAT WORKSPACE
// ========================================

export default function ChatArea({
  messages,
  loading,
}: ChatAreaProps) {
  // ----------------------------------------
  // Empty state
  // ----------------------------------------

  if (
    messages.length === 0 &&
    !loading
  ) {
    return (
      <main className="chat-area empty-chat">
        <div className="empty-state">
          <div className="empty-logo">
            NG<span style={{color: 'red', fontSize: '22px',}}>X</span>
            {/* ✦ */}
          </div>

          <h1>
            How can I help you today?
          </h1>

          <p>
            Create graphics, posters,
            branding assets and motion
            designs with your AI design
            team.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-area">
      <div className="message-container">
        {messages.map((message) => (
          <article
            className={`message-row ${
              message.role === "user"
                ? "user-message"
                : "assistant-message"
            }`}
            key={message.id}
          >
            {/* Avatar */}

            <div className="message-avatar">
              {message.role === "user" ? (
                <User size={17} />
              ) : (
                <Bot size={17} />
              )}
            </div>

            {/* Message */}

            <div className="message-content">
              <div className="message-role">
                {message.role === "user"
                  ? "You"
                  : "Design AI"}
              </div>
 
              <div className="message-text">
                {message.content}
              </div>


             {/* Generated preview*/}

              {message.imageUrl && (
                <div className="generated-image-card">
                  {message.imageUrl.endsWith(".mp4") ||
                  message.imageUrl.endsWith(".webm") ||
                  message.imageUrl.endsWith(".mov") ||
                  message.imageUrl.includes("/videos/") ? (
                    <video
                      src={message.imageUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "8px" }}
                    />
                  ) : (
                    <img
                      src={message.imageUrl}
                      alt="Generated design"
                    />
                  )}
                {/* Download button */}
                 {message.downloadUrl && (
                    <div className="generated-image-actions">
                      <a
                        href={message.downloadUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="download-artifact-button"
                      >
                        <Download size={16} />
                        <span>
                          Download
                          {message.artifactFormat
                            ? ` (${message.artifactFormat.toUpperCase()})`
                            : ""}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}

        {/* Agent processing indicator */}

        {loading && (
          <article className="message-row assistant-message">
            <div className="message-avatar">
              <Bot size={17} />
            </div>

            <div className="message-content">
              <div className="message-role">
                Design AI
              </div>

              <div className="processing-message">
                <LoaderCircle
                  className="spinner"
                  size={17}
                />

                <span>
                  Working on your request...
                </span>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}