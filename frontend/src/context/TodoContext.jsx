import { createContext, useContext, useEffect, useState } from "react";

const TodoContext = createContext();
export const useTodos = () => useContext(TodoContext);

const API_URL = "http://localhost:5000/api/todos"; // sesuaikan port backend

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET ALL
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      const todoData = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
      setTodos(todoData);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
    }
    setLoading(false);
  };

  const addTodo = async (todo) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${json.message || json.error || res.statusText}`);
      }
      
      if (json.data && json.data.id) {
        setTodos(prev => [json.data, ...prev]);
        return json.data;
      } else {
        throw new Error("Invalid response from server: missing data.id");
      }
    } catch (error) {
      console.error("Error adding todo:", error.message);
      throw error;
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      setTodos(prev =>
        prev.filter(t => t && t.id).map(t => (t.id === id ? { ...t, ...updates } : t))
      );
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  };


  const toggleComplete = (id) => {
    const todo = todos.find(t => t.id === id);
    updateTodo(id, { completed: !todo.completed });
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
