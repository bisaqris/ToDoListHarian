import { BarChart3 } from "lucide-react";
import { StackedStatusBar } from "./StackedStatusBar";

export const StatsChartCard = ({ stats }) => {
  const { total, completed, pending, inProgress } = stats;
  const legendItems = [
    {
      color: "bg-green-400",
      label: "Selesai",
      value: completed,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    {
      color: "bg-blue-400",
      label: "Dikerjakan",
      value: inProgress,
      pct: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    },
    {
      color: "bg-orange-400",
      label: "Pending",
      value: pending,
      pct: total > 0 ? Math.round((pending / total) * 100) : 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-purple-50 rounded-lg">
          <BarChart3 size={15} className="text-purple-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            Distribusi Status Todo
          </p>
          <p className="text-xs text-gray-400">
            Total {total} todo keseluruhan
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="relative shrink-0">
          {/* <PieChart
            completed={completed}
            pending={pending}
            inProgress={inProgress}
            total={total}
          /> */}
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-800">{total}</span>
            <span className="text-[10px] text-gray-400 font-medium">Total</span>
          </div>
        </div>

        {/* Kanan: stacked bar + legend */}
        <div className="flex-1 w-full space-y-4">
          {/* Stacked bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Distribusi</span>
              <span>{total} todo</span>
            </div>
            <StackedStatusBar
              completed={completed}
              pending={pending}
              inProgress={inProgress}
              total={total}
            />
          </div>

          {/* Legend items */}
          <div className="space-y-2">
            {legendItems.map(({ color, label, value, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color}`} />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-xs text-gray-600 font-medium">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Mini progress bar per item */}
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-6 text-right">
                      {value}
                    </span>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total bar label */}
          {total > 0 && (
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-400">Selesai dari total</span>
              <span
                className={`font-bold ${completed / total >= 0.7 ? "text-green-600" : completed / total >= 0.4 ? "text-amber-500" : "text-red-500"}`}
              >
                {completed}/{total} ({Math.round((completed / total) * 100)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
