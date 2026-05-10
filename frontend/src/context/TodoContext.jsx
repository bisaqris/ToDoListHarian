import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const TodoContext = createContext();
export const useTodos = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
  const { API_BASE, token, authHeaders, isAdmin } = useAuth();
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = `${API_BASE}/todos`;

  // GET ALL
  const fetchTodos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch todos");
      const todoData = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
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
      const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders });
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
        throw new Error(`API Error: ${res.status} - ${json.message || json.error || res.statusText}`);
      }
      
      if (json.data && json.data.id) {
        setTodos(prev => [json.data, ...prev]);
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
      setTodos(prev =>
        prev.filter(t => t && t.id).map(t => (t.id === id ? json.data : t))
      );
      fetchAdminData();
    } catch (error) {
      console.error("Error updating todo:", error);
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
      setTodos(prev => prev.filter(t => t.id !== id));
      fetchAdminData();
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
    if (token) {
      fetchTodos();
      fetchCategories();
      fetchAdminData();
    } else {
      setTodos([]);
      setCategories([]);
      setUsers([]);
      setActivities([]);
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
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        fetchTodos,
        fetchCategories,
        fetchAdminData,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
