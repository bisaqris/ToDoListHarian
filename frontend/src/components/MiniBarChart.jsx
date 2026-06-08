export const MiniBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-end gap-1 h-16">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t-sm"
            style={{ height: "20%" }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total || 0), 1);
  const getBarColor = (pct) => {
    if (pct === 0) return "bg-gray-200";
    if (pct < 40) return "bg-red-400";
    if (pct < 70) return "bg-amber-400";
    return "bg-green-400";
  };

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => {
        const heightPct = d.total > 0 ? Math.max((d.total / max) * 100, 8) : 6;
        const pct = d.percentage || 0;
        const dayLabel = new Date(d.date + "T00:00:00").toLocaleDateString(
          "id-ID",
          { weekday: "short" },
        );
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-0.5 group relative"
          >
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.date}
              <br />
              {d.completed}/{d.total} ({pct}%)
            </div>
            <div
              className="w-full relative shrink-0"
              style={{ height: `${heightPct}%` }}
            >
              <div
                className={`absolute inset-0 rounded-t-sm ${getBarColor(pct)} opacity-90`}
              />
              {d.total > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-opacity-30 bg-white"
                  style={{ height: `${100 - (d.completed / d.total) * 100}%` }}
                />
              )}
            </div>
            <span className="text-[9px] text-gray-400 leading-none">
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
};
