export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  category: string | null;
  recurringPattern: string | null;
  completedAt: Date | null;
  externalId: string | null;
  externalProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: "low" | "normal" | "high" | "urgent";
  status?: "todo" | "in_progress" | "done";
  category?: string | null;
  recurringPattern?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: "low" | "normal" | "high" | "urgent";
  status?: "todo" | "in_progress" | "done";
  category?: string | null;
}
