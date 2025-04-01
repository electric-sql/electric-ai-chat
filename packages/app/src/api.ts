// Types
export interface ChatMessage {
  id: string;
  content: string;
  user_name: string;
  created_at: Date;
  role?: 'user' | 'agent';
  status?: 'pending' | 'completed' | 'failed' | 'aborted';
}

export interface Chat {
  id: string;
  created_at: Date;
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  message: string;
  user: string;
  id?: string;
  dbUrl?: {
    redactedUrl: string;
    redactedId: string;
    password: string;
  };
}

export interface CreateMessageRequest {
  message: string;
  user: string;
  dbUrl?: {
    redactedUrl: string;
    redactedId: string;
    password: string;
  };
}

// Todo List Types
export interface TodoList {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface TodoItem {
  id: string;
  list_id: string;
  task: string;
  done: boolean;
  order_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTodoListRequest {
  name: string;
  id?: string;
}

export interface CreateTodoItemRequest {
  task: string;
  list_id: string;
  order_key: string;
}

export interface UpdateTodoItemRequest {
  task?: string;
  done?: boolean;
  order_key?: string;
}

// API client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Create a new chat with an initial message
 */
export async function createChat(
  message: string,
  user: string,
  id?: string,
  dbUrl?: { redactedUrl: string; redactedId: string; password: string }
): Promise<Chat> {
  const payload: CreateChatRequest = { message, user, id, dbUrl };

  const response = await fetch(`${API_URL}/api/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create chat');
  }

  const data = await response.json();
  return data.chat;
}

/**
 * Add a message to an existing chat
 */
export async function addMessage(
  chatId: string,
  message: string,
  user: string,
  dbUrl?: { redactedUrl: string; redactedId: string; password: string }
): Promise<{ messages: ChatMessage[] }> {
  const payload: CreateMessageRequest = { message, user, dbUrl };

  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add message');
  }

  return response.json();
}

/**
 * Abort an in-progress AI message
 */
export async function abortMessage(messageId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/messages/${messageId}/abort`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to abort message');
  }

  return response.json();
}

/**
 * Create a new todo list
 */
export async function createTodoList(name: string, id?: string): Promise<TodoList> {
  const payload: CreateTodoListRequest = { name, id };

  const response = await fetch(`${API_URL}/api/todo-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create todo list');
  }

  const data = await response.json();
  return data.todoList;
}

/**
 * Delete a todo list
 */
export async function deleteTodoList(listId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/todo-lists/${listId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete todo list');
  }

  return response.json();
}

/**
 * Create a new todo item
 */
export async function createTodoItem(
  listId: string,
  task: string,
  orderKey: string
): Promise<TodoItem> {
  const payload: CreateTodoItemRequest = { list_id: listId, task, order_key: orderKey };

  const response = await fetch(`${API_URL}/api/todo-lists/${listId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create todo item');
  }

  const data = await response.json();
  return data.todoItem;
}

/**
 * Update a todo item
 */
export async function updateTodoItem(
  itemId: string,
  updates: UpdateTodoItemRequest
): Promise<TodoItem> {
  const response = await fetch(`${API_URL}/api/todo-items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update todo item');
  }

  const data = await response.json();
  return data.todoItem;
}

/**
 * Delete a todo item
 */
export async function deleteTodoItem(itemId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/todo-items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete todo item');
  }

  return response.json();
}
