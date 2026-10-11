import { useEffect, useState, } from "react";
import {
    createConversation,
    getAllConversations,
    touchConversation,
    renameConversation,
    deleteConversation,
    setConversationPinned,
} from "./services/chatHistoryService";

import {
    saveMessage,
    getMessagesByConversation,
    deleteMessagesByConversation,
} from "./services/messageHistoryService";

import type {
    ConversationRecord,
} from "./types/conversation";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ChatArea from "./components/ChatArea";
import Composer from "./components/Composer";
import LoginPage from "./components/LoginPage";

import SettingsDrawer, {
    type ThemeMode,
} from "./components/SettingsDrawer";
import IconLibraryPage from "./components/IconLibraryPage";
import AdminDashboardPage from "./components/AdminDashboardPage";

import {
    sendPromptToManager,
} from "./services/chatApi";

import type {
    Attachment,
    ChatMessage,
} from "./types/chat";

import {
    registerDesktopLifecycle,
    startDesktopBackend,
} from "./services/desktopBackend";
import {
    logout,
    restoreSession,
    type AuthUser,
} from "./services/authApi";

// ========================================
// ROOT FRONTEND APPLICATION
// ========================================

export default function App() {
    const [authUser, setAuthUser] =
        useState<AuthUser | null>(null);

    const [authReady, setAuthReady] =
        useState(false);

    const [backendError, setBackendError] =
        useState<string | null>(null);

    const initializeDesktop = async () => {
        setBackendError(null);
        setAuthReady(false);
        try {
            await startDesktopBackend();
            await registerDesktopLifecycle();
            setAuthUser(await restoreSession());
        } catch (error) {
            console.error(
                "[DESKTOP] Backend/auth startup failed:",
                error,
            );
            setAuthUser(null);
            setBackendError(
                error instanceof Error
                    ? error.message
                    : "The local backend could not start.",
            );
        } finally {
            setAuthReady(true);
        }
    };

    useEffect(() => {
        void initializeDesktop();
    }, []);

    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    const [
        settingsOpen,
        setSettingsOpen,
    ] = useState(false);

    const [
        iconLibraryOpen,
        setIconLibraryOpen,
    ] = useState(false);

    const [
        adminDashboardOpen,
        setAdminDashboardOpen,
    ] = useState(false);

    const [theme, setTheme] =
        useState<ThemeMode>("light");

    const [messages, setMessages] =
        useState<ChatMessage[]>([]);

    const [loading, setLoading] =
        useState(false);

    // ========================================
    // CONVERSATION HISTORY STATE
    // ========================================

    const [
        conversations,
        setConversations,
    ] = useState<ConversationRecord[]>([]);


    // Currently selected/open conversation
    const [
        activeConversationId,
        setActiveConversationId,
    ] = useState<string | null>(null);

    const handleAuthenticatedLogin = (user: AuthUser) => {
        // Never carry an admin-only view into the next session. The same
        // desktop window can be used first by an admin and then by a client.
        setAdminDashboardOpen(false);
        setIconLibraryOpen(false);
        setSettingsOpen(false);
        setAuthUser(user);
    };



    // ========================================
    // APPLY THEME
    // ========================================

    useEffect(() => {
        const root =
            document.documentElement;

        let activeTheme = theme;

        // System follows OS/browser setting
        if (theme === "system") {
            activeTheme =
                window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches
                    ? "dark"
                    : "light";
        }

        root.setAttribute(
            "data-theme",
            activeTheme,
        );
    }, [theme]);

    // ========================================
    // LOAD CONVERSATIONS FROM INDEXEDDB
    // ========================================

    const loadConversations =
        async () => {

            try {

                const storedConversations =
                    await getAllConversations();

                setConversations(
                    storedConversations
                );

            } catch (error) {

                console.error(
                    "[FRONTEND] Failed to load conversations:",
                    error
                );

            }
        };

    // ========================================
    // INITIAL CONVERSATION LOAD
    // ========================================
    //
    // App start হলে IndexedDB থেকে
    // existing chat history load হবে.
    // ========================================

    useEffect(() => {

        loadConversations();

    }, []);

    // ========================================
    // CREATE SIDEBAR TITLE FROM FIRST PROMPT
    // ========================================
    //
    // এখন কোনো LLM call করা হচ্ছে না.
    //
    // First prompt-এর short version title হিসেবে
    // ব্যবহার করছি.
    //
    // Later চাইলে dedicated title generator
    // use করা যাবে.
    // ========================================

    const createConversationTitle = (
        prompt: string
    ): string => {

        const cleaned =
            prompt
                .replace(/\s+/g, " ")
                .trim();


        if (!cleaned) {
            return "New Design Chat";
        }


        const MAX_LENGTH = 42;


        if (
            cleaned.length <= MAX_LENGTH
        ) {
            return cleaned;
        }


        return (
            cleaned.slice(
                0,
                MAX_LENGTH
            ).trim() + "..."
        );
    };

    // ========================================
    // NEW CHAT
    // ========================================

    const handleNewChat = () => {

        // Clear current conversation
        setActiveConversationId(null);

        // Clear visible messages
        setMessages([]);

    };

    // ========================================
    // SELECT EXISTING CONVERSATION
    // ========================================
    //
    // এই stage-এ আমরা শুধু selected chat track করছি.
    //
    // Messages এখনো IndexedDB-তে persist করছি না,
    // তাই historical messages next step-এ add করব.
    // ========================================

    const handleSelectConversation =
        async (
            conversationId: string
        ) => {

            try {

                // Mark selected conversation
                setActiveConversationId(
                    conversationId
                );


                // Load persisted messages
                const storedMessages =
                    await getMessagesByConversation(
                        conversationId
                    );


                // Show them in ChatArea
                setMessages(
                    storedMessages
                );

            } catch (error) {

                console.error(
                    "[FRONTEND] Failed to load conversation messages:",
                    error
                );

            }

        };

    // ========================================
    // RENAME CONVERSATION
    // ========================================

    const handleRenameConversation = async (
        conversationId: string,
        newTitle: string
    ) => {

        try {

            await renameConversation(
                conversationId,
                newTitle
            );


            // Reload IndexedDB-backed sidebar
            await loadConversations();

        } catch (error) {

            console.error(
                "[FRONTEND] Failed to rename conversation:",
                error
            );

        }

    };

    // ========================================
    // PIN / UNPIN CONVERSATION
    // ========================================

    const handleTogglePinConversation =
        async (
            conversationId: string,
            pinned: boolean
        ) => {

            try {

                await setConversationPinned(
                    conversationId,
                    pinned
                );


                // Refresh sidebar immediately
                await loadConversations();

            } catch (error) {

                console.error(
                    "[FRONTEND] Failed to update pin:",
                    error
                );

            }

        };

    // ========================================
    // DELETE CONVERSATION
    // ========================================

    const handleDeleteConversation =
        async (
            conversationId: string
        ) => {

            try {

                await deleteMessagesByConversation(
                    conversationId
                );

                // Delete permanently from IndexedDB
                await deleteConversation(
                    conversationId
                );


                // If user deletes currently open chat,
                // reset workspace.
                if (
                    activeConversationId ===
                    conversationId
                ) {

                    setActiveConversationId(null);

                    setMessages([]);

                }


                // Refresh Sidebar
                await loadConversations();

            } catch (error) {

                console.error(
                    "[FRONTEND] Failed to delete conversation:",
                    error
                );

            }

        };

    // ========================================
    // USER SENDS PROMPT
    // ========================================

    const handleSendPrompt = async (
        prompt: string,
        attachments: Attachment[],
        imageModel: string,
        videoModel: string,
    ) => {

        // --------------------------------------
        // CREATE / UPDATE CONVERSATION HISTORY
        // --------------------------------------

        let currentConversationId =
            activeConversationId;


        if (!currentConversationId) {

            const title =
                createConversationTitle(
                    prompt ||
                    `Uploaded ${attachments.length} file(s)`
                );


            const newConversation =
                await createConversation(
                    title
                );


            currentConversationId =
                newConversation.id;


            setActiveConversationId(
                newConversation.id
            );


            await loadConversations();

        } else {

            await touchConversation(
                currentConversationId
            );


            await loadConversations();

        }

        // --------------------------------------
        // Immediately show user's message
        // --------------------------------------

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),

            // NEW
            conversationId:
                currentConversationId,

            role: "user",

            content:
                prompt ||
                `Uploaded ${attachments.length} file(s)`,

            status: "success",

            createdAt: new Date(),
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);


        // --------------------------------------
        // Show loading BEFORE persistence/API
        // --------------------------------------

        setLoading(true);


        try {

            // ------------------------------------
            // Save history
            //
            // IMPORTANT:
            // Local history failure should NOT stop
            // the Manager API request.
            // ------------------------------------

            try {

                await saveMessage(
                    userMessage
                );

            } catch (storageError) {

                console.error(
                    "[FRONTEND] Failed to persist user message:",
                    storageError
                );

            }


            // ------------------------------------
            // Send prompt to backend Manager
            // ------------------------------------

            const response =
                await sendPromptToManager({
                    prompt,
                    attachments,
                    selectedImageModel: imageModel,
                    selectedVideoModel: videoModel,
                });

            // ------------------------------------
            // Successful agent response
            // ------------------------------------

            if (response.success) {
                const assistantMessage: ChatMessage = {
                    id: crypto.randomUUID(),

                    // NEW
                    conversationId:
                        currentConversationId,

                    role: "assistant",

                    content:
                        response.message ||
                        "Your design request has been completed.",

                    imageUrl:
                        response.image_url,

                    downloadUrl:
                        response.download_url,

                    artifactFormat:
                        response.artifact_format,

                    artifactFilename:
                        response.artifact_filename,

                    status: "success",

                    createdAt: new Date(),
                };

                setMessages((previous) => [
                    ...previous,
                    assistantMessage,
                ]);

                // Persist assistant response
                try {

                    await saveMessage(
                        assistantMessage
                    );

                } catch (storageError) {

                    console.error(
                        "[FRONTEND] Failed to persist assistant message:",
                        storageError
                    );

                }

                return;
            }

            // ------------------------------------
            // Agent/model failure.
            //
            // Example:
            // Gemini/OpenAI rate limit
            // image generation failed
            // planner error
            // timeout
            //
            // User gets polite response.
            // ------------------------------------

            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),

                conversationId:
                    currentConversationId,

                role: "assistant",

                content:
                    response.message ||
                    "I’m sorry, I couldn’t generate the design. Please try again.",

                status: "error",

                createdAt: new Date(),
            };

            setMessages((previous) => [
                ...previous,
                errorMessage,
            ]);

            // Save error message to history
            await saveMessage(
                errorMessage
            );
        } catch (error) {
            console.error(
                "[FRONTEND] Unexpected error:",
                error,
            );

            // ------------------------------------
            // Last-resort UI protection.
            // The frontend must never crash because
            // an agent failed.
            // ------------------------------------

            const fallbackMessage: ChatMessage = {
                id: crypto.randomUUID(),

                conversationId:
                    currentConversationId,

                role: "assistant",

                content:
                    "Something went wrong while processing your design request. Please try again.",

                status: "error",

                createdAt: new Date(),
            };

            setMessages((previous) => [
                ...previous,
                fallbackMessage,
            ]);

            // Save fallback error to history
            await saveMessage(
                fallbackMessage
            );
        } finally {
            setLoading(false);
        }
    };

    if (!authReady) {
        return (
            <main className="auth-page">
                <div className="auth-card auth-loading-card">
                    Connecting to the design service...
                </div>
            </main>
        );
    }

    if (backendError) {
        return (
            <main className="auth-page">
                <section className="auth-card auth-loading-card">
                    <h1>Local service unavailable</h1>
                    <p>
                        The desktop backend did not start, so login cannot
                        connect to the local database.
                    </p>
                    <div className="auth-error">{backendError}</div>
                    <button
                        className="auth-submit"
                        type="button"
                        onClick={() => void initializeDesktop()}
                    >
                        Retry connection
                    </button>
                </section>
            </main>
        );
    }

    if (!authUser) {
        return <LoginPage onLogin={handleAuthenticatedLogin} />;
    }

    return (
        <div className="app">
            {/* ================================
          HEADER
         ================================ */}

            <TopBar
                onToggleSidebar={() =>
                    setSidebarOpen(
                        (previous) => !previous,
                    )
                }
                onLogout={async () => {
                    await logout();
                    setAdminDashboardOpen(false);
                    setIconLibraryOpen(false);
                    setSettingsOpen(false);
                    setAuthUser(null);
                }}
            />

            {adminDashboardOpen ? (
                <AdminDashboardPage
                    authUser={authUser}
                    onBack={() => setAdminDashboardOpen(false)}
                />
            ) : iconLibraryOpen ? (
                <IconLibraryPage
                    onBack={() => setIconLibraryOpen(false)}
                />
            ) : (
            <div className="app-body">
                {/* ==============================
            SIDEBAR
           ============================== */}

                <Sidebar
                    open={sidebarOpen}

                    conversations={conversations}

                    activeConversationId={
                        activeConversationId
                    }

                    onNewChat={handleNewChat}

                    onSelectConversation={
                        handleSelectConversation
                    }

                    onRenameConversation={
                        handleRenameConversation
                    }

                    onDeleteConversation={
                        handleDeleteConversation
                    }

                    onTogglePinConversation={
                        handleTogglePinConversation
                    }

                    onOpenSettings={() =>
                        setSettingsOpen(true)
                    }
                />

                {/* ==============================
            MAIN CHAT WORKSPACE
           ============================== */}

                <section className="workspace">
                    <ChatArea
                        messages={messages}
                        loading={loading}
                    />

                    <Composer
                        loading={loading}
                        onSubmit={handleSendPrompt}
                    />
                </section>
            </div>
            )}

            {/* ================================
          SETTINGS DRAWER
         ================================ */}

            <SettingsDrawer
                open={settingsOpen}
                authUser={authUser}
                theme={theme}
                onClose={() =>
                    setSettingsOpen(false)
                }
                onThemeChange={setTheme}
                onOpenIconLibrary={() => {
                    setSettingsOpen(false);
                    setIconLibraryOpen(true);
                }}
                onOpenAdminDashboard={() => {
                    setSettingsOpen(false);
                    setAdminDashboardOpen(true);
                }}
            />
        </div>
    );
}
