import { AlertCircle, BarChart3, Calendar, CheckCircle2 } from "lucide-react";
import { useTodos } from "../context/TodoContext";

export const Dashboard = () => {
  const { todos } = useTodos();
  
  const validTodos = (todos || []).filter(t => t && t.id);
  
  const stats = {
    total: validTodos.length,
    completed: validTodos.filter(t => t.completed).length,
    pending: validTodos.filter(t => !t.completed).length,
    today: validTodos.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total To-Do</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Selesai</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Hari Ini</p>
            <p className="text-3xl font-bold text-purple-600">{stats.today}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Calendar className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold mb-2">Progress Completion</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="bg-white bg-opacity-30 rounded-full h-4 overflow-hidden">
              <div 
                className="progress-bar bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-700 ease-out rounded-full shadow-lg"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <span className="text-3xl font-bold tabular-nums">{completionRate}%</span>
        </div>
        <p className="text-sm mt-3 opacity-90">
          {stats.completed} dari {stats.total} tugas telah diselesaikan
        </p>
      </div>
    </div>
  );
};