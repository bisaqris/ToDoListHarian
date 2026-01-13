export const TodoModel = (data) => ({
  title: data.title,
  description: data.description || "",
  completed: data.completed ?? false,
  priority: data.priority || "medium",
  category: data.category || "general",
  dueDate: data.dueDate || null,
  createdAt: new Date(),
});
