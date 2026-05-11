import { useState } from "react";
import { Dashboard } from "../components/Dashboard";
import { FilterBar } from "../components/FilterBar";
import { TodoCard } from "../components/TodoCard";
import { TodoForm } from "../components/TodoForm";
import { AdminPanel } from "../components/AdminPanel";
import { useTodos } from "../context/TodoContext";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    transitionTodoStatus,
  } = useTodos();
  const { isAdmin } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priority: "all",
    status: "all",
  });

  const filteredTodos = todos.filter((todo) => {
    if (!todo || !todo.id) return false;

    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      todo.title.toLowerCase().includes(searchLower) ||
      (todo.description &&
        todo.description.toLowerCase().includes(searchLower));

    const matchesCategory =
      filters.category === "all" || todo.category === filters.category;

    const matchesPriority =
      filters.priority === "all" || todo.priority === filters.priority;

    const matchesStatus =
      filters.status === "all" ||
      todo.status === filters.status ||
      (filters.status === "completed" && todo.completed) ||
      (filters.status === "pending" && !todo.completed);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <section className="w-screen p-6">
      <Dashboard />
      {isAdmin && <AdminPanel />}

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <button
        onClick={() => {
          setEditingTodo(null);
          setShowForm(true);
        }}
        className="relative overflow-hidden group mb-4 px-6 py-3 rounded-lg bg-gradient-to-r from-[#b900bc] to-[#009cff] text-white font-medium shadow-md hover:shadow-lg transition-all"
      >
        <span className="absolute inset-0 w-full h-full bg-[#b900bc] transition-transform duration-300 ease-out transform -translate-x-full group-hover:translate-x-0"></span>
        <span className="relative z-10">Tambah Todo</span>
      </button>

      <div className="space-y-4">
        {filteredTodos && filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={(todo) => {
                setEditingTodo(todo);
                setShowForm(true);
              }}
              onDelete={deleteTodo}
              onToggle={toggleComplete}
              onTransition={transitionTodoStatus}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              {todos.length === 0
                ? 'Belum ada todo. Klik "Tambah Todo" untuk memulai.'
                : "Tidak ada todo yang sesuai dengan filter."}
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <TodoForm
          todo={editingTodo}
          onSave={async (data) => {
            try {
              if (editingTodo) {
                await updateTodo(editingTodo.id, data);
              } else {
                await addTodo(data);
              }
              setShowForm(false);
              setEditingTodo(null);
            } catch (error) {
              alert(`Gagal menyimpan todo: ${error.message}`);
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </section>
  );
}
