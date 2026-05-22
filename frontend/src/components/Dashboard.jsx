import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Flame,
  PieChart,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  Zap,
  Lightbulb,
} from "lucide-react";
import { useTodos } from "../context/TodoContext";
import { useAuth } from "../context/AuthContext";
import { DonutRing } from "./DonutRing";
import { StatsChartCard } from "./StatsChartCard";
import { MiniBarChart } from "./MiniBarChart";
import { StackedStatusBar } from "./StackedStatusBar";

export const Dashboard = () => {
  const { todos, monthlyStats, REPORT_URL } = useTodos();
  const { authHeaders } = useAuth();

  const [weekData, setWeekData] = useState([]);
  const [weekLoading, setWeekLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const validTodos = (todos || []).filter((t) => t && t.id);

  const stats = {
    total: validTodos.length,
    completed: validTodos.filter((t) => t.status === "completed").length,
    pending: validTodos.filter((t) => t.status === "pending").length,
    inProgress: validTodos.filter((t) => t.status === "in_progress").length,
    today: validTodos.filter((t) => t.dueDate === todayStr).length,
  };
  const completionRate = monthlyStats?.percentage || 0;

  // Fetch 7 hari terakhir
  const fetchWeekData = useCallback(async () => {
    if (!REPORT_URL) return;
    setWeekLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const res = await fetch(
        `${REPORT_URL}/daily?year=${year}&month=${month}`,
        { headers: authHeaders },
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const filled = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const found = json.data.find((r) => r.date === dateStr);
          filled.push(
            found || {
              date: dateStr,
              total: 0,
              completed: 0,
              unfinished: 0,
              percentage: 0,
            },
          );
        }
        setWeekData(filled);
      }
    } catch (e) {
      console.error("fetch weekData error:", e);
    } finally {
      setWeekLoading(false);
    }
  }, [REPORT_URL, authHeaders]);

  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData, todos]);

  const weekAvg =
    weekData.filter((d) => d.total > 0).length > 0
      ? Math.round(
          weekData
            .filter((d) => d.total > 0)
            .reduce((s, d) => s + d.percentage, 0) /
            weekData.filter((d) => d.total > 0).length,
        )
      : 0;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* ── ROW 1: Produktivitas Bulan Ini + Donut ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Produktivitas Bulan Ini
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {monthlyStats?.completed || 0}
              <span className="text-base font-normal text-gray-400">
                {" "}
                / {monthlyStats?.total || 0} todo
              </span>
            </p>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="absolute h-full bg-linear-to-r from-[#b900bc] to-[#009cff] rounded-full transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>0%</span>
            <span className="font-semibold text-purple-600">
              {completionRate}%
            </span>
            <span>100%</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle2 size={11} /> {stats.completed} Selesai
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
              <AlertCircle size={11} /> {stats.pending} Pending
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
              <TrendingUp size={11} /> {stats.inProgress} Dikerjakan
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
              <Calendar size={11} /> {stats.today} Hari Ini
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Completion Rate
          </p>
          <div className="relative">
            <DonutRing percentage={completionRate} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800">
                {completionRate}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {completionRate >= 70
              ? "🎉 Sangat produktif!"
              : completionRate >= 40
                ? "💪 Terus semangat!"
                : "🌱 Mulai dari yang kecil"}
          </p>
        </div>
      </div>

      {/* ── ROW 2: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total To-Do",
            value: stats.total,
            Icon: BarChart3,
            bg: "bg-blue-50",
            ic: "text-blue-500",
            vc: "text-blue-700",
          },
          {
            label: "Selesai",
            value: stats.completed,
            Icon: CheckCircle2,
            bg: "bg-green-50",
            ic: "text-green-500",
            vc: "text-green-700",
          },
          {
            label: "Pending",
            value: stats.pending,
            Icon: AlertCircle,
            bg: "bg-orange-50",
            ic: "text-orange-500",
            vc: "text-orange-700",
          },
          {
            label: "Jadwal Hari Ini",
            value: stats.today,
            Icon: Calendar,
            bg: "bg-purple-50",
            ic: "text-purple-500",
            vc: "text-purple-700",
          },
        ].map(({ label, value, Icon, bg, ic, vc }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 ${bg} rounded-xl shrink-0`}>
              <Icon size={18} className={ic} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none">
                {label}
              </p>
              <p className={`text-2xl font-bold mt-0.5 ${vc}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Distribusi Status ── */}
      <StatsChartCard stats={stats} />

      {/* ── ROW 4: Aktivitas 7 Hari ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Aktivitas 7 Hari Terakhir
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Rata-rata:{" "}
              <span
                className={`font-semibold ${weekAvg >= 70 ? "text-green-600" : weekAvg >= 40 ? "text-amber-500" : "text-red-500"}`}
              >
                {weekAvg}%
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-sm bg-green-400" /> ≥70%
            <div className="w-2 h-2 rounded-sm bg-amber-400 ml-1" /> 40–70%
            <div className="w-2 h-2 rounded-sm bg-red-400 ml-1" /> &lt;40%
          </div>
        </div>
        {weekLoading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MiniBarChart data={weekData} />
        )}
      </div>
    </div>
  );
};
