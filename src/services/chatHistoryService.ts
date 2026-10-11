import {
  getDatabase,
} from "./indexedDb";

import type {
  ConversationRecord,
} from "../types/conversation";



// ============================================================
// DATABASE CONFIGURATION
// ============================================================
//
// IMPORTANT:
//
// UI সরাসরি IndexedDB use করবে না.
//
// UI
//   ↓
// chatHistoryService
//   ↓
// IndexedDB
//
// Later:
//
// UI
//   ↓
// chatHistoryService
//   ↓
// Backend API
//   ↓
// PostgreSQL
//
// তাই future migration সহজ হবে.
// ============================================================

const CONVERSATION_STORE =
  "conversations";


// ============================================================
// CREATE CONVERSATION
// ============================================================

export async function createConversation(
  title: string
): Promise<ConversationRecord> {

  const database =
    await getDatabase();

  const now = Date.now();

  const conversation:
    ConversationRecord = {

    id: crypto.randomUUID(),

    title,

    pinned: false,

    createdAt: now,

    updatedAt: now,

    jobId: null,
  };


  await database.put(
    CONVERSATION_STORE,
    conversation
  );


  return conversation;
}


// ============================================================
// GET ALL CONVERSATIONS
// ============================================================

export async function getAllConversations():
  Promise<ConversationRecord[]> {

  const database =
    await getDatabase();


  const conversations =
    await database.getAll(
      CONVERSATION_STORE
    );


  // Most recently updated first
  return conversations.sort(
    (a, b) =>
      b.updatedAt - a.updatedAt
  );
}


// ============================================================
// GET SINGLE CONVERSATION
// ============================================================

export async function getConversation(
  conversationId: string
): Promise<
  ConversationRecord | undefined
> {

  const database =
    await getDatabase();

  return database.get(
    CONVERSATION_STORE,
    conversationId
  );
}


// ============================================================
// RENAME CONVERSATION
// ============================================================

export async function renameConversation(
  conversationId: string,
  newTitle: string
): Promise<ConversationRecord> {

  const database =
    await getDatabase();

  const conversation =
    await database.get(
      CONVERSATION_STORE,
      conversationId
    );


  if (!conversation) {
    throw new Error(
      `Conversation '${conversationId}' not found.`
    );
  }


  const updatedConversation = {
    ...conversation,

    title: newTitle.trim(),

    updatedAt: Date.now(),
  };


  await database.put(
    CONVERSATION_STORE,
    updatedConversation
  );


  return updatedConversation;
}


// ============================================================
// PIN / UNPIN CONVERSATION
// ============================================================

export async function setConversationPinned(
  conversationId: string,
  pinned: boolean
): Promise<ConversationRecord> {

  const database =
    await getDatabase();

  const conversation =
    await database.get(
      CONVERSATION_STORE,
      conversationId
    );


  if (!conversation) {
    throw new Error(
      `Conversation '${conversationId}' not found.`
    );
  }


  const updatedConversation = {
    ...conversation,

    pinned,

    updatedAt: Date.now(),
  };


  await database.put(
    CONVERSATION_STORE,
    updatedConversation
  );


  return updatedConversation;
}


// ============================================================
// UPDATE LAST ACTIVITY
// ============================================================
//
// যখন user existing chat-এ নতুন prompt পাঠাবে,
// তখন updatedAt update করব.
//
// এতে chat আবার Recents-এর top-এ চলে আসবে.
// ============================================================

export async function touchConversation(
  conversationId: string
): Promise<ConversationRecord> {

  const database =
    await getDatabase();

  const conversation =
    await database.get(
      CONVERSATION_STORE,
      conversationId
    );


  if (!conversation) {
    throw new Error(
      `Conversation '${conversationId}' not found.`
    );
  }


  const updatedConversation = {
    ...conversation,

    updatedAt: Date.now(),
  };


  await database.put(
    CONVERSATION_STORE,
    updatedConversation
  );


  return updatedConversation;
}


// ============================================================
// STORE BACKEND JOB ID
// ============================================================
//
// Future:
// Manager API response থেকে job_id এখানে store করা যাবে.
//
// Conversation
//      ↓
// Manager Job
//
// relation maintain হবে.
// ============================================================

export async function setConversationJobId(
  conversationId: string,
  jobId: string
): Promise<ConversationRecord> {

  const database =
    await getDatabase();

  const conversation =
    await database.get(
      CONVERSATION_STORE,
      conversationId
    );


  if (!conversation) {
    throw new Error(
      `Conversation '${conversationId}' not found.`
    );
  }


  const updatedConversation = {
    ...conversation,

    jobId,

    updatedAt: Date.now(),
  };


  await database.put(
    CONVERSATION_STORE,
    updatedConversation
  );


  return updatedConversation;
}


// ============================================================
// DELETE CONVERSATION
// ============================================================

export async function deleteConversation(
  conversationId: string
): Promise<void> {

  const database =
    await getDatabase();

  await database.delete(
    CONVERSATION_STORE,
    conversationId
  );
}


// ============================================================
// DELETE ALL - DEVELOPMENT / TESTING ONLY
// ============================================================
//
// Production UI-তে expose করবেন না.
// Testing-এর সময় database clean করার জন্য useful.
// ============================================================

export async function clearAllConversations():
  Promise<void> {

  const database =
    await getDatabase();

  await database.clear(
    CONVERSATION_STORE
  );
}