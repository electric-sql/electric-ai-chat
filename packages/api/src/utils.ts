import { ChatMessage } from './types.js';

export function rowToChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    chat_id: row.chat_id,
    content: row.content,
    user_name: row.user_name,
    created_at: row.created_at,
    role: row.role,
    status: row.status,
  };
}
