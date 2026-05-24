import { useState } from "react";
import { Dashboard } from "../components/Dashboard";
import { FilterBar } from "../components/FilterBar";
import { TodoCard } from "../components/TodoCard";
import { TodoForm } from "../components/TodoForm";
import { AdminPanel } from "../components/AdminPanel";
import { useTodos } from "../context/TodoContext";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  const {
    todos,
    unfinishedYesterday,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    transitionTodoStatus,
  } = useTodos();
  const { isAdmin } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [reminderCollapsed, setReminderCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priority: "all",
    status: "all",
  });

  const filteredTodos = todos.filter((todo) => {
    if (!todo || !todo.id) return false;

    if (todo.status === "Selesai" || todo.status === "completed" || todo.completed === true) {
      return false;
    }

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
      {/* ── REMINDER SECTION: Todo Kemarin yang Belum Selesai ── */}
      {unfinishedYesterday.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 overflow-hidden shadow-sm">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
            onClick={() => setReminderCollapsed((prev) => !prev)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-200 rounded-full">
                <AlertTriangle size={18} className="text-amber-700" />
              </div>
              <div>
                <h2 className="text-amber-900 font-bold text-base">
                  Reminder: {unfinishedYesterday.length} Todo Kemarin Belum
                  Selesai
                </h2>
                <p className="text-amber-600 text-xs mt-0.5">
                  Selesaikan terlebih dahulu sebelum mengerjakan todo hari ini
                </p>
              </div>
            </div>
            <button className="text-amber-600 hover:text-amber-800 transition-colors">
              {reminderCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>
          </div>

          {/* Todo List */}
          {!reminderCollapsed && (
            <div className="px-5 pb-5 space-y-3 border-t border-amber-200 pt-4">
              {unfinishedYesterday.map((todo) => (
                <div key={todo.id} className="relative">
                  {/* Badge "Kemarin" */}
                  <div className="absolute -top-2 -right-1 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Dari Kemarin
                  </div>
                  <TodoCard
                    todo={todo}
                    onEdit={(t) => {
                      setEditingTodo(t);
                      setShowForm(true);
                    }}
                    onDelete={deleteTodo}
                    onToggle={toggleComplete}
                    onTransition={transitionTodoStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MAIN DASHBOARD ── */}
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
