import {
  MessageSquare,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ConversationRecord,
} from "../types/conversation";


// ============================================================
// SIDEBAR PROPS
// ============================================================

interface SidebarProps {
  open: boolean;

  conversations: ConversationRecord[];

  activeConversationId: string | null;

  onNewChat: () => void;

  onOpenSettings: () => void;

  onSelectConversation: (
    conversationId: string
  ) => void;

  // ----------------------------------------------------------
  // Row actions are handled in App.tsx.
  // Sidebar only emits user intent.
  // ----------------------------------------------------------

  onRenameConversation: (
    conversationId: string,
    newTitle: string
  ) => void;

  onDeleteConversation: (
    conversationId: string
  ) => void;

  onTogglePinConversation: (
    conversationId: string,
    pinned: boolean
  ) => void;
}


// ============================================================
// DYNAMIC SIDEBAR
// ============================================================

export default function Sidebar({
  open,
  conversations,
  activeConversationId,
  onNewChat,
  onOpenSettings,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onTogglePinConversation,
}: SidebarProps) {

  // Which row menu is currently open
  const [
    openMenuId,
    setOpenMenuId,
  ] = useState<string | null>(null);


  // Rename dialog state
  const [
    renameTarget,
    setRenameTarget,
  ] = useState<ConversationRecord | null>(
    null
  );

  const [
    renameValue,
    setRenameValue,
  ] = useState("");


  // Reference used to detect outside click
  const sidebarRef =
    useRef<HTMLElement | null>(null);


  // ----------------------------------------------------------
  // Split into PINNED / RECENTS
  // ----------------------------------------------------------

  const pinnedConversations =
    conversations.filter(
      (conversation) =>
        conversation.pinned
    );

  const recentConversations =
    conversations.filter(
      (conversation) =>
        !conversation.pinned
    );


  // ==========================================================
  // CLOSE MENU ON OUTSIDE CLICK
  // ==========================================================

  useEffect(() => {

    function handleDocumentClick(
      event: MouseEvent
    ) {

      const target =
        event.target as Node;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target)
      ) {
        setOpenMenuId(null);
      }
    }


    document.addEventListener(
      "mousedown",
      handleDocumentClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleDocumentClick
      );

    };

  }, []);


  // ==========================================================
  // OPEN RENAME DIALOG
  // ==========================================================

  const handleRenameClick = (
    conversation: ConversationRecord
  ) => {

    setRenameTarget(conversation);

    setRenameValue(
      conversation.title
    );

    setOpenMenuId(null);
  };


  // ==========================================================
  // SAVE RENAME
  // ==========================================================

  const handleRenameSubmit = () => {

    if (!renameTarget) {
      return;
    }


    const trimmedTitle =
      renameValue.trim();


    if (!trimmedTitle) {
      return;
    }


    onRenameConversation(
      renameTarget.id,
      trimmedTitle
    );


    setRenameTarget(null);

    setRenameValue("");
  };


  // ==========================================================
  // RENDER ONE CONVERSATION ROW
  // ==========================================================

  const renderConversationRow = (
    conversation: ConversationRecord
  ) => {

    const isActive =
      activeConversationId ===
      conversation.id;

    const isMenuOpen =
      openMenuId ===
      conversation.id;


    return (
      <div
        key={conversation.id}
        className="conversation-row"
      >

        {/* Main clickable row */}

        <button
          className={`conversation-item ${
            isActive
              ? "conversation-item-active"
              : ""
          }`}
          onClick={() =>
            onSelectConversation(
              conversation.id
            )
          }
        >

          <MessageSquare size={15} />

          <span>
            {conversation.title}
          </span>

        </button>


        {/* Three-dot menu button */}

        <button
          className="conversation-menu-button"
          aria-label="Conversation options"
          onClick={(event) => {

            // Prevent row selection
            event.stopPropagation();

            setOpenMenuId(
              isMenuOpen
                ? null
                : conversation.id
            );

          }}
        >

          <MoreHorizontal size={17} />

        </button>


        {/* Action dropdown */}

        {isMenuOpen && (

          <div className="conversation-menu">

            {/* PIN / UNPIN */}

            <button
              onClick={() => {

                onTogglePinConversation(
                  conversation.id,
                  !conversation.pinned
                );

                setOpenMenuId(null);

              }}
            >

              {conversation.pinned ? (
                <PinOff size={16} />
              ) : (
                <Pin size={16} />
              )}

              <span>
                {conversation.pinned
                  ? "Unpin"
                  : "Pin"}
              </span>

            </button>


            {/* RENAME */}

            <button
              onClick={() =>
                handleRenameClick(
                  conversation
                )
              }
            >

              <Pencil size={16} />

              <span>Rename</span>

            </button>


            {/* DELETE */}

            <button
              className="conversation-menu-danger"
              onClick={() => {

                const confirmed =
                  window.confirm(
                    `Delete "${conversation.title}"?`
                  );


                if (!confirmed) {
                  return;
                }


                onDeleteConversation(
                  conversation.id
                );

                setOpenMenuId(null);

              }}
            >

              <Trash2 size={16} />

              <span>Delete</span>

            </button>

          </div>

        )}

      </div>
    );
  };


  return (
    <>

      <aside
        ref={sidebarRef}
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >

        {/* ===================================================
            NEW CHAT
           =================================================== */}

        <button
          className="new-chat-button"
          onClick={onNewChat}
        >

          <Plus size={18} />

          <span>New Chat</span>

        </button>


        {/* ===================================================
            SETTINGS
           =================================================== */}

        <button
          className="sidebar-action"
          onClick={onOpenSettings}
        >

          <Settings size={18} />

          <span>Settings</span>

        </button>


        {/* ===================================================
            PINNED
           =================================================== */}

        {pinnedConversations.length > 0 && (

          <section className="sidebar-section">

            <div className="sidebar-section-title">

              <Pin size={13} />

              <span>PINNED</span>

            </div>


            <div className="conversation-list">

              {pinnedConversations.map(
                renderConversationRow
              )}

            </div>

          </section>

        )}


        {/* ===================================================
            RECENTS
           =================================================== */}

        <section className="sidebar-section sidebar-recents-section">

          <div className="sidebar-section-title">
            <span>RECENTS</span>
          </div>


          <div className="conversation-list recent-conversation-list">

            {recentConversations.length ===
            0 ? (

              <div className="sidebar-empty">
                No conversations yet
              </div>

            ) : (

              recentConversations.map(
                renderConversationRow
              )

            )}

          </div>

        </section>

      </aside>


      {/* =====================================================
          RENAME DIALOG
         ===================================================== */}

      {renameTarget && (

        <div className="rename-overlay">

          <div className="rename-dialog">

            <h3>
              Rename conversation
            </h3>


            <input
              autoFocus
              value={renameValue}
              onChange={(event) =>
                setRenameValue(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key === "Enter"
                ) {
                  handleRenameSubmit();
                }

                if (
                  event.key === "Escape"
                ) {
                  setRenameTarget(null);
                }

              }}
            />


            <div className="rename-dialog-actions">

              <button
                className="rename-cancel-button"
                onClick={() =>
                  setRenameTarget(null)
                }
              >
                Cancel
              </button>


              <button
                className="rename-save-button"
                onClick={
                  handleRenameSubmit
                }
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}


// import {
//   MessageSquare,
//   MoreHorizontal,
//   Pin,
//   PinOff,
//   Plus,
//   Settings,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// import type {
//   ConversationRecord,
// } from "../types/conversation";

// // ============================================================
// // SIDEBAR PROPS
// // ============================================================

// interface SidebarProps {
//   open: boolean;
//   // Real conversations from IndexedDB
//   conversations: ConversationRecord[];

//   // Currently open conversation
//   activeConversationId: string | null;

//   onNewChat: () => void;

//   onOpenSettings: () => void;

//   onSelectConversation: (
//     conversationId: string
//   ) => void; 
// }

// // ========================================
// // CHAT HISTORY SIDEBAR
// // ========================================

// export default function Sidebar({
//   open,
//   conversations,
//   activeConversationId,
//   onNewChat,
//   onOpenSettings,
//   onSelectConversation,
// }: SidebarProps) { 

//   // ----------------------------------------------------------
//   // Split conversations into PINNED + RECENTS
//   // ----------------------------------------------------------

//   const pinnedConversations =
//     conversations.filter(
//       (conversation) =>
//         conversation.pinned
//     );

//   const recentConversations =
//     conversations.filter(
//       (conversation) =>
//         !conversation.pinned
//     );


//   return (
//     <aside
//       className={`sidebar ${
//         open ? "sidebar-open" : ""
//       }`}
//     >

//       {/* =====================================================
//           NEW CHAT
//          ===================================================== */}

//       <button
//         className="new-chat-button"
//         onClick={onNewChat}
//       >
//         <Plus size={18} />

//         <span>New Chat</span>
//       </button>


//       {/* =====================================================
//           SETTINGS
//          ===================================================== */}

//       <button
//         className="sidebar-action"
//         onClick={onOpenSettings}
//       >
//         <Settings size={18} />

//         <span>Settings</span>
//       </button>


//       {/* =====================================================
//           PINNED CONVERSATIONS
//          ===================================================== */}

//       {pinnedConversations.length > 0 && (
//         <section className="sidebar-section">

//           <div className="sidebar-section-title">
//             <Pin size={13} />

//             <span>PINNED</span>
//           </div>


//           <div className="conversation-list">

//             {pinnedConversations.map(
//               (conversation) => (

//                 <button
//                   key={conversation.id}

//                   className={`conversation-item ${
//                     activeConversationId ===
//                     conversation.id
//                       ? "conversation-item-active"
//                       : ""
//                   }`}

//                   onClick={() =>
//                     onSelectConversation(
//                       conversation.id
//                     )
//                   }
//                 >

//                   <MessageSquare size={15} />

//                   <span>
//                     {conversation.title}
//                   </span>

//                 </button>

//               )
//             )}

//           </div>

//         </section>
//       )}


//       {/* =====================================================
//           RECENT CONVERSATIONS
//          ===================================================== */}

//       <section className="sidebar-section">

//         <div className="sidebar-section-title">
//           <span>RECENTS</span>
//         </div>


//         <div className="conversation-list">

//           {recentConversations.length === 0 ? (

//             <div className="sidebar-empty">
//               No conversations yet
//             </div>

//           ) : (

//             recentConversations.map(
//               (conversation) => (

//                 <button
//                   key={conversation.id}

//                   className={`conversation-item ${
//                     activeConversationId ===
//                     conversation.id
//                       ? "conversation-item-active"
//                       : ""
//                   }`}

//                   onClick={() =>
//                     onSelectConversation(
//                       conversation.id
//                     )
//                   }
//                 >

//                   <MessageSquare size={15} />

//                   <span>
//                     {conversation.title}
//                   </span>

//                 </button>

//               )
//             )

//           )}
//         </div>
//       </section>
//     </aside>
//   );
// }
