// ============================================================
// CONVERSATION TYPE
// ============================================================
//
// এই type শুধু frontend chat history-এর জন্য।
// Backend Manager/Planner/Graphic Agent schema-এর সাথে
// এর কোনো dependency নেই.
//
// Later PostgreSQL use করলেও UI এই same type use করতে পারবে.
// ============================================================

export interface ConversationRecord {
  // Unique frontend conversation ID
  id: string;

  // Sidebar title
  title: string;

  // User pin করেছে কি না
  pinned: boolean;

  // Chat create হওয়ার সময়
  createdAt: number;

  // Last activity time
  updatedAt: number;

  // Future backend workflow/job connection
  jobId?: string | null;
}