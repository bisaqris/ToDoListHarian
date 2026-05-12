import { AlertCircle, BarChart3, Calendar, CheckCircle2 } from "lucide-react";
import { useTodos } from "../context/TodoContext";

export const Dashboard = () => {
  const { todos, monthlyStats } = useTodos();
  
  const validTodos = (todos || []).filter(t => t && t.id);
  
  const stats = {
    total: validTodos.length,
    completed: validTodos.filter(t => t.completed).length,
    pending: validTodos.filter(t => !t.completed).length,
    today: validTodos.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length
  };

  const completionRate = monthlyStats?.percentage || 0;

  return (
 <>
      <div className="flex flex-col gap-6">     

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Monthly Productivity
            </span>
            <span className="text-sm font-bold text-purple-600">
              {completionRate}%
            </span>
          </div>
          <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            {monthlyStats?.completed || 0} dari {monthlyStats?.total || 0} tugas selesai dalam 30 hari terakhir
          </p>
        </div>

        {/* 2. GRID KARTU STATISTIK (Total, Selesai, Pending, Hari Ini) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>

        {/* 3. BAGIAN PROGRESS BAR BESAR (Opsi tambahan di bawah) */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Progress Completion</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-white/30 rounded-full h-4 overflow-hidden">
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
    </> // Tutup Fragment di sini
  );
};