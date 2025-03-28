export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  user_name: string;
  role: 'user' | 'agent';
  status: 'pending' | 'completed' | 'failed' | 'aborted';
  created_at: Date;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResponse {
  id: string;
  type: 'function';
  function: {
    name: string;
    content: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  created_at: Date;
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  message: string;
  user: string;
  id?: string; // Optional client-provided ID
}

export interface CreateMessageRequest {
  message: string;
  user: string;
}
