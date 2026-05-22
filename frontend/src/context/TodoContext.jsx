import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const TodoContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useTodos = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
  const { API_BASE, token, authHeaders, isAdmin } = useAuth();
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  // monthlyStats dihitung langsung dari todos (real-time, tidak perlu fetch backend)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthlyTodos = (todos || []).filter((t) => {
      if (!t || !t.id) return false;
      if (t.dueDate) {
        const [y, m] = t.dueDate.split("-").map(Number);
        return y === year && m === month;
      }
      // Fallback: todo tanpa due_date, pakai createdAt
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }
      return false;
    });
    const total = monthlyTodos.length;
    const completed = monthlyTodos.filter(
      (t) => t.status === "completed",
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [todos]);
  const [unfinishedYesterday, setUnfinishedYesterday] = useState([]);
  const API_URL = `${API_BASE}/todos`;
  const REPORT_URL = `${API_BASE}/report`;

  const fetchUnfinishedYesterday = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${REPORT_URL}/unfinished-yesterday`, {
        headers: authHeaders,
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUnfinishedYesterday(json.data);
      }
    } catch (error) {
      console.error("Error fetching unfinished yesterday:", error);
    }
  };

  const fetchTodos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch todos");
      const todoData = Array.isArray(json.data)
        ? json.data
        : json.data
          ? [json.data]
          : [];
      setTodos(todoData);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: authHeaders,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch categories");
      setCategories(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    try {
      const [usersRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: authHeaders }),
        fetch(`${API_BASE}/activity`, { headers: authHeaders }),
      ]);
      const [usersJson, activityJson] = await Promise.all([
        usersRes.json(),
        activityRes.json(),
      ]);
      setUsers(usersRes.ok ? usersJson.data : []);
      setActivities(activityRes.ok ? activityJson.data : []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const addTodo = async (todo) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(todo),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          `API Error: ${res.status} - ${json.message || json.error || res.statusText}`,
        );
      }
      if (json.data && json.data.id) {
        setTodos((prev) => [json.data, ...prev]);
        fetchAdminData();
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
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update todo");
      setTodos((prev) =>
        prev.filter((t) => t && t.id).map((t) => (t.id === id ? json.data : t)),
      );
      fetchAdminData();
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  };

  const transitionTodoStatus = async (id, event) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ event }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to transition todo status");
      setTodos((prev) =>
        prev.filter((t) => t && t.id).map((t) => (t.id === id ? json.data : t)),
      );
      setUnfinishedYesterday((prev) =>
        json.data?.status === "completed" || json.data?.status === "cancelled"
          ? prev.filter((t) => t.id !== id)
          : prev.map((t) => (t.id === id ? { ...t, ...json.data } : t)),
      );
      fetchAdminData();
    } catch (error) {
      console.error("Error transitioning todo status:", error);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setUnfinishedYesterday((prev) => prev.filter((t) => t.id !== id));
      fetchAdminData();
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  };

  const toggleComplete = (id) => {
    const todo =
      todos.find((t) => t.id === id) ||
      unfinishedYesterday.find((t) => t.id === id);
    const event = todo?.completed ? "reopen" : "complete";
    transitionTodoStatus(id, event);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      fetchTodos();
      fetchCategories();
      fetchAdminData();
      fetchUnfinishedYesterday();
    } else {
      setTodos([]);
      setCategories([]);
      setUsers([]);
      setActivities([]);
      setUnfinishedYesterday([]);
    }
  }, [token, isAdmin]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        categories,
        users,
        activities,
        loading,
        monthlyStats,
        unfinishedYesterday,
        addTodo,
        updateTodo,
        transitionTodoStatus,
        deleteTodo,
        toggleComplete,
        fetchTodos,
        fetchCategories,
        fetchAdminData,
        fetchUnfinishedYesterday,
        REPORT_URL,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
