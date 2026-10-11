import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
} from "idb";

import type {
  ConversationRecord,
} from "../types/conversation";


// ============================================================
// STORED MESSAGE
// ============================================================

export interface StoredMessage {
  id: string;

  conversationId: string;

  role: "user" | "assistant";

  content: string;

  imageUrl?: string;

  downloadUrl?: string;

  artifactFormat?: string;

  artifactFilename?: string;

  status?:
    | "sending"
    | "success"
    | "error";

  createdAt: number;
}


// ============================================================
// DATABASE SCHEMA
// ============================================================

export interface NGXFrontendDatabase
  extends DBSchema {

  conversations: {
    key: string;

    value: ConversationRecord;

    indexes: {
      "by-updatedAt": number;

      "by-pinned": number;
    };
  };


  messages: {
    key: string;

    value: StoredMessage;

    indexes: {
      "by-conversationId": string;

      "by-createdAt": number;
    };
  };
}


// ============================================================
// DATABASE CONFIG
// ============================================================

const DATABASE_NAME =
  "ngx-agentic-design-ai";


// IMPORTANT:
//
// আপনার browser database already version 2 হতে পারে,
// কিন্তু সেখানে messages store missing.
//
// তাই version 3 করছি যাতে upgrade আবার run করে.
//
const DATABASE_VERSION = 3;


// ============================================================
// SINGLE DATABASE INSTANCE
// ============================================================

let databasePromise:
  Promise<
    IDBPDatabase<NGXFrontendDatabase>
  >
  | null = null;


// ============================================================
// OPEN DATABASE
// ============================================================
//
// IMPORTANT:
//
// Conversation এবং Message store দুটোই
// এখান থেকে centrally manage হবে.
//
// অন্য কোনো service নিজের openDB() করবে না.
// ============================================================

export function getDatabase() {

  if (!databasePromise) {

    databasePromise =
      openDB<NGXFrontendDatabase>(
        DATABASE_NAME,
        DATABASE_VERSION,
        {
          upgrade(database) {

            // ================================================
            // CONVERSATIONS STORE
            // ================================================

            if (
              !database.objectStoreNames.contains(
                "conversations"
              )
            ) {

              const conversationStore =
                database.createObjectStore(
                  "conversations",
                  {
                    keyPath: "id",
                  }
                );


              conversationStore.createIndex(
                "by-updatedAt",
                "updatedAt"
              );


              conversationStore.createIndex(
                "by-pinned",
                "pinned"
              );
            }


            // ================================================
            // MESSAGES STORE
            // ================================================

            if (
              !database.objectStoreNames.contains(
                "messages"
              )
            ) {

              const messageStore =
                database.createObjectStore(
                  "messages",
                  {
                    keyPath: "id",
                  }
                );


              messageStore.createIndex(
                "by-conversationId",
                "conversationId"
              );


              messageStore.createIndex(
                "by-createdAt",
                "createdAt"
              );
            }

          },
        }
      );
  }


  return databasePromise;
}
