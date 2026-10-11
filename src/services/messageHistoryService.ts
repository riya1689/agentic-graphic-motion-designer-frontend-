import type {
  ChatMessage,
} from "../types/chat";

import {
  getDatabase,
  type StoredMessage,
} from "./indexedDb";


// ============================================================
// SAVE MESSAGE
// ============================================================

export async function saveMessage(
  message: ChatMessage
): Promise<void> {

  const database =
    await getDatabase();


  const storedMessage:
    StoredMessage = {

    id: message.id,

    conversationId:
      message.conversationId,

    role: message.role,

    content: message.content,

    imageUrl:
      message.imageUrl,

    downloadUrl:
      message.downloadUrl,

    artifactFormat:
      message.artifactFormat,

    artifactFilename:
      message.artifactFilename,

    status:
      message.status,

    createdAt:
      message.createdAt.getTime(),
  };


  await database.put(
    "messages",
    storedMessage
  );
}


// ============================================================
// GET MESSAGES BY CONVERSATION
// ============================================================

export async function getMessagesByConversation(
  conversationId: string
): Promise<ChatMessage[]> {

  const database =
    await getDatabase();


  const messages =
    await database.getAllFromIndex(
      "messages",
      "by-conversationId",
      conversationId
    );


  return messages

    .sort(
      (a, b) =>
        a.createdAt -
        b.createdAt
    )

    .map(
      (message): ChatMessage => ({

        id:
          message.id,

        conversationId:
          message.conversationId,

        role:
          message.role,

        content:
          message.content,

        imageUrl:
          message.imageUrl,

        downloadUrl:
          message.downloadUrl,

        artifactFormat:
          message.artifactFormat,

        artifactFilename:
          message.artifactFilename,

        status:
          message.status,

        createdAt:
          new Date(
            message.createdAt
          ),

      })
    );
}


// ============================================================
// DELETE ALL MESSAGES OF ONE CONVERSATION
// ============================================================

export async function deleteMessagesByConversation(
  conversationId: string
): Promise<void> {

  const database =
    await getDatabase();


  const transaction =
    database.transaction(
      "messages",
      "readwrite"
    );


  const index =
    transaction.store.index(
      "by-conversationId"
    );


  let cursor =
    await index.openCursor(
      conversationId
    );


  while (cursor) {

    await cursor.delete();

    cursor =
      await cursor.continue();
  }


  await transaction.done;
}
